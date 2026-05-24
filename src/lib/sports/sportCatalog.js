export const SPORT_CATEGORIES = [
  'Team Sports',
  'Individual Sports',
  'Combat Sports',
  'Racing',
  'Table / Bar Sports',
  'Board / Mind Sports',
  'Esports',
  'Fitness / Strength Challenges',
  'Custom / Other',
];

const now = () => new Date().toISOString();
const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const sport = (name, category, description, formats = ['Head-to-head', 'Tournament', 'League Season']) => ({
  id: slug(name),
  name,
  slug: slug(name),
  category,
  description,
  defaultFormats: formats,
  defaultStatTemplateIds: name === 'Basketball' ? ['basketball_5v5_player'] : [],
  defaultRuleSetIds: [`${slug(name)}-basic-rules`],
  isBuiltIn: true,
  isActive: true,
  createdByUserId: null,
  approvalStatus: 'built_in',
  createdAt: now(),
  updatedAt: now(),
});

export const BUILT_IN_SPORTS = [
  ...['Basketball', 'Football', 'Soccer', 'Baseball', 'Softball', 'Volleyball', 'Hockey', 'Rugby', 'Lacrosse', 'Dodgeball', 'Kickball'].map((name) => sport(name, 'Team Sports', `${name} skill competition with verified performance outcomes.`)),
  ...['Tennis', 'Golf', 'Bowling', 'Track and Field', 'Swimming', 'Skateboarding', 'Snowboarding', 'Archery'].map((name) => sport(name, 'Individual Sports', `${name} contest based on measurable performance.`)),
  ...['Boxing', 'Wrestling', 'Brazilian Jiu-Jitsu', 'MMA', 'Karate', 'Taekwondo', 'Judo', 'Fencing'].map((name) => sport(name, 'Combat Sports', `${name} match using judge, referee, or verified result scoring.`)),
  ...['Kart Racing', 'Bicycle Racing', 'Running Race', 'Obstacle Course', 'Sim Racing'].map((name) => sport(name, 'Racing', `${name} contest determined by time, placement, or verified score.`)),
  ...['Pool', 'Darts', 'Ping Pong', 'Foosball', 'Cornhole', 'Shuffleboard'].map((name) => sport(name, 'Table / Bar Sports', `${name} match based on standard scoring or league rules.`)),
  ...['Chess', 'Checkers', 'Trivia', 'Debate', 'Spelling Bee', 'Math Challenge'].map((name) => sport(name, 'Board / Mind Sports', `${name} competition based on knowledge, strategy, judging, or score.`)),
  ...['Madden', 'NBA 2K', 'FIFA / EA Sports FC', 'MLB The Show', 'Rocket League', 'Call of Duty', 'Fortnite', 'Apex Legends', 'Valorant', 'League of Legends', 'Super Smash Bros', 'Street Fighter', 'Tekken', 'Mortal Kombat', 'Minecraft Challenges', 'Custom Video Game'].map((name) => sport(name, 'Esports', `${name} skill match based on verified game performance.`)),
  ...['Push-up Challenge', 'Pull-up Challenge', 'Plank Challenge', 'Weightlifting', 'CrossFit-style Challenge', 'Sprint Challenge', 'Endurance Challenge'].map((name) => sport(name, 'Fitness / Strength Challenges', `${name} contest measured by reps, time, distance, form, or verified score.`)),
];

export const SEEDED_SPORT_SLUGS = ['basketball', 'football', 'soccer', 'boxing', 'pool', 'chess', 'madden', 'nba-2k', 'call-of-duty', 'push-up-challenge'];

