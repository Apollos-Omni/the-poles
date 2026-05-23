/**
 * North Pole Game Adapter System
 *
 * Every game that wants to plug into the North Pole prize system
 * must implement this adapter interface.
 *
 * The adapter is responsible for:
 *   1. Rendering the game UI (via the `GameComponent` React component)
 *   2. Reporting a standardized MATCH_RESULT_FINALIZED payload when the game ends
 *
 * Universal result payload shape:
 * {
 *   eventType: "MATCH_RESULT_FINALIZED",
 *   matchId: string,
 *   gameId: string,
 *   scores: { [userId]: number },
 *   winner: { userId: string },
 *   timestamp: ISO string,
 *   meta: object  // optional game-specific data
 * }
 */

/**
 * @typedef {Object} GameAdapter
 * @property {string} id - Unique game identifier
 * @property {string} title - Display name
 * @property {string} description - Short description
 * @property {string} genre - Genre label
 * @property {number} avgDurationSeconds - Approx game duration
 * @property {React.ComponentType} GameComponent - The playable game component
 *   Props: { matchId, userId, onResult(payload) }
 */

import GiftDashArenaGame from '@/components/northpole/games/GiftDashArenaGame';
import SnowflakeCatcherGame from '@/components/northpole/games/SnowflakeCatcherGame';

/** @type {GameAdapter[]} */
export const GAME_ADAPTERS = [
  {
    id: 'gift_dash_arena_v1',
    title: 'Gift Dash Arena',
    description: 'Move through a glowing North Pole arena, collect gifts and stars, dodge coal, build a combo, and prove skill under pressure.',
    genre: 'Skill / Arcade Arena',
    avgDurationSeconds: 45,
    icon: '🎅⚡',
    featured: true,
    GameComponent: GiftDashArenaGame,
  },
  {
    id: 'snowflake_skill_demo_v1',
    title: 'Snowflake Catcher',
    description: 'Catch as many snowflakes as you can in 30 seconds. Simple skill demo for quick testing.',
    genre: 'Skill / Tap Reflex',
    avgDurationSeconds: 30,
    icon: '❄️',
    featured: false,
    GameComponent: SnowflakeCatcherGame,
  },
];

/** Look up a registered adapter by ID */
export function getAdapter(gameId) {
  return GAME_ADAPTERS.find((a) => a.id === gameId) || null;
}

/**
 * Build a MATCH_RESULT_FINALIZED payload from a raw scores map.
 * Determines winner by highest score.
 */
export function buildResultPayload({ matchId, gameId, scores }) {
  const entries = Object.entries(scores);
  if (entries.length === 0) throw new Error('No scores provided');

  const [winnerUserId] = entries.reduce(([bestId, bestScore], [uid, sc]) =>
    sc > bestScore ? [uid, sc] : [bestId, bestScore],
    entries[0]
  );

  return {
    eventType: 'MATCH_RESULT_FINALIZED',
    matchId,
    gameId,
    scores,
    winner: { userId: winnerUserId },
    timestamp: new Date().toISOString(),
  };
}
