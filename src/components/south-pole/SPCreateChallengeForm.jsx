import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, ChevronRight, ChevronLeft, Trophy, Heart } from "lucide-react";
import { CATEGORIES, PRIZE_TYPES, WINNING_CONDITIONS, VERIFICATION_METHODS, formatCents, calcChallengeFunding } from "./SPConstants";
import SportSelector from "@/components/sports/SportSelector";

const STEPS = ["Challenge Info", "Prize / Experience", "Rules & Verification", "Settings & Review"];

export default function SPCreateChallengeForm({ onSubmit, onCancel, isLoading }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: "", description: "", category: "custom",
    sport_id: "", sport_name: "", sport_category: "",
    prize_type: "custom_reward", prize_title: "", prize_description: "",
    prize_value_cents: 10000, num_participants_needed: 5,
    entry_amount_cents: 0, location: "", is_online: false,
    challenge_date: "", rules: "", winning_condition: "creator_decision",
    verification_method: "creator_verified", min_age: "", safety_requirements: "",
    is_public: true, skill_tags: "", sandbox_mode: true,
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const fin = calcChallengeFunding({
    prize_value_cents: form.prize_value_cents,
    num_participants_needed: form.num_participants_needed,
  });

  const canNext = () => {
    if (step === 0) return form.title.trim() && form.description.trim();
    if (step === 1) return form.prize_title.trim() && form.prize_value_cents > 0;
    if (step === 2) return form.winning_condition && form.verification_method;
    return true;
  };

  const handleSubmit = () => {
    const tags = form.skill_tags ? form.skill_tags.split(",").map(t => t.trim()).filter(Boolean) : [];
    onSubmit({
      ...form,
      category: form.sport_category || form.category,
      prize_value_cents: Number(form.prize_value_cents),
      num_participants_needed: Number(form.num_participants_needed),
      entry_amount_cents: fin.perParticipant,
      north_pole_donation_cents: fin.donation,
      total_goal_cents: fin.total,
      min_age: form.min_age ? Number(form.min_age) : null,
      skill_tags: tags,
    });
  };

  return (
    <div className="space-y-6">
      {/* Step indicators */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-1.5 text-xs font-medium ${i === step ? "text-cyan-300" : i < step ? "text-teal-400" : "text-gray-500"}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs border ${i === step ? "border-cyan-500 bg-cyan-900/40 text-cyan-300" : i < step ? "border-teal-500 bg-teal-900/40 text-teal-300" : "border-gray-600 text-gray-500"}`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className="hidden sm:inline">{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-px ${i < step ? "bg-teal-600" : "bg-gray-700"}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 0: Challenge Info */}
      {step === 0 && (
        <div className="space-y-4">
          <div>
            <Label className="text-purple-200 text-sm">Challenge Title *</Label>
            <Input value={form.title} onChange={e => set("title", e.target.value)}
              placeholder="e.g. Citywide 5K Sprint Challenge" className="bg-black/40 border-cyan-700/40 text-white mt-1" />
          </div>
          <div>
            <Label className="text-purple-200 text-sm">Description *</Label>
            <Textarea value={form.description} onChange={e => set("description", e.target.value)}
              placeholder="Describe what this challenge is about, who it's for, and what makes it exciting..." rows={4}
              className="bg-black/40 border-cyan-700/40 text-white mt-1" />
          </div>
          <div>
            <Label className="text-purple-200 text-sm">Category</Label>
            <Select value={form.category} onValueChange={v => set("category", v)}>
              <SelectTrigger className="bg-black/40 border-cyan-700/40 text-white mt-1"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value} className="text-white hover:bg-gray-800">{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <SportSelector
            value={form.sport_id}
            label="Sport / game type"
            onChange={(sport) => setForm(f => ({
              ...f,
              sport_id: sport.id,
              sport_name: sport.name,
              sport_category: sport.category,
              category: sport.category,
              skill_tags: f.skill_tags || sport.name.toLowerCase(),
            }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-purple-200 text-sm">Participants Needed</Label>
              <Input type="number" min={2} value={form.num_participants_needed} onChange={e => set("num_participants_needed", e.target.value)}
                className="bg-black/40 border-cyan-700/40 text-white mt-1" />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch checked={form.is_online} onCheckedChange={v => set("is_online", v)} />
              <Label className="text-purple-200 text-sm">Online Challenge</Label>
            </div>
          </div>
          {!form.is_online && (
            <div>
              <Label className="text-purple-200 text-sm">Location</Label>
              <Input value={form.location} onChange={e => set("location", e.target.value)}
                placeholder="City, venue, or address" className="bg-black/40 border-cyan-700/40 text-white mt-1" />
            </div>
          )}
          <div>
            <Label className="text-purple-200 text-sm">Challenge Date & Time</Label>
            <Input type="datetime-local" value={form.challenge_date} onChange={e => set("challenge_date", e.target.value)}
              className="bg-black/40 border-cyan-700/40 text-white mt-1" />
          </div>
          <div>
            <Label className="text-purple-200 text-sm">Skill Tags (comma-separated)</Label>
            <Input value={form.skill_tags} onChange={e => set("skill_tags", e.target.value)}
              placeholder="e.g. running, endurance, speed" className="bg-black/40 border-cyan-700/40 text-white mt-1" />
          </div>
        </div>
      )}

      {/* Step 1: Prize */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <Label className="text-purple-200 text-sm">Prize / Experience Type</Label>
            <Select value={form.prize_type} onValueChange={v => set("prize_type", v)}>
              <SelectTrigger className="bg-black/40 border-cyan-700/40 text-white mt-1"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                {PRIZE_TYPES.map(p => <SelectItem key={p.value} value={p.value} className="text-white hover:bg-gray-800">{p.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-purple-200 text-sm">Prize Title *</Label>
            <Input value={form.prize_title} onChange={e => set("prize_title", e.target.value)}
              placeholder="e.g. Weekend Getaway to Napa Valley" className="bg-black/40 border-cyan-700/40 text-white mt-1" />
          </div>
          <div>
            <Label className="text-purple-200 text-sm">Prize Description</Label>
            <Textarea value={form.prize_description} onChange={e => set("prize_description", e.target.value)}
              placeholder="Details about the prize or experience..." rows={3} className="bg-black/40 border-cyan-700/40 text-white mt-1" />
          </div>
          <div>
            <Label className="text-purple-200 text-sm">Estimated Prize Value (in dollars) *</Label>
            <Input type="number" min={1} value={form.prize_value_cents / 100}
              onChange={e => set("prize_value_cents", Math.round(parseFloat(e.target.value || 0) * 100))}
              placeholder="e.g. 1000" className="bg-black/40 border-cyan-700/40 text-white mt-1" />
          </div>

          {/* Funding breakdown */}
          <div className="bg-cyan-900/20 border border-cyan-700/30 rounded-xl p-4 space-y-2 text-sm">
            <p className="font-semibold text-cyan-300 mb-3">Funding Breakdown (auto-calculated)</p>
            <div className="flex justify-between text-purple-200/70"><span>Prize value</span><span>{formatCents(fin.prize)}</span></div>
            <div className="flex justify-between text-purple-200/70"><span>Platform fees (~5%)</span><span>{formatCents(fin.fees)}</span></div>
            <div className="flex justify-between text-pink-300"><span className="flex items-center gap-1"><Heart className="w-3 h-3" /> The Poles Fund</span><span>Funded</span></div>
            <div className="flex justify-between font-bold text-white border-t border-cyan-700/30 pt-2"><span>Total goal</span><span>{formatCents(fin.total)}</span></div>
            <div className="flex justify-between font-bold text-cyan-300"><span>Per participant ({form.num_participants_needed} people)</span><span>{formatCents(fin.perParticipant)}</span></div>
          </div>
        </div>
      )}

      {/* Step 2: Rules */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <Label className="text-purple-200 text-sm">Challenge Rules *</Label>
            <Textarea value={form.rules} onChange={e => set("rules", e.target.value)}
              placeholder="State the rules clearly. How does someone win? What's allowed? What isn't?" rows={5}
              className="bg-black/40 border-cyan-700/40 text-white mt-1" />
          </div>
          <div>
            <Label className="text-purple-200 text-sm">Winning Condition</Label>
            <Select value={form.winning_condition} onValueChange={v => set("winning_condition", v)}>
              <SelectTrigger className="bg-black/40 border-cyan-700/40 text-white mt-1"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                {WINNING_CONDITIONS.map(w => <SelectItem key={w.value} value={w.value} className="text-white hover:bg-gray-800">{w.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-purple-200 text-sm">Verification Method</Label>
            <Select value={form.verification_method} onValueChange={v => set("verification_method", v)}>
              <SelectTrigger className="bg-black/40 border-cyan-700/40 text-white mt-1"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                {VERIFICATION_METHODS.map(v => <SelectItem key={v.value} value={v.value} className="text-white hover:bg-gray-800">{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-purple-200 text-sm">Minimum Age (optional)</Label>
            <Input type="number" min={0} value={form.min_age} onChange={e => set("min_age", e.target.value)}
              placeholder="Leave blank if no age requirement" className="bg-black/40 border-cyan-700/40 text-white mt-1" />
          </div>
          <div>
            <Label className="text-purple-200 text-sm">Safety Requirements (optional)</Label>
            <Textarea value={form.safety_requirements} onChange={e => set("safety_requirements", e.target.value)}
              placeholder="Any gear, waivers, safety equipment, or special requirements..." rows={2}
              className="bg-black/40 border-cyan-700/40 text-white mt-1" />
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch checked={form.is_public} onCheckedChange={v => set("is_public", v)} />
            <div>
              <Label className="text-purple-200 text-sm font-medium">{form.is_public ? "Public Challenge" : "Private Challenge"}</Label>
              <p className="text-xs text-purple-400/60">{form.is_public ? "Anyone can discover and join." : "Only people with your link can join."}</p>
            </div>
          </div>

          <div className="bg-black/40 border border-cyan-700/30 rounded-xl p-4 space-y-2 text-sm">
            <p className="font-bold text-white text-base">{form.title}</p>
            <p className="text-cyan-300">🏆 {form.prize_title} · {formatCents(form.prize_value_cents)}</p>
            <p className="text-purple-300/70 line-clamp-2">{form.description}</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-purple-400/60 pt-2">
              <span>👥 {form.num_participants_needed} participants</span>
              <span>💰 {formatCents(fin.perParticipant)} / person</span>
              <span>📍 {form.is_online ? "Online" : (form.location || "TBD")}</span>
              <span>⭐ {form.category}</span>
              {form.sport_name && <span>Sport: {form.sport_name}</span>}
            </div>
          </div>

          <div className="bg-gray-900/60 border border-gray-700/40 rounded-xl p-3 text-xs text-gray-400 space-y-1">
            <p className="font-semibold text-gray-300">Platform Disclaimer</p>
            <p>This is a skill-based competitive challenge. Outcomes are based on verified performance. By creating this challenge you agree to comply with all local laws, venue rules, age restrictions, safety requirements, and mission contribution rules. Creator contributions may support The Poles Fund.</p>
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
            className="bg-cyan-700 hover:bg-cyan-600 text-white">
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isLoading}
            className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trophy className="w-4 h-4 mr-2" />}
            Launch Challenge
          </Button>
        )}
      </div>
    </div>
  );
}