export const BUILT_IN_GAME_FORMATS = [
  { id: 'basketball_5v5', sportId: 'basketball', name: '5v5 League Game', description: 'Full team basketball game.', formatType: 'team_vs_team', minPlayers: 10, maxPlayers: 24, teamBased: true, winnerDeterminationMethod: 'final score', rulesSummary: 'Standard basketball scoring. Winner is the team with the highest verified final score.' },
  { id: 'basketball_3v3', sportId: 'basketball', name: '3v3 Game', description: 'Half-court 3v3 basketball game.', formatType: 'team_vs_team', minPlayers: 6, maxPlayers: 10, teamBased: true, winnerDeterminationMethod: 'final score', rulesSummary: 'Winner is the team with the highest verified score at game end.' },
  { id: 'basketball_1v1', sportId: 'basketball', name: '1v1 Game', description: 'One-on-one basketball match.', formatType: '1v1', minPlayers: 2, maxPlayers: 2, teamBased: false, winnerDeterminationMethod: 'final score', rulesSummary: 'Winner is the player with the highest verified score.' },
  { id: 'basketball_three_point_contest', sportId: 'basketball', name: 'Three-Point Contest', description: 'Accuracy challenge from three-point range.', formatType: 'accuracy_challenge', minPlayers: 2, maxPlayers: 20, teamBased: false, winnerDeterminationMethod: 'best score wins', rulesSummary: 'Winner is determined by verified made shots or contest score.' },
  { id: 'basketball_free_throw_contest', sportId: 'basketball', name: 'Free Throw Contest', description: 'Free throw accuracy challenge.', formatType: 'accuracy_challenge', minPlayers: 2, maxPlayers: 20, teamBased: false, winnerDeterminationMethod: 'best score wins', rulesSummary: 'Winner is determined by verified makes or percentage.' },
  { id: 'basketball_horse', sportId: 'basketball', name: 'HORSE Challenge', description: 'Shot-making challenge using HORSE-style letters.', formatType: 'accuracy_challenge', minPlayers: 2, maxPlayers: 6, teamBased: false, winnerDeterminationMethod: 'fewest letters / last player remaining', rulesSummary: 'Winner is determined by verified shot completion and letter count.' },
];

export const DEFAULT_RULE_SETS = [
  { id: 'basketball-basic-rules', sportId: 'basketball', formatId: null, title: 'Basketball basic rules', rulesText: 'Use standard basketball scoring. Results must be based on verified score, time, accuracy, or recorded performance.', scoringRules: '2-point, 3-point, and free throw scoring where applicable.', foulRules: 'League organizer may define foul limits.', tieBreakerRules: 'Use overtime, next score, or organizer-defined skill tiebreaker.', equipmentRules: 'Basketball, hoop, court, and scorekeeping method.', eligibilityRules: 'League organizer sets age, location, and roster eligibility.', verificationRules: 'Scorekeeper, organizer, video, or admin verification may be used.', approvalStatus: 'built_in', createdAt: now(), updatedAt: now() },
];

export function groupedSports(sports = BUILT_IN_SPORTS) {
  return SPORT_CATEGORIES.map((category) => ({
    category,
    sports: sports.filter((item) => item.category === category && item.isActive !== false),
  })).filter((group) => group.sports.length);
}

export function findSportBySlug(slugValue, sports = BUILT_IN_SPORTS) {
  return sports.find((item) => item.slug === slugValue || item.id === slugValue) || null;
}

export function chanceLanguageDetected(text = '') {
  return /\b(random|raffle|lottery|sweepstakes|chance|luck|drawing|drawn at random|coin flip|wheel spin|odds|bet|wager)\b/i.test(text);
}

export function hasAllowedWinnerMethod(text = '') {
  return /\b(score|time|accuracy|distance|completion rate|judge scoring|referee decision|verified performance|league standings|best stat line|fastest time|highest score)\b/i.test(text);
}

export function defaultSportPayload(name, category, createdByUserId) {
  return {
    ...sport(name, category || 'Custom / Other', 'Custom sport/game submitted by a user.', ['Custom Format']),
    isBuiltIn: false,
    createdByUserId,
    approvalStatus: 'pending_review',
  };
}
