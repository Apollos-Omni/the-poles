export const CATEGORIES = [
  { value: "sports", label: "⚽ Sports" },
  { value: "fitness", label: "💪 Fitness" },
  { value: "racing", label: "🏎️ Racing" },
  { value: "dance", label: "💃 Dance" },
  { value: "music", label: "🎵 Music" },
  { value: "art", label: "🎨 Art" },
  { value: "cooking", label: "🍳 Cooking" },
  { value: "trivia", label: "🧠 Trivia" },
  { value: "chess", label: "♟️ Chess" },
  { value: "pool", label: "🎱 Pool" },
  { value: "fishing", label: "🎣 Fishing" },
  { value: "outdoor_adventure", label: "🏕️ Outdoor Adventure" },
  { value: "talent", label: "⭐ Talent Challenge" },
  { value: "trade_skill", label: "🔧 Trade Skill" },
  { value: "sales", label: "📈 Sales Challenge" },
  { value: "social", label: "🤝 Social Challenge" },
  { value: "community", label: "🌍 Community Challenge" },
  { value: "custom", label: "✨ Custom Challenge" },
];

export const PRIZE_TYPES = [
  { value: "physical_item", label: "📦 Physical Item" },
  { value: "vacation", label: "✈️ Vacation" },
  { value: "cruise", label: "🚢 Cruise" },
  { value: "event_ticket", label: "🎟️ Event Ticket" },
  { value: "local_experience", label: "🗺️ Local Experience" },
  { value: "travel_package", label: "🌐 Travel Package" },
  { value: "custom_reward", label: "🎁 Custom Reward" },
  { value: "sponsored_reward", label: "🤝 Sponsored Reward" },
  { value: "community_funded", label: "💰 Community Funded" },
];

export const WINNING_CONDITIONS = [
  { value: "highest_score", label: "Highest Score" },
  { value: "fastest_time", label: "Fastest Time" },
  { value: "judge_panel", label: "Judge Panel Decision" },
  { value: "participant_vote", label: "Participant Vote" },
  { value: "creator_decision", label: "Creator Decision" },
  { value: "referee", label: "Referee/Official" },
  { value: "photo_proof", label: "Photo Proof Review" },
  { value: "video_proof", label: "Video Proof Review" },
  { value: "gps_checkin", label: "GPS Check-in" },
  { value: "qr_checkin", label: "QR Code Check-in" },
  { value: "third_party_result", label: "Third-Party Result Upload" },
  { value: "admin_approval", label: "Admin Approval" },
];

export const VERIFICATION_METHODS = [
  { value: "creator_verified", label: "Creator Verified" },
  { value: "admin_verified", label: "Admin Verified" },
  { value: "referee_judge", label: "Referee / Judge" },
  { value: "score_submission", label: "Score Submission" },
  { value: "video_proof", label: "Video Proof Upload" },
  { value: "photo_proof", label: "Photo Proof Upload" },
  { value: "participant_agreement", label: "Participant Agreement" },
  { value: "qr_checkin", label: "QR Check-in" },
  { value: "gps_checkin", label: "GPS / Location Check-in" },
  { value: "third_party_upload", label: "Third-Party Event Result" },
  { value: "manual_admin", label: "Manual Admin Approval" },
];

export const STATUS_CONFIG = {
  draft:                  { label: "Draft",                    color: "bg-gray-500/20 text-gray-300 border-gray-600/30" },
  open:                   { label: "Open for Competitors",     color: "bg-blue-500/20 text-blue-300 border-blue-600/30" },
  funding_in_progress:    { label: "Funding in Progress",      color: "bg-yellow-500/20 text-yellow-300 border-yellow-600/30" },
  fully_funded:           { label: "Fully Funded",             color: "bg-green-500/20 text-green-300 border-green-600/30" },
  scheduled:              { label: "Scheduled",                color: "bg-cyan-500/20 text-cyan-300 border-cyan-600/30" },
  active:                 { label: "Active",                   color: "bg-purple-500/20 text-purple-300 border-purple-600/30" },
  awaiting_verification:  { label: "Awaiting Verification",    color: "bg-orange-500/20 text-orange-300 border-orange-600/30" },
  winner_confirmed:       { label: "Winner Confirmed",         color: "bg-emerald-500/20 text-emerald-300 border-emerald-600/30" },
  fulfillment_pending:    { label: "Fulfillment Pending",      color: "bg-indigo-500/20 text-indigo-300 border-indigo-600/30" },
  donation_recorded:      { label: "Donation Recorded",        color: "bg-pink-500/20 text-pink-300 border-pink-600/30" },
  completed:              { label: "Completed",                color: "bg-teal-500/20 text-teal-300 border-teal-600/30" },
  cancelled:              { label: "Cancelled",                color: "bg-red-500/20 text-red-300 border-red-600/30" },
  refunded:               { label: "Refunded",                 color: "bg-slate-500/20 text-slate-300 border-slate-600/30" },
};

export const formatCents = (cents) => {
  if (!cents) return "$0.00";
  return `$${(cents / 100).toFixed(2)}`;
};

export const calcChallengeFunding = (challenge) => {
  const prize = challenge.prize_value_cents || 0;
  const donation = Math.ceil(prize * 0.10);
  const fees = Math.ceil(prize * 0.05);
  const total = prize + donation + fees;
  const perParticipant = challenge.num_participants_needed > 0
    ? Math.ceil(total / challenge.num_participants_needed)
    : 0;
  return { prize, donation, fees, total, perParticipant };
};