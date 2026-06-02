import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trophy, Package, CheckCircle2, XCircle, Truck, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import {
  logEvent,
  reviewScore,
  assignReferee,
  startRefereeSession,
  simulateRefereeReport,
  verifyWinner,
  aiVerifyWinner,
  lockWinner,
  disputeWinner,
  adminOverrideWinner,
  createFulfillmentOrder,
  createDemoFulfillmentOrder,
  repairDemoFulfillmentOrders,
  listPrizeFulfillmentQueue,
  updatePrizeFulfillment,
  listPrizeRooms,
  markPrizeRoomContributionPaid,
  markPrizeRoomFunded,
  startPrizeRoomMatch,
  createPrizeRoomFulfillment,
  hydratePrizeRoomProviderImages,
} from '@/lib/northpole/matchEngine';
import MatchEventLog from './MatchEventLog';

const STATUS_COLORS = {
  pending_review: 'bg-yellow-600/20 text-yellow-300 border-yellow-600/30',
  approved: 'bg-green-600/20 text-green-300 border-green-600/30',
  rejected: 'bg-red-600/20 text-red-300 border-red-600/30',
};

const ORDER_COLORS = {
  sandbox_created: 'bg-blue-600/20 text-blue-300',
  processing: 'bg-purple-600/20 text-purple-300',
  ordered: 'bg-blue-600/20 text-blue-300',
  shipped: 'bg-green-600/20 text-green-300',
  delivered: 'bg-green-600/20 text-green-300',
  failed: 'bg-red-600/20 text-red-300',
};

const formatCents = (value) => {
  const cents = Number(value || 0);
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
};

const fallbackNumber = (...values) => {
  for (const value of values) {
    if (value === null || value === undefined || value === '') continue;
    const number = Number(value);
    if (Number.isFinite(number)) return number;
  }
  return 0;
};

const estimateBreakdownFromPrize = (prize = {}) => {
  const itemCost = fallbackNumber(prize.item_cost_cents, prize.price_cents, prize.price, 0);
  const estimatedTax = fallbackNumber(prize.estimated_tax_cents, prize.tax_cents, Math.round(itemCost * 0.0825));
  const estimatedShipping = fallbackNumber(prize.estimated_shipping_cents, prize.shipping_estimate_cents, prize.shipping_cost_cents, 599);
  const reserve = fallbackNumber(prize.fulfillment_reserve_cents, 300);
  const processingReserve = fallbackNumber(prize.payment_processing_reserve_cents, 0);
  const platformAmount = fallbackNumber(prize.platform_or_foundation_amount_cents, prize.foundation_amount_cents, 500);
  return {
    item_cost_cents: itemCost,
    estimated_tax_cents: estimatedTax,
    estimated_shipping_cents: estimatedShipping,
    fulfillment_reserve_cents: reserve,
    payment_processing_reserve_cents: processingReserve,
    foundation_amount_cents: platformAmount,
    platform_or_foundation_amount_cents: platformAmount,
    total_required_cents: itemCost + estimatedTax + estimatedShipping + reserve + processingReserve + platformAmount,
    estimate_label: 'Pilot estimate',
    purchase_automation_status: 'No real purchase made automatically',
    fulfillment_requirement: 'Manual purchase required',
  };
};

const getPrizeCostBreakdown = (record = {}) => {
  const stored = record.prize_cost_breakdown || record.prizeCostBreakdown;
  if (stored && typeof stored === 'object') return stored;
  const estimated = estimateBreakdownFromPrize(record.prize_snapshot || record.prizeSnapshot || record);
  const breakdown = {
    ...estimateBreakdownFromPrize(record.prize_snapshot || record.prizeSnapshot || record),
    item_cost_cents: fallbackNumber(record.item_cost_cents, stored?.item_cost_cents, record.prize_snapshot?.price_cents),
    estimated_tax_cents: fallbackNumber(record.estimated_tax_cents, stored?.estimated_tax_cents),
    estimated_shipping_cents: fallbackNumber(record.estimated_shipping_cents, stored?.estimated_shipping_cents),
    fulfillment_reserve_cents: fallbackNumber(record.fulfillment_reserve_cents, stored?.fulfillment_reserve_cents, 300),
    payment_processing_reserve_cents: fallbackNumber(record.payment_processing_reserve_cents, stored?.payment_processing_reserve_cents),
    foundation_amount_cents: fallbackNumber(record.foundation_amount_cents, stored?.foundation_amount_cents, record.platform_or_foundation_amount_cents, stored?.platform_or_foundation_amount_cents, 500),
    platform_or_foundation_amount_cents: fallbackNumber(record.platform_or_foundation_amount_cents, stored?.platform_or_foundation_amount_cents, record.foundation_amount_cents, stored?.foundation_amount_cents, 500),
  };
  return {
    ...breakdown,
    total_required_cents: fallbackNumber(
      record.total_required_cents,
      record.total_room_cost_cents,
      stored?.total_required_cents,
      stored?.total_room_cost_cents,
      breakdown.item_cost_cents + breakdown.estimated_tax_cents + breakdown.estimated_shipping_cents + breakdown.fulfillment_reserve_cents + breakdown.payment_processing_reserve_cents + breakdown.platform_or_foundation_amount_cents,
      estimated.total_required_cents,
    ),
  };
};

