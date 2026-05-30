import express from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import { getRequestUser, ROLES } from '../lib/auth.js';

const ADMIN_ROLES = new Set([ROLES.OWNER, ROLES.ADMIN]);
const SIMULATED_PROVIDER = 'simulated';

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const ok = (res, data = {}) => res.json({ success: true, ...data });
const now = () => new Date().toISOString();
const makeId = (prefix) => `${prefix}_${crypto.randomUUID()}`;

const scoreTypes = ['highest_score', 'lowest_time', 'bracket_result', 'manual'];
const fulfillmentStatuses = ['ordered', 'shipped', 'delivered', 'cancelled'];
const cancellableMatchStatuses = new Set(['draft', 'open', 'waiting_for_players']);

const joinSchema = z.object({
  entryAmount: z.number().int().nonnegative().optional(),
  entry_amount: z.number().int().nonnegative().optional(),
  currency: z.string().min(3).max(8).optional(),
}).passthrough();

const submitScoreSchema = z.object({
  score: z.number(),
  scoreType: z.enum(scoreTypes).optional(),
  score_type: z.enum(scoreTypes).optional(),
  evidenceUrl: z.string().url().optional().or(z.literal('')),
  evidence_url: z.string().url().optional().or(z.literal('')),
  evidenceNotes: z.string().max(4000).optional(),
  evidence_notes: z.string().max(4000).optional(),
}).passthrough();

const lockWinnerSchema = z.object({
  winnerUserId: z.string().min(1).optional(),
  winner_user_id: z.string().min(1).optional(),
  winningScore: z.number().optional(),
  winning_score: z.number().optional(),
  verificationMethod: z.enum(['automatic', 'ai_assisted', 'admin_review']).optional(),
  verification_method: z.enum(['automatic', 'ai_assisted', 'admin_review']).optional(),
  auditNotes: z.string().max(4000).optional(),
  audit_notes: z.string().max(4000).optional(),
}).passthrough();

const updateFulfillmentStatusSchema = z.object({
  status: z.enum(fulfillmentStatuses),
  trackingNumber: z.string().max(120).optional(),
  tracking_number: z.string().max(120).optional(),
  carrier: z.string().max(120).optional(),
}).passthrough();

function isAdmin(user) {
  return ADMIN_ROLES.has(user?.role);
}

function matchUserIds(user) {
  return [user?.id, user?.auth_user_id, user?.authUserId, user?.user_id].filter(Boolean).map(String);
}

function isMatchCreator(match, user) {
  const userIds = matchUserIds(user);
  return [match?.creator_user_id, match?.created_by].filter(Boolean).map(String).some((id) => userIds.includes(id));
}

async function requireUser(req, res, store) {
  const user = await getRequestUser(req, store);
  if (!user?.id) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return null;
  }
  return user;
}

async function findMatch(store, matchId) {
  return await store.findOne('north_pole_matches', { id: matchId })
    || await store.findOne('north_pole_matches', { match_id: matchId })
    || await store.findOne('user_matches', { id: matchId })
    || await store.findOne('matches', { id: matchId });
}

function publicMatchId(match) {
  return match?.match_id || match?.id;
}

function matchRowId(match) {
  return match?.id;
}

async function createAuditEvent(store, {
  entityType,
  entityId,
  matchId,
  userId,
  action,
  metadata = {},
}) {
  return store.create('audit_events', {
    actor: userId ? `user:${userId}` : 'system',
    stage: action,
    message: action,
    meta: {
      entityType,
      entityId,
      matchId,
      userId,
      action,
      metadata,
    },
  });
}

function normalizePrize(match) {
  const snapshot = match?.prize_snapshot || match?.product_offer || {};
  const bestOffer = Array.isArray(snapshot.offers) ? snapshot.offers[0] || {} : {};
  const productSource = String(snapshot.source || snapshot.provider || bestOffer.retailer || 'manual').toLowerCase().includes('ebay')
    ? 'ebay'
    : String(snapshot.source || '').toLowerCase().includes('amazon')
      ? 'amazon'
      : 'manual';

  return {
    prizeId: match?.prize_id || match?.product_id || snapshot.id || null,
    productSource,
    productUrl: snapshot.product_url || snapshot.source_url || snapshot.url || bestOffer.product_url || null,
    itemId: snapshot.item_id || snapshot.itemId || snapshot.id || match?.prize_id || null,
    title: snapshot.title || 'Selected prize',
    price: Number(snapshot.price_cents || snapshot.price || bestOffer.price_cents || 0),
    currency: snapshot.currency || bestOffer.currency || 'USD',
    shippingCost: Number(snapshot.estimated_shipping_cents || snapshot.shipping_estimate_cents || snapshot.shippingCost || 0),
  };
}

