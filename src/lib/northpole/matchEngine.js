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

export async function assignReferee({
  matchId,
  refereeAccountId = '',
  joinMethod = 'spectator_mode',
  externalLobbyId = '',
  streamUrl = '',
}) {
  const response = await apiRequest(`/api/matches/${encodeURIComponent(matchId)}/assign-referee`, {
    method: 'POST',
    body: {
      refereeAccountId,
      joinMethod,
      externalLobbyId,
      streamUrl,
    },
  });

  return response;
}

export async function startRefereeSession({ matchId, refereeSessionId }) {
  const response = await apiRequest(`/api/matches/${encodeURIComponent(matchId)}/start-referee-session`, {
    method: 'POST',
    body: {
      refereeSessionId,
    },
  });

  return response.session || response.data;
}

export async function submitRefereeReport({
  matchId,
  refereeSessionId,
  source = 'spectator_bot',
  providerName = '',
  winnerUserId,
  loserUserIds = [],
  winningScore,
  scoreType = 'highest_score',
  confidence = 1,
  evidenceUrls = [],
  rawReport = {},
  warnings = [],
  signedPayload = '',
}) {
  const response = await apiRequest(`/api/matches/${encodeURIComponent(matchId)}/referee-report`, {
    method: 'POST',
    body: {
      refereeSessionId,
      source,
      providerName,
      winnerUserId,
      loserUserIds,
      winningScore,
      scoreType,
      confidence,
      evidenceUrls,
      rawReport,
      warnings,
      signedPayload,
    },
  });

  return response.report || response.data;
}

export async function simulateRefereeReport({ matchId }) {
  const response = await apiRequest(`/api/matches/${encodeURIComponent(matchId)}/simulate-referee-report`, {
    method: 'POST',
    body: {},
  });

  return response;
}

export async function verifyWinner({ matchId }) {
  return apiRequest(`/api/matches/${encodeURIComponent(matchId)}/verify-winner`, {
    method: 'POST',
    body: {},
  });
}

