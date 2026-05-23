import express from 'express';
import crypto from 'crypto';
import JSZip from 'jszip';
import { z } from 'zod';
import { getRequestUser, ROLES } from '../lib/auth.js';
import {
  searchPrizesAcrossProviders,
  searchProductsAcrossProviders,
} from '../lib/searchProviders/products.js';
import { searchGamesAcrossProviders } from '../lib/searchProviders/games.js';

const T = {
  userMatches: 'user_matches',
  tickets: 'tickets',
  scores: 'scores',
  auditEvents: 'audit_events',
  leaderboard: 'leaderboard',
  fulfillments: 'fulfillments',
  pushSubscriptions: 'push_subscriptions',
  affiliateOffers: 'affiliate_offers',
  hingeCommands: 'hinge_commands',
};

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const hash = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const ok = (res, data = {}) => res.json({ success: true, ...data });
const ADMIN_ROLES = [ROLES.OWNER, ROLES.ADMIN];
const AFFILIATE_ADMIN_ROLES = [ROLES.OWNER, ROLES.ADMIN, ROLES.AFFILIATE_MANAGER];

const WRITE_POLICIES = {
  affiliate_merchants: AFFILIATE_ADMIN_ROLES,
  affiliate_offers: AFFILIATE_ADMIN_ROLES,
  affiliate_applications: AFFILIATE_ADMIN_ROLES,
  fulfillments: ADMIN_ROLES,
  fulfillment_events: ADMIN_ROLES,
  north_pole_fulfillments: ADMIN_ROLES,
  north_pole_matches: ADMIN_ROLES,
  match_events: ADMIN_ROLES,
};

const ROLE_PROTECTED_TABLES = new Set(['profiles', 'users']);
const PROTECTED_READ_TABLES = new Set([
  'profiles',
  'users',
  'north_pole_matches',
  'north_pole_fulfillments',
  'match_events',
  'fulfillments',
  'fulfillment_events',
  'audit_events',
  'audit_logs',
  'hinge_commands',
  'push_subscriptions',
  'affiliate_clicks',
  'affiliate_applications',
]);
const ADMIN_READ_TABLES = new Set([
  'profiles',
  'users',
  'north_pole_fulfillments',
  'match_events',
  'fulfillments',
  'fulfillment_events',
  'audit_events',
  'audit_logs',
  'hinge_commands',
  'push_subscriptions',
  'affiliate_clicks',
  'affiliate_applications',
]);
const PUBLIC_READ_TABLES = new Set(['affiliate_offers', 'products', 'prizes', 'games']);

const entityRequestSchema = z.object({
  entity: z.string().optional(),
  entityName: z.string().optional(),
  table: z.string().optional(),
}).passthrough();

const ENTITY_TABLE_ALIASES = {
  NorthPoleMatch: 'north_pole_matches',
  NorthPoleFulfillment: 'north_pole_fulfillments',
  MatchEvent: 'match_events',
  UserMatch: 'user_match_entities',
  SouthPoleChallenge: 'south_pole_challenges',
  CampaignContribution: 'campaign_contributions',
  CampaignEvent: 'campaign_events',
  CampaignPlayer: 'campaign_players',
  TeamPrizePool: 'team_prize_pools',
  TeamPrizeCampaign: 'team_prize_campaigns',
};

const normalizeEntityTable = (rawName) => {
  if (!rawName || typeof rawName !== 'string') return null;
  const trimmed = rawName.trim();
  if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(trimmed)) return null;
  if (ENTITY_TABLE_ALIASES[trimmed]) return ENTITY_TABLE_ALIASES[trimmed];
  if (trimmed.includes('_')) return trimmed.toLowerCase();

  const snake = trimmed
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toLowerCase();

  if (snake.endsWith('s')) return snake;
  if (snake.endsWith('y')) return `${snake.slice(0, -1)}ies`;
  return `${snake}s`;
};