function determineScoreType(match, scores) {
  const matchType = match?.score_type || match?.match_plan?.scoreType || match?.game_snapshot?.score_type;
  if (scoreTypes.includes(matchType)) return matchType;
  const lowestTime = scores.find((score) => score.score_type === 'lowest_time');
  return lowestTime ? 'lowest_time' : 'highest_score';
}

function compareScores(scoreType) {
  return (a, b) => {
    const delta = scoreType === 'lowest_time'
      ? Number(a.score) - Number(b.score)
      : Number(b.score) - Number(a.score);
    if (delta !== 0) return delta;
    return String(a.created_at || '').localeCompare(String(b.created_at || ''));
  };
}

async function recommendWinner(store, match) {
  const matchId = publicMatchId(match);
  const entries = await store.list('match_entries', { matchId });
  const scores = await store.list('match_scores', { matchId });
  const paidUserIds = new Set(entries.filter((entry) => entry.status === 'paid').map((entry) => entry.userId));
  const warnings = [];

  const eligibleScores = scores.filter((score) => {
    const usable = score.verificationStatus !== 'rejected'
      && score.verificationStatus !== 'disputed'
      && Number.isFinite(Number(score.score));
    return usable && (!paidUserIds.size || paidUserIds.has(score.userId));
  });

  if (!eligibleScores.length) warnings.push('no_eligible_scores');
  const scoreType = determineScoreType(match, eligibleScores);
  const rankedScores = [...eligibleScores].sort(compareScores(scoreType));
  const winnerScore = rankedScores[0] || null;
  const tied = winnerScore
    ? rankedScores.filter((row) => Number(row.score) === Number(winnerScore.score))
    : [];
  if (tied.length > 1) warnings.push('tie_requires_admin_review');

  const suspiciousScores = rankedScores.filter((score) => ['suspicious', 'flagged'].includes(score.aiReviewStatus));
  if (suspiciousScores.length) warnings.push('ai_evidence_review_flagged');
  if (rankedScores.some((score) => !score.evidenceUrl)) warnings.push('missing_evidence_url');

  return {
    matchId,
    scoreType,
    recommendedWinner: winnerScore ? {
      userId: winnerScore.userId,
      score: Number(winnerScore.score),
      scoreId: winnerScore.id,
    } : null,
    rankedScores,
    warnings,
    deterministicRule: scoreType === 'lowest_time' ? 'Lowest submitted time wins.' : 'Highest submitted score wins.',
  };
}

function aiEvidenceReview(input) {
  const notes = `${input.evidenceNotes || ''} ${input.evidenceUrl || ''}`.toLowerCase();
  if (!input.evidenceUrl) return 'flagged';
  if (/(edited|photoshop|fake|tamper|mismatch|borrowed|reused)/i.test(notes)) return 'suspicious';
  return 'clean';
}

