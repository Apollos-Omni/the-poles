export const VERIFICATION_LEVELS = [
  { value: 'self_reported', label: 'Self-reported', weight: 0.35 },
  { value: 'opponent_confirmed', label: 'Opponent confirmed', weight: 0.5 },
  { value: 'scorekeeper_verified', label: 'Scorekeeper verified', weight: 0.7 },
  { value: 'organizer_verified', label: 'Organizer verified', weight: 0.8 },
  { value: 'video_reviewed', label: 'Video reviewed', weight: 0.9 },
  { value: 'admin_verified', label: 'Admin verified', weight: 0.95 },
  { value: 'system_verified', label: 'System verified', weight: 1 },
];

const basketball5v5Fields = [
  { key: 'points', label: 'Points', type: 'number', tier: 'basic', defaultValue: 0 },
  { key: 'two_point_made', label: '2-point shots made', type: 'number', tier: 'basic', defaultValue: 0 },
  { key: 'two_point_attempted', label: '2-point shots attempted', type: 'number', tier: 'basic', defaultValue: 0 },
  { key: 'three_point_made', label: '3-point shots made', type: 'number', tier: 'basic', defaultValue: 0 },
  { key: 'three_point_attempted', label: '3-point shots attempted', type: 'number', tier: 'basic', defaultValue: 0 },
  { key: 'free_throws_made', label: 'Free throws made', type: 'number', tier: 'basic', defaultValue: 0 },
  { key: 'free_throws_attempted', label: 'Free throws attempted', type: 'number', tier: 'basic', defaultValue: 0 },
  { key: 'offensive_rebounds', label: 'Offensive rebounds', type: 'number', tier: 'advanced', defaultValue: 0 },
  { key: 'defensive_rebounds', label: 'Defensive rebounds', type: 'number', tier: 'advanced', defaultValue: 0 },
  { key: 'total_rebounds', label: 'Total rebounds', type: 'number', tier: 'basic', defaultValue: 0, calculated: true },
  { key: 'assists', label: 'Assists', type: 'number', tier: 'basic', defaultValue: 0 },
  { key: 'steals', label: 'Steals', type: 'number', tier: 'advanced', defaultValue: 0 },
  { key: 'blocks', label: 'Blocks', type: 'number', tier: 'advanced', defaultValue: 0 },
  { key: 'turnovers', label: 'Turnovers', type: 'number', tier: 'advanced', defaultValue: 0 },
  { key: 'fouls', label: 'Fouls', type: 'number', tier: 'advanced', defaultValue: 0 },
  { key: 'minutes_played', label: 'Minutes played', type: 'number', tier: 'advanced', defaultValue: 0 },
  { key: 'result', label: 'Win/loss result', type: 'select', tier: 'basic', options: ['win', 'loss', 'draw'], defaultValue: 'win' },
  { key: 'plus_minus', label: 'Plus/minus if available', type: 'number', tier: 'advanced', defaultValue: 0, optional: true },
];

const basketballQuickFields = [
  { key: 'points', label: 'Points', type: 'number', tier: 'basic', defaultValue: 0 },
  { key: 'rebounds', label: 'Rebounds', type: 'number', tier: 'basic', defaultValue: 0 },
  { key: 'assists', label: 'Assists', type: 'number', tier: 'basic', defaultValue: 0 },
  { key: 'three_point_made', label: '3-point shots made', type: 'number', tier: 'advanced', defaultValue: 0 },
  { key: 'three_point_attempted', label: '3-point shots attempted', type: 'number', tier: 'advanced', defaultValue: 0 },
  { key: 'result', label: 'Win/loss result', type: 'select', tier: 'basic', options: ['win', 'loss', 'draw'], defaultValue: 'win' },
];

const shootingContestFields = [
  { key: 'made', label: 'Shots made', type: 'number', tier: 'basic', defaultValue: 0 },
  { key: 'attempted', label: 'Shots attempted', type: 'number', tier: 'basic', defaultValue: 0 },
  { key: 'score', label: 'Contest score', type: 'number', tier: 'basic', defaultValue: 0 },
  { key: 'time_seconds', label: 'Time in seconds', type: 'number', tier: 'advanced', defaultValue: 0, optional: true },
  { key: 'result', label: 'Win/loss result', type: 'select', tier: 'basic', options: ['win', 'loss', 'draw'], defaultValue: 'win' },
];

const horseFields = [
  { key: 'letters_taken', label: 'Letters taken', type: 'number', tier: 'basic', defaultValue: 0 },
  { key: 'trick_shots_made', label: 'Trick shots made', type: 'number', tier: 'basic', defaultValue: 0 },
  { key: 'defensive_stops', label: 'Defensive stops', type: 'number', tier: 'advanced', defaultValue: 0 },
  { key: 'result', label: 'Win/loss result', type: 'select', tier: 'basic', options: ['win', 'loss'], defaultValue: 'win' },
];

