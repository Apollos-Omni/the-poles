const SOURCE_STATUSES = new Set(['approved', 'rejected', 'unclear', 'not_supported']);

export const SUPPORTED_WINNER_PROOF_SOURCES = [
  'built_in_game_result',
  'official_game_api',
  'gamer_account_match_history',
  'observer_bot',
  'scoreboard_screenshot',
  'video_or_stream',
  'host_confirmation',
  'player_agreement',
  'tournament_bracket',
  'dispute_window',
  'manual_review',
];

const OFFICIAL_PROOF_SOURCES = new Set([
  'built_in_game_result',
  'official_game_api',
  'observer_bot',
  'tournament_bracket',
]);

function result(source, status, confidencePoints, reason, metadata = {}) {
  const safeStatus = SOURCE_STATUSES.has(status) ? status : 'unclear';
  return {
    source,
    status: safeStatus,
    confidencePoints: safeStatus === 'approved' ? Math.max(0, Number(confidencePoints) || 0) : 0,
    reason,
    metadata,
  };
}

function normalizeConfidence(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.max(0, Math.min(1, value));
  if (value === null || value === undefined || value === '') return 1;
  const normalized = String(value || '').toLowerCase();
  if (normalized === 'high') return 0.9;
  if (normalized === 'medium' || normalized === 'needs_review') return 0.55;
  if (normalized === 'low') return 0.3;
  return 0;
}

function firstWinnerId(...values) {
  for (const value of values) {
    if (value !== null && value !== undefined && value !== '') return String(value);
  }
  return '';
}

function sameWinner(a, b) {
  return Boolean(a && b && String(a) === String(b));
}

function urlLooksLikeScreenshot(url = '') {
  return /\.(png|jpe?g|webp|gif)(\?.*)?$/i.test(String(url));
}

function urlLooksLikeVideoOrStream(url = '') {
  return /\.(mp4|mov|webm|m3u8)(\?.*)?$/i.test(String(url))
    || /(?:twitch\.tv|youtube\.com|youtu\.be|kick\.com|vimeo\.com)/i.test(String(url));
}

function scoreEvidenceUrls(scores = []) {
  return scores
    .flatMap((score) => [score.evidenceUrl, score.evidence_url, ...(Array.isArray(score.evidenceUrls) ? score.evidenceUrls : [])])
    .filter(Boolean);
}

function prizeValueCents(match = {}) {
  const breakdown = match.prize_cost_breakdown || match.cost_breakdown || {};
  const snapshot = match.prize_snapshot || match.product_offer || {};
  const values = [
    breakdown.item_cost_cents,
    breakdown.total_required_cents,
    snapshot.price_cents,
    snapshot.item_cost_cents,
    match.item_cost_cents,
    match.total_required_cents,
  ];
  for (const value of values) {
    const number = Number(value);
    if (Number.isFinite(number) && number > 0) return Math.round(number);
  }
  return 0;
}

function prizeRuleForValue(valueCents) {
  if (valueCents >= 20000) {
    return {
      tier: 'high',
      approvalThreshold: 90,
      requiresOfficialProofOrManualReview: true,
      description: 'High value prizes require official proof or manual review.',
    };
  }
  if (valueCents >= 5000) {
    return {
      tier: 'medium',
      approvalThreshold: 75,
      requiresOfficialProofOrManualReview: false,
      description: 'Medium value prizes require stronger proof.',
    };
  }
  return {
    tier: 'low',
    approvalThreshold: 50,
    requiresOfficialProofOrManualReview: false,
    description: 'Low value prizes can approve with lower confidence.',
  };
}

function acceptedReports(context = {}) {
  return (context.refereeReports || context.refereeContext?.reports || [])
    .filter((report) => (report.reportStatus || report.report_status || 'accepted') === 'accepted');
}

export class WinnerVerificationEngine {
  constructor({ sources = SUPPORTED_WINNER_PROOF_SOURCES } = {}) {
    this.sources = sources;
    this.verifiers = {
      built_in_game_result: this.verifyBuiltInGameResult,
      official_game_api: this.verifyOfficialGameApi,
      gamer_account_match_history: this.verifyGamerAccountMatchHistory,
      observer_bot: this.verifyObserverBot,
      scoreboard_screenshot: this.verifyScoreboardScreenshot,
      video_or_stream: this.verifyVideoOrStream,
      host_confirmation: this.verifyHostConfirmation,
      player_agreement: this.verifyPlayerAgreement,
      tournament_bracket: this.verifyTournamentBracket,
      dispute_window: this.verifyDisputeWindow,
      manual_review: this.verifyManualReview,
    };
  }

