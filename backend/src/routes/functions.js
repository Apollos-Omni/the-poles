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
  matchEntries: 'match_entries',
  scores: 'scores',
  auditEvents: 'audit_events',
  leaderboard: 'leaderboard',
  fulfillments: 'fulfillments',
  scoreSubmissions: 'score_submissions',
  matchEvidence: 'match_evidence',
  winnerVerifications: 'winner_verifications',
  matchDisputes: 'match_disputes',
  fulfillmentIntents: 'fulfillment_intents',
  purchaseIntents: 'purchase_intents',
  pushSubscriptions: 'push_subscriptions',
  affiliateOffers: 'affiliate_offers',
  hingeCommands: 'hinge_commands',
};

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const hash = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const ok = (res, data = {}) => res.json({ success: true, ...data });
const ADMIN_ROLES = [ROLES.OWNER, ROLES.ADMIN];
const AFFILIATE_ADMIN_ROLES = [ROLES.OWNER, ROLES.ADMIN, ROLES.AFFILIATE_MANAGER];
const SKILL_COMPETITION_AGREEMENT_VERSION = 'skill_competition_agreement_v1';
const SKILL_AGREEMENT_REQUIRED_ERROR = 'Skill-based competition agreement must be accepted before entering this match.';
const NORTH_POLE_VISIBLE_STATUSES = [
  'draft',
  'open',
  'waiting_for_players',
  'in_progress',
  'pending_verification',
  'winner_verified',
  'fulfillment_pending',
  'fulfilled',
  'disputed',
  'cancelled',
];

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
const PUBLIC_READ_TABLES = new Set(['affiliate_offers', 'products', 'prizes', 'games']);

const entityRequestSchema = z.object({
  entity: z.string().optional(),
  entityName: z.string().optional(),
  table: z.string().optional(),
}).passthrough();

const ENTITY_TABLE_ALIASES = {
  MatchEntry: 'match_entries',
  MatchScore: 'match_scores',
  NorthPoleMatch: 'north_pole_matches',
  NorthPoleFulfillment: 'north_pole_fulfillments',
  ScoreSubmission: 'score_submissions',
  MatchEvidence: 'match_evidence',
  WinnerVerification: 'winner_verifications',
  MatchDispute: 'match_disputes',
  FulfillmentIntent: 'fulfillment_intents',
  FulfillmentOrder: 'fulfillment_orders',
  PurchaseIntent: 'purchase_intents',
  MatchEvent: 'match_events',
  UserMatch: 'user_match_entities',
  SouthPoleChallenge: 'south_pole_challenges',
  CampaignContribution: 'campaign_contributions',
  CampaignEvent: 'campaign_events',
  CampaignPlayer: 'campaign_players',
  TeamPrizePool: 'team_prize_pools',
  TeamPrizeCampaign: 'team_prize_campaigns',
  MissionContribution: 'mission_contributions',
  MissionLedgerEntry: 'mission_ledger_entries',
  SponsorPackage: 'sponsor_packages',
  PartnerInquiry: 'partner_inquiries',
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
  skillAgreementAccepted: z.boolean().optional(),
  skill_agreement_accepted: z.boolean().optional(),
  skillAgreementVersion: z.string().min(1).optional(),
  skill_agreement_version: z.string().min(1).optional(),
}).passthrough();

const joinNorthPoleMatchSchema = z.object({
  id: z.string().min(1).optional(),
  matchId: z.string().min(1).optional(),
  match_id: z.string().min(1).optional(),
  skillAgreementAccepted: z.boolean().optional(),
  skill_agreement_accepted: z.boolean().optional(),
  skillAgreementVersion: z.string().min(1).optional(),
  skill_agreement_version: z.string().min(1).optional(),
});

const finalizeNorthPoleMatchSchema = z.object({
  id: z.string().min(1).optional(),
  matchDbId: z.string().min(1).optional(),
  match_id: z.string().min(1).optional(),
  resultPayload: z.record(z.unknown()).optional(),
  result_payload: z.record(z.unknown()).optional(),
});

