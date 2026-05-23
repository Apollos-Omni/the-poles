import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Bookmark, Star, MapPin, Gamepad2, Trophy, Users } from "lucide-react";
import { DEMO_PRIZES, DEMO_GAMES, DEMO_MATCHES, DEMO_EVENTS } from '../poles/demo-data';

const FAV_PRIZES = DEMO_PRIZES.slice(0, 6);
const FAV_GAMES = DEMO_GAMES.slice(0, 5);
const FAV_EVENTS = DEMO_EVENTS.slice(0, 3);
const FAV_HOSTS = [
  { id: "h1", name: "Alex M.", wins: 12, avatar: "AM", rating: 4.9 },
  { id: "h2", name: "Jordan P.", wins: 8, avatar: "JP", rating: 4.7 },
  { id: "h3", name: "Sam K.", wins: 15, avatar: "SK", rating: 4.8 },
];
const SAVED_MATCHES = DEMO_MATCHES.slice(0, 3);

const SUB_TABS = [
  { id: 'prizes', label: '🏆 Prizes', icon: Trophy },
  { id: 'games', label: '🎮 Games', icon: Gamepad2 },
  { id: 'events', label: '⚡ Events', icon: Star },
  { id: 'hosts', label: '👤 Hosts', icon: Users },
  { id: 'matches', label: '🔖 Saved', icon: Bookmark },
];

export default function FavoritesTab() {
  const [sub, setSub] = useState('prizes');

  return (
    <div className="space-y-4">
      {/* Sub-tab chips */}
      <div className="flex gap-2 flex-wrap">
        {SUB_TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setSub(t.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${sub === t.id ? 'bg-purple-700 text-white' : 'bg-black/30 border border-purple-700/30 text-purple-300 hover:border-purple-500'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {sub === 'prizes' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {FAV_PRIZES.map(p => (
            <div key={p.id} className="bg-black/40 border border-purple-700/20 hover:border-pink-500/40 rounded-2xl overflow-hidden transition-all group">
              <div className="h-28 overflow-hidden relative">
                <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1549396535-c11d5c55b9df?w=200'; }} />
                <button className="absolute top-2 right-2 bg-black/60 rounded-full p-1">
                  <Heart className="w-3 h-3 text-pink-400 fill-pink-400" />
                </button>
              </div>
              <div className="p-2 space-y-1">
                <Badge className="bg-purple-900/40 text-purple-300 border-purple-700/30 text-xs">{p.category}</Badge>
                <p className="text-white text-xs font-semibold line-clamp-2">{p.title}</p>
                <p className="text-green-400 text-xs font-bold">${(p.estimatedValue / 100).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {sub === 'games' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FAV_GAMES.map(g => (
            <div key={g.id} className="bg-black/40 border border-purple-700/20 rounded-2xl p-3 flex items-center gap-3">
              <span className="text-3xl">{g.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">{g.title}</p>
                <Badge className="bg-purple-900/40 text-purple-300 border-purple-700/30 text-xs mt-1">{g.category}</Badge>
                <p className="text-purple-400/60 text-xs mt-1 line-clamp-1">{g.desc}</p>
              </div>
              <Heart className="w-4 h-4 text-pink-400 fill-pink-400 flex-shrink-0" />
            </div>
          ))}
        </div>
      )}

      {sub === 'events' && (
        <div className="space-y-3">
          {FAV_EVENTS.map(e => (
            <div key={e.id} className="bg-black/40 border border-purple-700/20 rounded-2xl p-4 flex items-center gap-4">
              <img src={e.prizeSnapshot?.image} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                onError={ev => { ev.target.src = 'https://images.unsplash.com/photo-1549396535-c11d5c55b9df?w=60'; }} />
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">{e.title}</p>
                <p className="text-purple-400/60 text-xs">{e.location} · {e.entryContribution}</p>
                <p className="text-green-400 text-xs">{e.prizeSnapshot?.title}</p>
              </div>
              <Bookmark className="w-4 h-4 text-purple-400 flex-shrink-0" />
            </div>
          ))}
        </div>
      )}

      {sub === 'hosts' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FAV_HOSTS.map(h => (
            <div key={h.id} className="bg-black/40 border border-purple-700/20 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {h.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">{h.name}</p>
                <div className="flex items-center gap-2 text-xs text-purple-400/60">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  {h.rating} · {h.wins} wins hosted
                </div>
              </div>
              <Heart className="w-4 h-4 text-pink-400 fill-pink-400 flex-shrink-0" />
            </div>
          ))}
        </div>
      )}

      {sub === 'matches' && (
        <div className="space-y-3">
          {SAVED_MATCHES.map(m => (
            <div key={m.id} className="bg-black/40 border border-purple-700/20 rounded-2xl p-4 flex items-center gap-4">
              <img src={m.prizeSnapshot?.image} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                onError={ev => { ev.target.src = 'https://images.unsplash.com/photo-1549396535-c11d5c55b9df?w=60'; }} />
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">{m.title}</p>
                <p className="text-purple-400/60 text-xs">{m.gameType} · {m.entryContribution}</p>
                <p className="text-green-400 text-xs">{m.prizeSnapshot?.title}</p>
              </div>
              <Badge className="bg-green-900/40 text-green-300 border-green-700/30 text-xs flex-shrink-0">{m.status}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}