/**
 * Snowflake Catcher — Original skill game for the North Pole demo.
 * 100% original code, no third-party game IP used.
 *
 * Rules: Snowflakes fall from the top. Click/tap them to catch.
 * Score = snowflakes caught in 30 seconds.
 * Speed increases over time.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { buildResultPayload } from '@/lib/northpole/gameAdapter';

const GAME_DURATION = 30; // seconds
const SNOWFLAKE_EMOJIS = ['❄️', '🌨️', '⛄', '🏔️'];
const INITIAL_SPAWN_INTERVAL = 900; // ms
const MIN_SPAWN_INTERVAL = 300;

let nextId = 1;

function spawnFlake(containerWidth) {
  return {
    id: nextId++,
    x: Math.random() * (containerWidth - 60) + 10,
    y: -50,
    emoji: SNOWFLAKE_EMOJIS[Math.floor(Math.random() * SNOWFLAKE_EMOJIS.length)],
    speed: 1.5 + Math.random() * 2,
    size: 28 + Math.floor(Math.random() * 20),
    caught: false,
  };
}

export default function SnowflakeCatcherGame({ matchId, userId, onResult }) {
  const [phase, setPhase] = useState('ready'); // ready | playing | done
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [flakes, setFlakes] = useState([]);
  const [missedCount, setMissedCount] = useState(0);

  const containerRef = useRef(null);
  const flakesRef = useRef([]);
  const scoreRef = useRef(0);
  const missedRef = useRef(0);
  const animFrameRef = useRef(null);
  const spawnTimerRef = useRef(null);
  const countdownRef = useRef(null);
  const spawnIntervalRef = useRef(INITIAL_SPAWN_INTERVAL);
  const gameActiveRef = useRef(false);

  const stopGame = useCallback(() => {
    gameActiveRef.current = false;
    cancelAnimationFrame(animFrameRef.current);
    clearInterval(spawnTimerRef.current);
    clearInterval(countdownRef.current);
  }, []);

  const endGame = useCallback(() => {
    stopGame();
    setPhase('done');
    const finalScore = scoreRef.current;
    const payload = buildResultPayload({
      matchId,
      gameId: 'snowflake_skill_demo_v1',
      scores: { [userId]: finalScore },
    });
    onResult(payload);
  }, [matchId, userId, onResult, stopGame]);

  const startGame = useCallback(() => {
    scoreRef.current = 0;
    missedRef.current = 0;
    flakesRef.current = [];
    nextId = 1;
    spawnIntervalRef.current = INITIAL_SPAWN_INTERVAL;
    setScore(0);
    setMissedCount(0);
    setFlakes([]);
    setTimeLeft(GAME_DURATION);
    setPhase('playing');
    gameActiveRef.current = true;

    // Countdown timer
    let elapsed = 0;
    countdownRef.current = setInterval(() => {
      elapsed += 1;
      setTimeLeft(GAME_DURATION - elapsed);
      // Speed up over time
      spawnIntervalRef.current = Math.max(MIN_SPAWN_INTERVAL, INITIAL_SPAWN_INTERVAL - elapsed * 18);
      if (elapsed >= GAME_DURATION) {
        endGame();
      }
    }, 1000);

    // Spawn flakes
    const scheduleSpawn = () => {
      if (!gameActiveRef.current) return;
      const w = containerRef.current?.clientWidth || 400;
      flakesRef.current = [...flakesRef.current, spawnFlake(w)];
      setFlakes([...flakesRef.current]);
      spawnTimerRef.current = setTimeout(scheduleSpawn, spawnIntervalRef.current);
    };
    scheduleSpawn();

    // Animation loop — move flakes down
    const tick = () => {
      if (!gameActiveRef.current) return;
      const containerH = containerRef.current?.clientHeight || 400;
      flakesRef.current = flakesRef.current
        .map((f) => ({ ...f, y: f.y + f.speed }))
        .filter((f) => {
          if (f.caught) return false;
          if (f.y > containerH + 10) {
            missedRef.current += 1;
            setMissedCount(missedRef.current);
            return false;
          }
          return true;
        });
      setFlakes([...flakesRef.current]);
      animFrameRef.current = requestAnimationFrame(tick);
    };
    animFrameRef.current = requestAnimationFrame(tick);
  }, [endGame]);

  const catchFlake = useCallback((id) => {
    flakesRef.current = flakesRef.current.filter((f) => f.id !== id);
    scoreRef.current += 1;
    setScore(scoreRef.current);
    setFlakes([...flakesRef.current]);
  }, []);

  useEffect(() => () => stopGame(), [stopGame]);

  const timerColor = timeLeft <= 10 ? 'text-red-400' : timeLeft <= 20 ? 'text-yellow-400' : 'text-green-400';

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      {/* HUD */}
      <div className="flex items-center gap-8 text-white">
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-300">{score}</div>
          <div className="text-xs text-purple-400 uppercase tracking-wide">Caught</div>
        </div>
        <div className="text-center">
          <div className={`text-3xl font-bold ${timerColor}`}>{timeLeft}s</div>
          <div className="text-xs text-purple-400 uppercase tracking-wide">Time</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-red-400">{missedCount}</div>
          <div className="text-xs text-purple-400 uppercase tracking-wide">Missed</div>
        </div>
      </div>

      {/* Game canvas */}
      <div
        ref={containerRef}
        className="relative w-full bg-gradient-to-b from-blue-950 to-black rounded-2xl border border-purple-700/40 overflow-hidden cursor-crosshair"
        style={{ height: 340 }}
      >
        {phase === 'ready' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="text-6xl">❄️</div>
            <h3 className="text-2xl font-bold text-white">Snowflake Catcher</h3>
            <p className="text-purple-300 text-sm px-8 text-center">
              Catch falling snowflakes by clicking/tapping them.<br />
              30 seconds — highest score wins!
            </p>
            <Button
              onClick={startGame}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
            >
              Start Game
            </Button>
          </div>
        )}

        {phase === 'playing' && flakes.map((f) => (
          <button
            key={f.id}
            onClick={() => catchFlake(f.id)}
            style={{
              position: 'absolute',
              left: f.x,
              top: f.y,
              fontSize: f.size,
              lineHeight: 1,
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              transition: 'top 0ms',
              userSelect: 'none',
            }}
            aria-label="catch snowflake"
          >
            {f.emoji}
          </button>
        ))}

        {phase === 'done' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 backdrop-blur-sm">
            <div className="text-5xl">🏆</div>
            <h3 className="text-2xl font-bold text-white">Time's Up!</h3>
            <p className="text-purple-300">Final Score: <span className="font-bold text-yellow-300 text-xl">{score}</span></p>
            <p className="text-purple-400 text-sm">Submitting result…</p>
          </div>
        )}
      </div>

      {phase === 'playing' && (
        <p className="text-purple-400 text-xs animate-pulse">Click/tap the snowflakes to catch them!</p>
      )}
    </div>
  );
}