  verify(context) {
    const sourceResults = this.sources.map((source) => {
      const verifier = this.verifiers[source];
      return verifier ? verifier.call(this, context) : result(source, 'not_supported', 0, 'Proof source is not supported by this engine.');
    });

    const approvedResults = sourceResults.filter((entry) => entry.status === 'approved');
    const confidenceScore = Math.min(100, approvedResults.reduce((total, entry) => total + entry.confidencePoints, 0));
    const valueCents = prizeValueCents(context.match);
    const prizeValueRule = prizeRuleForValue(valueCents);
    const hasDispute = sourceResults.some((entry) => entry.source === 'dispute_window' && entry.status === 'rejected')
      || Boolean(context.hasDispute);
    const hasOfficialProof = approvedResults.some((entry) => OFFICIAL_PROOF_SOURCES.has(entry.source));
    const hasManualReview = approvedResults.some((entry) => entry.source === 'manual_review');
    const thresholdMet = confidenceScore >= prizeValueRule.approvalThreshold;
    const officialRequirementMet = !prizeValueRule.requiresOfficialProofOrManualReview || hasOfficialProof || hasManualReview;

    let verificationStatus = 'manual_review';
    let approvalReason = `Score ${confidenceScore} is below ${prizeValueRule.tier} prize threshold ${prizeValueRule.approvalThreshold}.`;
    if (hasDispute) {
      approvalReason = 'A result dispute is open, so fulfillment requires manual review.';
    } else if (thresholdMet && officialRequirementMet) {
      verificationStatus = 'approved';
      approvalReason = `Approved with ${confidenceScore} confidence points for a ${prizeValueRule.tier} value prize.`;
    } else if (thresholdMet && !officialRequirementMet) {
      approvalReason = 'High value prize threshold was met, but official proof or manual review is required.';
    }

    return {
      status: verificationStatus,
      confidenceScore,
      approvalThreshold: prizeValueRule.approvalThreshold,
      prizeValueCents: valueCents,
      prizeValueTier: prizeValueRule.tier,
      prizeValueRule,
      approvalReason,
      sourceResults,
      proofSourcesUsed: approvedResults.map((entry) => entry.source),
      requiresManualReview: verificationStatus !== 'approved',
      hasDispute,
      hasOfficialProof,
      hasManualReview,
    };
  }

  verifyBuiltInGameResult({ match, claimedWinnerUserId }) {
    const winner = firstWinnerId(match?.winner_user_id, match?.winner_id, match?.result_payload?.winnerUserId, match?.resultPayload?.winnerUserId);
    if (!winner) return result('built_in_game_result', 'not_supported', 0, 'No built-in game result was found.');
    if (!sameWinner(winner, claimedWinnerUserId)) {
      return result('built_in_game_result', 'rejected', 0, 'Built-in result names a different winner.', { winner });
    }
    return result('built_in_game_result', 'approved', 90, 'Built-in game result matches the claimed winner.', { winner });
  }

  verifyOfficialGameApi(context) {
    const reports = acceptedReports(context).filter((report) => ['game_api', 'native_game_sdk'].includes(report.source));
    const report = reports.find((entry) => sameWinner(entry.winnerUserId || entry.winner_user_id, context.claimedWinnerUserId));
    if (!reports.length) return result('official_game_api', 'not_supported', 0, 'No accepted official game API proof was submitted.');
    if (!report) return result('official_game_api', 'rejected', 0, 'Official game API proof does not match the claimed winner.');
    return result('official_game_api', 'approved', Math.round(90 * normalizeConfidence(report.confidence)), 'Official game API proof matches the claimed winner.', { reportId: report.id, source: report.source });
  }