const getEntityTable = (body = {}) => {
  const parsed = entityRequestSchema.parse(body || {});
  return normalizeEntityTable(parsed.table || parsed.entity || parsed.entityName);
};

const parseLimit = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  const limit = Number(value);
  return Number.isInteger(limit) && limit >= 0 ? limit : undefined;
};

const entityOptions = (body = {}) => ({
  sort: typeof body.sort === 'string' ? body.sort : undefined,
  limit: parseLimit(body.limit),
});

const requireEntityTable = (body, res) => {
  const table = getEntityTable(body);
  if (!table) {
    res.status(400).json({ success: false, error: 'Missing or invalid entity name' });
    return null;
  }
  return table;
};

const hasRole = (user, roles = []) => roles.includes(user?.role);
const isAdminUser = (user) => hasRole(user, ADMIN_ROLES);

async function requireAuthenticatedUser(req, res, store) {
  const user = await getRequestUser(req, store);
  if (!user?.id) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return null;
  }
  return user;
}

function isPublicEntityRead(table, filters = {}) {
  if (!PUBLIC_READ_TABLES.has(table)) return false;
  if (table !== 'affiliate_offers') return true;
  const status = String(filters.status || '').toLowerCase();
  return status === 'active' || filters.active === true || filters.is_active === true;
}

async function authorizeEntityRead(req, res, store, table, filters = {}) {
  if (!PROTECTED_READ_TABLES.has(table) && isPublicEntityRead(table, filters)) return { public: true };

  const user = await requireAuthenticatedUser(req, res, store);
  if (!user) return null;

  if (ADMIN_READ_TABLES.has(table) && !isAdminUser(user)) {
    res.status(403).json({ success: false, error: 'Access denied' });
    return null;
  }

  return user;
}

function containsRoleField(value) {
  if (!value || typeof value !== 'object') return false;
  if (Object.prototype.hasOwnProperty.call(value, 'role')) return true;
  if (value.data && typeof value.data === 'object' && Object.prototype.hasOwnProperty.call(value.data, 'role')) return true;
  return false;
}

async function authorizeEntityWrite(req, res, store, table, payload = {}) {
  const user = await requireAuthenticatedUser(req, res, store);
  if (!user) return false;
  const allowedRoles = WRITE_POLICIES[table];
  if (allowedRoles && !hasRole(user, allowedRoles)) {
    res.status(403).json({ success: false, error: 'Access denied' });
    return false;
  }

  if (ROLE_PROTECTED_TABLES.has(table) && containsRoleField(payload) && user.role !== ROLES.OWNER) {
    res.status(403).json({ success: false, error: 'Only the owner can change user roles.' });
    return false;
  }

  return true;
}

const createMatchSchema = z.object({
  gameId: z.string().optional(),
  game_id: z.string().optional(),
  productId: z.string().optional(),
  product_id: z.string().optional(),
  minPlayers: z.number().int().positive().optional(),
  min_players: z.number().int().positive().optional(),
  maxPlayers: z.number().int().positive().optional(),
  max_players: z.number().int().positive().optional(),
  buyInCents: z.number().int().nonnegative().optional(),
  buy_in_cents: z.number().int().nonnegative().optional(),
  rules: z.string().optional(),
  verificationMethod: z.string().optional(),
  verification_method: z.string().optional(),
  startsAt: z.string().optional(),
  starts_at: z.string().optional(),
  endsAt: z.string().optional(),
  ends_at: z.string().optional(),
  productOffer: z.unknown().optional(),
}).passthrough();