const approveWinnerVerificationSchema = z.object({
  id: z.string().min(1).optional(),
  verificationId: z.string().min(1).optional(),
  verification_id: z.string().min(1).optional(),
  approve: z.boolean().optional(),
  winnerUserId: z.string().min(1).optional(),
  winner_user_id: z.string().min(1).optional(),
  reviewNote: z.string().optional(),
  review_note: z.string().optional(),
}).passthrough();

const missionCheckoutSchema = z.object({
  amount_cents: z.number().int().min(100).max(100000000),
  currency: z.string().default('USD'),
  contribution_type: z.string().min(1).max(80).default('mission_support'),
  public_label: z.string().max(80).optional(),
  contributor_display_name: z.string().max(80).optional(),
  email: z.string().email().optional().or(z.literal('')),
  mission_category: z.string().min(1).max(80).default('Approved Gifts'),
  package_id: z.string().max(80).optional(),
  package_label: z.string().max(120).optional(),
});

function publicOrigin(req) {
  const configured = process.env.FRONTEND_ORIGIN;
  if (configured) return configured.replace(/\/$/, '');
  const origin = req.headers.origin;
  if (origin) return origin.replace(/\/$/, '');
  return `${req.protocol}://${req.get('host')}`;
}

function sanitizePublicLabel(value) {
  const label = String(value || '').trim();
  return label ? label.slice(0, 80) : 'Mission Supporter';
}

function sanitizeMissionLedgerRow(row = {}) {
  return {
    id: row.id,
    date: row.created_at || row.created_date,
    public_label: sanitizePublicLabel(row.public_label || row.contributor_display_name),
    contribution_type: row.contribution_type || 'mission_support',
    amount_cents: Number(row.amount_cents || 0),
    currency: row.currency || 'USD',
    status: row.status || 'pending',
    mission_category: row.mission_category || 'Approved Gifts',
  };
}

async function createStripeCheckoutSession({ req, store, input, mode }) {
  const secretKey = process.env.STRIPE_SECRET_KEY || '';
  if (!secretKey) {
    return {
      configured: false,
      message: 'Stripe test checkout is not configured yet. Set STRIPE_SECRET_KEY on the backend to enable mission support intake.',
    };
  }
  if (!secretKey.startsWith('sk_test_')) {
    const error = new Error('Mission checkout only accepts Stripe test keys until payment processor approval and legal review are complete.');
    error.status = 403;
    throw error;
  }

  const nowIso = new Date().toISOString();
  const publicLabel = sanitizePublicLabel(input.public_label || input.contributor_display_name);
  const contribution = await store.create('mission_contributions', {
    amount_cents: input.amount_cents,
    currency: input.currency || 'USD',
    contribution_type: input.contribution_type,
    public_label: publicLabel,
    contributor_display_name: publicLabel,
    email: input.email || null,
    status: 'checkout_pending',
    mission_category: input.mission_category,
    payment_provider: 'stripe',
    provider_session_id: null,
    provider_payment_intent_id: null,
    checkout_mode: mode,
    package_id: input.package_id || null,
    package_label: input.package_label || null,
    created_at: nowIso,
  });

  const origin = publicOrigin(req);
  const params = new URLSearchParams();
  params.set('mode', 'payment');
  params.set('success_url', `${origin}/MissionLedger?mission_checkout=success`);
  params.set('cancel_url', `${origin}/ThePolesFund?mission_checkout=cancelled`);
  params.set('client_reference_id', contribution.id);
  params.set('line_items[0][quantity]', '1');
  params.set('line_items[0][price_data][currency]', String(input.currency || 'USD').toLowerCase());
  params.set('line_items[0][price_data][unit_amount]', String(input.amount_cents));
  params.set('line_items[0][price_data][product_data][name]', input.package_label || 'The Poles Fund Mission Support');
  params.set('line_items[0][price_data][product_data][description]', 'Mission support for approved gift and growth categories. Prize-room entry payments remain sandboxed.');
  params.set('metadata[mission_contribution_id]', contribution.id);
  params.set('metadata[contribution_type]', input.contribution_type);
  params.set('metadata[mission_category]', input.mission_category);

  if (input.email) params.set('customer_email', input.email);

  const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });
  const session = await stripeResponse.json();
  if (!stripeResponse.ok) {
    const error = new Error(session?.error?.message || 'Stripe checkout session could not be created.');
    error.status = stripeResponse.status;
    throw error;
  }

  await store.update('mission_contributions', contribution.id, {
    provider_session_id: session.id,
    status: 'checkout_created',
  });

  return { configured: true, contribution_id: contribution.id, session_id: session.id, url: session.url };
}

