import { base44 } from '@/api/base44Client';
import { apiRequest, invokeBackendFunction } from '@/api/apiClient';

export const SKILL_COMPETITION_AGREEMENT_VERSION = 'skill_competition_agreement_v1';

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
  skillAgreementAccepted = false,
  skillAgreementVersion = SKILL_COMPETITION_AGREEMENT_VERSION,
}) {
  const functionName = sandboxMode ? 'createSandboxNorthPoleMatch' : 'createNorthPoleMatch';
  const response = await invokeBackendFunction(functionName, {
    game_id: gameId,
    prize_id: prizeId,
    prize_snapshot: prizeSnapshot,
    game_snapshot: gameSnapshot,
    max_players: maxPlayers,
    buy_in_cents: buyInCents,
    match_plan: matchPlan || prizeSnapshot?.match_plan || null,
    sandbox_mode: sandboxMode,
    skill_agreement_accepted: skillAgreementAccepted,
    skill_agreement_version: skillAgreementVersion,
  });

  return response.data?.match || response.data?.data;
}

export async function listOpenNorthPoleMatches({ sort = '-created_date', limit = 100 } = {}) {
  const response = await invokeBackendFunction('listOpenNorthPoleMatches', {
    sort,
    limit,
  });

  return response.data?.rows || response.data?.data || [];
}

export async function joinNorthPoleMatch({
  matchId,
  skillAgreementAccepted = false,
  skillAgreementVersion = SKILL_COMPETITION_AGREEMENT_VERSION,
}) {
  if (!skillAgreementAccepted || skillAgreementVersion !== SKILL_COMPETITION_AGREEMENT_VERSION) {
    throw new Error('Skill-based competition agreement must be accepted before entering this match.');
  }

  const response = await apiRequest(`/api/matches/${encodeURIComponent(matchId)}/join-simulated`, {
    method: 'POST',
    body: {},
  });

  return response.data || response.entry;
}

export async function leaveNorthPoleMatch({ matchId }) {
  const response = await apiRequest(`/api/matches/${encodeURIComponent(matchId)}/leave`, {
    method: 'POST',
    body: {},
  });

  return response.match || response.data;
}

export async function cancelNorthPoleMatch({ matchId }) {
  const response = await apiRequest(`/api/matches/${encodeURIComponent(matchId)}/cancel`, {
    method: 'POST',
    body: {},
  });

  return response.match || response.data;
}

export async function submitScore({
  matchId,
  userId,
  score,
  scoreType = 'highest_score',
  evidenceUrl = '',
  evidenceNotes = '',
  platformUsername = '',
  matchRound = '',
  metadata = {},
}) {
  const response = await apiRequest(`/api/matches/${encodeURIComponent(matchId)}/submit-score`, {
    method: 'POST',
    body: {
      userId,
      score,
      scoreType,
      evidenceUrl,
      evidenceNotes,
      platformUsername,
      matchRound,
      metadata,
    },
  });

  return response.score || response.data;
}

export async function reviewScore({
  matchId,
  scoreId,
  verificationStatus,
  aiReviewStatus = 'not_reviewed',
  reviewNotes = '',
  reviewedBy = '',
}) {
  const response = await apiRequest(`/api/matches/${encodeURIComponent(matchId)}/review-score`, {
    method: 'POST',
    body: {
      scoreId,
      verificationStatus,
      aiReviewStatus,
      reviewNotes,
      reviewedBy,
    },
  });

  return response.score || response.data;
}

export async function verifyWinner({ matchId }) {
  return apiRequest(`/api/matches/${encodeURIComponent(matchId)}/verify-winner`, {
    method: 'POST',
    body: {},
  });
}

export async function lockWinner({
  matchId,
  winnerUserId,
  winningScore,
  verificationMethod = 'automatic',
  auditNotes = '',
  lockedBy = '',
  adminOverride = false,
}) {
  const response = await apiRequest(`/api/matches/${encodeURIComponent(matchId)}/lock-winner`, {
    method: 'POST',
    body: {
      winnerUserId,
      winningScore,
      verificationMethod,
      auditNotes,
      lockedBy,
      adminOverride,
    },
  });

  return response.verification || response.data;
}

export async function disputeWinner({ matchId, userId, reason, evidenceUrl = '' }) {
  const response = await apiRequest(`/api/matches/${encodeURIComponent(matchId)}/dispute-winner`, {
    method: 'POST',
    body: {
      userId,
      reason,
      evidenceUrl,
    },
  });

  return response.dispute || response.data;
}

export async function adminOverrideWinner({ matchId, adminUserId, newWinnerUserId, reason, evidenceUrl = '' }) {
  const response = await apiRequest(`/api/matches/${encodeURIComponent(matchId)}/admin-override-winner`, {
    method: 'POST',
    body: {
      adminUserId,
      newWinnerUserId,
      reason,
      evidenceUrl,
    },
  });

  return response.verification || response.data;
}

export async function createFulfillmentOrder({ matchId }) {
  const response = await apiRequest(`/api/fulfillment/${encodeURIComponent(matchId)}/create`, {
    method: 'POST',
    body: {},
  });

  return response.fulfillment || response.data;
}

export async function updateFulfillmentOrderStatus({ fulfillmentId, status, trackingNumber = '', carrier = '' }) {
  const response = await apiRequest(`/api/fulfillment/${encodeURIComponent(fulfillmentId)}/status`, {
    method: 'PATCH',
    body: {
      status,
      trackingNumber,
      carrier,
    },
  });

  return response.fulfillment || response.data;
}

export async function finalizeAndVerify({ matchDbId, matchId, resultPayload }) {
  const response = await invokeBackendFunction('finalizeNorthPoleMatchResult', {
    matchDbId,
    match_id: matchId,
    resultPayload,
  });

  return response.data?.match || response.data?.data;
}

export async function approveWinnerVerification({ verificationId, winnerUserId, approve = true, reviewNote = '' }) {
  const response = await invokeBackendFunction('approveWinnerVerification', {
    verification_id: verificationId,
    winner_user_id: winnerUserId,
    approve,
    review_note: reviewNote,
  });

  return response.data;
}

export async function createFulfillmentRecord({ matchId, winnerUserId, prizeId, prizeSnapshot }) {
  return {
    match_id: matchId,
    winner_user_id: winnerUserId,
    prize_id: prizeId,
    prize_snapshot: prizeSnapshot,
    shipping_status: 'pending_admin_review',
    fulfillment_status: 'pending',
    purchase_mode: 'sandbox',
    admin_approval_required: true,
  };
}