export async function aiVerifyWinner({ matchId }) {
  return apiRequest(`/api/matches/${encodeURIComponent(matchId)}/ai-verify`, {
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
  const response = await apiRequest(`/api/matches/${encodeURIComponent(matchId)}/create-fulfillment`, {
    method: 'POST',
    body: {},
  });

  return response.fulfillment || response.data;
}

export async function updateFulfillmentOrderStatus({ fulfillmentId, status, trackingNumber = '', carrier = '' }) {
  const response = await apiRequest(`/api/admin/fulfillment/${encodeURIComponent(fulfillmentId)}`, {
    method: 'PATCH',
    body: {
      status,
      trackingNumber,
      carrier,
    },
  });

  return response.fulfillment || response.data;
}

export async function listPrizeFulfillmentQueue() {
  const response = await apiRequest('/api/admin/fulfillment');
  return response.data || {
    fulfillments: response.fulfillments || [],
    readyMatches: response.readyMatches || [],
  };
}

export async function createDemoFulfillmentOrder({ matchId = '' } = {}) {
  const response = await apiRequest('/api/admin/fulfillment/demo-order', {
    method: 'POST',
    body: matchId ? { matchId } : {},
  });

  return response.fulfillment || response.data;
}

export async function repairDemoFulfillmentOrders() {
  const response = await apiRequest('/api/admin/fulfillment/repair-demo-orders', {
    method: 'POST',
    body: {},
  });

  return response.data || {
    created: response.created || [],
    existing: response.existing || [],
    errors: response.errors || [],
  };
}

export async function getPrizeFulfillment({ fulfillmentId }) {
  const response = await apiRequest(`/api/admin/fulfillment/${encodeURIComponent(fulfillmentId)}`);
  return response.fulfillment || response.data;
}

export async function updatePrizeFulfillment({ fulfillmentId, patch }) {
  const response = await apiRequest(`/api/admin/fulfillment/${encodeURIComponent(fulfillmentId)}`, {
    method: 'PATCH',
    body: patch,
  });

  return response.fulfillment || response.data;
}

export async function calculatePrizeRoomCheckout({ prizeSnapshot, playerCount, maxPlayers, foundationRate } = {}) {
  const response = await apiRequest('/api/prize-rooms/calculate', {
    method: 'POST',
    body: {
      prizeSnapshot,
      playerCount,
      maxPlayers,
      foundationRate,
    },
  });

  return response.costBreakdown || response.data;
}

export async function listPrizeRoomTemplates() {
  const response = await apiRequest('/api/prize-room-templates');
  return response.templates || response.data || [];
}

export async function listPrizeRooms() {
  const response = await apiRequest('/api/prize-rooms');
  return response.rooms || response.data || [];
}

export async function listMarketplaceProducts({
  q = '',
  category = '',
  minPrice = '',
  maxPrice = '',
  condition = '',
  buyingOptions = '',
  limit = 24,
  offset = 0,
  endpoint = '/api/prize-catalog',
} = {}) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (category) params.set('category', category);
  if (minPrice !== '') params.set('minPrice', String(minPrice));
  if (maxPrice !== '') params.set('maxPrice', String(maxPrice));
  if (condition) params.set('condition', condition);
  if (buyingOptions) params.set('buyingOptions', buyingOptions);
  params.set('limit', String(limit));
  params.set('offset', String(offset));
  const response = await apiRequest(`${endpoint}?${params.toString()}`);
  return {
    products: response.products || response.data || [],
    pagination: response.pagination || { limit, offset, next_offset: offset + (response.products || []).length, has_more: false },
    provider: response.provider || '',
    providerStatus: response.providerStatus || '',
    totalRequested: response.total_requested || limit,
    totalResults: response.totalResults || response.total_results || (response.products || []).length,
  };
}

export async function listMarketplaceProductRows({
  rowLimit = 40,
  queryOffset = 0,
  endpoint = '/api/prize-catalog/rows',
} = {}) {
  const params = new URLSearchParams();
  params.set('rowLimit', String(rowLimit));
  params.set('queryOffset', String(queryOffset));
  const response = await apiRequest(`${endpoint}?${params.toString()}`);
  return {
    rows: response.rows || response.data || [],
    provider: response.provider || '',
    providerStatus: response.providerStatus || '',
    debug: response.debug || null,
    rowLimit: response.rowLimit || rowLimit,
  };
}

export async function getMarketplaceProduct({ productId }) {
  const response = await apiRequest(`/api/prize-products/${encodeURIComponent(productId)}`);
  return response.product || response.data;
}

export async function createPrizeRoom(payload) {
  const response = await apiRequest('/api/prize-rooms', {
    method: 'POST',
    body: payload,
  });

  return response.room || response.data;
}

export async function joinPrizeRoom({ roomId, displayName = '', userEmail = '', paymentMode = 'pilot_manual' }) {
  const response = await apiRequest(`/api/prize-rooms/${encodeURIComponent(roomId)}/join`, {
    method: 'POST',
    body: {
      displayName,
      userEmail,
      paymentMode,
    },
  });

  return response.data || { room: response.room, contribution: response.contribution };
}

export async function markPrizeRoomContributionPaid({ roomId, contributionId }) {
  const response = await apiRequest(`/api/admin/prize-rooms/${encodeURIComponent(roomId)}/contributions/${encodeURIComponent(contributionId)}/mark-paid`, {
    method: 'POST',
    body: {},
  });

  return response.data || { room: response.room, contribution: response.contribution };
}

export async function markPrizeRoomFunded({ roomId }) {
  const response = await apiRequest(`/api/admin/prize-rooms/${encodeURIComponent(roomId)}/mark-funded`, {
    method: 'POST',
    body: {},
  });

  return response.room || response.data;
}

export async function startPrizeRoomMatch({ roomId }) {
  const response = await apiRequest(`/api/admin/prize-rooms/${encodeURIComponent(roomId)}/start-match`, {
    method: 'POST',
    body: {},
  });

  return response.room || response.data;
}

export async function createPrizeRoomFulfillment({ roomId }) {
  const response = await apiRequest(`/api/admin/prize-rooms/${encodeURIComponent(roomId)}/create-fulfillment`, {
    method: 'POST',
    body: {},
  });

  return response.data || { room: response.room, fulfillment: response.fulfillment };
}

export async function hydratePrizeRoomProviderImages() {
  const response = await apiRequest('/api/admin/prize-rooms/hydrate-provider-images', {
    method: 'POST',
    body: {},
  });

  return response.data || response;
}

function pilotPrizeCostBreakdown(prizeSnapshot = {}) {
  const number = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : fallback;
  };
  const itemCost = number(prizeSnapshot.item_cost_cents ?? prizeSnapshot.price_cents ?? prizeSnapshot.price, 0);
  const estimatedTax = number(prizeSnapshot.estimated_tax_cents ?? prizeSnapshot.tax_cents, Math.round(itemCost * 0.0825));
  const estimatedShipping = number(prizeSnapshot.estimated_shipping_cents ?? prizeSnapshot.shipping_estimate_cents ?? prizeSnapshot.shipping_cost_cents, 599);
  const reserve = 300;
  const platformAmount = number(prizeSnapshot.platform_or_foundation_amount_cents ?? prizeSnapshot.foundation_amount_cents, 500);
  return {
    item_cost_cents: itemCost,
    estimated_tax_cents: estimatedTax,
    estimated_shipping_cents: estimatedShipping,
    fulfillment_reserve_cents: reserve,
    platform_or_foundation_amount_cents: platformAmount,
    total_required_cents: itemCost + estimatedTax + estimatedShipping + reserve + platformAmount,
    estimate_label: 'Pilot estimate',
    purchase_automation_status: 'No real purchase made automatically',
    fulfillment_requirement: 'Manual purchase required',
  };
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
  const prizeCostBreakdown = pilotPrizeCostBreakdown(prizeSnapshot);
  return {
    match_id: matchId,
    winner_user_id: winnerUserId,
    prize_id: prizeId,
    prize_snapshot: prizeSnapshot,
    prize_cost_breakdown: prizeCostBreakdown,
    item_cost_cents: prizeCostBreakdown.item_cost_cents,
    estimated_tax_cents: prizeCostBreakdown.estimated_tax_cents,
    estimated_shipping_cents: prizeCostBreakdown.estimated_shipping_cents,
    fulfillment_reserve_cents: prizeCostBreakdown.fulfillment_reserve_cents,
    platform_or_foundation_amount_cents: prizeCostBreakdown.platform_or_foundation_amount_cents,
    total_required_cents: prizeCostBreakdown.total_required_cents,
    shipping_status: 'pending_admin_review',
    fulfillment_status: 'pending',
    purchase_mode: 'sandbox',
    admin_approval_required: true,
  };
}
