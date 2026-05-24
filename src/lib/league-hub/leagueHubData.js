export const LEAGUE_ROLES = {
  OWNER: 'owner',
  ORGANIZER: 'organizer',
  COACH: 'coach',
  PLAYER: 'player',
  REFEREE: 'referee',
  SCOREKEEPER: 'scorekeeper',
  SPONSOR: 'sponsor',
  VIEWER: 'viewer',
  PLATFORM_ADMIN: 'platform_admin',
  SUPER_ADMIN: 'super_admin',
};

export const LEAGUE_ADMIN_ROLES = [
  LEAGUE_ROLES.OWNER,
  LEAGUE_ROLES.ORGANIZER,
  LEAGUE_ROLES.PLATFORM_ADMIN,
  LEAGUE_ROLES.SUPER_ADMIN,
];

export const SCORE_SUBMITTER_ROLES = [
  LEAGUE_ROLES.OWNER,
  LEAGUE_ROLES.ORGANIZER,
  LEAGUE_ROLES.SCOREKEEPER,
];

export const RESULT_VERIFIER_ROLES = [
  LEAGUE_ROLES.OWNER,
  LEAGUE_ROLES.ORGANIZER,
  LEAGUE_ROLES.REFEREE,
  LEAGUE_ROLES.SCOREKEEPER,
  LEAGUE_ROLES.PLATFORM_ADMIN,
  LEAGUE_ROLES.SUPER_ADMIN,
];

export const LEAGUE_MEMBER_ROLES = [
  LEAGUE_ROLES.OWNER,
  LEAGUE_ROLES.ORGANIZER,
  LEAGUE_ROLES.COACH,
  LEAGUE_ROLES.PLAYER,
  LEAGUE_ROLES.REFEREE,
  LEAGUE_ROLES.SCOREKEEPER,
  LEAGUE_ROLES.SPONSOR,
  LEAGUE_ROLES.PLATFORM_ADMIN,
  LEAGUE_ROLES.SUPER_ADMIN,
];

export const GAME_PREP_MANAGER_ROLES = [
  LEAGUE_ROLES.OWNER,
  LEAGUE_ROLES.ORGANIZER,
  LEAGUE_ROLES.COACH,
  LEAGUE_ROLES.PLATFORM_ADMIN,
  LEAGUE_ROLES.SUPER_ADMIN,
];

export function slugifyLeagueName(name = '') {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'league';
}

export function userIds(user = {}) {
  return [user?.id, user?.email, user?.auth_user_id].filter(Boolean).map(String);
}

export function userPlatformRole(user = {}) {
  if (user?.role === 'super_admin') return LEAGUE_ROLES.SUPER_ADMIN;
  if (['owner', 'admin', 'platform_admin'].includes(user?.role)) return LEAGUE_ROLES.PLATFORM_ADMIN;
  return null;
}

export function getCurrentLeagueRole(league = {}, user = {}) {
  const platformRole = userPlatformRole(user);
  if (platformRole) return platformRole;
  const ids = userIds(user);
  const ownerIds = [league.ownerUserId, league.owner_user_id, league.createdByUserId, league.creator_user_id, league.organizerEmail].filter(Boolean).map(String);
  if (ids.some((id) => ownerIds.includes(id))) return LEAGUE_ROLES.OWNER;
  const member = (league.members || []).find((item) => ids.includes(String(item.userId || item.user_id || item.email)));
  return member?.role || LEAGUE_ROLES.VIEWER;
}

export function canManageLeague(league, user) {
  return LEAGUE_ADMIN_ROLES.includes(getCurrentLeagueRole(league, user));
}

export function canSubmitScores(league, user) {
  return SCORE_SUBMITTER_ROLES.includes(getCurrentLeagueRole(league, user));
}

export function canVerifyResults(league, user) {
  return RESULT_VERIFIER_ROLES.includes(getCurrentLeagueRole(league, user));
}

export function canPostLeagueContent(league, user) {
  return LEAGUE_MEMBER_ROLES.includes(getCurrentLeagueRole(league, user));
}