async function recordMissionCheckoutCompleted({ store, session }) {
  const contributionId = session?.metadata?.mission_contribution_id || session?.client_reference_id;
  if (!contributionId) return null;

  const existing = await store.findOne('mission_contributions', { id: contributionId });
  if (!existing) return null;

  const updated = await store.update('mission_contributions', contributionId, {
    status: 'funded',
    provider_session_id: session.id || existing.provider_session_id || null,
    provider_payment_intent_id: session.payment_intent || existing.provider_payment_intent_id || null,
  });

  await store.create('mission_ledger_entries', {
    mission_contribution_id: contributionId,
    public_label: sanitizePublicLabel(existing.public_label || existing.contributor_display_name),
    contribution_type: existing.contribution_type || 'mission_support',
    amount_cents: existing.amount_cents,
    currency: existing.currency || 'USD',
    status: 'funded',
    mission_category: existing.mission_category || 'Approved Gifts',
  });

  return updated;
}

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

function getSkillAgreementVersion(input = {}) {
  return input.skillAgreementVersion || input.skill_agreement_version;
}

function requireSkillCompetitionAgreement(input = {}) {
  const accepted = input.skillAgreementAccepted === true || input.skill_agreement_accepted === true;
  const version = getSkillAgreementVersion(input);
  if (!accepted || version !== SKILL_COMPETITION_AGREEMENT_VERSION) {
    const error = new Error(SKILL_AGREEMENT_REQUIRED_ERROR);
    error.status = 400;
    throw error;
  }
  return version;
}

function normalizeParticipantAgreements(value) {
  if (!value || typeof value !== 'object') return {};
  if (!Array.isArray(value)) return value;
  return value.reduce((acc, item) => {
    if (item?.user_id) acc[item.user_id] = item;
    return acc;
  }, {});
}

function canFinalizeNorthPoleMatch(user, match) {
  if (isAdminUser(user)) return true;
  if (!match?.sandbox_mode) return false;
  const playerIds = Array.isArray(match.player_ids) ? match.player_ids : [];
  return match.creator_user_id === user.id || match.created_by === user.id || playerIds.includes(user.id);
}

function analyzeWinnerSubmission({ match, resultPayload, scores, winnerUserId }) {
  const issues = [];
  const scoreEntries = Object.entries(scores || {})
    .map(([userId, value]) => ({ userId, score: Number(value) }))
    .filter((entry) => Number.isFinite(entry.score));
  const sortedScores = [...scoreEntries].sort((a, b) => b.score - a.score);
  const topScore = sortedScores[0];
  const topTies = topScore ? sortedScores.filter((entry) => entry.score === topScore.score) : [];

  if (!scoreEntries.length) issues.push('missing_scores');
  if (!winnerUserId) issues.push('missing_claimed_winner');
  if (winnerUserId && !Object.prototype.hasOwnProperty.call(scores || {}, winnerUserId)) issues.push('claimed_winner_missing_score');
  if (topTies.length > 1) issues.push('conflicting_top_scores');
  if (topScore && winnerUserId && topScore.userId !== winnerUserId) issues.push('claimed_winner_not_top_score');
  if (scoreEntries.some((entry) => entry.score < 0 || entry.score > 1000000000)) issues.push('impossible_score');

  const evidenceUrls = Array.isArray(resultPayload.evidence_urls)
    ? resultPayload.evidence_urls.filter(Boolean)
    : [resultPayload.proof_url, resultPayload.screenshot_url, resultPayload.video_url].filter(Boolean);
  const verificationMethod = match.verification_method || match.game_snapshot?.verification_type || 'screenshot';
  if (verificationMethod !== 'honor_system' && evidenceUrls.length === 0) issues.push('missing_evidence');

  const submittedAt = new Date().toISOString();
  const endsAt = match.ends_at || match.deadline;
  if (endsAt && Date.parse(submittedAt) > Date.parse(endsAt)) issues.push('time_mismatch');

  let aiRecommendation = 'recommended_winner';
  if (issues.includes('conflicting_top_scores') || issues.includes('claimed_winner_not_top_score')) {
    aiRecommendation = 'dispute_detected';
  } else if (issues.includes('missing_evidence') || issues.includes('missing_scores') || issues.includes('claimed_winner_missing_score')) {
    aiRecommendation = 'needs_more_evidence';
  } else if (issues.length) {
    aiRecommendation = 'manual_review_required';
  }

  const aiConfidence = aiRecommendation === 'recommended_winner' ? 0.82 : aiRecommendation === 'dispute_detected' ? 0.35 : 0.48;
  const verificationStatus = aiRecommendation === 'recommended_winner' ? 'recommended' : 'manual_review';

  return {
    evidenceUrls,
    scoreData: scoreEntries,
    aiRecommendation,
    aiConfidence,
    verificationStatus,
    issues,
    topScore,
  };
}

