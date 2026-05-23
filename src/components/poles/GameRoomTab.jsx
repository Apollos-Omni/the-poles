import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Zap } from "lucide-react";
import { DEMO_MATCHES, DEMO_EVENTS, formatCountdown } from './demo-data';
import EventMatchCard from './EventMatchCard';

const FILTERS = ["All", "Open", "Live Now", "Today", "Needs Players"];

export default function GameRoomTab({ onCreateNew }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const allItems = [...DEMO_MATCHES, ...DEMO_EVENTS];

  const filtered = allItems.filter(item => {
    const matchSearch = !search || item.title.toLowerCase().includes(search.toLowerCase()) || item.prizeSnapshot?.title.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === 'Open') return item.status === 'open';
    if (filter === 'Live Now') return item.status === 'active';
    if (filter === 'Needs Players') return item.playersNeeded - item.playersJoined >= 2;
    if (filter === 'Today') {
      const today = new Date().toDateString();
      return new Date(item.startDate).toDateString() === today;
    }
    return true;
  });

  const liveItems = allItems.filter(i => i.status === 'active');
  const upcomingItems = allItems.filter(i => i.status === 'open').sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  return (
    <div className="space-y-6">
      {/* Live Now banner */}
      {liveItems.length > 0 && (
        <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 border border-red-700/30 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-300 font-bold text-sm">Live Now</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {liveItems.map(item => (
              <div key={item.id} className="bg-black/40 border border-red-700/30 rounded-xl p-3 flex items-center gap-3">
                <img src={item.prizeSnapshot?.image} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" onError={e => { e.target.src = 'https://images.unsplash.com/photo-1549396535-c11d5c55b9df?w=60'; }} />
                <div className="min-w-0">
                  <p className="text-white font-semibold text-xs truncate">{item.title}</p>
                  <p className="text-red-300 text-xs">🏆 {item.prizeSnapshot?.title}</p>
                  <p className="text-purple-400/60 text-xs">{item.playersJoined}/{item.playersNeeded} players</p>
                </div>
                <Button size="sm" className="bg-red-700 hover:bg-red-600 text-white text-xs flex-shrink-0">Join</Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search + filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/60" />
          <Input
            placeholder="Search matches, events, or prizes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-black/30 border-purple-700/30 focus:border-purple-500 text-white placeholder:text-purple-400/60"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${filter === f ? 'bg-purple-700 text-white' : 'bg-black/30 border border-purple-700/30 text-purple-300 hover:border-purple-500'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Create CTA */}
      <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-700/30 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-white font-bold text-sm">Ready to compete for a prize?</p>
          <p className="text-purple-300/70 text-xs">Select a prize first, then create a skill-based match or event.</p>
        </div>
        <Button className="bg-purple-700 hover:bg-purple-600 text-white text-xs flex-shrink-0" onClick={onCreateNew}>
          <Zap className="w-3 h-3 mr-1" /> Create
        </Button>
      </div>

      {/* Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-white">{filter === 'All' ? 'All Matches & Events' : filter}</h3>
          <span className="text-xs text-purple-400/60">{filtered.length} results</span>
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-purple-400/60 text-sm">No matches found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(item => <EventMatchCard key={item.id} item={item} />)}
          </div>
        )}
      </div>
    </div>
  );
}