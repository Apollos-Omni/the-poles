import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Plus, CheckCircle, Clock } from "lucide-react";
import { MissionMediaCard, mediaImages } from "@/components/media/MediaPrimitives";

function formatCents(c) { return "$" + (c / 100).toFixed(2); }

const CONTRIB_TYPES = ["parent","player","sponsor","organizer","other"];

export default function ContributionLedger({ campaign, contributions, onAddContribution, isLoading }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ contributor_name: "", contributor_type: "parent", amount_dollars: "", note: "" });

  const totalFunded = contributions.filter(c => c.status === "confirmed").reduce((s, c) => s + c.amount_cents, 0);
  const required = campaign?.total_funding_required_cents || 0;
  const pct = required > 0 ? Math.min(100, Math.round((totalFunded / required) * 100)) : 0;

  const handleAdd = async () => {
    if (!form.contributor_name || !form.amount_dollars) return;
    await onAddContribution({
      campaign_id: campaign.id,
      contributor_name: form.contributor_name,
      contributor_type: form.contributor_type,
      amount_cents: Math.round(parseFloat(form.amount_dollars) * 100),
      note: form.note,
      status: "confirmed",
    });
    setForm({ contributor_name: "", contributor_type: "parent", amount_dollars: "", note: "" });
    setAdding(false);
  };

  return (
    <div className="space-y-4">
      <MissionMediaCard
        title="Creator contribution progress"
        description="Track confirmed support and keep the campaign path tied to The Poles Fund with clear, public-safe labels."
        image={mediaImages.fundGifts}
        statLabel="Mission"
        statValue="Funded"
      />

      {/* Progress bar */}
      <div className="bg-black/30 border border-purple-700/30 rounded-xl p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-purple-300">Funded</span>
          <span className="text-white font-bold">{formatCents(totalFunded)} / {formatCents(required)}</span>
        </div>
        <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-600 to-green-500 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }} />
        </div>
        <p className="text-right text-xs text-purple-400/70 mt-1">{pct}% funded</p>
      </div>

      {/* Contributions list */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {contributions.length === 0 && (
          <p className="text-center text-sm text-purple-400/50 py-4">No contributions yet.</p>
        )}
        {contributions.map(c => (
          <div key={c.id} className="flex items-center gap-3 bg-black/20 border border-purple-700/20 rounded-lg p-3 text-sm">
            {c.status === "confirmed"
              ? <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
              : <Clock className="w-4 h-4 text-yellow-400 flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{c.contributor_name}</p>
              <p className="text-purple-400/60 text-xs capitalize">{c.contributor_type} {c.note ? `· ${c.note}` : ""}</p>
            </div>
            <span className="text-green-400 font-bold">{formatCents(c.amount_cents)}</span>
          </div>
        ))}
      </div>

      {/* Add contribution */}
      {adding ? (
        <div className="bg-black/30 border border-purple-600/40 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
              <Label className="text-purple-200 text-xs">Contributor Display Name *</Label>
              <Input value={form.contributor_name} onChange={e => setForm(f => ({...f, contributor_name: e.target.value}))}
                placeholder="Supporter or sponsor" className="bg-black/40 border-purple-700/40 text-white text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-purple-200 text-xs">Type</Label>
              <Select value={form.contributor_type} onValueChange={v => setForm(f => ({...f, contributor_type: v}))}>
                <SelectTrigger className="bg-black/40 border-purple-700/40 text-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-purple-700/40 text-white">
                  {CONTRIB_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-purple-200 text-xs">Amount ($) *</Label>
              <Input type="number" min={1} step={0.01} value={form.amount_dollars}
                onChange={e => setForm(f => ({...f, amount_dollars: e.target.value}))}
                placeholder="0.00" className="bg-black/40 border-purple-700/40 text-white text-sm" />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-purple-200 text-xs">Note (optional)</Label>
              <Input value={form.note} onChange={e => setForm(f => ({...f, note: e.target.value}))}
                placeholder="e.g. In memory of..." className="bg-black/40 border-purple-700/40 text-white text-sm" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={() => setAdding(false)} className="text-purple-300">Cancel</Button>
            <Button type="button" size="sm" disabled={!form.contributor_name || !form.amount_dollars || isLoading}
              onClick={handleAdd} className="bg-green-700 hover:bg-green-600 text-white">
              <DollarSign className="w-4 h-4 mr-1" /> Record Contribution
            </Button>
          </div>
        </div>
      ) : (
        <Button type="button" variant="outline" onClick={() => setAdding(true)}
          className="w-full border-dashed border-purple-700/50 text-purple-300 hover:bg-purple-900/20">
          <Plus className="w-4 h-4 mr-2" /> Add Contribution
        </Button>
      )}
    </div>
  );
}
