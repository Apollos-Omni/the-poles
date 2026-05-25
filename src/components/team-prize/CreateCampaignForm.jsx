import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";
import { VideoBackgroundCard, mediaImages } from "@/components/media/MediaPrimitives";

const WINNING_CONDITIONS = [
  { value: "championship_winner",    label: "Championship Winner" },
  { value: "best_record",           label: "Best Record" },
  { value: "tournament_winner",     label: "Tournament Winner" },
  { value: "playoff_winner",        label: "Playoff Winner" },
  { value: "verified_standings",    label: "Verified Final Standings" },
  { value: "admin_approved_outcome",label: "Admin-Approved Outcome" },
];

const DEFAULT_FORM = {
  team_name: "", league_or_sport: "", season_start_date: "", season_end_date: "",
  num_players: "", winning_condition: "championship_winner", description: ""
};

export default function CreateCampaignForm({ onSubmit, onCancel, isLoading }) {
  const [form, setForm] = useState(DEFAULT_FORM);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, num_players: Number(form.num_players) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <VideoBackgroundCard
        title="Create a season people believe in"
        subtitle="Set the team, outcome, and prize path with a clear verified finish."
        image={mediaImages.leagueField}
        tone="cyan"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-purple-200">Team / Group Name *</Label>
          <Input required value={form.team_name} onChange={e => set("team_name", e.target.value)}
            placeholder="e.g. Thunder Hawks" className="bg-black/40 border-purple-700/40 text-white placeholder:text-purple-400/50" />
        </div>
        <div className="space-y-1">
          <Label className="text-purple-200">League or Sport *</Label>
          <Input required value={form.league_or_sport} onChange={e => set("league_or_sport", e.target.value)}
            placeholder="e.g. AYSO Soccer, Youth Basketball" className="bg-black/40 border-purple-700/40 text-white placeholder:text-purple-400/50" />
        </div>
        <div className="space-y-1">
          <Label className="text-purple-200">Season Start Date *</Label>
          <Input required type="date" value={form.season_start_date} onChange={e => set("season_start_date", e.target.value)}
            className="bg-black/40 border-purple-700/40 text-white" />
        </div>
        <div className="space-y-1">
          <Label className="text-purple-200">Season End Date *</Label>
          <Input required type="date" value={form.season_end_date} onChange={e => set("season_end_date", e.target.value)}
            className="bg-black/40 border-purple-700/40 text-white" />
        </div>
        <div className="space-y-1">
          <Label className="text-purple-200">Number of Players *</Label>
          <Input required type="number" min={1} max={100} value={form.num_players} onChange={e => set("num_players", e.target.value)}
            placeholder="e.g. 12" className="bg-black/40 border-purple-700/40 text-white" />
        </div>
        <div className="space-y-1">
          <Label className="text-purple-200">Winning Condition *</Label>
          <Select value={form.winning_condition} onValueChange={v => set("winning_condition", v)}>
            <SelectTrigger className="bg-black/40 border-purple-700/40 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-purple-700/40 text-white">
              {WINNING_CONDITIONS.map(c => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-purple-200">Description (optional)</Label>
        <Textarea value={form.description} onChange={e => set("description", e.target.value)}
          placeholder="Tell players and supporters about this campaign..." rows={3}
          className="bg-black/40 border-purple-700/40 text-white placeholder:text-purple-400/50" />
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-yellow-200/80 space-y-1">
          <p className="font-semibold text-yellow-300">Important Disclaimers</p>
          <p>This campaign is <strong>skill &amp; performance-based only</strong>. Prize fulfillment is contingent upon verified season outcomes. No random selection occurs.</p>
          <p>Campaigns are subject to local laws, league rules, parental consent requirements, and applicable charitable compliance regulations. Organizers are solely responsible for obtaining required permissions and consents.</p>
          <p>The Poles Fund contribution is a mission contribution and is non-refundable upon campaign activation.</p>
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel} className="text-purple-300">Cancel</Button>}
        <Button type="submit" disabled={isLoading}
          className="bg-purple-600 hover:bg-purple-700 text-white">
          {isLoading ? "Creating…" : "Create Campaign"}
        </Button>
      </div>
    </form>
  );
}
