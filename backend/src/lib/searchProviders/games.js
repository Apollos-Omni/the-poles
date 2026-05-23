const SAMPLE_GAME_CATALOG = [
  {
    id: 'game-clash-of-clans',
    title: 'Clash of Clans',
    developer: 'Supercell',
    description: 'Build a village, train troops, and compete in strategic attacks and defenses.',
    category: 'Strategy',
    platform: 'mobile',
    store: 'Apple App Store / Google Play',
    source: 'sample_game_catalog',
    skillStyle: 'strategy planning, timing, and resource management',
    skill_verifiable: true,
    icon_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200&h=200&fit=crop',
    provider_ids: { app_store: '553834731', google_play: 'com.supercell.clashofclans' },
  },
  {
    id: 'game-pubg-mobile',
    title: 'PUBG Mobile',
    developer: 'PUBG Corporation',
    description: 'Battle royale competition with survival, aim, movement, and positioning skill.',
    category: 'Action',
    platform: 'mobile',
    store: 'Apple App Store / Google Play',
    source: 'sample_game_catalog',
    skillStyle: 'survival placement, eliminations, and verified score reports',
    skill_verifiable: true,
    icon_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&h=200&fit=crop',
    provider_ids: { google_play: 'com.pubg.mobile' },
  },
  {
    id: 'game-real-racing-3',
    title: 'Real Racing 3',
    developer: 'EA Mobile',
    description: 'Mobile racing competition with lap times and clean-driving skill.',
    category: 'Racing',
    platform: 'mobile',
    store: 'Mobile app stores',
    source: 'sample_game_catalog',
    skillStyle: 'time trial and lap ranking',
    skill_verifiable: true,
    icon_url: 'https://images.unsplash.com/photo-1593341646797-278c77220268?w=200&h=200&fit=crop',
    provider_ids: { google_play: 'com.ea.games.r3_row' },
  },
  {
    id: 'game-counter-strike-2',
    title: 'Counter-Strike 2',
    developer: 'Valve',
    description: 'Competitive FPS with aim, team tactics, objective play, and scoreboards.',
    category: 'FPS',
    platform: 'desktop',
    store: 'Steam',
    source: 'sample_game_catalog',
    skillStyle: 'kills, wins, objective stats, and match score',
    skill_verifiable: true,
    icon_url: 'https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=200&h=200&fit=crop',
    provider_ids: { steam: '730' },
  },
  {
    id: 'game-fortnite',
    title: 'Fortnite',
    developer: 'Epic Games',
    description: 'Battle royale and creative modes with placement, eliminations, and building skill.',
    category: 'Battle Royale',
    platform: 'desktop/console',
    store: 'Epic Games / console stores',
    source: 'sample_game_catalog',
    skillStyle: 'placement, eliminations, and match performance',
    skill_verifiable: true,
    icon_url: 'https://images.unsplash.com/photo-1612287230491-645511cf2980?w=200&h=200&fit=crop',
    provider_ids: { epic: 'fortnite' },
  },
  {
    id: 'game-forza-horizon-5',
    title: 'Forza Horizon 5',
    developer: 'Playground Games',
    description: 'Racing challenges with lap times, events, and driving precision.',
    category: 'Racing',
    platform: 'desktop/console',
    store: 'Xbox / Microsoft Store / Steam',
    source: 'sample_game_catalog',
    skillStyle: 'lap time and event ranking',
    skill_verifiable: true,
    icon_url: 'https://images.unsplash.com/photo-1627943534575-b6d44f6f7b1e?w=200&h=200&fit=crop',
    provider_ids: { xbox: '9NBLGGH4T4X7' },
  },
  {
    id: 'game-fifa-fc',
    title: 'EA Sports FC',
    developer: 'EA Sports',
    description: 'Sports competition built around match wins, goals, and verified results.',
    category: 'Sports',
    platform: 'console/desktop',
    store: 'PlayStation / Xbox / PC stores',
    source: 'sample_game_catalog',
    skillStyle: 'head-to-head match result',
    skill_verifiable: true,
    icon_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=200&h=200&fit=crop',
    provider_ids: {},
  },
  {
    id: 'game-beat-saber',
    title: 'Beat Saber',
    developer: 'Beat Games',
    description: 'VR rhythm game where precision, timing, and score determine the winner.',
    category: 'Rhythm',
    platform: 'vr',
    store: 'Meta Quest / SteamVR',
    source: 'sample_game_catalog',
    skillStyle: 'score and accuracy challenge',
    skill_verifiable: true,
    icon_url: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=200&h=200&fit=crop',
    provider_ids: { steam: '620980' },
  },
  {
    id: 'game-celeste',
    title: 'Celeste',
    developer: 'Maddy Makes Games',
    description: 'Precision platforming challenges with speedrun and completion-time scoring.',
    category: 'Platformer',
    platform: 'desktop/console',
    store: 'Steam / itch.io / console stores',
    source: 'sample_game_catalog',
    skillStyle: 'speedrun time and completion proof',
    skill_verifiable: true,
    icon_url: 'https://images.unsplash.com/photo-1585860250091-a6b10b0e5c94?w=200&h=200&fit=crop',
    provider_ids: { itch_io: 'celeste' },
  },
  {
    id: 'challenge-trivia-champion',
    title: 'Trivia Champion',
    developer: 'The Poles',
    description: 'Knowledge challenge where correct answers and completion time determine ranking.',
    category: 'Trivia',
    platform: 'web',
    store: 'The Poles challenge',
    source: 'sample_game_catalog',
    skillStyle: 'correct answers and speed',
    skill_verifiable: true,
    icon_url: '',
    provider_ids: {},
  },
];