export function createMatchFlowRouter({ store }) {
  const router = express.Router();

  router.post('/matches/:matchId/join-simulated', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;

    const input = joinSchema.parse(req.body || {});
    const match = await findMatch(store, req.params.matchId);
    if (!match) return res.status(404).json({ success: false, error: 'Match not found' });
    if (!['open', 'waiting_for_players'].includes(match.status)) {
      return res.status(400).json({ success: false, error: 'Match is not accepting entries' });
    }

    const matchId = publicMatchId(match);
    const existing = await store.findOne('match_entries', { matchId, userId: user.id });
    if (existing?.status === 'paid') return res.status(400).json({ success: false, error: 'You have already joined this match' });

    const entry = existing
      ? await store.update('match_entries', existing.id, {
        status: 'paid',
        entryAmount: input.entryAmount ?? input.entry_amount ?? match.buy_in_cents ?? match.entry_amount_cents ?? 0,
        currency: input.currency || 'USD',
        paymentProvider: SIMULATED_PROVIDER,
        paymentIntentId: existing.paymentIntentId || makeId('sim_payment'),
      })
      : await store.create('match_entries', {
        matchId,
        userId: user.id,
        status: 'paid',
        entryAmount: input.entryAmount ?? input.entry_amount ?? match.buy_in_cents ?? match.entry_amount_cents ?? 0,
        currency: input.currency || 'USD',
        paymentProvider: SIMULATED_PROVIDER,
        paymentIntentId: makeId('sim_payment'),
      });

    const playerIds = Array.isArray(match.player_ids) ? match.player_ids.map(String) : [];
    if (!playerIds.includes(String(user.id)) && matchRowId(match)) {
      const nextPlayerIds = [...playerIds, user.id];
      const full = Number(match.max_players || match.player_slots || 0) > 0 && nextPlayerIds.length >= Number(match.max_players || match.player_slots || 0);
      await store.update('north_pole_matches', matchRowId(match), {
        player_ids: nextPlayerIds,
        status: full ? 'in_progress' : 'waiting_for_players',
      }).catch(() => null);
    }

    await createAuditEvent(store, {
      entityType: 'MatchEntry',
      entityId: entry.id,
      matchId,
      userId: user.id,
      action: 'MATCH_ENTRY_SIMULATED_PAID',
      metadata: { paymentProvider: SIMULATED_PROVIDER },
    });

    ok(res, { entry, data: entry });
  }));

  router.post('/matches/:matchId/leave', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;

    const match = await findMatch(store, req.params.matchId);
    if (!match) return res.status(404).json({ success: false, error: 'Match not found' });
    if (!['open', 'waiting_for_players'].includes(match.status)) {
      return res.status(400).json({ success: false, error: 'You can only leave a prize room before it starts' });
    }
    if (isMatchCreator(match, user)) {
      return res.status(400).json({ success: false, error: 'Creators should cancel the prize room instead of leaving it' });
    }

    const userIds = matchUserIds(user);
    const playerIds = Array.isArray(match.player_ids) ? match.player_ids.map(String) : [];
    if (!playerIds.some((id) => userIds.includes(id))) {
      return res.status(400).json({ success: false, error: 'You have not joined this prize room' });
    }

    const nextPlayerIds = playerIds.filter((id) => !userIds.includes(id));
    const updated = matchRowId(match)
      ? await store.update('north_pole_matches', matchRowId(match), {
        player_ids: nextPlayerIds,
        status: nextPlayerIds.length > 1 ? 'waiting_for_players' : 'open',
      })
      : match;

    const entry = await store.findOne('match_entries', { matchId: publicMatchId(match), userId: user.id });
    if (entry) {
      await store.update('match_entries', entry.id, {
        status: 'cancelled',
        cancelledAt: now(),
        cancelledBy: user.id,
      }).catch(() => null);
    }

    await createAuditEvent(store, {
      entityType: 'NorthPoleMatch',
      entityId: matchRowId(match),
      matchId: publicMatchId(match),
      userId: user.id,
      action: 'MATCH_PLAYER_LEFT',
      metadata: { nextPlayerCount: nextPlayerIds.length },
    });

    ok(res, { match: updated, data: updated });
  }));

  router.post('/matches/:matchId/cancel', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;

    const match = await findMatch(store, req.params.matchId);
    if (!match) return res.status(404).json({ success: false, error: 'Match not found' });
    if (!isAdmin(user) && !isMatchCreator(match, user)) {
      return res.status(403).json({ success: false, error: 'Only the creator or an admin can cancel this prize room' });
    }
    if (!cancellableMatchStatuses.has(match.status)) {
      return res.status(400).json({ success: false, error: `Prize rooms with status "${match.status}" cannot be cancelled` });
    }
    if (!matchRowId(match)) {
      return res.status(400).json({ success: false, error: 'This match cannot be cancelled from this flow' });
    }

    const timestamp = now();
    const updated = await store.update('north_pole_matches', matchRowId(match), {
      status: 'cancelled',
      cancelled_at: timestamp,
      cancelled_by: user.id,
    });

    await createAuditEvent(store, {
      entityType: 'NorthPoleMatch',
      entityId: matchRowId(match),
      matchId: publicMatchId(match),
      userId: user.id,
      action: 'MATCH_CANCELLED',
      metadata: { previousStatus: match.status, cancelledAt: timestamp },
    });

    ok(res, { match: updated, data: updated });
  }));

  router.post('/matches/:matchId/submit-score', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;

    const input = submitScoreSchema.parse(req.body || {});
    const match = await findMatch(store, req.params.matchId);
    if (!match) return res.status(404).json({ success: false, error: 'Match not found' });
    if (!['in_progress', 'pending_verification'].includes(match.status)) {
      return res.status(400).json({ success: false, error: 'Results can only be submitted for prize rooms that are in progress' });
    }

    const matchId = publicMatchId(match);
    const entry = await store.findOne('match_entries', { matchId, userId: user.id });
    const playerIds = Array.isArray(match.player_ids) ? match.player_ids.map(String) : [];
    if (entry?.status !== 'paid' && !playerIds.includes(String(user.id))) {
      return res.status(403).json({ success: false, error: 'Only paid simulated entrants can submit scores' });
    }

    const evidenceUrl = input.evidenceUrl || input.evidence_url || '';
    const evidenceNotes = input.evidenceNotes || input.evidence_notes || '';
    const aiReviewStatus = aiEvidenceReview({ evidenceUrl, evidenceNotes });
    const score = await store.create('match_scores', {
      matchId,
      userId: user.id,
      score: input.score,
      scoreType: input.scoreType || input.score_type || 'highest_score',
      evidenceUrl,
      evidenceNotes,
      verificationStatus: 'pending',
      aiReviewStatus,
    });

    if (matchRowId(match)) {
      await store.update('north_pole_matches', matchRowId(match), { status: 'pending_verification' }).catch(() => null);
    }

    await createAuditEvent(store, {
      entityType: 'MatchScore',
      entityId: score.id,
      matchId,
      userId: user.id,
      action: 'MATCH_SCORE_SUBMITTED',
      metadata: { score: input.score, aiReviewStatus },
    });

    ok(res, { score, data: score });
  }));

  router.post('/matches/:matchId/verify-winner', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;
    if (!isAdmin(user)) return res.status(403).json({ success: false, error: 'Admin access required to verify winners' });

    const match = await findMatch(store, req.params.matchId);
    if (!match) return res.status(404).json({ success: false, error: 'Match not found' });

    const recommendation = await recommendWinner(store, match);
    if (matchRowId(match)) {
      await store.update('north_pole_matches', matchRowId(match), { status: 'pending_verification' }).catch(() => null);
    }
    await createAuditEvent(store, {
      entityType: 'WinnerVerification',
      entityId: null,
      matchId: recommendation.matchId,
      userId: user.id,
      action: 'WINNER_VERIFICATION_RECOMMENDED',
      metadata: { recommendedWinner: recommendation.recommendedWinner, warnings: recommendation.warnings },
    });

    ok(res, { ...recommendation, data: recommendation });
  }));

  router.post('/matches/:matchId/lock-winner', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;
    if (!isAdmin(user)) return res.status(403).json({ success: false, error: 'Admin access required to approve winners' });

    const input = lockWinnerSchema.parse(req.body || {});
    const match = await findMatch(store, req.params.matchId);
    if (!match) return res.status(404).json({ success: false, error: 'Match not found' });
    if (match.winner_locked_at && !isAdmin(user)) {
      return res.status(409).json({ success: false, error: 'Winner is already locked. Use admin dispute flow to change it.' });
    }

    const recommendation = await recommendWinner(store, match);
    const requestedWinner = input.winnerUserId || input.winner_user_id || recommendation.recommendedWinner?.userId;
    if (!requestedWinner) return res.status(400).json({ success: false, error: 'No winner can be locked until scores are submitted' });
    if (requestedWinner !== recommendation.recommendedWinner?.userId && !isAdmin(user)) {
      return res.status(403).json({ success: false, error: 'Only admins can override the deterministic winner recommendation' });
    }

    const winningScore = input.winningScore ?? input.winning_score ?? recommendation.recommendedWinner?.score ?? null;
    const verificationMethod = input.verificationMethod || input.verification_method || (recommendation.warnings.length ? 'admin_review' : 'automatic');
    const verification = await store.create('winner_verifications', {
      matchId: recommendation.matchId,
      winnerUserId: requestedWinner,
      winningScore,
      verificationMethod,
      status: 'locked',
      auditNotes: input.auditNotes || input.audit_notes || [
        recommendation.deterministicRule,
        recommendation.warnings.length ? `Warnings: ${recommendation.warnings.join(', ')}` : 'No warnings.',
      ].join(' '),
      recommendedWinner: recommendation.recommendedWinner,
      warnings: recommendation.warnings,
      rankedScores: recommendation.rankedScores,
    });

    if (matchRowId(match)) {
      await store.update('north_pole_matches', matchRowId(match), {
        status: 'fulfillment_pending',
        winner_id: requestedWinner,
        winner_user_id: requestedWinner,
        verified_at: now(),
        verified_by: user.id,
        winner_locked_at: now(),
        winner_verification_id: verification.id,
      }).catch(() => null);
    }

    await createAuditEvent(store, {
      entityType: 'WinnerVerification',
      entityId: verification.id,
      matchId: recommendation.matchId,
      userId: user.id,
      action: 'WINNER_LOCKED',
      metadata: { winnerUserId: requestedWinner, winningScore, verificationMethod },
    });

    ok(res, { verification, data: verification });
  }));

  router.post('/fulfillment/:matchId/create', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;

    const match = await findMatch(store, req.params.matchId);
    if (!match) return res.status(404).json({ success: false, error: 'Match not found' });
    const matchId = publicMatchId(match);
    const lockedVerification = await store.findOne('winner_verifications', { matchId, status: 'locked' });
    const winnerUserId = match.winner_user_id || lockedVerification?.winnerUserId;
    if (!winnerUserId) return res.status(400).json({ success: false, error: 'Winner must be locked before fulfillment is created' });

    const existing = await store.findOne('fulfillment_orders', { matchId });
    if (existing) return ok(res, { fulfillment: existing, data: existing });

    const prize = normalizePrize(match);
    const fulfillment = await store.create('fulfillment_orders', {
      matchId,
      winnerUserId,
      prizeId: prize.prizeId,
      productSource: prize.productSource,
      productUrl: prize.productUrl,
      itemId: prize.itemId,
      title: prize.title,
      price: prize.price,
      currency: prize.currency,
      shippingCost: prize.shippingCost,
      status: prize.productUrl ? 'ready_to_order' : 'pending',
      trackingNumber: '',
      carrier: '',
      orderedAt: null,
      shippedAt: null,
      deliveredAt: null,
    });

    if (matchRowId(match)) {
      await store.update('north_pole_matches', matchRowId(match), {
        status: 'prize_fulfillment',
        fulfillment_order_id: fulfillment.id,
      }).catch(() => null);
    }

    await createAuditEvent(store, {
      entityType: 'FulfillmentOrder',
      entityId: fulfillment.id,
      matchId,
      userId: user.id,
      action: 'FULFILLMENT_ORDER_CREATED',
      metadata: { productSource: fulfillment.productSource, status: fulfillment.status },
    });

    ok(res, { fulfillment, data: fulfillment });
  }));

  router.patch('/fulfillment/:fulfillmentId/status', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;
    if (!isAdmin(user)) return res.status(403).json({ success: false, error: 'Admin access required' });

    const input = updateFulfillmentStatusSchema.parse(req.body || {});
    const fulfillment = await store.findOne('fulfillment_orders', { id: req.params.fulfillmentId });
    if (!fulfillment) return res.status(404).json({ success: false, error: 'Fulfillment order not found' });

    const timestamp = now();
    const patch = {
      status: input.status,
      trackingNumber: input.trackingNumber || input.tracking_number || fulfillment.trackingNumber || '',
      carrier: input.carrier || fulfillment.carrier || '',
    };
    if (input.status === 'ordered') patch.orderedAt = fulfillment.orderedAt || timestamp;
    if (input.status === 'shipped') patch.shippedAt = fulfillment.shippedAt || timestamp;
    if (input.status === 'delivered') patch.deliveredAt = fulfillment.deliveredAt || timestamp;

    const updated = await store.update('fulfillment_orders', fulfillment.id, patch);
    await createAuditEvent(store, {
      entityType: 'FulfillmentOrder',
      entityId: fulfillment.id,
      matchId: fulfillment.matchId,
      userId: user.id,
      action: 'FULFILLMENT_STATUS_UPDATED',
      metadata: patch,
    });

    ok(res, { fulfillment: updated, data: updated });
  }));

  return router;
}