  verifyGamerAccountMatchHistory({ scores = [], claimedWinnerUserId }) {
    const score = scores.find((entry) => sameWinner(entry.userId || entry.user_id, claimedWinnerUserId) && (entry.platformUsername || entry.platform_username || entry.metadata?.matchHistoryUrl));
    if (!score) return result('gamer_account_match_history', 'not_supported', 0, 'No gamer account match history proof was submitted.');
    return result('gamer_account_match_history', 'approved', 50, 'Claimed winner has account-level match history proof.', { scoreId: score.id, platformUsername: score.platformUsername || score.platform_username || '' });
  }

  verifyObserverBot(context) {
    const reports = acceptedReports(context).filter((report) => report.source === 'spectator_bot');
    const report = reports.find((entry) => sameWinner(entry.winnerUserId || entry.winner_user_id, context.claimedWinnerUserId));
    if (!reports.length) return result('observer_bot', 'not_supported', 0, 'No observer bot proof was submitted.');
    if (!report) return result('observer_bot', 'rejected', 0, 'Observer bot proof does not match the claimed winner.');
    return result('observer_bot', 'approved', Math.round(70 * normalizeConfidence(report.confidence)), 'Observer bot proof matches the claimed winner.', { reportId: report.id });
  }

  verifyScoreboardScreenshot({ scores = [] }) {
    const urls = scoreEvidenceUrls(scores).filter(urlLooksLikeScreenshot);
    if (!urls.length) return result('scoreboard_screenshot', 'not_supported', 0, 'No scoreboard screenshot proof was submitted.');
    return result('scoreboard_screenshot', 'approved', 30, 'Scoreboard screenshot proof is present.', { evidenceCount: urls.length });
  }

  verifyVideoOrStream({ scores = [], refereeContext = {} }) {
    const scoreUrls = scoreEvidenceUrls(scores);
    const reportUrls = (refereeContext.reports || []).flatMap((report) => report.evidenceUrls || report.evidence_urls || []);
    const urls = [...scoreUrls, ...reportUrls].filter(urlLooksLikeVideoOrStream);
    if (!urls.length) return result('video_or_stream', 'not_supported', 0, 'No video or stream proof was submitted.');
    return result('video_or_stream', 'approved', 40, 'Video or stream proof is present.', { evidenceCount: urls.length });
  }

  verifyHostConfirmation({ manualLock, lockedBy }) {
    if (!manualLock) return result('host_confirmation', 'not_supported', 0, 'No host or admin confirmation was submitted.');
    return result('host_confirmation', 'approved', 35, 'Host/admin confirmed the winner.', { lockedBy });
  }

  verifyPlayerAgreement({ entries = [], hasDispute }) {
    if (hasDispute) return result('player_agreement', 'rejected', 0, 'A player dispute prevents agreement proof.');
    if (entries.length < 2) return result('player_agreement', 'unclear', 0, 'Not enough player entries to infer agreement.');
    return result('player_agreement', 'approved', 35, 'No player dispute is recorded for the match.', { playerCount: entries.length });
  }

  verifyTournamentBracket({ match, claimedWinnerUserId }) {
    const winner = firstWinnerId(match?.bracket_winner_user_id, match?.bracketWinnerUserId, match?.match_plan?.bracketWinnerUserId, match?.metadata?.bracketWinnerUserId);
    if (!winner) return result('tournament_bracket', 'not_supported', 0, 'No tournament bracket winner was submitted.');
    if (!sameWinner(winner, claimedWinnerUserId)) return result('tournament_bracket', 'rejected', 0, 'Tournament bracket winner does not match the claimed winner.', { winner });
    return result('tournament_bracket', 'approved', 70, 'Tournament bracket winner matches the claimed winner.', { winner });
  }

  verifyDisputeWindow({ hasDispute }) {
    if (hasDispute) return result('dispute_window', 'rejected', 0, 'A dispute is open for this result.');
    return result('dispute_window', 'approved', 20, 'No open dispute is recorded.', {});
  }

  verifyManualReview({ manualLock, adminOverride, lockedBy }) {
    if (!manualLock && !adminOverride) return result('manual_review', 'not_supported', 0, 'No manual review approval was submitted.');
    return result('manual_review', 'approved', 100, 'Manual review approved the claimed winner.', { lockedBy, adminOverride });
  }
}

export default WinnerVerificationEngine;
