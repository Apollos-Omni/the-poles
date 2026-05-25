import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, ChevronRight, ChevronLeft, Trophy, Heart, Layers } from "lucide-react";
import { WINNING_CONDITIONS, VERIFICATION_METHODS, formatCents } from "./SPConstants";
import SPSportStatTemplateSelector from "./SPSportStatTemplateSelector";
import { fieldsForStatsMode, getFormatTemplate } from "@/lib/south-pole/statTemplates";
import SportSelector from "@/components/sports/SportSelector";

const STEPS = ["Event Info", "Format & Schedule", "Prize & Funding", "Rules & Verification", "Review & Launch"];

const SPORT_TYPES = [
  { value: "basketball", label: "🏀 Basketball", emoji: "🏀" },
  { value: "football", label: "🏈 Football", emoji: "🏈" },
  { value: "soccer", label: "⚽ Soccer", emoji: "⚽" },
  { value: "baseball", label: "⚾ Baseball", emoji: "⚾" },
  { value: "volleyball", label: "🏐 Volleyball", emoji: "🏐" },
  { value: "tennis", label: "🎾 Tennis", emoji: "🎾" },
  { value: "golf", label: "⛳ Golf", emoji: "⛳" },
  { value: "bowling", label: "🎳 Bowling", emoji: "🎳" },
  { value: "pool_billiards", label: "🎱 Pool / Billiards", emoji: "🎱" },
  { value: "chess", label: "♟️ Chess", emoji: "♟️" },
  { value: "darts", label: "🎯 Darts", emoji: "🎯" },
  { value: "fitness", label: "💪 Fitness Challenge", emoji: "💪" },
  { value: "running", label: "🏃 Running / 5K", emoji: "🏃" },
  { value: "cycling", label: "🚴 Cycling", emoji: "🚴" },
  { value: "swimming", label: "🏊 Swimming", emoji: "🏊" },
  { value: "axe_throwing", label: "🪓 Axe Throwing", emoji: "🪓" },
  { value: "escape_room", label: "🔐 Escape Room", emoji: "🔐" },
  { value: "trivia", label: "🧠 Trivia", emoji: "🧠" },
  { value: "cooking", label: "🍳 Cooking Battle", emoji: "🍳" },
  { value: "dance", label: "💃 Dance Battle", emoji: "💃" },
  { value: "video_game", label: "🎮 Video Game", emoji: "🎮" },
  { value: "fishing", label: "🎣 Fishing", emoji: "🎣" },
  { value: "paintball", label: "🎯 Paintball", emoji: "🎯" },
  { value: "go_kart", label: "🏎️ Go-Kart", emoji: "🏎️" },
  { value: "custom", label: "✨ Custom", emoji: "🏆" },
];

const FORMATS = [
  { value: "single_event", label: "Single Event — one day, one winner" },
  { value: "tournament", label: "Tournament — elimination brackets" },
  { value: "round_robin", label: "Round Robin — everyone plays everyone" },
  { value: "league_season", label: "League Season — multi-week standings" },
  { value: "playoff", label: "Playoffs — top teams advance" },
];

const GROUPS = [
  "Basketball", "Football", "Soccer", "Pool / Billiards", "Bowling", "Video Games",
  "Chess", "Fitness Challenges", "Local SF Events", "Youth Sports", "Adult Leagues",
  "Running / 5K", "Trivia Night", "Cooking", "Dance", "Outdoor Adventures", "Fishing", "General",
];