const GAME_PROVIDER_SLOTS = [
  {
    id: 'igdb',
    label: 'IGDB',
    configured: (env) => Boolean(env.IGDB_CLIENT_ID && env.IGDB_CLIENT_SECRET),
    status: 'placeholder',
  },
  {
    id: 'rawg',
    label: 'RAWG',
    configured: (env) => Boolean(env.RAWG_API_KEY),
    status: 'placeholder',
  },
  {
    id: 'steam',
    label: 'Steam Web API',
    configured: (env) => Boolean(env.STEAM_API_KEY),
    status: 'placeholder',
  },
  { id: 'epic', label: 'Epic Games Store', configured: () => false, status: 'placeholder' },
  { id: 'xbox', label: 'Xbox catalog', configured: () => false, status: 'placeholder' },
  { id: 'playstation', label: 'PlayStation catalog', configured: () => false, status: 'placeholder' },
  { id: 'mobile_app_stores', label: 'Mobile app stores', configured: () => false, status: 'placeholder' },
];

const SAMPLE_PROVIDER = {
  id: 'sample_game_catalog',
  label: 'Sample game catalog',
};

function activeGameProviders(env) {
  return GAME_PROVIDER_SLOTS
    .filter((provider) => provider.configured(env))
    .map((provider) => ({
      id: provider.id,
      label: provider.label,
      status: provider.status,
    }));
}

function withGameSource(game, provider = SAMPLE_PROVIDER) {
  const source = game.source || provider.id;
  const sourceLabel = game.source_label || game.sourceLabel || provider.label;
  return {
    ...game,
    provider: source,
    source,
    source_label: sourceLabel,
    sourceLabel,
  };
}

function searchSampleCatalog({ q = '', category = null, platform = null, limit = 24, offset = 0 } = {}) {
  const query = String(q || '').trim().toLowerCase();
  const normalizedCategory = category ? String(category).toLowerCase() : null;
  const normalizedPlatform = platform ? String(platform).toLowerCase() : null;
  const boundedLimit = Math.min(Math.max(Number(limit) || 24, 1), 50);
  const boundedOffset = Math.max(Number(offset) || 0, 0);

  const games = SAMPLE_GAME_CATALOG.filter((game) => {
    const matchesQuery = !query || [
      game.title,
      game.developer,
      game.description,
      game.category,
      game.platform,
      game.skillStyle,
      game.store,
    ].some((value) => String(value || '').toLowerCase().includes(query));
    const matchesCategory = !normalizedCategory || String(game.category || '').toLowerCase() === normalizedCategory;
    const matchesPlatform = !normalizedPlatform || String(game.platform || '').toLowerCase().includes(normalizedPlatform);
    return matchesQuery && matchesCategory && matchesPlatform;
  });

  return {
    games: games
      .slice(boundedOffset, boundedOffset + boundedLimit)
      .map((game) => withGameSource(game, SAMPLE_PROVIDER)),
    totalResults: games.length,
    provider: SAMPLE_PROVIDER.id,
    sourceLabel: SAMPLE_PROVIDER.label,
    providerStatus: 'fallback',
  };
}

async function searchConfiguredGameProviders(_input, env) {
  const configured = activeGameProviders(env);
  if (!configured.length) {
    return {
      games: [],
      totalResults: 0,
      provider: null,
      sourceLabel: null,
      providerStatus: 'not_configured',
      activeProviders: [],
    };
  }

  return {
    games: [],
    totalResults: 0,
    provider: configured[0].id,
    sourceLabel: configured[0].label,
    providerStatus: 'configured_placeholder',
    activeProviders: configured,
  };
}

export async function searchGamesAcrossProviders(input = {}, env = process.env) {
  const configured = await searchConfiguredGameProviders(input, env);
  if (configured.games.length) {
    return {
      ...configured,
      fallbackProvider: SAMPLE_PROVIDER.id,
      futureProviders: GAME_PROVIDER_SLOTS.map((provider) => provider.id),
    };
  }

  const sample = searchSampleCatalog(input);
  return {
    ...sample,
    activeProviders: configured.activeProviders || [],
    externalProviderStatus: configured.providerStatus,
    fallbackProvider: SAMPLE_PROVIDER.id,
    futureProviders: GAME_PROVIDER_SLOTS.map((provider) => provider.id),
  };
}
