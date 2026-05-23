import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Heart, Zap, Package } from "lucide-react";
import { DEMO_PRIZES } from '../poles/demo-data';

const PRIZES_WON = DEMO_PRIZES.filter(p => ["prize-2", "prize-6"].includes(p.id));
const PRIZES_PLAYING = DEMO_PRIZES.filter(p => ["prize-9", "prize-4"].includes(p.id));
const PRIZES_WISHLIST = DEMO_PRIZES.filter(p => ["prize-3", "prize-7", "prize-12"].includes(p.id));

const SUB_TABS = [
  { id: 'won', label: '🏆 Won', count: PRIZES_WON.length },
  { id: 'playing', label: '⚡ Playing For', count: PRIZES_PLAYING.length },
  { id: 'wishlist', label: '❤️ Wishlist', count: PRIZES_WISHLIST.length },
];

function PrizeCard({ prize, accent, badge }) {
  return (
    <div className={`bg-black/40 border ${accent} rounded-2xl overflow-hidden transition-all hover:scale-[1.01]`}>
      <div className="h-36 overflow-hidden relative">
        <img
          src={prize.image}
          alt={prize.title}
          className="w-full h-full object-cover"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1549396535-c11d5c55b9df?w=200'; }}
        />
        <div className="absolute top-2 left-2">
          <Badge className={`${badge} text-xs`}>{prize.category}</Badge>
        </div>
      </div>
      <div className="p-3 space-y-1">
        <p className="text-white text-sm font-semibold leading-tight">{prize.title}</p>
        <p className="text-green-400 font-bold text-sm">${(prize.estimatedValue / 100).toFixed(2)}</p>
      </div>
    </div>
  );
}

export default function PrizesTab() {
  const [sub, setSub] = useState('won');

  const prizeMap = {
    won: { prizes: PRIZES_WON, accent: 'border-yellow-700/40', badge: 'bg-yellow-900/60 text-yellow-300 border-yellow-700/30', emptyMsg: "No prizes won yet — start competing!" },
    playing: { prizes: PRIZES_PLAYING, accent: 'border-blue-700/40', badge: 'bg-blue-900/60 text-blue-300 border-blue-700/30', emptyMsg: "Not currently competing for any prizes." },
    wishlist: { prizes: PRIZES_WISHLIST, accent: 'border-pink-700/40', badge: 'bg-pink-900/60 text-pink-300 border-pink-700/30', emptyMsg: "Your wishlist is empty. Browse prizes to add some!" },
  };

  const current = prizeMap[sub];

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-xl p-3 text-center">
          <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
          <p className="text-white font-black">{PRIZES_WON.length}</p>
          <p className="text-xs text-yellow-300/60">Won</p>
        </div>
        <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-3 text-center">
          <Zap className="w-5 h-5 text-blue-400 mx-auto mb-1" />
          <p className="text-white font-black">{PRIZES_PLAYING.length}</p>
          <p className="text-xs text-blue-300/60">Playing For</p>
        </div>
        <div className="bg-pink-900/20 border border-pink-700/30 rounded-xl p-3 text-center">
          <Heart className="w-5 h-5 text-pink-400 mx-auto mb-1" />
          <p className="text-white font-black">{PRIZES_WISHLIST.length}</p>
          <p className="text-xs text-pink-300/60">Wishlist</p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2">
        {SUB_TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setSub(t.id)}
            className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${sub === t.id ? 'bg-purple-700 text-white' : 'bg-black/30 border border-purple-700/30 text-purple-300 hover:border-purple-500'}`}
          >
            {t.label}
            {t.count > 0 && <span className="ml-1 opacity-70">({t.count})</span>}
          </button>
        ))}
      </div>

      {/* Prize grid */}
      {current.prizes.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {current.prizes.map(p => (
            <PrizeCard key={p.id} prize={p} accent={current.accent} badge={current.badge} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-purple-400/60">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">{current.emptyMsg}</p>
        </div>
      )}
    </div>
  );
}