export function canManageGamePrep(league, user) {
  return GAME_PREP_MANAGER_ROLES.includes(getCurrentLeagueRole(league, user));
}

const baseMembers = [
  { id: 'm-1', name: 'Avery Stone', role: 'owner', team: 'Downtown Flight', verificationLevel: 'organizer verified' },
  { id: 'm-2', name: 'Maya Chen', role: 'coach', team: 'Downtown Flight', verificationLevel: 'scorekeeper verified' },
  { id: 'm-3', name: 'Jordan Price', role: 'player', team: 'Westside Arc', verificationLevel: 'opponent confirmed' },
  { id: 'm-4', name: 'Sam Rivera', role: 'referee', team: 'Officials', verificationLevel: 'organizer verified' },
  { id: 'm-5', name: 'Nia Brooks', role: 'scorekeeper', team: 'Officials', verificationLevel: 'scorekeeper verified' },
  { id: 'm-6', name: 'Peak Sports Lab', role: 'sponsor', team: 'Partners', verificationLevel: 'admin verified' },
];

const basketballStats = {
  wins: 7,
  losses: 2,
  ties: 0,
  points: 14,
  scoreDifferential: 86,
  streak: 'W3',
  gamesPlayed: 9,
};

export const DEMO_LEAGUES = [
  {
    id: 'league-downtown-hoops',
    slug: 'downtown-hoops-winter',
    name: 'Downtown Hoops Winter League',
    logoUrl: '',
    coverImageUrl: '',
    location: 'Los Angeles, CA',
    sportId: 'basketball',
    sportName: 'Basketball',
    sportCategory: 'Team Sports',
    formatName: '5v5 League Game',
    statTemplateName: 'Basketball 5v5 Player Stats',
    seasonStart: '2026-06-01',
    seasonEnd: '2026-08-22',
    rules: '5v5 league play with verified scorekeeper records, organizer review, and standard basketball scoring.',
    organizerName: 'Avery Stone',
    organizerEmail: 'demo@thepoles.local',
    contactInfo: 'league@downtownhoops.test',
    description: 'A competitive city basketball league for verified stat tracking, team standings, and league rewards.',
    visibility: 'public',
    verificationStatus: 'organizer verified',
    ownerUserId: 'demo-user',
    members: baseMembers,
    teams: [
      { id: 'team-flight', name: 'Downtown Flight', coach: 'Maya Chen', players: 8, record: '7-2', captain: 'Avery Stone' },
      { id: 'team-arc', name: 'Westside Arc', coach: 'Drew Malik', players: 9, record: '6-3', captain: 'Jordan Price' },
      { id: 'team-lockdown', name: 'Lockdown Club', coach: 'Tia Knox', players: 8, record: '5-4', captain: 'Devin Hall' },
    ],
    schedule: [
      { id: 'evt-1', type: 'Game', title: 'Downtown Flight vs Westside Arc', date: '2026-06-10', time: '7:00 PM', status: 'final', score: '82-76' },
      { id: 'evt-2', type: 'Practice', title: 'Open gym and shooting reps', date: '2026-06-14', time: '6:30 PM', status: 'scheduled', score: '' },
      { id: 'evt-3', type: 'Playoff', title: 'Semifinal night', date: '2026-08-12', time: '7:30 PM', status: 'scheduled', score: '' },
      { id: 'evt-4', type: 'Championship', title: 'Winter League Final', date: '2026-08-22', time: '8:00 PM', status: 'scheduled', score: '' },
    ],
    standings: [
      { rank: 1, team: 'Downtown Flight', ...basketballStats },
      { rank: 2, team: 'Westside Arc', wins: 6, losses: 3, ties: 0, points: 12, scoreDifferential: 44, streak: 'W1', gamesPlayed: 9 },
      { rank: 3, team: 'Lockdown Club', wins: 5, losses: 4, ties: 0, points: 10, scoreDifferential: 12, streak: 'L1', gamesPlayed: 9 },
    ],
    playerProfiles: [
      { id: 'p-1', name: 'Avery Stone', team: 'Downtown Flight', stats: '19.4 PPG, 6.2 RPG, 4.8 APG', practiceTime: '11h this month', skillRating: 82, matchHistory: '7-2', verificationLevel: 'organizer verified', highlights: 5 },
      { id: 'p-2', name: 'Jordan Price', team: 'Westside Arc', stats: '22.1 PPG, 3.7 RPG, 5.1 APG', practiceTime: '9h this month', skillRating: 80, matchHistory: '6-3', verificationLevel: 'scorekeeper verified', highlights: 4 },
      { id: 'p-3', name: 'Devin Hall', team: 'Lockdown Club', stats: '14.6 PPG, 8.4 RPG, 2.3 BPG', practiceTime: '7h this month', skillRating: 76, matchHistory: '5-4', verificationLevel: 'opponent confirmed', highlights: 3 },
    ],
    media: [
      { id: 'media-1', type: 'Game clip', title: 'Fast-break finish sequence', author: 'Maya Chen', verificationLevel: 'video reviewed' },
      { id: 'media-2', type: 'Score screenshot', title: 'Week 3 verified box score', author: 'Nia Brooks', verificationLevel: 'scorekeeper verified' },
      { id: 'media-3', type: 'Event flyer', title: 'Championship night flyer', author: 'Avery Stone', verificationLevel: 'organizer verified' },
    ],
    discussion: [
      { id: 'post-1', type: 'Announcement', author: 'Avery Stone', body: 'Week 4 schedule is posted. Captains should confirm rosters by Friday.', createdAt: '2026-06-11' },
      { id: 'post-2', type: 'Game prep', author: 'Maya Chen', body: 'Focus on transition defense and clean defensive rebounds this week.', createdAt: '2026-06-12' },
      { id: 'post-3', type: 'Congratulations', author: 'Jordan Price', body: 'Strong game from Downtown Flight. Looking forward to the rematch.', createdAt: '2026-06-13' },
    ],
    gamePrep: {
      upcomingOpponent: 'Westside Arc',
      pastPerformance: 'Downtown Flight won the first matchup 82-76 with a plus-12 second half.',
      tendencies: 'Westside Arc pushes pace after long rebounds and uses high ball screens late.',
      teamNotes: 'Prioritize communication on switches and early help positioning.',
      scoutingClips: ['High screen coverage', 'Corner three closeouts'],
      keyPlayers: ['Jordan Price', 'Miles Grant'],
    },
    prizeRewards: [
      { id: 'reward-1', name: 'League Champion Reward Pack', value: '$1,200', taxes: 'Estimated by recipient', shipping: 'Simulated during beta', donationAmount: '$120', winnerStatus: 'Pending championship', fulfillmentStatus: 'Not started', fulfillmentRecordId: '' },
      { id: 'reward-2', name: 'MVP Training Credit', value: '$300', taxes: 'Estimated by recipient', shipping: 'Digital delivery planned', donationAmount: '$30', winnerStatus: 'Pending MVP vote', fulfillmentStatus: 'Queued', fulfillmentRecordId: '' },
    ],
  },
  {
    id: 'league-eastside-3v3',
    slug: 'eastside-3v3-summer',
    name: 'Eastside 3v3 Summer Circuit',
    location: 'Pasadena, CA',
    sportId: 'basketball',
    sportName: 'Basketball',
    sportCategory: 'Team Sports',
    formatName: '3v3 Game',
    statTemplateName: 'Basketball 3v3 Basic Stats',
    seasonStart: '2026-07-05',
    seasonEnd: '2026-09-02',
    rules: 'Half-court 3v3 games. Winners are determined by verified final score and organizer-approved results.',
    organizerName: 'Tia Knox',
    organizerEmail: 'eastside@thepoles.local',
    contactInfo: 'eastside3v3@test',
    description: 'Fast 3v3 basketball nights with standings, clips, and verified player profiles.',
    visibility: 'public',
    verificationStatus: 'scorekeeper verified',
    ownerUserId: 'eastside-owner',
    members: baseMembers.slice(1),
    teams: [
      { id: 'team-roses', name: 'Rose City Handles', coach: 'Tia Knox', players: 4, record: '5-1', captain: 'Nia Brooks' },
      { id: 'team-foothill', name: 'Foothill Press', coach: 'Drew Malik', players: 4, record: '4-2', captain: 'Sam Rivera' },
    ],
    schedule: [
      { id: 'evt-e1', type: 'Tournament', title: 'Opening bracket night', date: '2026-07-05', time: '6:00 PM', status: 'final', score: '21-18' },
      { id: 'evt-e2', type: 'Game', title: 'Rose City Handles vs Foothill Press', date: '2026-07-12', time: '7:15 PM', status: 'scheduled', score: '' },
    ],
    standings: [
      { rank: 1, team: 'Rose City Handles', wins: 5, losses: 1, ties: 0, points: 10, scoreDifferential: 31, streak: 'W4', gamesPlayed: 6 },
      { rank: 2, team: 'Foothill Press', wins: 4, losses: 2, ties: 0, points: 8, scoreDifferential: 18, streak: 'W2', gamesPlayed: 6 },
    ],
    playerProfiles: [
      { id: 'p-e1', name: 'Nia Brooks', team: 'Rose City Handles', stats: '8.8 PPG, 2.3 APG', practiceTime: '6h this month', skillRating: 74, matchHistory: '5-1', verificationLevel: 'scorekeeper verified', highlights: 2 },
      { id: 'p-e2', name: 'Sam Rivera', team: 'Foothill Press', stats: '7.2 PPG, 3.1 RPG', practiceTime: '5h this month', skillRating: 71, matchHistory: '4-2', verificationLevel: 'opponent confirmed', highlights: 1 },
    ],
    media: [{ id: 'media-e1', type: 'Highlight reel', title: 'Week 1 top finishes', author: 'Tia Knox', verificationLevel: 'organizer verified' }],
    discussion: [{ id: 'post-e1', type: 'Motivation', author: 'Tia Knox', body: 'Bring clean jerseys and arrive 20 minutes early for check-in.', createdAt: '2026-07-01' }],
    gamePrep: { upcomingOpponent: 'Foothill Press', pastPerformance: 'Rose City leads the series 1-0.', tendencies: 'Foothill Press favors quick resets after misses.', teamNotes: 'Keep spacing wide.', scoutingClips: ['Reset possessions'], keyPlayers: ['Sam Rivera'] },
    prizeRewards: [{ id: 'reward-e1', name: 'Circuit Winner Reward', value: '$600', taxes: 'Estimated by recipient', shipping: 'Simulated during beta', donationAmount: '$60', winnerStatus: 'Pending final', fulfillmentStatus: 'Not started', fulfillmentRecordId: '' }],
  },
  {
    id: 'league-madden-night',
    slug: 'madden-friday-night-ladder',
    name: 'Madden Friday Night Ladder',
    location: 'Online',
    sportId: 'madden',
    sportName: 'Madden',
    sportCategory: 'Esports',
    formatName: 'Best Score Wins',
    statTemplateName: 'Basic stat template',
    seasonStart: '2026-06-20',
    seasonEnd: '2026-08-01',
    rules: 'Head-to-head esports ladder. Results require submitted score screenshots or organizer verification.',
    organizerName: 'Chris Lane',
    organizerEmail: 'madden@thepoles.local',
    contactInfo: 'discord.gg/demo-ladder',
    description: 'Weekly Madden skill ladder with verified match history and clean standings.',
    visibility: 'invite-only',
    verificationStatus: 'organizer verified',
    ownerUserId: 'madden-owner',
    members: [
      { id: 'm-md1', name: 'Chris Lane', role: 'owner', team: 'Commissioners', verificationLevel: 'organizer verified' },
      { id: 'm-md2', name: 'Rico Fields', role: 'player', team: 'AFC Ladder', verificationLevel: 'scorekeeper verified' },
      { id: 'm-md3', name: 'Jules Carter', role: 'scorekeeper', team: 'Commissioners', verificationLevel: 'scorekeeper verified' },
    ],
    teams: [
      { id: 'team-afc', name: 'AFC Ladder', coach: 'Chris Lane', players: 8, record: '14-6', captain: 'Rico Fields' },
      { id: 'team-nfc', name: 'NFC Ladder', coach: 'Jules Carter', players: 8, record: '12-8', captain: 'Kai Ward' },
    ],
    schedule: [
      { id: 'evt-md1', type: 'Game', title: 'Rico Fields vs Kai Ward', date: '2026-06-21', time: '8:00 PM', status: 'final', score: '31-24' },
      { id: 'evt-md2', type: 'Playoff', title: 'Top 4 ladder semifinal', date: '2026-07-26', time: '8:30 PM', status: 'scheduled', score: '' },
    ],
    standings: [
      { rank: 1, team: 'AFC Ladder', wins: 14, losses: 6, ties: 0, points: 28, scoreDifferential: 104, streak: 'W5', gamesPlayed: 20 },
      { rank: 2, team: 'NFC Ladder', wins: 12, losses: 8, ties: 0, points: 24, scoreDifferential: 63, streak: 'L1', gamesPlayed: 20 },
    ],
    playerProfiles: [{ id: 'p-md1', name: 'Rico Fields', team: 'AFC Ladder', stats: '31.2 PPG, 2.1 TO/G', practiceTime: '8h this month', skillRating: 79, matchHistory: '14-6', verificationLevel: 'scorekeeper verified', highlights: 6 }],
    media: [{ id: 'media-md1', type: 'Score screenshot', title: 'Week 1 verified score', author: 'Jules Carter', verificationLevel: 'scorekeeper verified' }],
    discussion: [{ id: 'post-md1', type: 'Strategy', author: 'Chris Lane', body: 'Post score screenshots immediately after each match.', createdAt: '2026-06-19' }],
    gamePrep: { upcomingOpponent: 'Kai Ward', pastPerformance: 'Rico has won 3 of last 4 verified matches.', tendencies: 'Kai leans on quick passing and conservative clock use.', teamNotes: 'Practice red-zone decision making.', scoutingClips: ['Red zone drives'], keyPlayers: ['Kai Ward'] },
    prizeRewards: [{ id: 'reward-md1', name: 'Ladder Champion Reward', value: '$400', taxes: 'Estimated by recipient', shipping: 'Digital delivery planned', donationAmount: '$40', winnerStatus: 'Pending playoffs', fulfillmentStatus: 'Queued', fulfillmentRecordId: '' }],
  },
  {
    id: 'league-iron-ring',
    slug: 'iron-ring-boxing-gym',
    name: 'Iron Ring Boxing Gym',
    location: 'Long Beach, CA',
    sportId: 'boxing',
    sportName: 'Boxing',
    sportCategory: 'Combat Sports',
    formatName: 'Judge Scored Sparring Card',
    statTemplateName: 'Basic stat template',
    seasonStart: '2026-05-15',
    seasonEnd: '2026-10-15',
    rules: 'Gym-controlled boxing sessions with coach supervision, safety checks, referee decisions, and organizer verification.',
    organizerName: 'Coach Elena Ruiz',
    organizerEmail: 'boxing@thepoles.local',
    contactInfo: 'frontdesk@ironring.test',
    description: 'A combat sports gym hub for classes, supervised cards, verified training clips, and member progress.',
    visibility: 'private',
    verificationStatus: 'organizer verified',
    ownerUserId: 'boxing-owner',
    members: [
      { id: 'm-bx1', name: 'Elena Ruiz', role: 'owner', team: 'Coaches', verificationLevel: 'organizer verified' },
      { id: 'm-bx2', name: 'Marcus Reed', role: 'coach', team: 'Coaches', verificationLevel: 'organizer verified' },
      { id: 'm-bx3', name: 'Ivy Park', role: 'player', team: 'Novice Class', verificationLevel: 'video reviewed' },
      { id: 'm-bx4', name: 'Ray Ortega', role: 'referee', team: 'Officials', verificationLevel: 'admin verified' },
    ],
    teams: [
      { id: 'team-novice', name: 'Novice Class', coach: 'Marcus Reed', players: 12, record: 'Training group', captain: 'Ivy Park' },
      { id: 'team-open', name: 'Open Sparring', coach: 'Elena Ruiz', players: 10, record: 'Training group', captain: 'TBD' },
    ],
    schedule: [
      { id: 'evt-bx1', type: 'Practice', title: 'Footwork and defense session', date: '2026-06-18', time: '6:00 PM', status: 'scheduled', score: '' },
      { id: 'evt-bx2', type: 'Game', title: 'Supervised sparring card', date: '2026-06-25', time: '7:00 PM', status: 'scheduled', score: '' },
    ],
    standings: [
      { rank: 1, team: 'Novice Class', wins: 0, losses: 0, ties: 0, points: 18, scoreDifferential: 0, streak: 'Training', gamesPlayed: 0 },
      { rank: 2, team: 'Open Sparring', wins: 0, losses: 0, ties: 0, points: 16, scoreDifferential: 0, streak: 'Training', gamesPlayed: 0 },
    ],
    playerProfiles: [{ id: 'p-bx1', name: 'Ivy Park', team: 'Novice Class', stats: '12 sessions, 4 verified clips', practiceTime: '14h this month', skillRating: 68, matchHistory: 'Training only', verificationLevel: 'video reviewed', highlights: 4 }],
    media: [{ id: 'media-bx1', type: 'Training clip', title: 'Defense drill review', author: 'Marcus Reed', verificationLevel: 'video reviewed' }],
    discussion: [{ id: 'post-bx1', type: 'Announcement', author: 'Elena Ruiz', body: 'Bring wraps and arrive early for safety checks before sparring.', createdAt: '2026-06-10' }],
    gamePrep: { upcomingOpponent: 'Open Sparring Card', pastPerformance: 'Training progress is based on verified coach notes and clips.', tendencies: 'Focus on guard recovery after combinations.', teamNotes: 'Safety checks are required before contact drills.', scoutingClips: ['Defense drill review'], keyPlayers: ['Ivy Park'] },
    prizeRewards: [{ id: 'reward-bx1', name: 'Most Improved Member Reward', value: '$250', taxes: 'Estimated by recipient', shipping: 'In-person pickup planned', donationAmount: '$25', winnerStatus: 'Pending coach review', fulfillmentStatus: 'Not started', fulfillmentRecordId: '' }],
  },
];

