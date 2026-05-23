import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Gamepad2, Clock, Trophy, Lock, Users, Heart, DollarSign, ShieldCheck } from 'lucide-react';
import { GAME_ADAPTERS } from '@/lib/northpole/gameAdapter';
import SkillConfidenceAgreement from '@/components/poles/SkillConfidenceAgreement';

const DEFAULT_PLAYER_OPTIONS = [2, 4, 6, 8, 10, 12];
const DONATION_PERCENT = 0.10;

function formatMoney(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

function calculateMatchPlan(priceCents, players) {
  const donationCents = Math.ceil(priceCents * DONATION_PERCENT);
  const platformBufferCents = Math.ceil(priceCents * 0.03);
  const totalMatchCents = priceCents + donationCents + platformBufferCents;
  const perPlayerCents = Math.ceil(totalMatchCents / players);

  return {
    players,
    priceCents,
    donationCents,
    platformBufferCents,
    totalMatchCents,
    perPlayerCents,
  };
}

function PrizeBreakdown({ selectedPrize, selectedPlayers, onPlayersChange }) {
  const priceCents = selectedPrize.price_cents || 0;
  const playerOptions = selectedPrize.player_options || DEFAULT_PLAYER_OPTIONS;
  const plans = playerOptions.map((players) => calculateMatchPlan(priceCents, players));
  const activePlan = calculateMatchPlan(priceCents, selectedPlayers);

  return (
    <div className="mb-6 space-y-4">
      <div className="rounded-2xl border border-yellow-600/40 bg-gradient-to-r from-yellow-950/40 via-orange-950/25 to-black/30 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <Lock className="mt-1 h-5 w-5 flex-shrink-0 text-yellow-400" />
            <div>
              <p className="text-sm font-bold text-yellow-300">Prize Locked Before Gameplay</p>
              <p className="text-xs leading-relaxed text-yellow-100/75">
                <strong>{selectedPrize.title}</strong> is the prize. Before the game starts, players should see how the cost changes when more or fewer people join.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4 lg:min-w-[460px]">
            <div className="rounded-xl border border-yellow-500/20 bg-black/35 p-3">
              <div className="text-lg font-black text-white">{formatMoney(activePlan.priceCents)}</div>
              <div className="text-[10px] uppercase tracking-wide text-yellow-200/60">Prize Cost</div>
            </div>
            <div className="rounded-xl border border-green-500/20 bg-black/35 p-3">
              <div className="text-lg font-black text-green-300">{formatMoney(activePlan.perPlayerCents)}</div>
              <div className="text-[10px] uppercase tracking-wide text-green-200/60">Each Player</div>
            </div>
            <div className="rounded-xl border border-pink-500/20 bg-black/35 p-3">
              <div className="text-lg font-black text-pink-300">{formatMoney(activePlan.donationCents)}</div>
              <div className="text-[10px] uppercase tracking-wide text-pink-200/60">Gift Fund</div>
            </div>
            <div className="rounded-xl border border-cyan-500/20 bg-black/35 p-3">
              <div className="text-lg font-black text-cyan-300">{activePlan.players}</div>
              <div className="text-[10px] uppercase tracking-wide text-cyan-200/60">Players</div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-purple-700/30 bg-black/30 p-4">
        <div className="mb-3 flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-green-300" />
          <h3 className="text-sm font-bold text-white">Cost Breakdown by Player Count</h3>
          <Badge className="border border-pink-500/30 bg-pink-600/15 text-pink-200">10% supports children</Badge>
        </div>
        <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-6">
          {plans.map((plan) => {
            const selected = plan.players === selectedPlayers;
            return (
              <button
                type="button"
                key={plan.players}
                onClick={() => onPlayersChange(plan.players)}
                className={`rounded-xl border p-3 text-left transition-all ${
                  selected
                    ? 'border-cyan-400 bg-cyan-600/20 shadow-lg shadow-cyan-950/40'
                    : 'border-purple-700/25 bg-purple-950/20 hover:border-purple-400/50 hover:bg-purple-900/30'
                }`}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1 text-xs font-semibold text-purple-100">
                    <Users className="h-3 w-3" /> {plan.players} players
                  </span>
                  {selected && <span className="text-xs text-cyan-200">Selected</span>}
                </div>
                <div className="text-xl font-black text-green-300">{formatMoney(plan.perPlayerCents)}</div>
                <div className="mt-1 text-[11px] leading-relaxed text-purple-200/65">
                  Prize {formatMoney(plan.priceCents)} + gift fund {formatMoney(plan.donationCents)} + buffer {formatMoney(plan.platformBufferCents)}
                </div>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-purple-300/70">
          Demo math: prize cost + 10% North Pole gift fund + 3% sandbox buffer, divided by selected players. Later this should use live tax, shipping, payment processing, and partner pricing.
        </p>
      </div>
    </div>
  );
}

export default function GameLobby({ selectedPrize, onStartMatch }) {
  const [selectedPlayers, setSelectedPlayers] = useState(selectedPrize.max_players || 10);
  const [agreementOpen, setAgreementOpen] = useState(false);
  const [pendingAdapter, setPendingAdapter] = useState(null);

  const activePlan = useMemo(
    () => calculateMatchPlan(selectedPrize.price_cents || 0, selectedPlayers),
    [selectedPrize.price_cents, selectedPlayers]
  );

  const handleStartMatch = (adapter) => {
    setPendingAdapter(adapter);
    setAgreementOpen(true);
  };

  const handleAgreementConfirm = () => {
    if (pendingAdapter) {
      onStartMatch({
        ...pendingAdapter,
        matchPlan: activePlan,
      });
      setAgreementOpen(false);
      setPendingAdapter(null);
    }
  };

  return (
    <>
      <SkillConfidenceAgreement
        open={agreementOpen}
        onConfirm={handleAgreementConfirm}
        onCancel={() => { setAgreementOpen(false); setPendingAdapter(null); }}
      />
      <div>
      <PrizeBreakdown
        selectedPrize={selectedPrize}
        selectedPlayers={selectedPlayers}
        onPlayersChange={setSelectedPlayers}
      />

      <div className="mb-6 flex items-center gap-3">
        <Gamepad2 className="h-6 w-6 text-purple-400" />
        <div>
          <h2 className="text-2xl font-bold text-white">Choose Your Skill Game</h2>
          <p className="text-sm text-purple-300/70">The prize and cost plan are locked before the game begins.</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {GAME_ADAPTERS.map((adapter) => (
          <Card
            key={adapter.id}
            className={`group cursor-pointer border transition-all ${
              adapter.featured
                ? 'border-cyan-400/50 bg-gradient-to-br from-cyan-950/35 via-purple-950/35 to-black/50 shadow-xl shadow-cyan-950/20'
                : 'border-purple-700/30 bg-purple-900/30 hover:border-purple-400/60'
            }`}
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="text-5xl">{adapter.icon}</div>
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{adapter.title}</h3>
                    {adapter.featured && <Badge className="border border-cyan-400/30 bg-cyan-500/20 text-cyan-200">Featured Demo</Badge>}
                    <Badge className="bg-purple-600/20 text-xs text-purple-300">{adapter.genre}</Badge>
                  </div>
                  <p className="mb-3 text-sm leading-relaxed text-purple-200/75">{adapter.description}</p>
                  <div className="mb-4 grid grid-cols-2 gap-2 text-xs text-purple-200/70 sm:grid-cols-4">
                    <span className="flex items-center gap-1 rounded-lg bg-black/25 px-2 py-2">
                      <Clock className="h-3 w-3" />~{adapter.avgDurationSeconds}s
                    </span>
                    <span className="flex items-center gap-1 rounded-lg bg-black/25 px-2 py-2">
                      <Trophy className="h-3 w-3" />Skill-based
                    </span>
                    <span className="flex items-center gap-1 rounded-lg bg-black/25 px-2 py-2">
                      <Users className="h-3 w-3" />{selectedPlayers} players
                    </span>
                    <span className="flex items-center gap-1 rounded-lg bg-black/25 px-2 py-2">
                      <Heart className="h-3 w-3" />{formatMoney(activePlan.donationCents)} fund
                    </span>
                  </div>
                  <Button
                    onClick={() => handleStartMatch(adapter)}
                    className={adapter.featured
                      ? 'w-full bg-gradient-to-r from-cyan-600 to-purple-600 font-bold text-white hover:from-cyan-500 hover:to-purple-500'
                      : 'w-full bg-purple-600 text-white hover:bg-purple-700'}
                  >
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Play for {selectedPrize.title.split(' ').slice(0, 3).join(' ')} · {formatMoney(activePlan.perPlayerCents)} each
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
    </>
  );
}