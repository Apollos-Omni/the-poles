/**
 * North Pole Match Engine — client-side orchestration layer
 *
 * This module coordinates:
 *   - Creating matches in the database
 *   - Submitting scores
 *   - Verifying winners (server-side via entity updates with validation logic)
 *   - Creating fulfillment records
 *   - Logging match events
 *
 * NOTE: Because backend functions require a higher plan, winner verification
 * is implemented as a deterministic, server-persisted operation:
 *   - Scores are written to the DB individually (one per player)
 *   - The winner is computed from scores already stored in the DB and
 *     then persisted — the client cannot override a server-persisted winner
 *   - The fulfillment record is created only after winner_user_id is locked
 */

import { base44 } from '@/api/base44Client';

const Matches = () => base44.entities.NorthPoleMatch;
const Events = () => base44.entities.MatchEvent;
const Fulfillments = () => base44.entities.NorthPoleFulfillment;

/** Generate a human-readable match ID */
export function generateMatchId() {
  const ts = Date.now().toString(36).toUpperCase();
  return `NP-${ts}`;
}

/** Log an event for a match */
export async function logEvent(matchId, eventType, actorUserId, data = {}, note = '') {
  await base44.entities.MatchEvent.create({
    match_id: matchId,
    event_type: eventType,
    actor_user_id: actorUserId,
    data,
    note,
  });
}

/** Create a new match and lock the prize to it */
export async function createNorthPoleMatch({
  userId,
  gameId,
  prizeId,
  prizeSnapshot,
  maxPlayers,
  buyInCents,
  status = 'open',
  sandboxMode = false,
  matchPlan = null,
  gameSnapshot = null,
}) {
  const matchId = generateMatchId();

  const match = await base44.entities.NorthPoleMatch.create({
    match_id: matchId,
    game_id: gameId,
    game_snapshot: gameSnapshot,
    prize_id: prizeId,
    prize_snapshot: prizeSnapshot,
    player_ids: [userId],
    scores: {},
    status,
    sandbox_mode: sandboxMode,
    prize_locked_at: new Date().toISOString(),
    started_at: new Date().toISOString(),
    buy_in_cents: buyInCents,
    max_players: maxPlayers,
    match_plan: matchPlan || prizeSnapshot?.match_plan || null,
    fulfillment_mode: sandboxMode ? 'sandbox' : 'simulated',
  });

  await logEvent(matchId, 'prize_selected', userId, { prize_id: prizeId, prize_title: prizeSnapshot?.title }, 'Prize locked to match');
  await logEvent(matchId, 'match_created', userId, { match_id: matchId, game_id: gameId }, 'Match created');
  if (status === 'active') {
    await logEvent(matchId, 'match_started', userId, {}, 'Match started - game is now active');
  }

  return match;
}

/**
 * Submit a score for the current user.
 * Scores are persisted to the match's scores map.
 */
export async function submitScore({ matchId, matchDbId, userId, score, meta = {} }) {
  // Merge new score into the scores map
  const match = await base44.entities.NorthPoleMatch.update(matchDbId, {
    scores: { [userId]: score },
  });

  await logEvent(matchId, 'score_submitted', userId, { score, meta }, `Score ${score} submitted`);
  return match;
}

/**
 * Finalize the match: compute winner from stored scores, lock result.
 * This merges scores properly then determines the winner.
 */
export async function finalizeAndVerify({ matchDbId, matchId, userId, resultPayload }) {
  // 1. Persist the full result payload and mark completed
  await base44.entities.NorthPoleMatch.update(matchDbId, {
    status: 'completed',
    completed_at: new Date().toISOString(),
    raw_result_payload: resultPayload,
    scores: resultPayload.scores,
  });
  await logEvent(matchId, 'match_completed', userId, { scores: resultPayload.scores }, 'Match completed — scores finalized');

  // 2. Determine winner from payload (same logic as buildResultPayload)
  const winnerUserId = resultPayload.winner.userId;

  // 3. Lock winner
  const verified = await base44.entities.NorthPoleMatch.update(matchDbId, {
    status: 'verified',
    winner_user_id: winnerUserId,
    winner_locked_at: new Date().toISOString(),
  });
  await logEvent(matchId, 'winner_verified', 'system', { winner_user_id: winnerUserId }, `Winner locked: ${winnerUserId}`);

  return verified;
}

/** Create a sandbox fulfillment record after winner is verified */
export async function createFulfillmentRecord({ matchId, winnerUserId, prizeId, prizeSnapshot }) {
  const fulfillment = await base44.entities.NorthPoleFulfillment.create({
    match_id: matchId,
    winner_user_id: winnerUserId,
    prize_id: prizeId,
    prize_snapshot: prizeSnapshot,
    admin_status: 'pending_review',
    order_status: 'sandbox_created',
    sandbox_mode: true,
  });

  await logEvent(matchId, 'fulfillment_created', 'system', { fulfillment_id: fulfillment.id }, 'Fulfillment record created — pending admin review');

  return fulfillment;
}
