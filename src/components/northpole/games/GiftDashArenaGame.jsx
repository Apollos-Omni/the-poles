/**
 * Gift Dash Arena — attention-grabbing North Pole arcade demo.
 *
 * Rules:
 * - Move the player through the arena with WASD / arrow keys or touch buttons.
 * - Collect gifts and stars.
 * - Avoid coal.
 * - Score is based on collection, combo, survival, and accuracy.
 *
 * This remains a sandbox skill-game adapter. No third-party IP is used.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { buildResultPayload } from '@/lib/northpole/gameAdapter';

const GAME_DURATION = 45;
const ARENA_HEIGHT = 380;
const PLAYER_SIZE = 42;
const OBJECT_SIZE = 34;
const MOVE_SPEED = 5.2;
const SPAWN_MS = 560;

let nextObjectId = 1;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function formatTime(seconds) {
  return `${Math.max(0, seconds)}s`;
}

function spawnObject(width) {
  const roll = Math.random();
  const type = roll < 0.66 ? 'gift' : roll < 0.84 ? 'star' : 'coal';
  const config = {
    gift: { emoji: '🎁', value: 100, label: 'Gift', speed: 2.4 + Math.random() * 1.4 },
    star: { emoji: '⭐', value: 225, label: 'Combo Star', speed: 2.1 + Math.random() * 1.2 },
    coal: { emoji: '🪨', value: -175, label: 'Coal', speed: 2.7 + Math.random() * 1.8 },
  }[type];

  return {
    id: nextObjectId++,
    type,
    ...config,
    x: Math.random() * Math.max(1, width - OBJECT_SIZE - 20) + 10,
    y: -OBJECT_SIZE,
    rotation: Math.floor(Math.random() * 20) - 10,
  };
}

function collides(player, object) {
  const playerCenterX = player.x + PLAYER_SIZE / 2;
  const playerCenterY = player.y + PLAYER_SIZE / 2;
  const objectCenterX = object.x + OBJECT_SIZE / 2;
  const objectCenterY = object.y + OBJECT_SIZE / 2;
  const dx = playerCenterX - objectCenterX;
  const dy = playerCenterY - objectCenterY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < 39;
}

export default function GiftDashArenaGame({ matchId, userId, onResult }) {
  const [phase, setPhase] = useState('ready');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [combo, setCombo] = useState(1);
  const [bestCombo, setBestCombo] = useState(1);
  const [giftsCollected, setGiftsCollected] = useState(0);
  const [coalHits, setCoalHits] = useState(0);
  const [objects, setObjects] = useState([]);
  const [player, setPlayer] = useState({ x: 60, y: ARENA_HEIGHT - 72 });
  const [message, setMessage] = useState('Collect gifts. Dodge coal. Build the combo.');

  const arenaRef = useRef(null);
  const objectsRef = useRef([]);
  const playerRef = useRef({ x: 60, y: ARENA_HEIGHT - 72 });
  const keysRef = useRef(new Set());
  const scoreRef = useRef(0);
  const comboRef = useRef(1);
  const bestComboRef = useRef(1);
  const giftsRef = useRef(0);
  const coalRef = useRef(0);
  const gameActiveRef = useRef(false);
  const animationRef = useRef(null);
  const countdownRef = useRef(null);
  const spawnRef = useRef(null);

  const syncStats = useCallback(() => {
    setScore(scoreRef.current);
    setCombo(comboRef.current);
    setBestCombo(bestComboRef.current);
    setGiftsCollected(giftsRef.current);
    setCoalHits(coalRef.current);
  }, []);

  const stopGame = useCallback(() => {
    gameActiveRef.current = false;
    cancelAnimationFrame(animationRef.current);
    clearInterval(countdownRef.current);
    clearInterval(spawnRef.current);
  }, []);

  const endGame = useCallback(() => {
    stopGame();
    setPhase('done');

    const survivalBonus = coalRef.current === 0 ? 500 : Math.max(0, 300 - coalRef.current * 75);
    const finalScore = Math.max(0, scoreRef.current + survivalBonus + bestComboRef.current * 40);
    scoreRef.current = finalScore;
    syncStats();

    const payload = buildResultPayload({
      matchId,
      gameId: 'gift_dash_arena_v1',
      scores: { [userId]: finalScore },
    });

    payload.meta = {
      giftsCollected: giftsRef.current,
      coalHits: coalRef.current,
      bestCombo: bestComboRef.current,
      survivalBonus,
      gameName: 'Gift Dash Arena',
    };

    setTimeout(() => onResult(payload), 900);
  }, [matchId, onResult, stopGame, syncStats, userId]);

  const applyObjectResult = useCallback((object) => {
    if (object.type === 'coal') {
      coalRef.current += 1;
      comboRef.current = 1;
      scoreRef.current = Math.max(0, scoreRef.current + object.value);
      setMessage('Coal hit! Combo reset. Stay sharp.');
      syncStats();
      return;
    }

    giftsRef.current += 1;
    const nextCombo = Math.min(10, comboRef.current + (object.type === 'star' ? 2 : 1));
    comboRef.current = nextCombo;
    bestComboRef.current = Math.max(bestComboRef.current, nextCombo);
    scoreRef.current += Math.floor(object.value * nextCombo);
    setMessage(object.type === 'star' ? 'Star boost! Combo jumped.' : 'Gift secured. Keep moving.');
    syncStats();
  }, [syncStats]);

  const startGame = useCallback(() => {
    const arenaWidth = arenaRef.current?.clientWidth || 620;
    const startPlayer = {
      x: Math.max(24, arenaWidth / 2 - PLAYER_SIZE / 2),
      y: ARENA_HEIGHT - 72,
    };

    nextObjectId = 1;
    objectsRef.current = [];
    playerRef.current = startPlayer;
    scoreRef.current = 0;
    comboRef.current = 1;
    bestComboRef.current = 1;
    giftsRef.current = 0;
    coalRef.current = 0;
    keysRef.current.clear();

    setPlayer(startPlayer);
    setObjects([]);
    setScore(0);
    setCombo(1);
    setBestCombo(1);
    setGiftsCollected(0);
    setCoalHits(0);
    setTimeLeft(GAME_DURATION);
    setMessage('Go. Gifts are falling. Coal is not your friend.');
    setPhase('playing');
    gameActiveRef.current = true;

    let elapsed = 0;
    countdownRef.current = setInterval(() => {
      elapsed += 1;
      setTimeLeft(GAME_DURATION - elapsed);
      if (elapsed >= GAME_DURATION) endGame();
    }, 1000);

    spawnRef.current = setInterval(() => {
      if (!gameActiveRef.current) return;
      const width = arenaRef.current?.clientWidth || 620;
      objectsRef.current = [...objectsRef.current, spawnObject(width)];
      setObjects([...objectsRef.current]);
    }, SPAWN_MS);

    const tick = () => {
      if (!gameActiveRef.current) return;
      const width = arenaRef.current?.clientWidth || 620;
      const keys = keysRef.current;
      let dx = 0;
      let dy = 0;

      if (keys.has('ArrowLeft') || keys.has('a')) dx -= MOVE_SPEED;
      if (keys.has('ArrowRight') || keys.has('d')) dx += MOVE_SPEED;
      if (keys.has('ArrowUp') || keys.has('w')) dy -= MOVE_SPEED;
      if (keys.has('ArrowDown') || keys.has('s')) dy += MOVE_SPEED;

      if (dx !== 0 && dy !== 0) {
        dx *= 0.72;
        dy *= 0.72;
      }

      playerRef.current = {
        x: clamp(playerRef.current.x + dx, 8, width - PLAYER_SIZE - 8),
        y: clamp(playerRef.current.y + dy, 26, ARENA_HEIGHT - PLAYER_SIZE - 8),
      };

      const nextObjects = [];
      for (const object of objectsRef.current) {
        const moved = { ...object, y: object.y + object.speed + Math.max(0, 1.2 - comboRef.current * 0.03) };
        if (collides(playerRef.current, moved)) {
          applyObjectResult(moved);
          continue;
        }
        if (moved.y < ARENA_HEIGHT + 50) nextObjects.push(moved);
      }

      objectsRef.current = nextObjects;
      setObjects(nextObjects);
      setPlayer(playerRef.current);
      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);
  }, [applyObjectResult, endGame]);

  useEffect(() => {
    const down = (event) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'w', 'a', 's', 'd'].includes(event.key)) {
        event.preventDefault();
        keysRef.current.add(event.key);
      }
    };
    const up = (event) => keysRef.current.delete(event.key);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      stopGame();
    };
  }, [stopGame]);

  const pressDirection = (keys) => {
    keys.forEach((key) => keysRef.current.add(key));
  };

  const releaseDirection = (keys) => {
    keys.forEach((key) => keysRef.current.delete(key));
  };

  const DirectionButton = ({ label, keys }) => (
    <button
      type="button"
      onMouseDown={() => pressDirection(keys)}
      onMouseUp={() => releaseDirection(keys)}
      onMouseLeave={() => releaseDirection(keys)}
      onTouchStart={(event) => {
        event.preventDefault();
        pressDirection(keys);
      }}
      onTouchEnd={(event) => {
        event.preventDefault();
        releaseDirection(keys);
      }}
      className="h-11 w-11 rounded-xl bg-purple-800/70 border border-purple-500/40 text-white font-black active:scale-95"
    >
      {label}
    </button>
  );

  const timerColor = timeLeft <= 10 ? 'text-red-300' : timeLeft <= 22 ? 'text-yellow-300' : 'text-green-300';

  return (
    <div className="space-y-4 select-none">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-black/40 border border-purple-700/30 rounded-xl p-3 text-center">
          <div className="text-2xl font-black text-yellow-300">{score}</div>
          <div className="text-[10px] uppercase tracking-wide text-purple-300/70">Score</div>
        </div>
        <div className="bg-black/40 border border-purple-700/30 rounded-xl p-3 text-center">
          <div className={`text-2xl font-black ${timerColor}`}>{formatTime(timeLeft)}</div>
          <div className="text-[10px] uppercase tracking-wide text-purple-300/70">Clock</div>
        </div>
        <div className="bg-black/40 border border-purple-700/30 rounded-xl p-3 text-center">
          <div className="text-2xl font-black text-cyan-300">x{combo}</div>
          <div className="text-[10px] uppercase tracking-wide text-purple-300/70">Combo</div>
        </div>
        <div className="bg-black/40 border border-purple-700/30 rounded-xl p-3 text-center">
          <div className="text-2xl font-black text-green-300">{giftsCollected}</div>
          <div className="text-[10px] uppercase tracking-wide text-purple-300/70">Collected</div>
        </div>
        <div className="bg-black/40 border border-purple-700/30 rounded-xl p-3 text-center col-span-2 md:col-span-1">
          <div className="text-2xl font-black text-red-300">{coalHits}</div>
          <div className="text-[10px] uppercase tracking-wide text-purple-300/70">Coal Hits</div>
        </div>
      </div>

      <div
        ref={arenaRef}
        className="relative w-full overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-indigo-950 via-purple-950 to-black shadow-2xl shadow-purple-950/50"
        style={{ height: ARENA_HEIGHT }}
      >
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          {[...Array(34)].map((_, i) => (
            <div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-white animate-pulse"
              style={{ left: `${(i * 37) % 100}%`, top: `${(i * 59) % 100}%`, animationDelay: `${(i * 0.17) % 2}s` }}
            />
          ))}
        </div>

        <div className="absolute left-4 top-4 z-20 flex flex-wrap items-center gap-2">
          <Badge className="bg-cyan-500/20 text-cyan-200 border border-cyan-400/30">Gift Dash Arena</Badge>
          <Badge className="bg-yellow-500/20 text-yellow-200 border border-yellow-400/30">Skill Match</Badge>
        </div>

        {phase === 'ready' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-black/45 px-6 text-center backdrop-blur-sm">
            <div className="text-7xl drop-shadow-lg">🎅⚡</div>
            <div>
              <h3 className="text-3xl font-black text-white">Gift Dash Arena</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm text-purple-200/80">
                Move your character through the arena, collect gifts and stars, dodge coal, and build a combo before time runs out.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-purple-200/80">
              <span className="rounded-lg bg-black/40 px-3 py-2">🎁 Gifts = points</span>
              <span className="rounded-lg bg-black/40 px-3 py-2">⭐ Stars = combo</span>
              <span className="rounded-lg bg-black/40 px-3 py-2">🪨 Coal = penalty</span>
            </div>
            <Button onClick={startGame} className="bg-gradient-to-r from-cyan-600 to-purple-600 px-8 py-6 text-lg font-black text-white hover:from-cyan-500 hover:to-purple-500">
              Start Arena Match
            </Button>
            <p className="text-xs text-purple-300/70">Keyboard: WASD / Arrow keys · Mobile: use controls below</p>
          </div>
        )}

        {phase === 'playing' && (
          <>
            <div
              className="absolute z-10 flex items-center justify-center rounded-2xl border border-cyan-300/50 bg-cyan-500/20 text-3xl shadow-lg shadow-cyan-900/60"
              style={{ left: player.x, top: player.y, width: PLAYER_SIZE, height: PLAYER_SIZE }}
            >
              🎅
            </div>
            {objects.map((object) => (
              <div
                key={object.id}
                className={`absolute z-10 flex items-center justify-center rounded-full text-3xl transition-transform ${object.type === 'coal' ? 'bg-red-950/30' : 'bg-white/5'}`}
                style={{
                  left: object.x,
                  top: object.y,
                  width: OBJECT_SIZE,
                  height: OBJECT_SIZE,
                  transform: `rotate(${object.rotation}deg)`,
                }}
                aria-label={object.label}
              >
                {object.emoji}
              </div>
            ))}
          </>
        )}

        {phase === 'done' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/65 px-6 text-center backdrop-blur-sm">
            <div className="text-7xl">🏆</div>
            <h3 className="text-3xl font-black text-white">Match Complete</h3>
            <p className="text-purple-200">Final verified score:</p>
            <div className="text-5xl font-black text-yellow-300">{score}</div>
            <p className="text-sm text-purple-300">Submitting score to the North Pole verification system…</p>
          </div>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
        <div className="rounded-2xl border border-purple-700/30 bg-black/30 p-3 text-sm text-purple-200/80">
          <span className="font-semibold text-cyan-300">Live callout:</span> {message}
        </div>
        {phase === 'playing' && (
          <div className="grid grid-cols-3 gap-1 justify-self-center md:justify-self-end">
            <div />
            <DirectionButton label="↑" keys={['ArrowUp']} />
            <div />
            <DirectionButton label="←" keys={['ArrowLeft']} />
            <DirectionButton label="↓" keys={['ArrowDown']} />
            <DirectionButton label="→" keys={['ArrowRight']} />
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-yellow-600/25 bg-yellow-900/10 p-3 text-xs text-yellow-100/70">
        Demo note: this game sends the same standardized MATCH_RESULT_FINALIZED payload as the old demo, so the winner verification and fulfillment flow remain connected.
      </div>
    </div>
  );
}
