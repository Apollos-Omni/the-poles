import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Trophy, Gamepad2, Calendar, CheckCircle, XCircle, PlusCircle, LogIn } from "lucide-react";

const DEMO_HISTORY = [
  { id: "h1", title: "SkyChess Blitz Championship", type: "match_joined", result: "win", prize: "Apple AirPods Pro 2nd Gen", prizeValue: 24900, game: "Chess", date: "2026-05-05", status: "completed" },
  { id: "h2", title: "Neon Arena Duel — Weekend Series", type: "match_joined", result: "loss", prize: "Nintendo Switch OLED", prizeValue: 34999, game: "Action Arena", date: "2026-04-28", status: "completed" },
  { id: "h3", title: "South Pole 5K Challenge", type: "event_joined", result: "win", prize: "Nike Air Jordan 1 Retro High", prizeValue: 17000, game: "5K Race", date: "2026-04-12", status: "completed" },
  { id: "h4", title: "Trivia Champion Finals", type: "match_joined", result: "loss", prize: "Sony PlayStation 5", prizeValue: 49999, game: "Trivia", date: "2026-03-30", status: "completed" },
  { id: "h5", title: "Citywide Basketball Shootout", type: "event_joined", result: null, prize: "NBA Game Tickets (2-pack)", prizeValue: 25000, game: "Basketball", date: "2026-06-22", status: "open" },
  { id: "h6", title: "Chess Blitz — Spring Open", type: "match_created", result: null, prize: "Amazon $500 Gift Card", prizeValue: 50000, game: "Chess", date: "2026-03-10", status: "cancelled" },
];

const TYPE_ICONS = {
  match_joined: <LogIn className="w-4 h-4 text-blue-400" />,
  match_created: <PlusCircle className="w-4 h-4 text-purple-400" />,
  event_joined: <Calendar className="w-4 h-4 text-cyan-400" />,
};

const TYPE_LABELS = {
  match_joined: "Joined Match",
  match_created: "Created Match",
  event_joined: "Joined Event",
};

export default function HistoryTab() {
  const [filter, setFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'win', label: '🏆 Wins' },
    { id: 'loss', label: '❌ Losses' },
    { id: 'match_created', label: 'Created' },
    { id: 'open', label: 'Active' },
  ];

  const filtered = DEMO_HISTORY.filter(h => {
    if (filter === 'all') return true;
    if (filter === 'win') return h.result === 'win';
    if (filter === 'loss') return h.result === 'loss';
    if (filter === 'match_created') return h.type === 'match_created';
    if (filter === 'open') return h.status === 'open';
    return true;
  });

  // Summary stats
  const wins = DEMO_HISTORY.filter(h => h.result === 'win').length;
  const losses = DEMO_HISTORY.filter(h => h.result === 'loss').length;
  const prizesWon = DEMO_HISTORY.filter(h => h.result === 'win');
  const totalPrizeValue = prizesWon.reduce((s, h) => s + h.prizeValue, 0);

  return (
    <div className="space-y-5">
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Wins", value: wins, icon: "🏆", color: "border-green-700/30" },
          { label: "Losses", value: losses, icon: "❌", color: "border-red-700/30" },
          { label: "Events Total", value: DEMO_HISTORY.length, icon: "🎮", color: "border-purple-700/30" },
          { label: "Prize Value Won", value: `$${(totalPrizeValue / 100).toFixed(0)}`, icon: "💰", color: "border-yellow-700/30" },
        ].map(s => (
          <div key={s.label} className={`bg-black/40 border ${s.color} rounded-2xl p-3 text-center`}>
            <p className="text-xl mb-0.5">{s.icon}</p>
            <p className="text-xl font-black text-white">{s.value}</p>
            <p className="text-xs text-purple-400/60">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${filter === f.id ? 'bg-purple-700 text-white' : 'bg-black/30 border border-purple-700/30 text-purple-300 hover:border-purple-500'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* History list */}
      <div className="space-y-2">
        {filtered.map(h => (
          <div key={h.id} className="bg-black/40 border border-purple-700/20 rounded-xl p-4 flex items-center gap-4">
            <div className="flex-shrink-0">{TYPE_ICONS[h.type]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold">{h.title}</p>
              <div className="flex flex-wrap gap-2 mt-1">
                <span className="text-xs text-purple-400/60">{TYPE_LABELS[h.type]}</span>
                <span className="text-xs text-purple-400/30">·</span>
                <span className="text-xs text-purple-400/60">{h.game}</span>
                <span className="text-xs text-purple-400/30">·</span>
                <span className="text-xs text-green-400/70">🏆 {h.prize}</span>
              </div>
              <p className="text-xs text-purple-400/40 mt-0.5">{h.date}</p>
            </div>
            <div className="flex-shrink-0 flex flex-col items-end gap-1">
              {h.result === 'win' && <Badge className="bg-green-900/40 text-green-300 border-green-700/30 text-xs">Win 🏆</Badge>}
              {h.result === 'loss' && <Badge className="bg-red-900/40 text-red-300 border-red-700/30 text-xs">Loss</Badge>}
              {!h.result && (
                <Badge className={`text-xs ${h.status === 'open' ? 'bg-blue-900/40 text-blue-300 border-blue-700/30' : 'bg-gray-900/40 text-gray-300 border-gray-700/30'}`}>
                  {h.status === 'open' ? 'Active' : 'Cancelled'}
                </Badge>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-10 text-purple-400/60 text-sm">No records match this filter.</div>
        )}
      </div>
    </div>
  );
}