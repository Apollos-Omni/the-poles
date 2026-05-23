import express from 'express';
import { z } from 'zod';
import { getRequestUser, normalizeRole, ROLES } from '../lib/auth.js';

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const ok = (res, data = {}) => res.json({ success: true, ...data });

const SAFE_PROFILE_FIELDS = new Set([
  'name',
  'full_name',
  'avatar_url',
  'phone',
  'bio',
  'location',
  'timezone',
  'preferences',
]);

const BLOCKED_PROFILE_FIELDS = new Set([
  'id',
  'role',
  'roles',
  'auth_user_id',
  'authUserId',
  'user_id',
  'email',
  'is_admin',
  'isAdmin',
  'admin',
  'permissions',
  'privileges',
  'app_metadata',
  'user_metadata',
  'created_at',
  'updated_at',
  'created_date',
  'updated_date',
]);

const updateMeSchema = z.object({
  data: z.record(z.string(), z.unknown()).optional(),
}).catchall(z.unknown());

const updateRoleSchema = z.object({
  profileId: z.string().optional(),
  profile_id: z.string().optional(),
  authUserId: z.string().optional(),
  auth_user_id: z.string().optional(),
  email: z.string().email().optional(),
  role: z.enum([ROLES.OWNER, ROLES.ADMIN, ROLES.MODERATOR, ROLES.AFFILIATE_MANAGER, ROLES.USER]),
});

function bearerToken(req) {
  const authHeader = req.headers.authorization || '';
  return authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
}

function publicProfile(profile) {
  if (!profile) return null;
  const data = profile.data && typeof profile.data === 'object' ? profile.data : {};
  return {
    id: profile.id,
    auth_user_id: profile.auth_user_id || null,
    email: profile.email || null,
    role: normalizeRole(profile.role),
    name: data.name || data.full_name || null,
    full_name: data.full_name || data.name || null,
    avatar_url: data.avatar_url || null,
    data,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
  };
}

function userFromProfile(profile, fallbackUser = {}) {
  const shapedProfile = publicProfile(profile);
  if (!shapedProfile) return fallbackUser;
  return {
    id: shapedProfile.id,
    authUserId: shapedProfile.auth_user_id,
    email: shapedProfile.email || fallbackUser.email || null,
    role: shapedProfile.role,
    name: shapedProfile.name,
    full_name: shapedProfile.full_name,
    avatar_url: shapedProfile.avatar_url,
  };
}

function collectSafeProfileFields(body = {}) {
  const parsed = updateMeSchema.parse(body || {});
  const candidates = {
    ...parsed,
    ...(parsed.data && typeof parsed.data === 'object' ? parsed.data : {}),
  };
  const safe = {};

  for (const [key, value] of Object.entries(candidates)) {
    if (key === 'data' || BLOCKED_PROFILE_FIELDS.has(key) || !SAFE_PROFILE_FIELDS.has(key)) continue;
    safe[key] = value;
  }

  return safe;
}

async function resolveAuthContext(req, store) {
  const token = bearerToken(req);
  if (token && store.authUserFromToken && store.upsertProfileForAuthUser) {
    const authUser = await store.authUserFromToken(token).catch((error) => {
      console.warn('[auth:me] Supabase token lookup failed:', error.message);
      return null;
    });
    if (authUser) {
      const profile = await store.upsertProfileForAuthUser(authUser);
      return {
        mode: 'supabase',
        authUser,
        profile,
        user: userFromProfile(profile, { id: authUser.id, email: authUser.email, role: ROLES.USER }),
      };
    }
  }

  const user = await getRequestUser(req, store);
  let profile = null;
  if (store.kind === 'memory' && store.upsertProfileForAuthUser) {
    profile = await store.upsertProfileForAuthUser({
      id: user.id,
      email: user.email,
      user_metadata: { name: user.email },
    });
    if (user.role !== ROLES.GUEST && profile.role !== user.role) {
      profile = await store.updateUserRole(profile.id, user.role);
    }
  }

  return {
    mode: 'demo',
    authUser: null,
    profile,
    user: profile ? userFromProfile(profile, user) : user,
  };
}

async function resolveRoleTarget(store, input) {
  const profileId = input.profileId || input.profile_id;
  const authUserId = input.authUserId || input.auth_user_id;

  if (profileId) return store.findOne('profiles', { id: profileId });
  if (authUserId && store.findProfileByAuthUserId) return store.findProfileByAuthUserId(authUserId);
  if (input.email && store.findProfileByEmail) return store.findProfileByEmail(input.email);
  return null;
}

export function createAuthRouter({ store }) {
  const router = express.Router();

  router.get('/me', asyncHandler(async (req, res) => {
    const context = await resolveAuthContext(req, store);
    ok(res, {
      mode: context.mode,
      user: context.user,
      profile: publicProfile(context.profile),
    });
  }));

  router.patch('/me', asyncHandler(async (req, res) => {
    const context = await resolveAuthContext(req, store);
    if (!context.profile) {
      res.status(400).json({ success: false, error: 'Profile is not available for this auth mode.' });
      return;
    }

    const safeFields = collectSafeProfileFields(req.body);
    const profile = await store.updateProfileSafeFields(context.profile.id, safeFields);
    ok(res, {
      user: userFromProfile(profile, context.user),
      profile: publicProfile(profile),
    });
  }));

  router.post('/roles', asyncHandler(async (req, res) => {
    const context = await resolveAuthContext(req, store);
    if (context.user?.role !== ROLES.OWNER) {
      res.status(403).json({ success: false, error: 'Only the owner can update user roles.' });
      return;
    }

    const input = updateRoleSchema.parse(req.body || {});
    const target = await resolveRoleTarget(store, input);
    if (!target) {
      res.status(404).json({ success: false, error: 'Target profile not found.' });
      return;
    }

    const profile = await store.updateUserRole(target.id, input.role);
    await store.create('audit_events', {
      actor: `user:${context.user.id}`,
      stage: 'AUTH_ROLE_UPDATE',
      message: `Updated role for profile ${target.id}`,
      meta: { profileId: target.id, role: input.role },
    }).catch((error) => {
      console.warn('[auth:roles] audit logging failed:', error.message);
    });

    ok(res, { profile: publicProfile(profile) });
  }));

  return router;
}
