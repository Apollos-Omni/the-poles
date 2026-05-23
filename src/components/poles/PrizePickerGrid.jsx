import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { DEMO_PRIZES, PRIZE_CATEGORIES } from './demo-data';

export default function PrizePickerGrid({ onSelectPrize, selectedPrizeId }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(null);

  const filtered = DEMO_PRIZES.filter(p => {
    const q = query.toLowerCase();
    const matchesQuery = !q
      || p.title.toLowerCase().includes(q)
      || p.category.toLowerCase().includes(q)
      || (p.description || '').toLowerCase().includes(q)
      || (p.provider || '').toLowerCase().includes(q);
    const matchesCat = !category || p.category === category;
    return matchesQuery && matchesCat;
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/60" />
          <Input
            placeholder="Search prizes — vacations, concerts, cruises, products..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-9 bg-black/30 border-purple-700/30 focus:border-purple-500 text-white placeholder:text-purple-400/60"
          />
        </div>
        {(query || category) && (
          <Button variant="outline" className="border-purple-700/40 text-purple-300 text-xs"
            onClick={() => { setQuery(''); setCategory(null); }}>
            Clear
          </Button>
        )}
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategory(null)}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${!category ? 'bg-purple-700 text-white' : 'bg-black/30 border border-purple-700/30 text-purple-300 hover:border-purple-500'}`}
        >
          All Prizes
        </button>
        {PRIZE_CATEGORIES.map(c => (
          <button
            key={c.label}
            onClick={() => setCategory(c.label === category ? null : c.label)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${category === c.label ? 'bg-purple-700 text-white' : 'bg-black/30 border border-purple-700/30 text-purple-300 hover:border-purple-500'}`}
          >
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(prize => {
          const isSelected = selectedPrizeId === prize.id;
          return (
            <div
              key={prize.id}
              className={`bg-black/40 border rounded-2xl overflow-hidden transition-all cursor-pointer ${isSelected ? 'border-purple-400 ring-2 ring-purple-500/40' : 'border-purple-700/20 hover:border-purple-500/50'}`}
              onClick={() => onSelectPrize && onSelectPrize(prize)}
            >
              <div className="h-36 overflow-hidden">
                <img src={prize.image} alt={prize.title} className="w-full h-full object-cover" onError={e => { e.target.src = 'https://images.unsplash.com/photo-1549396535-c11d5c55b9df?w=400'; }} />
              </div>
              <div className="p-3 space-y-2">
                <Badge className="bg-purple-900/40 text-purple-300 border-purple-700/30 text-xs">{prize.category}</Badge>
                <h4 className="font-semibold text-white text-sm leading-tight">{prize.title}</h4>
                <p className="text-purple-300 font-bold text-sm">${(prize.estimatedValue / 100).toFixed(2)}</p>
                <Button
                  size="sm"
                  className={`w-full text-xs ${isSelected ? 'bg-green-700 hover:bg-green-600' : 'bg-purple-700 hover:bg-purple-600'} text-white`}
                  onClick={e => { e.stopPropagation(); onSelectPrize && onSelectPrize(prize); }}
                >
                  {isSelected ? '✓ Selected' : '🏆 Select This Prize'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-purple-400/60 text-sm">
          No prizes found for "{query}". Try a different search.
        </div>
      )}
    </div>
  );
}