const northPoleSnapshotSchema = z.record(z.unknown()).optional().nullable();
const createNorthPoleMatchSchema = z.object({
  gameId: z.string().min(1).optional(),
  game_id: z.string().min(1).optional(),
  prizeId: z.string().min(1).optional(),
  prize_id: z.string().min(1).optional(),
  maxPlayers: z.number().int().min(2).max(100).optional(),
  max_players: z.number().int().min(2).max(100).optional(),
  buyInCents: z.number().int().min(0).max(10000000).optional(),
  buy_in_cents: z.number().int().min(0).max(10000000).optional(),
  prizeSnapshot: northPoleSnapshotSchema,
  prize_snapshot: northPoleSnapshotSchema,
  gameSnapshot: northPoleSnapshotSchema,
  game_snapshot: northPoleSnapshotSchema,
  matchPlan: northPoleSnapshotSchema,
  match_plan: northPoleSnapshotSchema,
  sandboxMode: z.boolean().optional(),
  sandbox_mode: z.boolean().optional(),
}).passthrough();

const joinNorthPoleMatchSchema = z.object({
  id: z.string().min(1).optional(),
  matchId: z.string().min(1).optional(),
  match_id: z.string().min(1).optional(),
});

const finalizeNorthPoleMatchSchema = z.object({
  id: z.string().min(1).optional(),
  matchDbId: z.string().min(1).optional(),
  match_id: z.string().min(1).optional(),
  resultPayload: z.record(z.unknown()).optional(),
  result_payload: z.record(z.unknown()).optional(),
});

function generateNorthPoleMatchId() {
  return `NP-${Date.now().toString(36).toUpperCase()}`;
}

function sanitizeSnapshot(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value;
}

function getNorthPoleMatchId(input = {}) {
  return input.id || input.matchDbId || input.matchId || input.match_id;
}

