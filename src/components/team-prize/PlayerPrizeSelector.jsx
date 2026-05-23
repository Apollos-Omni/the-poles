import React, { useState } from "react";
import { TEAM_PRIZES } from "./prizes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Gift } from "lucide-react";

function formatCents(c) { return "$" + (c / 100).toFixed(2); }

export default function PlayerPrizeSelector({ campaign, players, onAddPlayer, onUpdatePrize, isLoading }) {
  const [form, setForm] = useState({ player_name: "", jersey_number: "", position: "" });
  const [selectedPrize, setSelectedPrize] = useState(null);
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!form.player_name) return;
    await onAddPlayer({
      ...form,
      selected_prize_id: selectedPrize?.id || null,
      selected_prize_snapshot: selectedPrize || null,
    });
    setForm({ player_name: "", jersey_number: "", position: "" });
    setSelectedPrize(null);
    setAdding(false);
  };

  return (
    <div className="space-y-6">
      {/* Existing players */}
      {players.length > 0 && (
        <div className="space-y-2">
          {players.map(p => (
            <div key={p.id} className="flex items-center gap-3 bg-black/30 border border-purple-700/30 rounded-lg p-3">
              <div className="w-8 h-8 rounded-full bg-purple-700/40 flex items-center justify-center text-xs font-bold text-purple-200">
                {p.jersey_number || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{p.player_name}</p>
                <p className="text-xs text-purple-400/70">{p.position || "No position"}</p>
              </div>
              <div className="text-right">
                {p.selected_prize_snapshot ? (
                  <div className="flex items-center gap-2">
                    <img src={p.selected_prize_snapshot.image_url} alt="" className="w-8 h-8 rounded object-cover" />
                    <div className="text-right">
                      <p className="text-xs text-white leading-tight">{p.selected_prize_snapshot.title}</p>
                      <p className="text-xs text-green-400">{formatCents(p.selected_prize_snapshot.price_cents)}</p>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-purple-400/60 italic">No prize selected</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add player */}
      {players.length < (campaign?.num_players || 99) && (
        adding ? (
          <div className="bg-black/30 border border-purple-600/40 rounded-xl p-4 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-3 md:col-span-1 space-y-1">
                <Label className="text-purple-200 text-xs">Player Name *</Label>
                <Input value={form.player_name} onChange={e => setForm(f => ({...f, player_name: e.target.value}))}
                  placeholder="Full name" className="bg-black/40 border-purple-700/40 text-white text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-purple-200 text-xs">Jersey #</Label>
                <Input value={form.jersey_number} onChange={e => setForm(f => ({...f, jersey_number: e.target.value}))}
                  placeholder="#" className="bg-black/40 border-purple-700/40 text-white text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-purple-200 text-xs">Position</Label>
                <Input value={form.position} onChange={e => setForm(f => ({...f, position: e.target.value}))}
                  placeholder="e.g. Forward" className="bg-black/40 border-purple-700/40 text-white text-sm" />
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-purple-300 mb-2">Select Prize (optional now)</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                {TEAM_PRIZES.map(prize => (
                  <div key={prize.id} onClick={() => setSelectedPrize(p => p?.id === prize.id ? null : prize)}
                    className={`cursor-pointer rounded-lg border p-2 text-xs transition-all ${
                      selectedPrize?.id === prize.id
                        ? "border-purple-500 bg-purple-900/40 ring-1 ring-purple-500"
                        : "border-purple-700/30 bg-black/30 hover:border-purple-600/50"
                    }`}>
                    <img src={prize.image_url} alt={prize.title} className="w-full h-14 object-cover rounded mb-1" />
                    <p className="text-white font-medium leading-tight truncate">{prize.title}</p>
                    <p className="text-green-400">{formatCents(prize.price_cents)}</p>
                    {selectedPrize?.id === prize.id && <Check className="w-3 h-3 text-purple-400 mt-1" />}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" size="sm" onClick={() => setAdding(false)} className="text-purple-300">Cancel</Button>
              <Button type="button" size="sm" disabled={!form.player_name || isLoading}
                onClick={handleAdd} className="bg-purple-600 hover:bg-purple-700 text-white">
                Add Player
              </Button>
            </div>
          </div>
        ) : (
          <Button type="button" variant="outline" onClick={() => setAdding(true)}
            className="w-full border-dashed border-purple-700/50 text-purple-300 hover:bg-purple-900/20">
            <Gift className="w-4 h-4 mr-2" /> Add Player &amp; Prize
          </Button>
        )
      )}
    </div>
  );
}