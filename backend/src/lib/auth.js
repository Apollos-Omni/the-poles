export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  AFFILIATE_MANAGER: 'affiliate_manager',
  USER: 'user',
  GUEST: 'guest',
};

const VALID_ROLES = new Set(Object.values(ROLES));

export function normalizeRole(role, fallback = ROLES.USER) {
  return VALID_ROLES.has(role) ? role : fallback;
}

function roleForEmail(email, role) {
  if (process.env.OWNER_EMAIL && email?.toLowerCase() === process.env.OWNER_EMAIL.toLowerCase()) {
    return ROLES.OWNER;
  }
  return role;
}

export async function getRequestUser(req, store) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (token && store.authUserFromToken) {
    const user = await store.authUserFromToken(token).catch((error) => {
      console.warn('[auth] Supabase token lookup failed:', error.message);
      return null;
    });
    if (user) {
      const role = normalizeRole(user.app_metadata?.role || user.user_metadata?.role || ROLES.USER);
      return {
        id: user.id,
        email: user.email,
        role: roleForEmail(user.email, role),
      };
    }
  }

  // Local/demo fallback. This keeps the MVP usable while auth is migrated.
  const isProduction = process.env.NODE_ENV === 'production';
  const email = req.headers['x-demo-user-email'] || process.env.DEMO_USER_EMAIL || 'demo@thepoles.local';
  const requestedRole = req.headers['x-demo-user-role'];
  const defaultRole = isProduction ? ROLES.USER : ROLES.OWNER;
  const role = isProduction ? defaultRole : normalizeRole(requestedRole, defaultRole);

  return {
    id: req.headers['x-demo-user-id'] || process.env.DEMO_USER_ID || 'demo-user',
    email,
    role: roleForEmail(email, role),
  };
}

export function requireAuth(store) {
  return async (req, res, next) => {
    const user = await getRequestUser(req, store);
    if (!user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }
    req.user = user;
    next();
  };
}

export function requireRole(store, ...roles) {
  return [
    requireAuth(store),
    (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        res.status(403).json({ success: false, error: 'Access denied' });
        return;
      }
      next();
    },
  ];
}

export function requireOwner(store) {
  return requireRole(store, ROLES.OWNER);
}