export function createFunctionRouter({ store }) {
  const router = express.Router();

  const requireUser = async (req, res) => requireAuthenticatedUser(req, res, store);

  router.post('/entityList', asyncHandler(async (req, res) => {
    const table = requireEntityTable(req.body, res);
    if (!table) return;
    if (!(await authorizeEntityRead(req, res, store, table))) return;
    const rows = await store.list(table, {}, entityOptions(req.body));
    ok(res, { rows, data: rows });
  }));

  router.post('/entityFilter', asyncHandler(async (req, res) => {
    const table = requireEntityTable(req.body, res);
    if (!table) return;
    const filters = req.body?.filters && typeof req.body.filters === 'object' ? req.body.filters : {};
    if (!(await authorizeEntityRead(req, res, store, table, filters))) return;
    const rows = await store.list(table, filters, entityOptions(req.body));
    ok(res, { rows, data: rows });
  }));

  router.post('/entityGet', asyncHandler(async (req, res) => {
    const table = requireEntityTable(req.body, res);
    if (!table) return;
    if (!(await authorizeEntityRead(req, res, store, table))) return;
    const id = req.body?.id;
    if (!id) return res.status(400).json({ success: false, error: 'Missing entity row id' });
    const row = await store.findOne(table, { id });
    if (!row) return res.status(404).json({ success: false, error: 'Entity row not found' });
    ok(res, { row, data: row });
  }));

  router.post('/entityCreate', asyncHandler(async (req, res) => {
    const table = requireEntityTable(req.body, res);
    if (!table) return;
    const data = req.body?.data && typeof req.body.data === 'object' ? req.body.data : {};
    if (!(await authorizeEntityWrite(req, res, store, table, data))) return;
    const row = await store.create(table, data);
    ok(res, { row, data: row });
  }));

  router.post('/entityUpdate', asyncHandler(async (req, res) => {
    const table = requireEntityTable(req.body, res);
    if (!table) return;
    const id = req.body?.id;
    const patch = req.body?.patch && typeof req.body.patch === 'object' ? req.body.patch : {};
    if (!id) return res.status(400).json({ success: false, error: 'Missing entity row id' });
    if (!(await authorizeEntityWrite(req, res, store, table, patch))) return;
    const row = await store.update(table, id, patch);
    if (!row) return res.status(404).json({ success: false, error: 'Entity row not found' });
    ok(res, { row, data: row });
  }));

  router.post('/entityDelete', asyncHandler(async (req, res) => {
    const table = requireEntityTable(req.body, res);
    if (!table) return;
    const id = req.body?.id;
    if (!id) return res.status(400).json({ success: false, error: 'Missing entity row id' });
    if (!(await authorizeEntityWrite(req, res, store, table))) return;
    const row = await store.delete(table, id);
    if (!row) return res.status(404).json({ success: false, error: 'Entity row not found' });
    ok(res, { id, row, data: row });
  }));

  router.post('/entityBulkCreate', asyncHandler(async (req, res) => {
    const table = requireEntityTable(req.body, res);
    if (!table) return;
    const data = Array.isArray(req.body?.data) ? req.body.data : [];
    for (const item of data) {
      if (!(await authorizeEntityWrite(req, res, store, table, item))) return;
    }
    const rows = await store.bulkCreate(table, data);
    ok(res, { rows, data: rows });
  }));

  router.get('/getVapidPublicKey', asyncHandler(async (_req, res) => {
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || '';
    if (!vapidPublicKey) {
      res.status(501).json({ success: false, error: 'VAPID public key not configured yet.' });
      return;
    }
    ok(res, { vapidPublicKey });
  }));

  router.all('/managePushSubscription', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res);
    if (!user) return;

    if (req.method === 'GET') {
      const subscriptions = await store.list(T.pushSubscriptions, { user_id: user.id, is_active: true });
      ok(res, { subscriptions: subscriptions.map((sub) => ({
        id: sub.id,
        endpoint: sub.endpoint ? `${sub.endpoint.slice(0, 50)}...` : '',
        userAgent: sub.user_agent || 'unknown',
        createdAt: sub.created_at,
        lastUpdated: sub.updated_at,
      })) });
      return;
    }

    if (req.method === 'DELETE') {
      const endpoint = req.body?.endpoint;
      if (!endpoint) return res.status(400).json({ success: false, error: 'Missing endpoint' });
      const matches = await store.list(T.pushSubscriptions, { user_id: user.id, endpoint });
      for (const sub of matches) await store.update(T.pushSubscriptions, sub.id, { is_active: false, unsubscribed_at: new Date().toISOString() });
      ok(res, { removed: matches.length });
      return;
    }

    if (req.method === 'POST') {
      const action = req.body?.action || (req.body?.subscription ? 'subscribe' : null);
      const subscription = req.body?.subscription;
      if (action === 'unsubscribe') {
        const endpoint = subscription?.endpoint || req.body?.endpoint;
        const matches = await store.list(T.pushSubscriptions, { user_id: user.id, endpoint });
        for (const sub of matches) await store.update(T.pushSubscriptions, sub.id, { is_active: false, unsubscribed_at: new Date().toISOString() });
        ok(res, { removed: matches.length });
        return;
      }

      if (action !== 'subscribe' || !subscription?.endpoint) {
        return res.status(400).json({ success: false, error: 'Invalid push subscription request' });
      }

      const existing = await store.findOne(T.pushSubscriptions, { user_id: user.id, endpoint: subscription.endpoint });
      const payload = {
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh_key: subscription.keys?.p256dh || null,
        auth_key: subscription.keys?.auth || null,
        is_active: true,
        user_agent: req.headers['user-agent'] || 'unknown',
      };
      const row = existing ? await store.update(T.pushSubscriptions, existing.id, payload) : await store.create(T.pushSubscriptions, payload);
      ok(res, { id: row.id, subscription: row });
      return;
    }

    res.status(405).json({ success: false, error: 'Method not allowed' });
  }));

  router.post('/searchProducts', asyncHandler(async (req, res) => {
    ok(res, await searchProductsAcrossProviders(req.body || {}, process.env));
  }));

  router.post('/searchPrizes', asyncHandler(async (req, res) => {
    ok(res, await searchPrizesAcrossProviders(req.body || {}, process.env));
  }));

  router.post('/searchGames', asyncHandler(async (req, res) => {
    ok(res, await searchGamesAcrossProviders(req.body || {}, process.env));
  }));

  router.post('/createNorthPoleMatch', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res);
    if (!user) return;

    const input = createNorthPoleMatchSchema.parse(req.body || {});
    const gameId = input.gameId || input.game_id;
    const prizeId = input.prizeId || input.prize_id;
    const maxPlayers = input.maxPlayers || input.max_players;
    const buyInCents = input.buyInCents ?? input.buy_in_cents;
    const sandboxMode = Boolean(input.sandboxMode || input.sandbox_mode);

    if (!gameId || !prizeId) return res.status(400).json({ success: false, error: 'Missing gameId or prizeId' });
    if (!Number.isInteger(maxPlayers) || maxPlayers < 2 || maxPlayers > 100) {
      return res.status(400).json({ success: false, error: 'maxPlayers must be between 2 and 100' });
    }
    if (!Number.isInteger(buyInCents) || buyInCents < 0 || buyInCents > 10000000) {
      return res.status(400).json({ success: false, error: 'buyInCents is invalid' });
    }

    const matchId = generateNorthPoleMatchId();
    const status = sandboxMode ? 'active' : 'open';
    const nowIso = new Date().toISOString();
    const match = await store.create('north_pole_matches', {
      match_id: matchId,
      created_by: user.id,
      creator_user_id: user.id,
      game_id: gameId,
      game_snapshot: sanitizeSnapshot(input.gameSnapshot || input.game_snapshot),
      prize_id: prizeId,
      prize_snapshot: sanitizeSnapshot(input.prizeSnapshot || input.prize_snapshot),
      player_ids: [user.id],
      scores: {},
      status,
      sandbox_mode: sandboxMode,
      fulfillment_mode: sandboxMode ? 'sandbox' : 'simulated',
      prize_locked_at: nowIso,
      started_at: nowIso,
      buy_in_cents: buyInCents,
      max_players: maxPlayers,
      match_plan: sanitizeSnapshot(input.matchPlan || input.match_plan),
    });

    await store.create('match_events', {
      match_id: matchId,
      event_type: 'match_created',
      actor_user_id: user.id,
      data: { match_id: matchId, game_id: gameId, sandbox_mode: sandboxMode },
      note: sandboxMode ? 'Sandbox match created' : 'North Pole match created',
    });

    ok(res, { match, row: match, data: match });
  }));

  router.post('/joinNorthPoleMatch', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res);
    if (!user) return;

    const input = joinNorthPoleMatchSchema.parse(req.body || {});
    const id = getNorthPoleMatchId(input);
    if (!id) return res.status(400).json({ success: false, error: 'Match ID is required' });

    const match = await store.findOne('north_pole_matches', { id }) || await store.findOne('north_pole_matches', { match_id: id });
    if (!match) return res.status(404).json({ success: false, error: 'Match not found' });
    if (match.sandbox_mode) return res.status(400).json({ success: false, error: 'Sandbox matches are not joinable from the real flow' });
    if (match.status !== 'open') return res.status(400).json({ success: false, error: 'Match is not open for joining' });

    const playerIds = Array.isArray(match.player_ids) ? match.player_ids : [];
    if (playerIds.includes(user.id)) return res.status(400).json({ success: false, error: 'You have already joined this match' });
    const maxPlayers = Number(match.max_players || 0);
    if (!Number.isInteger(maxPlayers) || maxPlayers < 2) return res.status(400).json({ success: false, error: 'Match capacity is invalid' });
    if (playerIds.length >= maxPlayers) return res.status(400).json({ success: false, error: 'This match is already full' });

    const nextPlayerIds = [...playerIds, user.id];
    const nextStatus = nextPlayerIds.length >= maxPlayers ? 'active' : 'open';
    const updated = await store.update('north_pole_matches', match.id, {
      player_ids: nextPlayerIds,
      status: nextStatus,
      joined_at: new Date().toISOString(),
    });

    await store.create('match_events', {
      match_id: match.match_id,
      event_type: nextStatus === 'active' ? 'match_started' : 'player_joined',
      actor_user_id: user.id,
      data: { player_count: nextPlayerIds.length, max_players: maxPlayers },
      note: nextStatus === 'active' ? 'Match filled and is ready to start' : 'Player joined match',
    });

    ok(res, { match: updated, row: updated, data: updated });
  }));

  router.post('/finalizeNorthPoleMatchResult', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res);
    if (!user) return;

    const input = finalizeNorthPoleMatchSchema.parse(req.body || {});
    const id = getNorthPoleMatchId(input);
    const resultPayload = input.resultPayload || input.result_payload || {};
    if (!id) return res.status(400).json({ success: false, error: 'Match ID is required' });

    const match = await store.findOne('north_pole_matches', { id }) || await store.findOne('north_pole_matches', { match_id: id });
    if (!match) return res.status(404).json({ success: false, error: 'Match not found' });
    if (!match.sandbox_mode && !isAdminUser(user)) {
      return res.status(403).json({ success: false, error: 'Only sandbox matches or admins can be finalized here' });
    }

    const scores = resultPayload.scores && typeof resultPayload.scores === 'object' ? resultPayload.scores : null;
    const winnerUserId = resultPayload.winner?.userId || resultPayload.winner_user_id;
    if (!scores || !winnerUserId) return res.status(400).json({ success: false, error: 'Invalid result payload' });

    await store.update('north_pole_matches', match.id, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      raw_result_payload: resultPayload,
      scores,
    });
    await store.create('match_events', {
      match_id: match.match_id,
      event_type: 'match_completed',
      actor_user_id: user.id,
      data: { scores },
      note: 'Match completed - scores finalized',
    });

    const verified = await store.update('north_pole_matches', match.id, {
      status: 'verified',
      winner_user_id: winnerUserId,
      winner_locked_at: new Date().toISOString(),
    });
    await store.create('match_events', {
      match_id: match.match_id,
      event_type: 'winner_verified',
      actor_user_id: 'system',
      data: { winner_user_id: winnerUserId },
      note: `Winner locked: ${winnerUserId}`,
    });

    let fulfillment = null;
    if (match.sandbox_mode) {
      fulfillment = await store.create('north_pole_fulfillments', {
        match_id: match.match_id,
        winner_user_id: winnerUserId,
        prize_id: match.prize_id,
        prize_snapshot: match.prize_snapshot,
        admin_status: 'pending_review',
        order_status: 'sandbox_created',
        sandbox_mode: true,
      });
      await store.create('match_events', {
        match_id: match.match_id,
        event_type: 'fulfillment_created',
        actor_user_id: 'system',
        data: { fulfillment_id: fulfillment.id },
        note: 'Fulfillment record created - pending admin review',
      });
    }

    ok(res, { match: verified, fulfillment, row: verified, data: verified });
  }));

  router.post('/createMatch', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res);
    if (!user) return;
    const input = createMatchSchema.parse(req.body || {});
    const gameId = input.gameId || input.game_id;
    const productId = input.productId || input.product_id || input.productOffer?.product_id || input.productOffer?.id;
    const minPlayers = input.minPlayers || input.min_players || 2;
    const maxPlayers = input.maxPlayers || input.max_players || 2;
    const buyInCents = input.buyInCents ?? input.buy_in_cents ?? 0;

    if (!gameId || !productId) return res.status(400).json({ success: false, error: 'Missing gameId or productId' });
    if (maxPlayers < minPlayers) return res.status(400).json({ success: false, error: 'maxPlayers must be greater than or equal to minPlayers' });

    const match = await store.create(T.userMatches, {
      created_by: user.id,
      game_id: gameId,
      product_id: productId,
      min_players: minPlayers,
      max_players: maxPlayers,
      buy_in_cents: buyInCents,
      status: 'open',
      starts_at: input.startsAt || input.starts_at || null,
      ends_at: input.endsAt || input.ends_at || null,
      rules: input.rules || '',
      verification_method: input.verificationMethod || input.verification_method || 'screenshot',
      product_offer: input.productOffer || null,
    });

    await store.create(T.tickets, { match_id: match.id, user_id: user.id, method: 'creator' });
    await store.create(T.auditEvents, { actor: `user:${user.id}`, stage: 'MATCH_CREATE', message: `Created match ${match.id}`, meta: { matchId: match.id } });
    ok(res, { match });
  }));

  router.post('/joinMatch', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res);
    if (!user) return;
    const { matchId, match_id, method = 'paid' } = req.body || {};
    const id = matchId || match_id;
    if (!id) return res.status(400).json({ success: false, error: 'Match ID is required' });

    const match = await store.findOne(T.userMatches, { id });
    if (!match) return res.status(404).json({ success: false, error: 'Match not found' });
    if (match.status !== 'open') return res.status(400).json({ success: false, error: 'Match is not open for joining' });

    const existingTicket = await store.findOne(T.tickets, { match_id: id, user_id: user.id });
    if (existingTicket) return res.status(400).json({ success: false, error: 'You have already joined this match' });

    const tickets = await store.list(T.tickets, { match_id: id });
    if (tickets.length >= match.max_players) return res.status(400).json({ success: false, error: 'This match is already full' });

    const ticket = await store.create(T.tickets, { match_id: id, user_id: user.id, method });
    const newCount = tickets.length + 1;
    if (newCount >= match.max_players) await store.update(T.userMatches, id, { status: 'active' });
    await store.create(T.auditEvents, { actor: `user:${user.id}`, stage: 'MATCH_JOIN', message: `Joined match ${id}`, meta: { matchId: id } });
    ok(res, { ticket, status: newCount >= match.max_players ? 'active' : match.status });
  }));

  router.post('/submitScore', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res);
    if (!user) return;
    const { matchId, match_id, score, proofMeta = {}, meta = {} } = req.body || {};
    const id = matchId || match_id;
    if (!id || typeof score !== 'number') return res.status(400).json({ success: false, error: 'Missing matchId or numeric score' });

    const ticket = await store.findOne(T.tickets, { match_id: id, user_id: user.id });
    if (!ticket) return res.status(403).json({ success: false, error: 'Not a participant in this match' });

    const match = await store.findOne(T.userMatches, { id });
    if (!match || !['active', 'judging', 'open'].includes(match.status)) {
      return res.status(400).json({ success: false, error: 'Match is not accepting scores' });
    }

    if (match.status === 'open') await store.update(T.userMatches, id, { status: 'judging' });
    const proof = Object.keys(proofMeta || {}).length ? proofMeta : meta;
    const scoreRow = await store.create(T.scores, { match_id: id, user_id: user.id, score, meta_json: proof, proof_hash: hash(proof) });
    await store.create(T.auditEvents, { actor: `user:${user.id}`, stage: 'SCORE_SUBMIT', message: `Submitted score ${score} for match ${id}`, meta: { matchId: id, score } });
    ok(res, { score: scoreRow });
  }));

  router.post('/finalizeMatch', asyncHandler(async (req, res) => {
    const { matchId, match_id } = req.body || {};
    const id = matchId || match_id;
    if (!id) return res.status(400).json({ success: false, error: 'Match ID required' });

    const match = await store.findOne(T.userMatches, { id });
    if (!match) return res.status(404).json({ success: false, error: 'Match not found' });

    const scores = await store.list(T.scores, { match_id: id });
    if (!scores.length) return res.status(400).json({ success: false, error: 'No scores submitted for this match' });
    scores.sort((a, b) => b.score - a.score || String(a.created_at).localeCompare(String(b.created_at)));

    const entries = scores.map((scoreRow, index) => ({ match_id: id, user_id: scoreRow.user_id, total_score: scoreRow.score, rank: index + 1 }));
    await store.bulkCreate(T.leaderboard, entries);
    const winner = scores[0];
    await store.update(T.userMatches, id, { status: 'completed', winners: [winner.user_id] });
    const fulfillment = await store.create(T.fulfillments, { match_id: id, winner_id: winner.user_id, mode: 'manual_review', status: 'pending' });
    await store.create(T.auditEvents, { actor: 'system', stage: 'MATCH_FINALIZE', message: `Winner locked for match ${id}`, meta: { matchId: id, winnerId: winner.user_id } });
    ok(res, { winner_id: winner.user_id, leaderboard: entries, fulfillment });
  }));

  router.post('/affiliateRedirect', asyncHandler(async (req, res) => {
    const { offerId } = req.body || {};
    if (!offerId) return res.status(400).json({ success: false, error: 'Missing offerId' });

    const stored = await store.findOne(T.affiliateOffers, { id: offerId }).catch(() => null);
    const offer = stored || {
      id: offerId,
      title: 'Affiliate offer',
      merchant: 'Retail Partner',
      affiliate_url: 'https://example.com',
      disclosure_text: process.env.AFFILIATE_DISCLOSURE_TEXT || 'We may earn from qualifying purchases.',
    };
    const user = await requireUser(req, res);
    if (!user) return;
    await store.create('affiliate_clicks', {
      offer_id: offerId,
      affiliate_offer_id: offerId,
      user_id: user.id,
      source_page: req.body?.sourcePage || req.body?.source_page || 'direct',
      merchant: offer.merchant || null,
      destination_url: offer.affiliate_url || null,
      user_agent: req.headers['user-agent'] || 'unknown',
      ip_hash: hash(req.ip || req.socket?.remoteAddress || 'unknown'),
    }).catch((error) => {
      console.warn('[affiliateRedirect] click logging failed:', error.message);
    });
    ok(res, offer);
  }));

  router.post('/publishHingeCommand', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res);
    if (!user) return;
    const { deviceId, commandType, args = {} } = req.body || {};
    if (!deviceId || !commandType) return res.status(400).json({ success: false, error: 'Missing deviceId or commandType' });
    const command = await store.create(T.hingeCommands, { user_id: user.id, device_id: deviceId, command_type: commandType, args, status: 'queued' });
    ok(res, { requestId: command.id, command });
  }));

  router.get('/downloadAgentToolkit', asyncHandler(async (_req, res) => {
    const zip = new JSZip();
    zip.file('README.md', '# The Poles Agent Doctor\n\nRun `./agent_doctor.sh` after setting API1 to your backend URL.\n');
    zip.file('agent_doctor.sh', `#!/usr/bin/env bash\nset -euo pipefail\nAPI1=\${API1:-http://localhost:8787}\ncurl -fsS "$API1/api/health" && echo\n`);
    zip.file('supabase_smoke.sql', 'select now() as smoke_test;\n');
    const buffer = await zip.generateAsync({ type: 'nodebuffer' });
    res.setHeader('content-type', 'application/zip');
    res.setHeader('content-disposition', 'attachment; filename="agent_doctor.zip"');
    res.send(buffer);
  }));

  router.get('/manifest', (_req, res) => {
    res.type('application/manifest+json').json({ name: 'The Poles', short_name: 'The Poles', start_url: '/', display: 'standalone', background_color: '#08000f', theme_color: '#6d28d9', icons: [] });
  });

  router.get('/sw', (_req, res) => {
    res.type('application/javascript').send(`self.addEventListener('install',e=>self.skipWaiting());self.addEventListener('activate',e=>self.clients.claim());`);
  });

  router.post('/testPush', (_req, res) => ok(res, { message: 'Push test accepted. Web push delivery is not wired yet.' }));

  return router;
}
