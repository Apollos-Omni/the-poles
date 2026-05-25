/**
 * MatchDraftBuilder — A self-contained 3-step flow:
 *   Step 1: Prize Search (demo data + eBay tab)
 *   Step 2: Game Search (demo data)
 *   Step 3: Confirm & Create Match
 *
 * Saves prizeSnapshot and gameSnapshot to a local matchDraft.
 */
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Search, Trophy, Gamepad2, CheckCircle, Info } from 'lucide-react';
import { DEMO_PRIZES, DEMO_GAMES, PRIZE_CATEGORIES, GAME_CATEGORIES } from './demo-data';

// ─── Prize Search Step ─────────────────────────────────────────────────────────
function PrizeSearch({ onSelect }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(null);
  const [tab, setTab] = useState('demo'); // 'demo' | 'ebay'

  const filtered = DEMO_PRIZES.filter(p => {
    const q = query.toLowerCase();
    const matchQ = !q
      || p.title.toLowerCase().includes(q)
      || p.category.toLowerCase().includes(q)
      || (p.description || '').toLowerCase().includes(q)
      || (p.provider || '').toLowerCase().includes(q);
    const matchCat = !category || p.category === category;
    return matchQ && matchCat;
  });

  return (
    <div className="space-y-4">
      {/* Source tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('demo')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === 'demo' ? 'bg-purple-700 text-white' : 'bg-black/30 border border-purple-700/30 text-purple-300 hover:border-purple-500'}`}
        >
          🏆 Demo Prize Search
        </button>
        <button
          onClick={() => setTab('ebay')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === 'ebay' ? 'bg-orange-700 text-white' : 'bg-black/30 border border-orange-700/30 text-orange-300 hover:border-orange-500'}`}
        >
          eBay Live Search
        </button>
      </div>

      {/* eBay placeholder */}
      {tab === 'ebay' && (
        <div className="bg-orange-900/20 border border-orange-700/30 rounded-2xl p-6 flex items-start gap-4">
          <Info className="w-6 h-6 text-orange-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-orange-200 font-semibold text-sm">Live eBay search is being connected.</p>
            <p className="text-orange-300/70 text-sm mt-1">Use Demo Prize Search for now.</p>
            <Button
              size="sm"
              className="mt-3 bg-orange-700 hover:bg-orange-600 text-white text-xs"
              onClick={() => setTab('demo')}
            >
              Switch to Demo Search
            </Button>
          </div>
        </div>
      )}

      {/* Demo search */}
      {tab === 'demo' && (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/60" />
            <Input
              placeholder="Search prizes — AirPods, PS5, vacation, cruise, concert tickets..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="pl-9 bg-black/30 border-purple-700/30 focus:border-purple-500 text-white placeholder:text-purple-400/60"
            />
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategory(null)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${!category ? 'bg-purple-700 text-white' : 'bg-black/30 border border-purple-700/30 text-purple-300 hover:border-purple-500'}`}
            >
              All
            </button>
            {PRIZE_CATEGORIES.map(c => (
              <button
                key={c.label}
                onClick={() => setCategory(c.label === category ? null : c.label)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${category === c.label ? 'bg-purple-700 text-white' : 'bg-black/30 border border-purple-700/30 text-purple-300 hover:border-purple-500'}`}
              >
                {c.icon} {c.label}
              </button>
            ))}
          </div>

          {/* Results */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-1">
            {filtered.map(prize => (
              <div
                key={prize.id}
                className="bg-black/40 border border-purple-700/20 hover:border-purple-400/60 rounded-2xl overflow-hidden transition-all cursor-pointer group"
                onClick={() => onSelect(prize)}
              >
                <div className="h-36 overflow-hidden">
                  <img
                    src={prize.image}
                    alt={prize.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1549396535-c11d5c55b9df?w=400'; }}
                  />
                </div>
                <div className="p-3 space-y-2">
                  <Badge className="bg-purple-900/40 text-purple-300 border-purple-700/30 text-xs">{prize.category}</Badge>
                  <h4 className="font-semibold text-white text-sm leading-tight">{prize.title}</h4>
                  {prize.description && (
                    <p className="text-purple-400/60 text-xs line-clamp-2">{prize.description}</p>
                  )}
                  <p className="text-green-400 font-bold text-sm">${(prize.estimatedValue / 100).toFixed(2)}</p>
                  <Button
                    size="sm"
                    className="w-full bg-purple-700 hover:bg-purple-600 text-white text-xs"
                    onClick={e => { e.stopPropagation(); onSelect(prize); }}
                  >
                    🏆 Select This Prize
                  </Button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-10 text-purple-400/60 text-sm">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
                No prizes found for "{query}". Try different keywords.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Game Search Step ──────────────────────────────────────────────────────────
function GameSearch({ prizeSnapshot, onSelect }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(null);

  const filtered = DEMO_GAMES.filter(g => {
    const q = query.toLowerCase();
    const matchQ = !q
      || g.title.toLowerCase().includes(q)
      || g.category.toLowerCase().includes(q)
      || (g.desc || '').toLowerCase().includes(q);
    const matchCat = !category || g.category === category;
    return matchQ && matchCat;
  });

  return (
    <div className="space-y-4">
      {/* Selected prize reminder */}
      {prizeSnapshot && (
        <div className="bg-green-900/20 border border-green-700/30 rounded-xl p-3 flex items-center gap-3">
          <img
            src={prizeSnapshot.image}
            alt={prizeSnapshot.title}
            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1549396535-c11d5c55b9df?w=60'; }}
          />
          <div>
            <p className="text-green-300 text-xs font-semibold">✓ Prize Selected</p>
            <p className="text-white font-bold text-sm">{prizeSnapshot.title}</p>
            <p className="text-green-400 text-xs">${(prizeSnapshot.estimatedValue / 100).toFixed(2)}</p>
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/60" />
        <Input
          placeholder="Search — Basketball, Chess, Call of Duty, Fortnite, Custom..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="pl-9 bg-black/30 border-purple-700/30 focus:border-purple-500 text-white placeholder:text-purple-400/60"
        />
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategory(null)}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${!category ? 'bg-purple-700 text-white' : 'bg-black/30 border border-purple-700/30 text-purple-300 hover:border-purple-500'}`}
        >
          All
        </button>
        {GAME_CATEGORIES.map(c => (
          <button
            key={c.label}
            onClick={() => setCategory(c.label === category ? null : c.label)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${category === c.label ? 'bg-purple-700 text-white' : 'bg-black/30 border border-purple-700/30 text-purple-300 hover:border-purple-500'}`}
          >
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      {/* Game grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[55vh] overflow-y-auto pr-1">
        {filtered.map(game => (
          <button
            key={game.id}
            onClick={() => onSelect(game)}
            className="text-left p-4 rounded-2xl border border-purple-700/20 bg-black/40 hover:border-purple-400/60 hover:bg-purple-900/20 transition-all group"
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">{game.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">{game.title}</p>
                <Badge className="bg-purple-900/40 text-purple-300 border-purple-700/30 text-xs mt-1">{game.category}</Badge>
                <p className="text-purple-400/60 text-xs mt-1 line-clamp-2">{game.desc}</p>
              </div>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-10 text-purple-400/60 text-sm">
            <Gamepad2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            No games found for "{query}". Try different keywords.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Confirm Step ──────────────────────────────────────────────────────────────
function MatchConfirm({ prizeSnapshot, gameSnapshot, poleType, onConfirm, onEditPrize, onEditGame }) {
  const isNorth = poleType === 'north';
  const entryContrib = prizeSnapshot ? `$${((prizeSnapshot.estimatedValue * 1.1) / 100 / 10).toFixed(2)}` : 'TBD';

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-bold text-white">Review Your Match</h3>

      {/* Prize card */}
      <div className="bg-black/40 border border-purple-700/30 rounded-2xl overflow-hidden">
        <div className="bg-purple-900/20 px-4 py-2 border-b border-purple-700/20 flex items-center justify-between">
          <p className="text-purple-300 text-xs font-semibold">🏆 PRIZE</p>
          <button onClick={onEditPrize} className="text-purple-400 hover:text-purple-200 text-xs underline">Change</button>
        </div>
        <div className="p-4 flex items-center gap-4">
          <img
            src={prizeSnapshot?.image}
            alt={prizeSnapshot?.title}
            className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1549396535-c11d5c55b9df?w=80'; }}
          />
          <div>
            <p className="text-white font-bold">{prizeSnapshot?.title}</p>
            <Badge className="bg-purple-900/40 text-purple-300 border-purple-700/30 text-xs mt-1">{prizeSnapshot?.category}</Badge>
            <p className="text-green-400 font-bold text-sm mt-1">${(prizeSnapshot?.estimatedValue / 100).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Game card */}
      <div className="bg-black/40 border border-purple-700/30 rounded-2xl overflow-hidden">
        <div className="bg-purple-900/20 px-4 py-2 border-b border-purple-700/20 flex items-center justify-between">
          <p className="text-purple-300 text-xs font-semibold">🎮 GAME / EVENT</p>
          <button onClick={onEditGame} className="text-purple-400 hover:text-purple-200 text-xs underline">Change</button>
        </div>
        <div className="p-4 flex items-center gap-4">
          <span className="text-4xl">{gameSnapshot?.icon}</span>
          <div>
            <p className="text-white font-bold">{gameSnapshot?.title}</p>
            <Badge className="bg-purple-900/40 text-purple-300 border-purple-700/30 text-xs mt-1">{gameSnapshot?.category}</Badge>
            <p className="text-purple-400/60 text-xs mt-1">{gameSnapshot?.desc}</p>
          </div>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-black/30 border border-purple-700/20 rounded-xl p-3">
          <p className="text-purple-400/60 text-xs">Est. Entry / Player</p>
          <p className="text-white font-bold text-lg">{entryContrib}</p>
        </div>
        <div className="bg-black/30 border border-purple-700/20 rounded-xl p-3">
          <p className="text-purple-400/60 text-xs">The Poles Fund</p>
          <p className="text-pink-300 font-bold text-lg">Mission</p>
        </div>
      </div>

      <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-xl p-3 text-xs text-yellow-300/80">
        ⚠️ <strong>Sandbox Mode:</strong> No real payments processed. Demo event only.
      </div>
      <div className="bg-pink-900/20 border border-pink-700/20 rounded-xl p-3 text-xs text-pink-300/70">
        Mission support goes to <strong>The Poles Fund</strong> for approved gift and growth categories.
      </div>

      <Button
        className={`w-full font-bold py-3 ${isNorth ? 'bg-purple-700 hover:bg-purple-600' : 'bg-cyan-700 hover:bg-cyan-600'} text-white`}
        onClick={onConfirm}
      >
        🚀 Create Match
      </Button>
    </div>
  );
}

// ─── Main MatchDraftBuilder ────────────────────────────────────────────────────
export default function MatchDraftBuilder({ poleType = 'north', prePrize = null, onComplete, onBack }) {
  const [step, setStep] = useState(prePrize ? 2 : 1); // 1=prize, 2=game, 3=confirm
  const [prizeSnapshot, setPrizeSnapshot] = useState(prePrize || null);
  const [gameSnapshot, setGameSnapshot] = useState(null);

  const isNorth = poleType === 'north';

  const handleSelectPrize = (prize) => {
    setPrizeSnapshot(prize);
    setStep(2);
  };

  const handleSelectGame = (game) => {
    setGameSnapshot(game);
    setStep(3);
  };

  const handleConfirm = () => {
    const matchDraft = {
      id: `draft_${Date.now()}`,
      title: `${gameSnapshot?.title} — ${prizeSnapshot?.title}`,
      poleType,
      prizeSnapshot,
      gameSnapshot,
      status: 'open',
      playersJoined: 1,
      playersNeeded: 10,
      entryContribution: `$${((prizeSnapshot?.estimatedValue * 1.1) / 100 / 10).toFixed(2)}`,
      startDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      hostId: 'me',
      hostName: 'You',
    };
    onComplete?.(matchDraft);
  };

  const STEP_LABELS = ['Select Prize', 'Select Game', 'Confirm'];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          className="text-purple-400 hover:text-white p-1"
          onClick={step === 1 ? onBack : () => setStep(s => s - 1)}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-xl font-black text-white">Create {isNorth ? '🎅 North Pole Match' : '🧊 South Pole Event'}</h2>
          <p className="text-purple-400/60 text-xs">Step {step} of 3 — {STEP_LABELS[step - 1]}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1">
        {[1, 2, 3].map(s => (
          <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${s <= step ? (isNorth ? 'bg-purple-500' : 'bg-cyan-500') : 'bg-white/10'}`} />
        ))}
      </div>

      {/* Step labels */}
      <div className="flex text-xs text-purple-400/60">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className={`flex-1 text-center ${i + 1 === step ? 'text-purple-300 font-semibold' : ''}`}>
            {i + 1 === step && <CheckCircle className="w-3 h-3 inline mr-1 text-purple-400" />}
            {label}
          </div>
        ))}
      </div>

      {/* Steps */}
      {step === 1 && <PrizeSearch onSelect={handleSelectPrize} />}
      {step === 2 && <GameSearch prizeSnapshot={prizeSnapshot} onSelect={handleSelectGame} />}
      {step === 3 && (
        <MatchConfirm
          prizeSnapshot={prizeSnapshot}
          gameSnapshot={gameSnapshot}
          poleType={poleType}
          onConfirm={handleConfirm}
          onEditPrize={() => setStep(1)}
          onEditGame={() => setStep(2)}
        />
      )}
    </div>
  );
}