export function normalizeLeagueOrganization(row = {}) {
  return {
    ...row,
    slug: row.slug || slugifyLeagueName(row.name),
    sportName: row.sportName || row.sport_name || row.sport?.name || 'Custom Sport/Game',
    sportId: row.sportId || row.sport_id || row.sport?.slug || row.sport?.id,
    sportCategory: row.sportCategory || row.sport_category || row.sport?.category || 'Custom / Other',
    members: row.members || [],
    teams: row.teams || [],
    schedule: row.schedule || [],
    standings: row.standings || [],
    playerProfiles: row.playerProfiles || row.player_profiles || [],
    media: row.media || [],
    discussion: row.discussion || [],
    gamePrep: row.gamePrep || row.game_prep || {},
    prizeRewards: row.prizeRewards || row.prize_rewards || [],
    evidenceRecords: row.evidenceRecords || row.evidence_records || [],
    disputeRecords: row.disputeRecords || row.dispute_records || [],
  };
}

export function mergeDemoAndSavedLeagues(savedRows = []) {
  const saved = savedRows.map(normalizeLeagueOrganization);
  const savedSlugs = new Set(saved.map((row) => row.slug));
  return [...saved, ...DEMO_LEAGUES.filter((row) => !savedSlugs.has(row.slug))].map(normalizeLeagueOrganization);
}