export const SPORT_STAT_TEMPLATES = {
  basketball: {
    sport: { id: 'basketball', name: 'Basketball', icon: 'basketball' },
    formats: [
      { id: 'basketball_5v5', label: '5v5 league game', templateId: 'basketball_5v5_player', fields: basketball5v5Fields },
      { id: 'basketball_3v3', label: '3v3 game', templateId: 'basketball_3v3_player', fields: basketballQuickFields },
      { id: 'basketball_1v1', label: '1v1 game', templateId: 'basketball_1v1_player', fields: basketballQuickFields },
      { id: 'basketball_three_point_contest', label: 'Three-point contest', templateId: 'basketball_three_point_contest', fields: shootingContestFields },
      { id: 'basketball_free_throw_contest', label: 'Free throw contest', templateId: 'basketball_free_throw_contest', fields: shootingContestFields },
      { id: 'basketball_horse', label: 'HORSE-style challenge', templateId: 'basketball_horse', fields: horseFields },
    ],
  },
};

export function getSportTemplate(sportType) {
  return SPORT_STAT_TEMPLATES[sportType] || null;
}

export function getFormatTemplate(sportType, formatId) {
  const sport = getSportTemplate(sportType);
  return sport?.formats.find((format) => format.id === formatId) || sport?.formats[0] || null;
}

export function fieldsForStatsMode(fields = [], statsMode = 'basic') {
  if (statsMode === 'advanced') return fields;
  return fields.filter((field) => field.tier === 'basic');
}

const pct = (made, attempted) => {
  const attempts = Number(attempted || 0);
  if (!attempts) return 0;
  return Math.round((Number(made || 0) / attempts) * 1000) / 10;
};

const perGame = (value, gamesPlayed = 1) => {
  const games = Math.max(1, Number(gamesPlayed || 1));
  return Math.round((Number(value || 0) / games) * 10) / 10;
};

export function calculateBasketballStats(stats = {}, gamesPlayed = 1) {
  const twoMade = Number(stats.two_point_made || 0);
  const twoAttempted = Number(stats.two_point_attempted || 0);
  const threeMade = Number(stats.three_point_made || 0);
  const threeAttempted = Number(stats.three_point_attempted || 0);
  const offensiveRebounds = Number(stats.offensive_rebounds || 0);
  const defensiveRebounds = Number(stats.defensive_rebounds || 0);
  const totalRebounds = Number(stats.total_rebounds || stats.rebounds || offensiveRebounds + defensiveRebounds || 0);
  const assists = Number(stats.assists || 0);
  const turnovers = Number(stats.turnovers || 0);
  const points = Number(stats.points || 0);
  const wins = Number(stats.wins || (stats.result === 'win' ? 1 : 0));
  const losses = Number(stats.losses || (stats.result === 'loss' ? 1 : 0));
  const decisions = Math.max(1, wins + losses);
  const efficiency = points + totalRebounds + assists + Number(stats.steals || 0) + Number(stats.blocks || 0)
    - ((twoAttempted - twoMade) + (threeAttempted - threeMade) + (Number(stats.free_throws_attempted || 0) - Number(stats.free_throws_made || 0)) + turnovers);

  return {
    field_goal_percentage: pct(twoMade + threeMade, twoAttempted + threeAttempted),
    three_point_percentage: pct(threeMade, threeAttempted),
    free_throw_percentage: pct(stats.free_throws_made, stats.free_throws_attempted),
    total_rebounds: totalRebounds,
    assist_to_turnover_ratio: turnovers ? Math.round((assists / turnovers) * 100) / 100 : assists,
    points_per_game: perGame(points, gamesPlayed),
    rebounds_per_game: perGame(totalRebounds, gamesPlayed),
    assists_per_game: perGame(assists, gamesPlayed),
    win_rate: Math.round((wins / decisions) * 1000) / 10,
    player_efficiency_score: Math.round(efficiency * 10) / 10,
  };
}

export function skillTierForPerformance(calculated = {}, verificationLevel = 'self_reported') {
  const verification = VERIFICATION_LEVELS.find((level) => level.value === verificationLevel) || VERIFICATION_LEVELS[0];
  const score = (
    Number(calculated.player_efficiency_score || 0)
    + Number(calculated.points_per_game || 0) * 0.8
    + Number(calculated.rebounds_per_game || 0) * 0.5
    + Number(calculated.assists_per_game || 0) * 0.7
    + Number(calculated.win_rate || 0) * 0.08
  ) * verification.weight;

  if (score >= 42) return { tier: 'elite', score: Math.round(score) };
  if (score >= 28) return { tier: 'advanced', score: Math.round(score) };
  if (score >= 16) return { tier: 'intermediate', score: Math.round(score) };
  return { tier: 'developing', score: Math.round(score) };
}
