import { base44 } from '@/api/base44Client';
import { invokeBackendFunction } from '@/api/apiClient';

export function generateMatchId() {
  const ts = Date.now().toString(36).toUpperCase();
  return `NP-${ts}`;
}

export async function logEvent(matchId, eventType, actorUserId, data = {}, note = '') {
  await base44.entities.MatchEvent.create({
    match_id: matchId,
    event_type: eventType,
    actor_user_id: actorUserId,
    data,
    note,
  });
}

export async function createNorthPoleMatch({
  gameId,
  prizeId,
  prizeSnapshot,
  maxPlayers,
  buyInCents,
  sandboxMode = false,
  matchPlan = null,
  gameSnapshot = null,
}) {
  const response = await invokeBackendFunction('createNorthPoleMatch', {
    game_id: gameId,
    prize_id: prizeId,
    prize_snapshot: prizeSnapshot,
    game_snapshot: gameSnapshot,
    max_players: maxPlayers,
    buy_in_cents: buyInCents,
    match_plan: matchPlan || prizeSnapshot?.match_plan || null,
    sandbox_mode: sandboxMode,
  });

  return response.data?.match || response.data?.data;
}

export async function joinNorthPoleMatch({ matchId }) {
  const response = await invokeBackendFunction('joinNorthPoleMatch', {
    id: matchId,
  });

  return response.data?.match || response.data?.data;
}

export async function submitScore({ matchId, matchDbId, userId, score, meta = {} }) {
  const match = await base44.entities.NorthPoleMatch.update(matchDbId, {
    scores: { [userId]: score },
  });

  await logEvent(matchId, 'score_submitted', userId, { score, meta }, `Score ${score} submitted`);
  return match;
}

export async function finalizeAndVerify({ matchDbId, matchId, resultPayload }) {
  const response = await invokeBackendFunction('finalizeNorthPoleMatchResult', {
    matchDbId,
    match_id: matchId,
    resultPayload,
  });

  return response.data?.match || response.data?.data;
}

export async function createFulfillmentRecord({ matchId, winnerUserId, prizeId, prizeSnapshot }) {
  return {
    match_id: matchId,
    winner_user_id: winnerUserId,
    prize_id: prizeId,
    prize_snapshot: prizeSnapshot,
    admin_status: 'pending_review',
    order_status: 'sandbox_created',
    sandbox_mode: true,
  };
}