function PrizeCostBreakdownPanel({ record, compact = false }) {
  const breakdown = getPrizeCostBreakdown(record);
  const total = fallbackNumber(
    breakdown.total_required_cents,
    breakdown.total_room_cost_cents,
    breakdown.item_cost_cents + breakdown.estimated_tax_cents + breakdown.estimated_shipping_cents + breakdown.fulfillment_reserve_cents + breakdown.payment_processing_reserve_cents + (breakdown.foundation_amount_cents || breakdown.platform_or_foundation_amount_cents),
  );
  const rows = [
    ['Item cost', breakdown.item_cost_cents],
    ['Estimated tax', breakdown.estimated_tax_cents],
    ['Estimated shipping', breakdown.estimated_shipping_cents],
    ['Fulfillment reserve', breakdown.fulfillment_reserve_cents],
    ['Processing reserve', breakdown.payment_processing_reserve_cents],
    ['Foundation 10%', breakdown.foundation_amount_cents || breakdown.platform_or_foundation_amount_cents],
  ];

  return (
    <div className={`rounded-lg border border-yellow-700/40 bg-yellow-950/10 ${compact ? 'p-2' : 'p-3'}`}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge className="bg-yellow-600/20 text-yellow-100 border border-yellow-500/30">Pilot estimate</Badge>
        <Badge className="bg-red-600/20 text-red-100 border border-red-500/30">No real purchase made automatically</Badge>
        <Badge className="bg-orange-600/20 text-orange-100 border border-orange-500/30">Manual purchase required</Badge>
      </div>
      <div className="mt-2 grid gap-1 text-xs text-purple-100 sm:grid-cols-2">
        {rows.map(([label, cents]) => (
          <div key={label} className="flex justify-between gap-3">
            <span className="text-purple-300">{label}</span>
            <span className="font-mono text-white">{formatCents(cents)}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between border-t border-yellow-700/30 pt-2 text-sm">
        <span className="font-semibold text-yellow-100">Total required</span>
        <span className="font-mono font-bold text-yellow-100">{formatCents(total)}</span>
      </div>
      {!compact && (
        <p className="mt-2 text-xs text-yellow-100/80">
          Tax uses 8.25% unless a prize snapshot tax exists. Shipping uses snapshot data when present, otherwise $5.99.
        </p>
      )}
    </div>
  );
}

export default function AdminDashboard({ currentUser }) {
  const [matches, setMatches] = useState([]);
  const [fulfillments, setFulfillments] = useState([]);
  const [prizeFulfillments, setPrizeFulfillments] = useState([]);
  const [fulfillmentReadyMatches, setFulfillmentReadyMatches] = useState([]);
  const [prizeRooms, setPrizeRooms] = useState([]);
  const [matchScores, setMatchScores] = useState([]);
  const [winnerVerifications, setWinnerVerifications] = useState([]);
  const [refereeAccounts, setRefereeAccounts] = useState([]);
  const [refereeSessions, setRefereeSessions] = useState([]);
  const [refereeReports, setRefereeReports] = useState([]);
  const [events, setEvents] = useState({});
  const [expandedMatch, setExpandedMatch] = useState(null);
  const [adminNotes, setAdminNotes] = useState({});
  const [scoreReviewNotes, setScoreReviewNotes] = useState({});
  const [winnerActions, setWinnerActions] = useState({});
  const [trackingDrafts, setTrackingDrafts] = useState({});
  const [fulfillmentDrafts, setFulfillmentDrafts] = useState({});
  const [fulfillmentError, setFulfillmentError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  const load = async () => {
    setIsLoading(true);
    try {
      const [matchList, fulfillList, prizeQueue, roomList, scoreList, verificationList, refereeAccountList, refereeSessionList, refereeReportList] = await Promise.all([
        base44.entities.NorthPoleMatch.list('-created_date', 50),
        base44.entities.NorthPoleFulfillment.list('-created_date', 50),
        listPrizeFulfillmentQueue(),
        listPrizeRooms().catch(() => []),
        base44.entities.MatchScore.list('-created_date', 100),
        base44.entities.WinnerVerification.list('-created_date', 50),
        base44.entities.RefereeAccount.list('-created_date', 50).catch(() => []),
        base44.entities.MatchRefereeSession.list('-created_date', 100).catch(() => []),
        base44.entities.RefereeReport.list('-created_date', 100).catch(() => []),
      ]);
      setFulfillmentError('');
      setMatches(matchList);
      setFulfillments(fulfillList);
      setPrizeFulfillments(prizeQueue.fulfillments || []);
      setFulfillmentReadyMatches(prizeQueue.readyMatches || []);
      setPrizeRooms(roomList || []);
      setMatchScores(scoreList);
      setWinnerVerifications(verificationList);
      setRefereeAccounts(refereeAccountList);
      setRefereeSessions(refereeSessionList);
      setRefereeReports(refereeReportList);
    } catch (error) {
      setFulfillmentError(error.message || 'Could not load prize fulfillment queue.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const loadEvents = async (matchId) => {
    const evts = await base44.entities.MatchEvent.filter({ match_id: matchId }, 'created_date', 100);
    setEvents(prev => ({ ...prev, [matchId]: evts }));
  };

  const toggleExpand = (matchId) => {
    if (expandedMatch === matchId) {
      setExpandedMatch(null);
    } else {
      setExpandedMatch(matchId);
      loadEvents(matchId);
    }
  };

  const getFulfillment = (matchId) => fulfillments.find(f => f.match_id === matchId);
  const getMatch = (matchId) => matches.find(match => String(match.match_id || match.id) === String(matchId));
  const scoresForMatch = (matchId) => matchScores.filter(score => String(score.matchId || score.match_id) === String(matchId));
  const verificationForMatch = (matchId) => winnerVerifications.find(verification => String(verification.matchId || verification.match_id) === String(matchId) && verification.status === 'locked')
    || winnerVerifications.find(verification => String(verification.matchId || verification.match_id) === String(matchId));
  const gameTitle = (match = {}) => match.game_snapshot?.title || match.game_snapshot?.name || match.game_title || match.game_id || 'Game not recorded';
  const winningRule = (match = {}, recommendation = null, verification = null) => (
    recommendation?.deterministicRule
    || verification?.auditSummary?.deterministicRule
    || verification?.auditNotes
    || match.match_plan?.selectedRule
    || match.match_plan?.scoreType
    || match.score_type
    || match.game_snapshot?.score_type
    || 'Highest verified eligible score'
  );
  const scoreSummary = (scores = []) => scores.length
    ? scores.map(score => `${score.userId || score.user_id}: ${score.score} (${score.scoreType || score.score_type || 'score'})`).join(', ')
    : 'No submitted scores recorded';
  const proofUrlsForMatch = (matchId, scores = [], report = null) => [
    ...scores.map(score => score.evidenceUrl || score.evidence_url).filter(Boolean),
    ...(Array.isArray(report?.evidenceUrls) ? report.evidenceUrls : []),
    ...(Array.isArray(report?.evidence_urls) ? report.evidence_urls : []),
  ];

  const handleApprove = async (fulfillment) => {
    const key = fulfillment.id;
    setActionLoading(prev => ({ ...prev, [key]: true }));
    await base44.entities.NorthPoleFulfillment.update(fulfillment.id, {
      admin_status: 'approved',
      order_status: 'processing',
      reviewed_by: currentUser?.email,
      reviewed_at: new Date().toISOString(),
      admin_notes: adminNotes[fulfillment.id] || '',
    });
    await logEvent(fulfillment.match_id, 'admin_approved', currentUser?.id || 'admin',
      { fulfillment_id: fulfillment.id }, 'Admin approved fulfillment');
    await load();
    setActionLoading(prev => ({ ...prev, [key]: false }));
  };

  const handleReject = async (fulfillment) => {
    const key = fulfillment.id;
    setActionLoading(prev => ({ ...prev, [key]: true }));
    await base44.entities.NorthPoleFulfillment.update(fulfillment.id, {
      admin_status: 'rejected',
      reviewed_by: currentUser?.email,
      reviewed_at: new Date().toISOString(),
      admin_notes: adminNotes[fulfillment.id] || '',
    });
    await logEvent(fulfillment.match_id, 'admin_rejected', currentUser?.id || 'admin',
      { fulfillment_id: fulfillment.id }, 'Admin rejected fulfillment');
    await load();
    setActionLoading(prev => ({ ...prev, [key]: false }));
  };

  const handleMarkShipped = async (fulfillment) => {
    const key = fulfillment.id + '_ship';
    setActionLoading(prev => ({ ...prev, [key]: true }));
    await base44.entities.NorthPoleFulfillment.update(fulfillment.id, {
      order_status: 'shipped',
      tracking_number: 'SANDBOX-TRACK-' + Date.now().toString(36).toUpperCase(),
    });
    await logEvent(fulfillment.match_id, 'prize_sent', currentUser?.id || 'admin',
      { fulfillment_id: fulfillment.id }, 'Prize marked as shipped');
    await load();
    setActionLoading(prev => ({ ...prev, [key]: false }));
  };

  const verifiedMatches = matches.filter(m => ['verified', 'winner_verified', 'fulfillment_pending', 'prize_fulfillment', 'fulfilled'].includes(m.status));
  const pendingFulfillments = fulfillments.filter(f => f.admin_status === 'pending_review');
  const pendingScoreReviews = matchScores.filter(score => score.verificationStatus === 'pending');
  const disputedScores = matchScores.filter(score => score.verificationStatus === 'disputed' || ['suspicious', 'flagged'].includes(score.aiReviewStatus));
  const fulfillmentQueue = prizeFulfillments;
  const roomFundingCounts = prizeRooms.reduce((acc, room) => {
    acc.total += 1;
    if (room.status === 'funded') acc.funded += 1;
    return acc;
  }, { total: 0, funded: 0 });

  const updateTrackingDraft = (fulfillmentId, patch) => {
    setTrackingDrafts(prev => ({
      ...prev,
      [fulfillmentId]: {
        trackingNumber: '',
        carrier: '',
        ...(prev[fulfillmentId] || {}),
        ...patch,
      },
    }));
  };

  const updateFulfillmentDraft = (fulfillmentId, patch) => {
    setFulfillmentDrafts(prev => ({
      ...prev,
      [fulfillmentId]: {
        ...(prev[fulfillmentId] || {}),
        ...patch,
      },
    }));
  };

  const fulfillmentValue = (fulfillment, field) => (
    fulfillmentDrafts[fulfillment.id]?.[field] ?? fulfillment[field] ?? ''
  );

  const fulfillmentEditablePatch = (fulfillment) => ({
    winner_name: fulfillmentValue(fulfillment, 'winner_name'),
    winner_email: fulfillmentValue(fulfillment, 'winner_email'),
    prize_title: fulfillmentValue(fulfillment, 'prize_title'),
    prize_source: fulfillmentValue(fulfillment, 'prize_source'),
    prize_url: fulfillmentValue(fulfillment, 'prize_url'),
    prize_image: fulfillmentValue(fulfillment, 'prize_image'),
    shipping_name: fulfillmentValue(fulfillment, 'shipping_name'),
    shipping_address_line1: fulfillmentValue(fulfillment, 'shipping_address_line1'),
    shipping_address_line2: fulfillmentValue(fulfillment, 'shipping_address_line2'),
    shipping_city: fulfillmentValue(fulfillment, 'shipping_city'),
    shipping_state: fulfillmentValue(fulfillment, 'shipping_state'),
    shipping_zip: fulfillmentValue(fulfillment, 'shipping_zip'),
    shipping_country: fulfillmentValue(fulfillment, 'shipping_country'),
    retailer_order_id: fulfillmentValue(fulfillment, 'retailer_order_id'),
    tracking_number: fulfillmentValue(fulfillment, 'tracking_number'),
    admin_notes: fulfillmentValue(fulfillment, 'admin_notes'),
  });

  const handleCreatePrizeFulfillment = async (matchId) => {
    const key = `${matchId}_create_fulfillment`;
    setActionLoading(prev => ({ ...prev, [key]: true }));
    await createFulfillmentOrder({ matchId });
    await load();
    setActionLoading(prev => ({ ...prev, [key]: false }));
  };

  const handleCreateDemoFulfillmentOrder = async () => {
    const key = 'demo_fulfillment_order';
    setActionLoading(prev => ({ ...prev, [key]: true }));
    setFulfillmentError('');
    try {
      const fulfillment = await createDemoFulfillmentOrder();
      if (!fulfillment?.id) {
        throw new Error('Demo fulfillment endpoint did not return a fulfillment record.');
      }
      await load();
    } catch (error) {
      setFulfillmentError(error.message || 'Demo fulfillment order failed.');
    } finally {
      setActionLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleRepairDemoFulfillmentOrders = async () => {
    const key = 'repair_demo_fulfillment_orders';
    setActionLoading(prev => ({ ...prev, [key]: true }));
    setFulfillmentError('');
    try {
      const result = await repairDemoFulfillmentOrders();
      if (result.errors?.length) {
        setFulfillmentError(result.errors.map(error => `${error.match_id}: ${error.error}`).join(' | '));
      }
      await load();
    } catch (error) {
      setFulfillmentError(error.message || 'Repair demo fulfillment orders failed.');
    } finally {
      setActionLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const handlePrizeFulfillmentPatch = async (fulfillment, patch, keySuffix) => {
    const key = `${fulfillment.id}_${keySuffix}`;
    setActionLoading(prev => ({ ...prev, [key]: true }));
    await updatePrizeFulfillment({ fulfillmentId: fulfillment.id, patch });
    await load();
    setActionLoading(prev => ({ ...prev, [key]: false }));
  };

  const handleAddTracking = async (fulfillment) => {
    const draft = trackingDrafts[fulfillment.id] || {};
    await handlePrizeFulfillmentPatch(fulfillment, {
      trackingNumber: draft.trackingNumber || fulfillmentValue(fulfillment, 'tracking_number'),
    }, 'tracking');
  };

  const handleSaveFulfillment = async (fulfillment) => {
    await handlePrizeFulfillmentPatch(fulfillment, fulfillmentEditablePatch(fulfillment), 'save');
  };

  const handleFulfillmentStatus = async (fulfillment, status) => {
    await handlePrizeFulfillmentPatch(fulfillment, {
      ...fulfillmentEditablePatch(fulfillment),
      status,
      shippingStatus: status,
      adminApproved: ['ready_to_order', 'ordered', 'shipped', 'delivered'].includes(status) || fulfillment.admin_approved,
    }, status);
  };

  const handleMarkRoomContributionPaid = async (room, contribution) => {
    const key = `${room.id}_${contribution.id}_paid`;
    setActionLoading(prev => ({ ...prev, [key]: true }));
    await markPrizeRoomContributionPaid({ roomId: room.id, contributionId: contribution.id });
    await load();
    setActionLoading(prev => ({ ...prev, [key]: false }));
  };

  const handleMarkRoomFunded = async (room) => {
    const key = `${room.id}_funded`;
    setActionLoading(prev => ({ ...prev, [key]: true }));
    await markPrizeRoomFunded({ roomId: room.id });
    await load();
    setActionLoading(prev => ({ ...prev, [key]: false }));
  };

  const handleStartPrizeRoom = async (room) => {
    const key = `${room.id}_start`;
    setActionLoading(prev => ({ ...prev, [key]: true }));
    await startPrizeRoomMatch({ roomId: room.id });
    await load();
    setActionLoading(prev => ({ ...prev, [key]: false }));
  };

  const handleCreateRoomFulfillment = async (room) => {
    const key = `${room.id}_room_fulfillment`;
    setActionLoading(prev => ({ ...prev, [key]: true }));
    await createPrizeRoomFulfillment({ roomId: room.id });
    await load();
    setActionLoading(prev => ({ ...prev, [key]: false }));
  };

  const handleHydrateProviderImages = async () => {
    const key = 'hydrate_provider_images';
    setActionLoading(prev => ({ ...prev, [key]: true }));
    try {
      const result = await hydratePrizeRoomProviderImages();
      setFulfillmentError(`Provider image refresh complete. Updated ${result.updated_room_count || 0} room(s); ${result.failed_room_count || 0} failed.`);
      await load();
    } catch (error) {
      setFulfillmentError(error.message || 'Could not refresh provider images.');
    } finally {
      setActionLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleScoreReview = async (score, verificationStatus, aiReviewStatus = score.aiReviewStatus || 'not_reviewed') => {
    const key = `${score.id}_${verificationStatus}`;
    setActionLoading(prev => ({ ...prev, [key]: true }));
    await reviewScore({
      matchId: score.matchId,
      scoreId: score.id,
      verificationStatus,
      aiReviewStatus,
      reviewNotes: scoreReviewNotes[score.id] || '',
      reviewedBy: currentUser?.id || currentUser?.email || 'admin',
    });
    await load();
    setActionLoading(prev => ({ ...prev, [key]: false }));
  };

  const getRefereeSession = (matchId) => refereeSessions.find(session => session.matchId === matchId);
  const getRefereeReport = (matchId) => refereeReports.find(report => report.matchId === matchId);
  const getRefereeAccount = (session) => refereeAccounts.find(account => account.id === session?.refereeAccountId);

  const handleAssignGhostReferee = async (matchId) => {
    const key = `${matchId}_ghost_assign`;
    setActionLoading(prev => ({ ...prev, [key]: true }));
    const result = await assignReferee({ matchId, joinMethod: 'spectator_mode' });
    setWinnerActions(prev => ({ ...prev, [matchId]: { ...(prev[matchId] || {}), referee: result } }));
    await load();
    setActionLoading(prev => ({ ...prev, [key]: false }));
  };

  const handleStartRefereeSession = async (matchId) => {
    const session = winnerActions[matchId]?.referee?.session || getRefereeSession(matchId);
    if (!session?.id) return;
    const key = `${matchId}_ghost_start`;
    setActionLoading(prev => ({ ...prev, [key]: true }));
    await startRefereeSession({ matchId, refereeSessionId: session.id });
    await load();
    setActionLoading(prev => ({ ...prev, [key]: false }));
  };

  const handleSimulateRefereeReport = async (matchId) => {
    const key = `${matchId}_ghost_sim`;
    setActionLoading(prev => ({ ...prev, [key]: true }));
    const result = await simulateRefereeReport({ matchId });
    setWinnerActions(prev => ({ ...prev, [matchId]: { ...(prev[matchId] || {}), referee: result } }));
    await load();
    setActionLoading(prev => ({ ...prev, [key]: false }));
  };

  const handleRecommendWinner = async (matchId) => {
    const key = `${matchId}_recommend`;
    setActionLoading(prev => ({ ...prev, [key]: true }));
    const recommendation = await verifyWinner({ matchId });
    setWinnerActions(prev => ({ ...prev, [matchId]: { ...(prev[matchId] || {}), recommendation } }));
    await load();
    setActionLoading(prev => ({ ...prev, [key]: false }));
  };

  const handleAiVerifyWinner = async (matchId) => {
    const key = `${matchId}_ai_verify`;
    setActionLoading(prev => ({ ...prev, [key]: true }));
    const review = await aiVerifyWinner({ matchId });
    setWinnerActions(prev => ({ ...prev, [matchId]: { ...(prev[matchId] || {}), aiReview: review, recommendation: review.recommendation || prev[matchId]?.recommendation } }));
    await load();
    setActionLoading(prev => ({ ...prev, [key]: false }));
  };

  const handleLockRecommendedWinner = async (matchId) => {
    const recommendation = winnerActions[matchId]?.recommendation;
    const winnerUserId = recommendation?.recommendedWinnerUserId || recommendation?.recommendedWinner?.userId;
    if (!winnerUserId) return;
    const key = `${matchId}_lock`;
    setActionLoading(prev => ({ ...prev, [key]: true }));
    await lockWinner({
      matchId,
      winnerUserId,
      winningScore: recommendation.winningScore ?? recommendation.recommendedWinner?.score,
      verificationMethod: recommendation.warnings?.length ? 'admin_review' : 'automatic',
      auditNotes: recommendation.deterministicRule || '',
      lockedBy: currentUser?.id || currentUser?.email || 'admin',
    });
    await load();
    setActionLoading(prev => ({ ...prev, [key]: false }));
  };

  const updateWinnerAction = (matchId, patch) => {
    setWinnerActions(prev => ({
      ...prev,
      [matchId]: {
        disputeReason: '',
        disputeEvidenceUrl: '',
        overrideWinnerUserId: '',
        overrideReason: '',
        overrideEvidenceUrl: '',
        ...(prev[matchId] || {}),
        ...patch,
      },
    }));
  };

  const handleDisputeWinner = async (matchId) => {
    const draft = winnerActions[matchId] || {};
    if (!draft.disputeReason) return;
    const key = `${matchId}_dispute`;
    setActionLoading(prev => ({ ...prev, [key]: true }));
    await disputeWinner({
      matchId,
      userId: currentUser?.id,
      reason: draft.disputeReason,
      evidenceUrl: draft.disputeEvidenceUrl || '',
    });
    await load();
    setActionLoading(prev => ({ ...prev, [key]: false }));
  };

  const handleAdminOverrideWinner = async (matchId) => {
    const draft = winnerActions[matchId] || {};
    if (!draft.overrideWinnerUserId || !draft.overrideReason) return;
    const key = `${matchId}_override`;
    setActionLoading(prev => ({ ...prev, [key]: true }));
    await adminOverrideWinner({
      matchId,
      adminUserId: currentUser?.id,
      newWinnerUserId: draft.overrideWinnerUserId,
      reason: draft.overrideReason,
      evidenceUrl: draft.overrideEvidenceUrl || '',
    });
    await load();
    setActionLoading(prev => ({ ...prev, [key]: false }));
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1,2,3].map(i => <div key={i} className="h-24 bg-purple-900/30 rounded-xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Matches', value: matches.length, icon: '🎮', color: 'text-purple-300' },
          { label: 'Verified Winners', value: verifiedMatches.length, icon: '✅', color: 'text-green-300' },
          { label: 'Pending Review', value: pendingFulfillments.length, icon: '⏳', color: 'text-yellow-300' },
          { label: 'Prize Rooms Funded', value: `${roomFundingCounts.funded}/${roomFundingCounts.total}`, icon: '🏆', color: 'text-blue-300' },
        ].map(stat => (
          <Card key={stat.label} className="bg-purple-900/30 border-purple-700/30">
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-purple-400 text-xs">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Refresh */}
      <div className="flex flex-wrap justify-end gap-2">
        <Button
          variant="outline"
          onClick={handleHydrateProviderImages}
          disabled={actionLoading.hydrate_provider_images}
          className="border-yellow-700/50 text-yellow-200 hover:bg-yellow-950/40 gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${actionLoading.hydrate_provider_images ? 'animate-spin' : ''}`} />
          Refresh Provider Images
        </Button>
        <Button variant="outline" onClick={load} className="border-purple-700/50 text-purple-300 hover:bg-purple-900/40 gap-2">
          <RefreshCw className="w-4 h-4" />Refresh
        </Button>
      </div>

      <Card className="bg-black/30 border border-cyan-800/30">
        <CardHeader>
          <CardTitle className="text-lg text-white">Prize Room Queue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {prizeRooms.slice(0, 12).map(room => {
            const contributions = Array.isArray(room.contributions) ? room.contributions : [];
            const paidCount = contributions.filter(row => ['marked_paid', 'paid'].includes(row.status)).length;
            return (
              <div key={room.id} className="rounded-lg border border-cyan-800/30 bg-cyan-950/10 p-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-white">{room.title}</span>
                      <Badge className="bg-cyan-600/20 text-cyan-100">{room.status}</Badge>
                      <Badge className="bg-purple-600/20 text-purple-100">{room.payment_mode || 'pilot_manual'}</Badge>
                      <Badge className="bg-yellow-600/20 text-yellow-100">Manual purchase required</Badge>
                    </div>
                    <div className="text-xs text-purple-200">
                      {room.game_title} - Prize {room.prize_title} - Players {paidCount}/{room.max_players}
                    </div>
                    <div className="text-xs text-purple-400">
                      Match {room.match_id || 'not mirrored'} - Fulfillment {room.prize_fulfillment_id || room.fulfillment_status || 'not prepared'}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkRoomFunded(room)}
                      disabled={actionLoading[`${room.id}_funded`]}
                      className="border-green-700/50 text-green-200 hover:bg-green-950/40"
                    >
                      Mark Room Funded
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStartPrizeRoom(room)}
                      disabled={actionLoading[`${room.id}_start`]}
                      className="border-cyan-700/50 text-cyan-200 hover:bg-cyan-950/40"
                    >
                      Start Match
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleCreateRoomFulfillment(room)}
                      disabled={actionLoading[`${room.id}_room_fulfillment`] || !(room.winner_user_id || getMatch(room.match_id)?.winner_user_id)}
                      className="bg-purple-700 text-white hover:bg-purple-600"
                    >
                      Create Fulfillment
                    </Button>
                  </div>
                </div>
                <div className="mt-3">
                  <PrizeCostBreakdownPanel record={{ ...room, prize_cost_breakdown: room.cost_breakdown }} />
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {contributions.length ? contributions.map(contribution => (
                    <div key={contribution.id} className="rounded border border-purple-800/30 bg-black/25 p-2 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-white">{contribution.display_name || contribution.user_email || contribution.user_id}</span>
                        <Badge className={['marked_paid', 'paid'].includes(contribution.status) ? 'bg-green-600/20 text-green-200' : 'bg-yellow-600/20 text-yellow-200'}>
                          {contribution.status}
                        </Badge>
                      </div>
                      <div className="mt-1 text-purple-300">Contribution {formatCents(contribution.amount_cents)} - {contribution.payment_provider || 'manual_pilot'}</div>
                      {!['marked_paid', 'paid'].includes(contribution.status) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkRoomContributionPaid(room, contribution)}
                          disabled={actionLoading[`${room.id}_${contribution.id}_paid`]}
                          className="mt-2 border-green-700/50 text-green-200 hover:bg-green-950/40"
                        >
                          Mark Contribution Paid
                        </Button>
                      )}
                    </div>
                  )) : (
                    <p className="text-xs text-purple-400">No player contributions yet.</p>
                  )}
                </div>
              </div>
            );
          })}
          {!prizeRooms.length && (
            <p className="py-4 text-center text-sm text-purple-400">No Prize Rooms loaded yet. Open the lobby to seed starter rooms.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="bg-black/30 border border-purple-800/30">
          <CardHeader>
            <CardTitle className="text-lg text-white">Score Review Queue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[...pendingScoreReviews, ...disputedScores].slice(0, 8).map(score => (
              <div key={score.id} className="rounded-lg border border-purple-800/30 bg-purple-950/20 p-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-purple-100">{score.matchId}</span>
                  <Badge className={['suspicious', 'flagged'].includes(score.aiReviewStatus) ? 'bg-yellow-600/20 text-yellow-200' : 'bg-blue-600/20 text-blue-200'}>
                    {score.verificationStatus} / {score.aiReviewStatus}
                  </Badge>
                </div>
                <div className="mt-2 text-purple-200">
                  User {score.userId} submitted {score.score} ({score.scoreType})
                </div>
                {score.evidenceUrl && (
                  <a href={score.evidenceUrl} target="_blank" rel="noreferrer" className="mt-1 block truncate text-cyan-300">
                    {score.evidenceUrl}
                  </a>
                )}
                <Input
                  value={scoreReviewNotes[score.id] || ''}
                  onChange={event => setScoreReviewNotes(prev => ({ ...prev, [score.id]: event.target.value }))}
                  placeholder="Review notes"
                  className="mt-2 border-purple-700/40 bg-black/30 text-white placeholder:text-purple-400/60"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleScoreReview(score, 'verified', score.aiReviewStatus || 'clean')}
                    disabled={actionLoading[`${score.id}_verified`]}
                    className="bg-green-700 text-white hover:bg-green-600"
                  >
                    Verify
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleScoreReview(score, 'disputed', 'flagged')}
                    disabled={actionLoading[`${score.id}_disputed`]}
                    className="border-orange-700/50 text-orange-200 hover:bg-orange-950/40"
                  >
                    Mark Disputed
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleScoreReview(score, 'rejected', 'flagged')}
                    disabled={actionLoading[`${score.id}_rejected`]}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
            {pendingScoreReviews.length === 0 && disputedScores.length === 0 && (
              <p className="py-4 text-center text-sm text-purple-400">No pending or disputed score reviews.</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-black/30 border border-purple-800/30">
          <CardHeader>
            <CardTitle className="text-lg text-white">Winner Verification Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {winnerVerifications.slice(0, 8).map(verification => {
              const matchId = verification.matchId || verification.match_id;
              const match = getMatch(matchId) || {};
              const scores = scoresForMatch(matchId);
              const report = verification.refereeReport || getRefereeReport(matchId);
              const proofs = proofUrlsForMatch(matchId, scores, report);
              const finalWinner = verification.winnerUserId || verification.winner_user_id || match.winner_user_id || match.winner_id || '-';
              return (
                <div key={verification.id} className="rounded-lg border border-purple-800/30 bg-purple-950/20 p-3 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-purple-100">{matchId}</span>
                    <Badge className={verification.status === 'locked' ? 'bg-green-600/20 text-green-200' : 'bg-yellow-600/20 text-yellow-200'}>
                      Admin lock: {verification.status}
                    </Badge>
                  </div>
                  <div className="mt-2 grid gap-1 text-purple-200 sm:grid-cols-2">
                    <div>Game title: <span className="text-white">{gameTitle(match)}</span></div>
                    <div>Selected winning rule: <span className="text-white">{winningRule(match, null, verification)}</span></div>
                    <div>Submitted scores: <span className="text-white">{scoreSummary(scores)}</span></div>
                    <div>AI review status: <span className="text-white">{match.ai_referee_status || verification.aiReviewStatus || verification.ai_review_status || 'not reviewed'}</span></div>
                    <div>Final winner: <span className="font-mono text-yellow-200">{finalWinner}</span></div>
                    <div>Method: <span className="text-white">{verification.verificationMethod || verification.verification_method || '-'}</span></div>
                  </div>
                  {proofs.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {proofs.map(url => (
                        <a key={url} href={url} target="_blank" rel="noreferrer" className="text-cyan-300 hover:underline">
                          Evidence/proof URL
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-2 text-purple-400">Evidence/proof URL: none recorded</div>
                  )}
                  {verification.warnings?.length > 0 && (
                    <div className="mt-1 text-yellow-200">Warnings: {verification.warnings.join(', ')}</div>
                  )}
                </div>
              );
            })}
            {winnerVerifications.length === 0 && (
              <p className="py-4 text-center text-sm text-purple-400">No winner verifications yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-black/30 border border-purple-800/30">
        <CardHeader>
          <CardTitle className="text-lg text-white">Winner Verification Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {matches.filter(match => ['referee_assigned', 'waiting_for_referee', 'referee_observing', 'pending_verification', 'disputed', 'winner_verified', 'fulfillment_pending'].includes(match.status)).slice(0, 8).map(match => {
            const matchId = match.match_id || match.id;
            const draft = winnerActions[matchId] || {};
            const recommendation = draft.recommendation;
            const aiReview = draft.aiReview;
            const refereeSession = draft.referee?.session || getRefereeSession(matchId);
            const refereeReport = draft.referee?.report || recommendation?.refereeReport || getRefereeReport(matchId);
            const refereeAccount = draft.referee?.refereeAccount || getRefereeAccount(refereeSession);
            const recommendedWinnerUserId = recommendation?.recommendedWinnerUserId || recommendation?.recommendedWinner?.userId;
            const lockedVerification = verificationForMatch(matchId);
            const scores = scoresForMatch(matchId);
            const proofs = proofUrlsForMatch(matchId, scores, refereeReport);
            const finalWinner = match.winner_user_id || match.winner_id || lockedVerification?.winnerUserId || lockedVerification?.winner_user_id || recommendedWinnerUserId || '-';
            return (
              <div key={match.id} className="rounded-lg border border-purple-800/30 bg-purple-950/20 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-mono text-sm text-white">{matchId}</div>
                    <div className="text-xs text-purple-300">Game title: {gameTitle(match)}</div>
                    <div className="text-xs text-purple-300">Final winner: {finalWinner}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAiVerifyWinner(matchId)}
                      disabled={actionLoading[`${matchId}_ai_verify`]}
                      className="border-cyan-700/50 text-cyan-200 hover:bg-cyan-950/40"
                    >
                      AI Referee Review
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRecommendWinner(matchId)}
                      disabled={actionLoading[`${matchId}_recommend`]}
                      className="border-purple-700/50 text-purple-200 hover:bg-purple-900/40"
                    >
                      Recommend Winner
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleLockRecommendedWinner(matchId)}
                      disabled={actionLoading[`${matchId}_lock`] || !recommendedWinnerUserId}
                      className="bg-green-700 text-white hover:bg-green-600"
                    >
                      Lock Winner
                    </Button>
                  </div>
                </div>
                <div className="mt-3 rounded border border-purple-800/30 bg-black/20 p-2 text-xs text-purple-100">
                  <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
                    <span>Selected winning rule: <strong className="text-white">{winningRule(match, recommendation, lockedVerification)}</strong></span>
                    <span>Submitted scores: <strong className="text-white">{scoreSummary(scores)}</strong></span>
                    <span>AI review status: <strong className="text-white">{match.ai_referee_status || aiReview?.result || 'not reviewed'}</strong></span>
                    <span>Admin lock status: <strong className="text-white">{lockedVerification?.status || (match.winner_locked_at ? 'locked' : 'not locked')}</strong></span>
                    <span>Final winner: <strong className="font-mono text-yellow-200">{finalWinner}</strong></span>
                  </div>
                  {proofs.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {proofs.map(url => (
                        <a key={url} href={url} target="_blank" rel="noreferrer" className="text-cyan-300 hover:underline">
                          Evidence/proof URL
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-2 text-purple-400">Evidence/proof URL: none recorded</div>
                  )}
                </div>
                <div className="mt-3">
                  <PrizeCostBreakdownPanel record={match} compact />
                </div>
                {aiReview && (
                  <div className="mt-2 rounded border border-cyan-800/30 bg-cyan-950/10 p-2 text-xs text-purple-100">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-white">AI Referee:</span>
                      <Badge className={aiReview.result === 'approved' ? 'bg-green-600/20 text-green-200' : aiReview.result === 'rejected' ? 'bg-red-600/20 text-red-200' : 'bg-yellow-600/20 text-yellow-200'}>
                        {aiReview.result}
                      </Badge>
                      <span>Confidence: {aiReview.confidenceScore ?? aiReview.confidence_score}</span>
                      <span>Recommended winner: <strong className="font-mono text-yellow-200">{aiReview.recommendedWinner || aiReview.recommended_winner || '-'}</strong></span>
                    </div>
                    <div className="mt-1 text-purple-200">{aiReview.explanation}</div>
                  </div>
                )}
                <div className="mt-3 rounded border border-cyan-800/30 bg-cyan-950/10 p-3 text-xs text-purple-100">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="font-semibold text-white">Ghost Referee / Referee Engine</div>
                    <Badge className="bg-cyan-900/40 text-cyan-200">AI-assisted referee report</Badge>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    <span>Assigned referee: <strong className="text-white">{refereeAccount?.displayName || 'None'}</strong></span>
                    <span>Session: <strong className="text-white">{refereeSession?.status || 'not assigned'}</strong></span>
                    <span>Join method: <strong className="text-white">{refereeSession?.joinMethod || '-'}</strong></span>
                    <span>Report: <strong className="text-white">{refereeReport?.reportStatus || 'none'}</strong></span>
                    <span>Confidence: <strong className="text-white">{refereeReport?.confidence ?? '-'}</strong></span>
                    <span>Recommended winner: <strong className="font-mono text-yellow-200">{refereeReport?.winnerUserId || recommendedWinnerUserId || '-'}</strong></span>
                  </div>
                  {refereeReport?.warnings?.length > 0 && (
                    <div className="mt-2 text-yellow-200">Warnings: {refereeReport.warnings.join(', ')}</div>
                  )}
                  {refereeReport?.evidenceUrls?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {refereeReport.evidenceUrls.map(url => (
                        <a key={url} href={url} target="_blank" rel="noreferrer" className="text-cyan-300 hover:underline">Evidence</a>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAssignGhostReferee(matchId)}
                      disabled={actionLoading[`${matchId}_ghost_assign`]}
                      className="border-cyan-700/50 text-cyan-200 hover:bg-cyan-950/40"
                    >
                      Assign Ghost Referee
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStartRefereeSession(matchId)}
                      disabled={actionLoading[`${matchId}_ghost_start`] || !refereeSession?.id}
                      className="border-cyan-700/50 text-cyan-200 hover:bg-cyan-950/40"
                    >
                      Start Referee Session
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSimulateRefereeReport(matchId)}
                      disabled={actionLoading[`${matchId}_ghost_sim`]}
                      className="bg-cyan-700 text-white hover:bg-cyan-600"
                    >
                      Create Simulated Referee Report
                    </Button>
                  </div>
                </div>
                {recommendation && (
                  <div className="mt-2 rounded border border-purple-800/30 bg-black/20 p-2 text-xs text-purple-100">
                    <div>Recommended winner: <span className="font-mono text-yellow-200">{recommendedWinnerUserId || 'None'}</span></div>
                    <div>Rule: {recommendation.deterministicRule}</div>
                    <div>AI-assisted review is informational only. Confidence: {recommendation.confidence}. Can lock: {recommendation.canLockWinner ? 'yes' : 'no'}.</div>
                    {recommendation.lockBlockReasons?.length > 0 && <div className="text-orange-200">Cannot lock: {recommendation.lockBlockReasons.join(', ')}</div>}
                    {recommendation.warnings?.length > 0 && <div className="text-yellow-200">Warnings: {recommendation.warnings.join(', ')}</div>}
                  </div>
                )}
                <div className="mt-3 grid gap-2 lg:grid-cols-[1fr_1fr_auto]">
                  <Input
                    value={draft.disputeReason || ''}
                    onChange={event => updateWinnerAction(matchId, { disputeReason: event.target.value })}
                    placeholder="Dispute reason"
                    className="border-orange-700/40 bg-black/30 text-white placeholder:text-orange-300/50"
                  />
                  <Input
                    value={draft.disputeEvidenceUrl || ''}
                    onChange={event => updateWinnerAction(matchId, { disputeEvidenceUrl: event.target.value })}
                    placeholder="Dispute evidence URL"
                    className="border-orange-700/40 bg-black/30 text-white placeholder:text-orange-300/50"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDisputeWinner(matchId)}
                    disabled={actionLoading[`${matchId}_dispute`] || !draft.disputeReason}
                    className="border-orange-700/50 text-orange-200 hover:bg-orange-950/40"
                  >
                    Dispute
                  </Button>
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-[1fr_1fr_1fr_auto]">
                  <Input
                    value={draft.overrideWinnerUserId || ''}
                    onChange={event => updateWinnerAction(matchId, { overrideWinnerUserId: event.target.value })}
                    placeholder="Override winner user ID"
                    className="border-red-700/40 bg-black/30 text-white placeholder:text-red-300/50"
                  />
                  <Input
                    value={draft.overrideReason || ''}
                    onChange={event => updateWinnerAction(matchId, { overrideReason: event.target.value })}
                    placeholder="Override reason"
                    className="border-red-700/40 bg-black/30 text-white placeholder:text-red-300/50"
                  />
                  <Input
                    value={draft.overrideEvidenceUrl || ''}
                    onChange={event => updateWinnerAction(matchId, { overrideEvidenceUrl: event.target.value })}
                    placeholder="Override evidence URL"
                    className="border-red-700/40 bg-black/30 text-white placeholder:text-red-300/50"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleAdminOverrideWinner(matchId)}
                    disabled={actionLoading[`${matchId}_override`] || !draft.overrideWinnerUserId || !draft.overrideReason}
                  >
                    Admin Override
                  </Button>
                </div>
              </div>
            );
          })}
          {matches.filter(match => ['referee_assigned', 'waiting_for_referee', 'referee_observing', 'pending_verification', 'disputed', 'winner_verified', 'fulfillment_pending'].includes(match.status)).length === 0 && (
            <p className="py-4 text-center text-sm text-purple-400">No matches are waiting for winner verification.</p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-black/30 border border-purple-800/30">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-lg text-white">Prize Fulfillment Queue</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleRepairDemoFulfillmentOrders}
              disabled={actionLoading.repair_demo_fulfillment_orders}
              className="border-yellow-700/50 text-yellow-100 hover:bg-yellow-950/40"
            >
              Repair Demo Fulfillment Orders
            </Button>
            <Button
              size="sm"
              onClick={handleCreateDemoFulfillmentOrder}
              disabled={actionLoading.demo_fulfillment_order}
              className="bg-yellow-700 text-white hover:bg-yellow-600"
            >
              Create Demo Fulfillment Order
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {fulfillmentError && (
            <div className="rounded-lg border border-red-700/50 bg-red-950/30 p-3 text-sm text-red-100">
              {fulfillmentError}
            </div>
          )}

          {fulfillmentReadyMatches.map(match => (
            <div key={match.match_id} className="rounded-lg border border-purple-800/30 bg-purple-950/20 p-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-white">{match.match_title || match.match_id}</span>
                    <Badge className="bg-yellow-600/20 text-yellow-200">{match.status}</Badge>
                  </div>
                  <div className="mt-1 text-xs text-purple-300">
                    Prize {match.prize_title || 'Selected prize'} - Winner {match.winner_id || 'locked winner pending sync'}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleCreatePrizeFulfillment(match.match_id)}
                  disabled={actionLoading[`${match.match_id}_create_fulfillment`]}
                  className="bg-purple-700 text-white hover:bg-purple-600"
                >
                  Create Fulfillment
                </Button>
              </div>
              <div className="mt-3">
                <PrizeCostBreakdownPanel record={match} />
              </div>
            </div>
          ))}

          {fulfillmentQueue.map(fulfillment => (
            <div key={fulfillment.id} className="rounded-lg border border-purple-800/30 bg-purple-950/20 p-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-white">{fulfillment.match_title || fulfillment.match_id}</span>
                    <Badge className="bg-blue-600/20 text-blue-200">{fulfillment.status}</Badge>
                    <Badge className="bg-purple-600/20 text-purple-200">{fulfillment.prize_source || 'manual'}</Badge>
                    {(fulfillment.demo_mode || fulfillment.test_order) && (
                      <Badge className="bg-yellow-600/20 text-yellow-100 border border-yellow-500/40">
                        DEMO ORDER  NO REAL PURCHASE
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-purple-300">
                    Winner {fulfillment.winner_name || fulfillment.winner_id || 'Unknown'} - Prize {fulfillment.prize_title || 'Selected prize'}
                  </div>
                  <div className="text-xs text-purple-400">
                    Tracking {fulfillment.tracking_number || 'none'} - Created {fulfillment.created_at ? format(new Date(fulfillment.created_at), 'MMM d, yyyy') : '-'}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleSaveFulfillment(fulfillment)}
                  disabled={actionLoading[`${fulfillment.id}_save`]}
                  className="bg-purple-700 text-white hover:bg-purple-600"
                >
                  Save
                </Button>
              </div>

              <div className="mt-3 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {[
                  ['winner_name', 'Winner name'],
                  ['winner_email', 'Winner email'],
                  ['prize_title', 'Prize title'],
                  ['prize_source', 'Prize source'],
                  ['prize_url', 'Prize URL'],
                  ['prize_image', 'Prize image'],
                  ['shipping_name', 'Shipping name'],
                  ['shipping_address_line1', 'Address line 1'],
                  ['shipping_address_line2', 'Address line 2'],
                  ['shipping_city', 'City'],
                  ['shipping_state', 'State'],
                  ['shipping_zip', 'ZIP'],
                  ['shipping_country', 'Country'],
                  ['retailer_order_id', 'Retailer order ID'],
                  ['tracking_number', 'Tracking number'],
                ].map(([field, placeholder]) => (
                  <Input
                    key={field}
                    value={fulfillmentValue(fulfillment, field)}
                    onChange={event => {
                      updateFulfillmentDraft(fulfillment.id, { [field]: event.target.value });
                      if (field === 'tracking_number') updateTrackingDraft(fulfillment.id, { trackingNumber: event.target.value });
                    }}
                    placeholder={placeholder}
                    className="border-purple-700/40 bg-black/30 text-white placeholder:text-purple-400/60"
                  />
                ))}
              </div>

              <Textarea
                value={fulfillmentValue(fulfillment, 'admin_notes')}
                onChange={event => updateFulfillmentDraft(fulfillment.id, { admin_notes: event.target.value })}
                placeholder="Notes"
                className="mt-2 min-h-20 border-purple-700/40 bg-black/30 text-white placeholder:text-purple-400/60"
              />

              <div className="mt-3">
                <PrizeCostBreakdownPanel record={fulfillment} />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleFulfillmentStatus(fulfillment, 'ready_to_order')}
                  disabled={actionLoading[`${fulfillment.id}_ready_to_order`]}
                  className="border-green-700/50 text-green-200 hover:bg-green-950/40"
                >
                  Mark Ready to Order
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleFulfillmentStatus(fulfillment, 'ordered')}
                  disabled={actionLoading[`${fulfillment.id}_ordered`]}
                  className="border-purple-700/50 text-purple-200 hover:bg-purple-900/40"
                >
                  Mark Ordered
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddTracking(fulfillment)}
                  disabled={actionLoading[`${fulfillment.id}_tracking`]}
                  className="border-purple-700/50 text-purple-200 hover:bg-purple-900/40"
                >
                  Add Tracking
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleFulfillmentStatus(fulfillment, 'shipped')}
                  disabled={actionLoading[`${fulfillment.id}_shipped`]}
                  className="border-purple-700/50 text-purple-200 hover:bg-purple-900/40"
                >
                  Mark Shipped
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleFulfillmentStatus(fulfillment, 'delivered')}
                  disabled={actionLoading[`${fulfillment.id}_delivered`]}
                  className="border-purple-700/50 text-purple-200 hover:bg-purple-900/40"
                >
                  Mark Delivered
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleFulfillmentStatus(fulfillment, 'cancelled')}
                  disabled={actionLoading[`${fulfillment.id}_cancelled`]}
                >
                  Cancel Fulfillment
                </Button>
              </div>
              {fulfillment.prize_url && (
                <a href={fulfillment.prize_url} target="_blank" rel="noreferrer" className="mt-2 block truncate text-xs text-cyan-300">
                  {fulfillment.prize_url}
                </a>
              )}
            </div>
          ))}
          {fulfillmentReadyMatches.length === 0 && fulfillmentQueue.length === 0 && (
            <p className="py-4 text-center text-sm text-purple-400">No verified winners are waiting for prize fulfillment.</p>
          )}
        </CardContent>
      </Card>

      {/* Match list */}
      <div>
        <h3 className="text-lg font-bold text-white mb-3">All Matches</h3>
        {matches.length === 0 && (
          <p className="text-purple-400 text-sm text-center py-8">No matches yet. Play a game to see results here.</p>
        )}
        <div className="space-y-3">
          {matches.map(match => {
            const fulfillment = getFulfillment(match.match_id);
            const isExpanded = expandedMatch === match.match_id;
            return (
              <Card key={match.id} className="bg-black/30 border border-purple-800/30">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-white font-bold text-sm">{match.match_id}</span>
                        <Badge className={`text-xs ${
                          match.status === 'verified' ? 'bg-green-600/20 text-green-300' :
                          match.status === 'active' ? 'bg-blue-600/20 text-blue-300' :
                          match.status === 'completed' ? 'bg-orange-600/20 text-orange-300' :
                          'bg-purple-600/20 text-purple-300'
                        }`}>{match.status}</Badge>
                        {match.sandbox_mode && <Badge className="bg-blue-900/40 text-blue-300 text-xs border border-blue-700/30">🧪 Sandbox</Badge>}
                      </div>
                      <div className="text-purple-400 text-xs">
                        Game: <span className="text-purple-200">{match.game_id}</span>
                        {' · '}
                        Prize: <span className="text-purple-200">{match.prize_snapshot?.title || match.prize_id}</span>
                      </div>
                      {match.winner_user_id && (
                        <div className="flex items-center gap-1 text-xs">
                          <Trophy className="w-3 h-3 text-yellow-400" />
                          <span className="text-yellow-300">Winner locked: {match.winner_user_id}</span>
                        </div>
                      )}
                      <div className="text-purple-500 text-xs">
                        {match.created_date ? format(new Date(match.created_date), 'MMM d, yyyy HH:mm') : '—'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {fulfillment && (
                        <Badge className={`text-xs border ${STATUS_COLORS[fulfillment.admin_status] || ''}`}>
                          {fulfillment.admin_status}
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleExpand(match.match_id)}
                        className="text-purple-300 hover:bg-purple-900/40"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded: fulfillment controls + event log */}
                  {isExpanded && (
                    <div className="mt-4 space-y-4 border-t border-purple-800/30 pt-4">
                      {/* Fulfillment controls */}
                      {fulfillment && (
                        <div className="bg-purple-900/20 rounded-lg p-4 space-y-3">
                          <h4 className="text-purple-200 font-semibold text-sm flex items-center gap-2">
                            <Package className="w-4 h-4" />Fulfillment Record
                          </h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-purple-400">Winner</span>
                              <p className="text-white truncate">{fulfillment.winner_user_id}</p>
                            </div>
                            <div>
                              <span className="text-purple-400">Order Status</span>
                              <Badge className={`${ORDER_COLORS[fulfillment.order_status]} text-xs mt-1`}>
                                {fulfillment.order_status}
                              </Badge>
                            </div>
                          </div>

                          <PrizeCostBreakdownPanel record={fulfillment} compact />

                          {fulfillment.admin_status === 'pending_review' && (
                            <div className="space-y-2">
                              <Textarea
                                placeholder="Admin notes (optional)…"
                                value={adminNotes[fulfillment.id] || ''}
                                onChange={e => setAdminNotes(prev => ({ ...prev, [fulfillment.id]: e.target.value }))}
                                className="bg-black/30 border-purple-700/40 text-white text-xs h-16 resize-none"
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(fulfillment)}
                                  disabled={actionLoading[fulfillment.id]}
                                  className="bg-green-700 hover:bg-green-600 text-white gap-1"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  {actionLoading[fulfillment.id] ? 'Approving…' : 'Approve'}
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleReject(fulfillment)}
                                  disabled={actionLoading[fulfillment.id]}
                                  variant="destructive"
                                  className="gap-1"
                                >
                                  <XCircle className="w-3 h-3" />Reject
                                </Button>
                              </div>
                            </div>
                          )}

                          {fulfillment.admin_status === 'approved' && fulfillment.order_status === 'processing' && (
                            <Button
                              size="sm"
                              onClick={() => handleMarkShipped(fulfillment)}
                              disabled={actionLoading[fulfillment.id + '_ship']}
                              className="bg-blue-700 hover:bg-blue-600 text-white gap-1"
                            >
                              <Truck className="w-3 h-3" />
                              {actionLoading[fulfillment.id + '_ship'] ? 'Marking…' : 'Mark as Shipped (Sandbox)'}
                            </Button>
                          )}

                          {fulfillment.tracking_number && (
                            <p className="text-green-300 text-xs">
                              📬 Tracking: <span className="font-mono">{fulfillment.tracking_number}</span>
                            </p>
                          )}
                          {fulfillment.admin_notes && (
                            <p className="text-purple-300 text-xs">Notes: {fulfillment.admin_notes}</p>
                          )}
                        </div>
                      )}

                      {/* Event log */}
                      <div>
                        <h4 className="text-purple-200 font-semibold text-sm mb-2">Event Log</h4>
                        <MatchEventLog events={events[match.match_id]} isLoading={!events[match.match_id]} />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