async function createNorthPoleMatchRecord({ store, user, input, sandboxMode = false, skillAgreementVersion = null }) {
  const gameId = input.gameId || input.game_id;
  const prizeId = input.prizeId || input.prize_id;
  const maxPlayers = input.maxPlayers || input.max_players;
  const buyInCents = input.buyInCents ?? input.buy_in_cents;

  if (!gameId || !prizeId) {
    const error = new Error('Missing gameId or prizeId');
    error.status = 400;
    throw error;
  }
  if (!Number.isInteger(maxPlayers) || maxPlayers < 2 || maxPlayers > 100) {
    const error = new Error('maxPlayers must be between 2 and 100');
    error.status = 400;
    throw error;
  }
  if (!Number.isInteger(buyInCents) || buyInCents < 0 || buyInCents > 10000000) {
    const error = new Error('buyInCents is invalid');
    error.status = 400;
    throw error;
  }

  const matchId = generateNorthPoleMatchId();
  const nowIso = new Date().toISOString();
  const agreementFields = skillAgreementVersion ? {
    skill_agreement_required: true,
    skill_agreement_version: skillAgreementVersion,
    creator_agreement_accepted_at: nowIso,
    creator_agreement_user_id: user.id,
    participant_agreements: {
      [user.id]: {
        user_id: user.id,
        accepted_at: nowIso,
        agreement_version: skillAgreementVersion,
      },
    },
  } : {};
  const match = await store.create('north_pole_matches', {
    match_id: matchId,
    created_by: user.id,
    creator_user_id: user.id,
    creator_display_name: user.full_name || user.name || user.email || 'Creator',
    game_id: gameId,
    game_snapshot: sanitizeSnapshot(input.gameSnapshot || input.game_snapshot),
    prize_id: prizeId,
    prize_snapshot: sanitizeSnapshot(input.prizeSnapshot || input.prize_snapshot),
    player_ids: [user.id],
    scores: {},
    status: input.status || (sandboxMode ? 'active' : 'open'),
    sandbox_mode: sandboxMode,
    fulfillment_mode: sandboxMode ? 'sandbox' : 'simulated',
    creator_is_mission_player: true,
    mission_player_number: maxPlayers + 1,
    player_slots: maxPlayers,
    entry_amount_cents: buyInCents,
    total_prize_path_cents: sanitizeSnapshot(input.matchPlan || input.match_plan)?.totalPrizeCostCents
      || sanitizeSnapshot(input.prizeSnapshot || input.prize_snapshot)?.total_prize_cost_cents
      || sanitizeSnapshot(input.prizeSnapshot || input.prize_snapshot)?.price_cents
      || 0,
    prize_locked_at: nowIso,
    started_at: nowIso,
    buy_in_cents: buyInCents,
    max_players: maxPlayers,
    match_plan: sanitizeSnapshot(input.matchPlan || input.match_plan),
    ...agreementFields,
  });

  const entry = await store.create(T.matchEntries, {
    matchId,
    userId: user.id,
    status: 'paid',
    entryAmount: buyInCents,
    currency: 'USD',
    paymentProvider: 'simulated',
    paymentIntentId: `sim_payment_${crypto.randomUUID()}`,
  });

  await store.create('match_events', {
    match_id: matchId,
    event_type: 'match_created',
    actor_user_id: user.id,
    data: { match_id: matchId, game_id: gameId, sandbox_mode: sandboxMode },
    note: sandboxMode ? 'Sandbox match created' : 'North Pole match created',
  });

  await store.create(T.auditEvents, {
    actor: `user:${user.id}`,
    stage: 'MATCH_CREATED',
    message: 'North Pole match created',
    meta: {
      entityType: 'NorthPoleMatch',
      entityId: match.id,
      matchId,
      userId: user.id,
      action: 'MATCH_CREATED',
      metadata: { gameId, prizeId, sandboxMode },
    },
  });

  await store.create(T.auditEvents, {
    actor: `user:${user.id}`,
    stage: 'MATCH_ENTRY_SIMULATED_PAID',
    message: 'Creator simulated entry created',
    meta: {
      entityType: 'MatchEntry',
      entityId: entry.id,
      matchId,
      userId: user.id,
      action: 'MATCH_ENTRY_SIMULATED_PAID',
      metadata: { paymentProvider: 'simulated', creatorEntry: true },
    },
  });

  return match;
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

  router.post('/publicBetaReadiness', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res);
    if (!user) return;
    if (!isAdminUser(user)) return res.status(403).json({ success: false, error: 'Access denied' });

    const paymentEnabled = process.env.PAYMENT_PROVIDER_ENABLED === 'true'
      || Boolean(process.env.STRIPE_SECRET_KEY || process.env.STRIPE_WEBHOOK_SECRET);
    const frontendOrigin = process.env.FRONTEND_ORIGIN || '';

    ok(res, {
      summary: 'Public beta readiness only. Live payments and real fulfillment remain disabled.',
      checks: [
        {
          key: 'supabaseConnected',
          label: 'Supabase connected',
          status: Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)),
          note: 'Checks server-side Supabase URL and key presence without exposing secrets.',
        },
        {
          key: 'renderBackendHealth',
          label: 'Render backend health',
          status: true,
          note: 'This admin-only function returned successfully from the backend.',
        },
        {
          key: 'vercelFrontendLive',
          label: 'Vercel frontend live',
          status: Boolean(frontendOrigin && !frontendOrigin.includes('localhost')),
          note: frontendOrigin ? `Configured frontend origin: ${frontendOrigin}` : 'FRONTEND_ORIGIN is not configured.',
        },
        {
          key: 'ebayKeyConfigured',
          label: 'eBay key configured',
          status: Boolean(process.env.EBAY_CLIENT_ID && process.env.EBAY_CLIENT_SECRET),
          note: 'Used for live prize search when configured; sample fallback remains available.',
        },
        {
          key: 'rawgKeyConfigured',
          label: 'RAWG key configured',
          status: Boolean(process.env.RAWG_API_KEY),
          note: 'Used for live game search when configured; sample fallback remains available.',
        },
        {
          key: 'paymentProviderNotEnabled',
          label: 'Payment provider not enabled',
          status: !paymentEnabled,
          note: 'Public beta must keep live payment collection disabled.',
        },
        {
          key: 'legalReviewPending',
          label: 'Legal review pending',
          status: 'pending',
          note: 'No page or checklist item claims legal compliance is complete.',
        },
      ],
    });
  }));

  router.post('/createMissionCheckoutSession', asyncHandler(async (req, res) => {
    const input = missionCheckoutSchema.parse(req.body || {});
    const result = await createStripeCheckoutSession({ req, store, input, mode: 'mission_support' });
    ok(res, result);
  }));

  router.post('/createSponsorCheckoutSession', asyncHandler(async (req, res) => {
    const input = missionCheckoutSchema.parse({
      ...(req.body || {}),
      contribution_type: req.body?.contribution_type || 'sponsor',
    });
    const result = await createStripeCheckoutSession({ req, store, input, mode: 'sponsor_package' });
    ok(res, result);
  }));

  router.get('/listMissionLedger', asyncHandler(async (_req, res) => {
    const ledgerEntries = await store.list('mission_ledger_entries', {}, { sort: '-created_at', limit: 100 }).catch(() => []);
    const sourceRows = ledgerEntries.length
      ? ledgerEntries
      : await store.list('mission_contributions', { status: 'funded' }, { sort: '-created_at', limit: 100 }).catch(() => []);
    ok(res, { entries: sourceRows.map(sanitizeMissionLedgerRow) });
  }));

  router.post('/stripeMissionWebhook', asyncHandler(async (req, res) => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    if (!webhookSecret) {
      return res.status(501).json({ success: false, error: 'STRIPE_WEBHOOK_SECRET is not configured. Webhook is placeholder-only.' });
    }

    const event = req.body || {};
    if (event.type !== 'checkout.session.completed') {
      ok(res, { received: true, ignored: true });
      return;
    }

    const updated = await recordMissionCheckoutCompleted({ store, session: event.data?.object || {} });
    ok(res, { received: true, updated });
  }));

  router.post('/listOpenNorthPoleMatches', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res);
    if (!user) return;

    const options = entityOptions({
      sort: req.body?.sort || '-created_date',
      limit: parseLimit(req.body?.limit) ?? 100,
    });
    const rows = isAdminUser(user)
      ? await store.list('north_pole_matches', {}, options)
      : await store.list('north_pole_matches', {
        sandbox_mode: false,
        status: NORTH_POLE_VISIBLE_STATUSES,
      }, options);
    ok(res, { rows, data: rows });
  }));

  router.post('/createNorthPoleMatch', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res);
    if (!user) return;

    const input = createNorthPoleMatchSchema.parse(req.body || {});
    if (input.sandboxMode || input.sandbox_mode) {
      return res.status(403).json({ success: false, error: 'Use createSandboxNorthPoleMatch for sandbox matches' });
    }

    try {
      const skillAgreementVersion = requireSkillCompetitionAgreement(input);
      const match = await createNorthPoleMatchRecord({
        store,
        user,
        input,
        sandboxMode: false,
        skillAgreementVersion,
      });
      ok(res, { match, row: match, data: match });
    } catch (error) {
      res.status(error.status || 500).json({ success: false, error: error.message || 'Could not create match' });
    }
  }));

  router.post('/createSandboxNorthPoleMatch', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res);
    if (!user) return;

    const input = createNorthPoleMatchSchema.parse(req.body || {});
    try {
      const match = await createNorthPoleMatchRecord({ store, user, input, sandboxMode: true });
      ok(res, { match, row: match, data: match });
    } catch (error) {
      res.status(error.status || 500).json({ success: false, error: error.message || 'Could not create sandbox match' });
    }
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

    let skillAgreementVersion;
    try {
      skillAgreementVersion = requireSkillCompetitionAgreement(input);
    } catch (error) {
      return res.status(error.status || 400).json({ success: false, error: error.message });
    }

    const playerIds = Array.isArray(match.player_ids) ? match.player_ids : [];
    if (playerIds.includes(user.id)) return res.status(400).json({ success: false, error: 'You have already joined this match' });
    const maxPlayers = Number(match.max_players || 0);
    if (!Number.isInteger(maxPlayers) || maxPlayers < 2) return res.status(400).json({ success: false, error: 'Match capacity is invalid' });
    if (playerIds.length >= maxPlayers) return res.status(400).json({ success: false, error: 'This match is already full' });

    const nextPlayerIds = [...playerIds, user.id];
    const nextStatus = nextPlayerIds.length >= maxPlayers ? 'in_progress' : 'waiting_for_players';
    const acceptedAt = new Date().toISOString();
    const participantAgreements = normalizeParticipantAgreements(match.participant_agreements);
    const entry = await store.create(T.matchEntries, {
      matchId: match.match_id,
      userId: user.id,
      status: 'paid',
      entryAmount: match.buy_in_cents || match.entry_amount_cents || 0,
      currency: 'USD',
      paymentProvider: 'simulated',
      paymentIntentId: `sim_payment_${crypto.randomUUID()}`,
    });
    const updated = await store.update('north_pole_matches', match.id, {
      player_ids: nextPlayerIds,
      status: nextStatus,
      joined_at: acceptedAt,
      skill_agreement_required: true,
      skill_agreement_version: match.skill_agreement_version || skillAgreementVersion,
      participant_agreements: {
        ...participantAgreements,
        [user.id]: {
          user_id: user.id,
          accepted_at: acceptedAt,
          agreement_version: skillAgreementVersion,
        },
      },
    });

    await store.create('match_events', {
      match_id: match.match_id,
      event_type: nextStatus === 'active' ? 'match_started' : 'player_joined',
      actor_user_id: user.id,
      data: { player_count: nextPlayerIds.length, max_players: maxPlayers },
      note: nextStatus === 'active' ? 'Match filled and is ready to start' : 'Player joined match',
    });

    await store.create(T.auditEvents, {
      actor: `user:${user.id}`,
      stage: 'MATCH_ENTRY_SIMULATED_PAID',
      message: 'Player joined with simulated payment',
      meta: {
        entityType: 'MatchEntry',
        entityId: entry.id,
        matchId: match.match_id,
        userId: user.id,
        action: 'MATCH_ENTRY_SIMULATED_PAID',
        metadata: { paymentProvider: 'simulated' },
      },
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
    if (!canFinalizeNorthPoleMatch(user, match)) {
      return res.status(403).json({ success: false, error: 'Only match participants, match creators, or admins can finalize this match' });
    }

    const scores = resultPayload.scores && typeof resultPayload.scores === 'object' ? resultPayload.scores : null;
    const winnerUserId = resultPayload.winner?.userId || resultPayload.winner_user_id;
    if (!scores || !winnerUserId) return res.status(400).json({ success: false, error: 'Invalid result payload' });

    const analysis = analyzeWinnerSubmission({ match, resultPayload, scores, winnerUserId });
    const nowIso = new Date().toISOString();

    const scoreSubmission = await store.create(T.scoreSubmissions, {
      match_id: match.match_id,
      match_db_id: match.id,
      submitted_by_user_id: user.id,
      claimed_winner_user_id: winnerUserId,
      score_data: scores,
      evidence_urls: analysis.evidenceUrls,
      submitted_at: nowIso,
    });

    const evidence = await store.create(T.matchEvidence, {
      match_id: match.match_id,
      score_submission_id: scoreSubmission.id,
      submitted_by_user_id: user.id,
      evidence_urls: analysis.evidenceUrls,
      evidence_type: analysis.evidenceUrls.length ? 'media_url' : 'missing',
      status: analysis.evidenceUrls.length ? 'received' : 'missing',
    });

    const verification = await store.create(T.winnerVerifications, {
      match_id: match.match_id,
      match_db_id: match.id,
      score_submission_id: scoreSubmission.id,
      match_evidence_id: evidence.id,
      submitted_by_user_id: user.id,
      claimed_winner_user_id: winnerUserId,
      evidence_urls: analysis.evidenceUrls,
      score_data: scores,
      game_rules_snapshot: {
        rules: match.rules || match.match_plan?.rules || '',
        game_snapshot: match.game_snapshot || {},
        verification_method: match.verification_method || match.game_snapshot?.verification_type || 'screenshot',
      },
      ai_recommendation: analysis.aiRecommendation,
      ai_confidence: analysis.aiConfidence,
      ai_findings: analysis.issues,
      verification_status: analysis.verificationStatus,
      admin_review_required: true,
      reviewed_by: null,
      reviewed_at: null,
    });

    let dispute = null;
    if (analysis.aiRecommendation === 'dispute_detected') {
      dispute = await store.create(T.matchDisputes, {
        match_id: match.match_id,
        winner_verification_id: verification.id,
        opened_by_user_id: user.id,
        dispute_status: 'open',
        reasons: analysis.issues,
      });
    }

    const updated = await store.update('north_pole_matches', match.id, {
      status: analysis.aiRecommendation === 'dispute_detected' ? 'disputed' : 'pending_verification',
      completed_at: nowIso,
      raw_result_payload: resultPayload,
      scores,
      claimed_winner_user_id: winnerUserId,
      winner_verification_id: verification.id,
    });

    await store.create('match_events', {
      match_id: match.match_id,
      event_type: 'winner_verification_created',
      actor_user_id: user.id,
      data: {
        score_submission_id: scoreSubmission.id,
        winner_verification_id: verification.id,
        ai_recommendation: analysis.aiRecommendation,
        admin_review_required: true,
      },
      note: 'Winner verification recommendation created. Admin approval is required before fulfillment intent.',
    });

    ok(res, { match: updated, verification, scoreSubmission, evidence, dispute, row: updated, data: updated });
  }));

  router.post('/approveWinnerVerification', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res);
    if (!user) return;
    if (!isAdminUser(user)) return res.status(403).json({ success: false, error: 'Admin review is required to approve winner verification.' });

    const input = approveWinnerVerificationSchema.parse(req.body || {});
    const verificationId = input.id || input.verificationId || input.verification_id;
    if (!verificationId) return res.status(400).json({ success: false, error: 'Winner verification ID is required' });

    const verification = await store.findOne(T.winnerVerifications, { id: verificationId });
    if (!verification) return res.status(404).json({ success: false, error: 'Winner verification not found' });

    const approve = input.approve !== false;
    const nowIso = new Date().toISOString();
    const status = approve ? 'approved' : 'rejected';
    const winnerUserId = input.winnerUserId || input.winner_user_id || verification.claimed_winner_user_id;
    const reviewed = await store.update(T.winnerVerifications, verification.id, {
      verification_status: status,
      reviewed_by: user.id,
      reviewed_at: nowIso,
      review_note: input.reviewNote || input.review_note || '',
    });

    const match = await store.findOne('north_pole_matches', { match_id: verification.match_id });
    let updatedMatch = match;
    let fulfillmentIntent = null;
    if (approve && match) {
      updatedMatch = await store.update('north_pole_matches', match.id, {
        status: 'fulfillment_pending',
        winner_id: winnerUserId,
        winner_user_id: winnerUserId,
        verified_at: nowIso,
        verified_by: user.id,
        winner_locked_at: nowIso,
      });
      fulfillmentIntent = await store.create(T.fulfillmentIntents, {
        match_id: match.match_id,
        winner_user_id: winnerUserId,
        prize_snapshot: match.prize_snapshot || {},
        shipping_status: 'pending_admin_review',
        fulfillment_status: 'pending',
        purchase_mode: 'sandbox',
        admin_approval_required: true,
        winner_verification_id: verification.id,
      });
      await store.create(T.purchaseIntents, {
        match_id: match.match_id,
        winner_user_id: winnerUserId,
        prize_snapshot: match.prize_snapshot || {},
        purchase_mode: 'sandbox',
        purchase_status: 'pending_admin_review',
        admin_approval_required: true,
        fulfillment_intent_id: fulfillmentIntent.id,
      });
    } else if (match) {
      updatedMatch = await store.update('north_pole_matches', match.id, { status: 'pending_verification' });
    }

    await store.create('match_events', {
      match_id: verification.match_id,
      event_type: approve ? 'winner_verification_approved' : 'winner_verification_rejected',
      actor_user_id: user.id,
      data: { winner_verification_id: verification.id, fulfillment_intent_id: fulfillmentIntent?.id || null },
      note: approve ? 'Admin approved winner verification and created sandbox fulfillment intent.' : 'Admin rejected winner verification.',
    });

    ok(res, { verification: reviewed, match: updatedMatch, fulfillmentIntent, row: reviewed, data: reviewed });
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
    const user = await requireUser(req, res);
    if (!user) return;

    const { matchId, match_id } = req.body || {};
    const id = matchId || match_id;
    if (!id) return res.status(400).json({ success: false, error: 'Match ID required' });

    const match = await store.findOne(T.userMatches, { id });
    if (!match) return res.status(404).json({ success: false, error: 'Match not found' });
    const ticket = await store.findOne(T.tickets, { match_id: id, user_id: user.id });
    if (!isAdminUser(user) && !ticket) {
      return res.status(403).json({ success: false, error: 'Only match participants or admins can finalize this match' });
    }

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