export default function SPCreateLeagueForm({ onSubmit, onCancel, isLoading }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: "", description: "", sport_type: "basketball", sport_emoji: "🏀",
    sport_id: "basketball", sport_name: "Basketball", sport_category: "Team Sports",
    format: "tournament", is_online: false, location: "",
    game_format_id: "basketball_5v5", stat_template_id: "basketball_5v5_player", stats_mode: "basic",
    start_date: "", end_date: "",
    max_participants: 8, team_size: 1, is_teams: false,
    prize_title: "", prize_description: "", prize_value_cents: 50000,
    rules: "", winning_condition: "highest_score", verification_method: "referee_judge",
    min_age: "", safety_requirements: "", waiver_required: false,
    is_public: true, group_tags: [], host_name: "",
    organizer_role: "league_organizer",
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSportSelect = (sport) => {
    const sportId = sport.slug || sport.id;
    const formatTemplate = getFormatTemplate(sportId);
    setForm(f => ({
      ...f,
      sport_id: sport.id,
      sport_type: sportId,
      sport_name: sport.name,
      sport_category: sport.category,
      sport_emoji: sportId === "basketball" ? "🏀" : "🏆",
      game_format_id: formatTemplate?.id || "basic_custom_format",
      stat_template_id: formatTemplate?.templateId || "basic_custom_stats",
      custom_rules: sport.proposedRules || null,
      custom_stat_fields: sport.proposedStatFields || [],
    }));
  };

  const setStatTemplate = (patch) => {
    setForm(f => {
      const sport = SPORT_TYPES.find(x => x.value === patch.sport_type);
      const next = { ...f, ...patch, sport_emoji: sport?.emoji || f.sport_emoji };
      const formatTemplate = getFormatTemplate(next.sport_type, next.game_format_id);
      const statFields = fieldsForStatsMode(formatTemplate?.fields || [], next.stats_mode);
      return {
        ...next,
        stat_template_id: next.stat_template_id || formatTemplate?.templateId || null,
        stat_fields: statFields,
        verification_levels: [
          "self_reported",
          "opponent_confirmed",
          "scorekeeper_verified",
          "organizer_verified",
          "video_reviewed",
          "admin_verified",
          "system_verified",
        ],
      };
    });
  };

  const toggleGroup = (g) => {
    setForm(f => ({
      ...f,
      group_tags: f.group_tags.includes(g) ? f.group_tags.filter(x => x !== g) : [...f.group_tags, g],
    }));
  };

  const prizeVal = form.prize_value_cents;
  const donation = Math.ceil(prizeVal * 0.10);
  const fees = Math.ceil(prizeVal * 0.05);
  const total = prizeVal + donation + fees;
  const perParticipant = form.max_participants > 0 ? Math.ceil(total / form.max_participants) : 0;

  const canNext = () => {
    if (step === 0) return form.title.trim() && form.sport_type && form.host_name.trim();
    if (step === 1) return form.format && form.start_date;
    if (step === 2) return form.prize_title.trim() && form.prize_value_cents > 0;
    if (step === 3) return form.rules.trim() && form.winning_condition;
    return true;
  };

  const handleSubmit = () => {
    const formatTemplate = getFormatTemplate(form.sport_type, form.game_format_id);
    const statFields = formatTemplate
      ? fieldsForStatsMode(formatTemplate.fields || [], form.stats_mode)
      : (form.custom_stat_fields || []);
    onSubmit({
      ...form,
      sport_id: form.sport_id || form.sport_type,
      game_format_label: formatTemplate?.label || form.format,
      stat_template_id: form.stat_template_id || formatTemplate?.templateId || null,
      stat_fields: statFields,
      stat_field_keys: statFields.map((field) => field.key),
      supports_performance_history: true,
      supports_skill_rating: true,
      matchmaking_uses_verified_history: true,
      prize_value_cents: Number(form.prize_value_cents),
      max_participants: Number(form.max_participants),
      team_size: Number(form.team_size),
      entry_amount_cents: perParticipant,
      north_pole_donation_cents: donation,
      total_goal_cents: total,
      min_age: form.min_age ? Number(form.min_age) : null,
      status: "open",
    });
  };

  return (
    <div className="space-y-6">
      {/* Step indicators */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-1.5 text-xs font-medium shrink-0 ${i === step ? "text-purple-300" : i < step ? "text-teal-400" : "text-gray-500"}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs border ${i === step ? "border-purple-500 bg-purple-900/40" : i < step ? "border-teal-500 bg-teal-900/40" : "border-gray-600"}`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className="hidden sm:inline">{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-px min-w-4 ${i < step ? "bg-teal-600" : "bg-gray-700"}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 0 — Event Info */}
      {step === 0 && (
        <div className="space-y-4">
          <div>
            <Label className="text-purple-200 text-sm">Event / League Title *</Label>
            <Input value={form.title} onChange={e => set("title", e.target.value)}
              placeholder="e.g. Saturday Basketball Shootout, SF Pool League Season 1" className="bg-black/40 border-purple-700/40 text-white mt-1" />
          </div>
          <div>
            <Label className="text-purple-200 text-sm">Organizer / Host Name *</Label>
            <Input value={form.host_name} onChange={e => set("host_name", e.target.value)}
              placeholder="Your name, organization, or team name" className="bg-black/40 border-purple-700/40 text-white mt-1" />
          </div>
          <div>
            <Label className="text-purple-200 text-sm">Description</Label>
            <Textarea value={form.description} onChange={e => set("description", e.target.value)}
              placeholder="What is this event? Who is it for? What makes it special?" rows={3}
              className="bg-black/40 border-purple-700/40 text-white mt-1" />
          </div>
          <SportSelector value={form.sport_id || form.sport_type} onChange={handleSportSelect} />
          {form.sport_type === "basketball" ? (
            <SPSportStatTemplateSelector value={form} onChange={setStatTemplate} />
          ) : form.custom_stat_fields?.length || form.custom_rules ? (
            <div className="rounded-xl border border-cyan-700/25 bg-cyan-950/15 p-4 text-sm text-cyan-100/80">
              Custom rules and stat fields loaded for {form.sport_name}.
            </div>
          ) : (
            <div className="rounded-xl border border-purple-700/25 bg-purple-950/20 p-4 text-sm text-purple-100/75">
              Basic stat template available. Advanced template coming soon.
            </div>
          )}
          <div className="hidden">
            <Label className="text-purple-200 text-sm">Sport / Game Type *</Label>
            <Select value={form.sport_type} onValueChange={v => {
              const s = SPORT_TYPES.find(x => x.value === v);
              set("sport_type", v);
              set("sport_emoji", s?.emoji || "🏆");
            }}>
              <SelectTrigger className="bg-black/40 border-purple-700/40 text-white mt-1"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                {SPORT_TYPES.map(s => <SelectItem key={s.value} value={s.value} className="text-white hover:bg-gray-800">{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-purple-200 text-sm">Max Participants / Teams</Label>
              <Input type="number" min={2} value={form.max_participants} onChange={e => set("max_participants", e.target.value)}
                className="bg-black/40 border-purple-700/40 text-white mt-1" />
            </div>
            <div className="flex items-center gap-3 pt-5">
              <Switch checked={form.is_teams} onCheckedChange={v => set("is_teams", v)} />
              <Label className="text-purple-200 text-sm">Team Event</Label>
            </div>
          </div>
          {form.is_teams && (
            <div>
              <Label className="text-purple-200 text-sm">Players per Team</Label>
              <Input type="number" min={2} value={form.team_size} onChange={e => set("team_size", e.target.value)}
                className="bg-black/40 border-purple-700/40 text-white mt-1" />
            </div>
          )}
          <div className="flex items-center gap-3">
            <Switch checked={form.is_online} onCheckedChange={v => set("is_online", v)} />
            <Label className="text-purple-200 text-sm">Online Event</Label>
          </div>
          {!form.is_online && (
            <div>
              <Label className="text-purple-200 text-sm">Location / Venue</Label>
              <Input value={form.location} onChange={e => set("location", e.target.value)}
                placeholder="Venue name, address, city" className="bg-black/40 border-purple-700/40 text-white mt-1" />
            </div>
          )}
          <div>
            <Label className="text-purple-200 text-sm mb-2 block">Post to Groups</Label>
            <div className="flex flex-wrap gap-2">
              {GROUPS.map(g => (
                <button key={g} type="button" onClick={() => toggleGroup(g)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${form.group_tags.includes(g) ? "bg-purple-700 border-purple-500 text-white" : "bg-black/30 border-purple-700/30 text-purple-400 hover:border-purple-500"}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 1 — Format & Schedule */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <Label className="text-purple-200 text-sm">Competition Format *</Label>
            <div className="grid gap-2 mt-2">
              {FORMATS.map(f => (
                <button key={f.value} type="button" onClick={() => set("format", f.value)}
                  className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${form.format === f.value ? "bg-purple-900/40 border-purple-500 text-white" : "bg-black/30 border-purple-700/30 text-purple-300 hover:border-purple-500"}`}>
                  <span className="font-semibold">{f.label.split(" — ")[0]}</span>
                  <span className="text-xs text-purple-400/60 ml-2">— {f.label.split(" — ")[1]}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-purple-200 text-sm">Start Date *</Label>
              <Input type="datetime-local" value={form.start_date} onChange={e => set("start_date", e.target.value)}
                className="bg-black/40 border-purple-700/40 text-white mt-1" />
            </div>
            <div>
              <Label className="text-purple-200 text-sm">End Date (optional)</Label>
              <Input type="datetime-local" value={form.end_date} onChange={e => set("end_date", e.target.value)}
                className="bg-black/40 border-purple-700/40 text-white mt-1" />
            </div>
          </div>

          <div className="bg-purple-900/20 border border-purple-700/20 rounded-xl p-4 text-xs text-purple-300/70 space-y-1">
            <p className="font-semibold text-purple-200">Format Guide</p>
            <p>• <strong>Tournament:</strong> Bracket-style elimination. Good for 8, 16, or 32 players.</p>
            <p>• <strong>Round Robin:</strong> Each player/team faces every other. Best for small groups.</p>
            <p>• <strong>League Season:</strong> Multi-week standings. Great for recurring leagues.</p>
            <p>• <strong>Single Event:</strong> One competition, one day, one winner.</p>
          </div>
        </div>
      )}

      {/* Step 2 — Prize & Funding */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <Label className="text-purple-200 text-sm">Prize / Experience Title *</Label>
            <Input value={form.prize_title} onChange={e => set("prize_title", e.target.value)}
              placeholder="e.g. $500 Cash, Weekend Getaway, Trophy + Gift Cards" className="bg-black/40 border-purple-700/40 text-white mt-1" />
          </div>
          <div>
            <Label className="text-purple-200 text-sm">Prize Description</Label>
            <Textarea value={form.prize_description} onChange={e => set("prize_description", e.target.value)}
              placeholder="Details about the prize..." rows={2} className="bg-black/40 border-purple-700/40 text-white mt-1" />
          </div>
          <div>
            <Label className="text-purple-200 text-sm">Estimated Prize Value (in dollars) *</Label>
            <Input type="number" min={1} value={form.prize_value_cents / 100}
              onChange={e => set("prize_value_cents", Math.round(parseFloat(e.target.value || 0) * 100))}
              className="bg-black/40 border-purple-700/40 text-white mt-1" />
          </div>
          <div className="bg-purple-900/20 border border-purple-700/30 rounded-xl p-4 space-y-2 text-sm">
            <p className="font-semibold text-purple-300 mb-3">Funding Breakdown</p>
            <div className="flex justify-between text-purple-200/70"><span>Prize value</span><span>{formatCents(prizeVal)}</span></div>
            <div className="flex justify-between text-purple-200/70"><span>Platform fees (~5%)</span><span>{formatCents(fees)}</span></div>
            <div className="flex justify-between text-pink-300">
              <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> The Poles Fund</span>
              <span>{formatCents(donation)}</span>
            </div>
            <div className="flex justify-between font-bold text-white border-t border-purple-700/30 pt-2"><span>Total goal</span><span>{formatCents(total)}</span></div>
            <div className="flex justify-between font-bold text-purple-300">
              <span>Per participant ({form.max_participants})</span>
              <span>{formatCents(perParticipant)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Step 3 — Rules & Verification */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <Label className="text-purple-200 text-sm">Event Rules *</Label>
            <Textarea value={form.rules} onChange={e => set("rules", e.target.value)}
              placeholder="State the rules clearly. How does someone win? What's allowed? What isn't? How are disputes handled?" rows={6}
              className="bg-black/40 border-purple-700/40 text-white mt-1" />
          </div>
          <div>
            <Label className="text-purple-200 text-sm">Winning Condition</Label>
            <Select value={form.winning_condition} onValueChange={v => set("winning_condition", v)}>
              <SelectTrigger className="bg-black/40 border-purple-700/40 text-white mt-1"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                {WINNING_CONDITIONS.map(w => <SelectItem key={w.value} value={w.value} className="text-white hover:bg-gray-800">{w.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-purple-200 text-sm">Verification Method</Label>
            <Select value={form.verification_method} onValueChange={v => set("verification_method", v)}>
              <SelectTrigger className="bg-black/40 border-purple-700/40 text-white mt-1"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                {VERIFICATION_METHODS.map(v => <SelectItem key={v.value} value={v.value} className="text-white hover:bg-gray-800">{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-purple-200 text-sm">Minimum Age</Label>
              <Input type="number" min={0} value={form.min_age} onChange={e => set("min_age", e.target.value)}
                placeholder="No requirement" className="bg-black/40 border-purple-700/40 text-white mt-1" />
            </div>
            <div className="flex items-center gap-3 pt-5">
              <Switch checked={form.waiver_required} onCheckedChange={v => set("waiver_required", v)} />
              <Label className="text-purple-200 text-sm">Waiver Required</Label>
            </div>
          </div>
          <div>
            <Label className="text-purple-200 text-sm">Safety Requirements</Label>
            <Textarea value={form.safety_requirements} onChange={e => set("safety_requirements", e.target.value)}
              placeholder="Required gear, safety rules, venue requirements..." rows={2}
              className="bg-black/40 border-purple-700/40 text-white mt-1" />
          </div>
        </div>
      )}

      {/* Step 4 — Review */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch checked={form.is_public} onCheckedChange={v => set("is_public", v)} />
            <div>
              <Label className="text-purple-200 text-sm font-medium">{form.is_public ? "Public — visible to all" : "Private — invite only"}</Label>
            </div>
          </div>
          <div className="bg-black/40 border border-purple-700/30 rounded-xl p-4 space-y-2 text-sm">
            <p className="text-xl">{form.sport_emoji} <span className="font-bold text-white ml-2">{form.title}</span></p>
            <p className="text-purple-300">🏆 {form.prize_title} · {formatCents(form.prize_value_cents)}</p>
            <p className="text-purple-200/60 text-xs line-clamp-2">{form.description}</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-purple-400/60 pt-2">
              <span>👥 {form.max_participants} {form.is_teams ? "teams" : "players"}</span>
              <span>💰 {formatCents(perParticipant)}/person</span>
              <span>📍 {form.is_online ? "Online" : (form.location || "TBD")}</span>
              <span>📋 {form.format?.replace(/_/g, " ")}</span>
              <span>Stats: {form.game_format_id?.replace(/_/g, " ")}</span>
              <span>📅 {form.start_date ? new Date(form.start_date).toLocaleDateString() : "TBD"}</span>
              <span>❤️ {formatCents(donation)} → NP Fund</span>
            </div>
            {form.group_tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {form.group_tags.map(g => <span key={g} className="text-xs bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded-full border border-purple-700/30">{g}</span>)}
              </div>
            )}
          </div>
          <div className="bg-gray-900/60 border border-gray-700/40 rounded-xl p-3 text-xs text-gray-400 space-y-1">
            <p className="font-semibold text-gray-300">Platform Disclaimer</p>
            <p>This is a skill-based competitive event. Outcomes are based on verified performance. Organizer agrees to comply with all local laws, venue rules, age restrictions, safety requirements, and mission contribution rules. Creator contributions may support The Poles Fund.</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <Button variant="ghost" onClick={step === 0 ? onCancel : () => setStep(s => s - 1)}
          className="text-purple-300 hover:text-white">
          {step === 0 ? "Cancel" : <><ChevronLeft className="w-4 h-4 mr-1" /> Back</>}
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep(s => s + 1)} disabled={!canNext()}
            className="bg-purple-700 hover:bg-purple-600 text-white">
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isLoading}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Layers className="w-4 h-4 mr-2" />}
            Launch Event / League
          </Button>
        )}
      </div>
    </div>
  );
}
