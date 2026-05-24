import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { base44 } from '@/api/base44Client';
import SportRulesEditor from '@/components/sports/SportRulesEditor';
import StatTemplateBuilder from '@/components/sports/StatTemplateBuilder';
import { SPORT_CATEGORIES, chanceLanguageDetected, hasAllowedWinnerMethod } from '@/lib/sports/sportCatalog';
import { AlertTriangle, Save, Send } from 'lucide-react';

export default function CreateCustomSportPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    category: 'Custom / Other',
    description: '',
    players: '',
    teamBased: false,
    equipmentNeeded: '',
    safetyNotes: '',
    skillFactors: '',
    mediaExampleUrl: '',
    publicSubmission: false,
    rules: {
      rules: '',
      scoringMethod: '',
      winnerDeterminationMethod: '',
      tieBreakerRules: '',
      foulRules: '',
    },
    statFields: [],
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const flagged = chanceLanguageDetected([
    form.name,
    form.description,
    form.skillFactors,
    form.rules.rules,
    form.rules.scoringMethod,
    form.rules.winnerDeterminationMethod,
  ].join(' '));
  const winnerMethodAllowed = hasAllowedWinnerMethod(form.rules.winnerDeterminationMethod);

  const save = async (approvalStatus) => {
    setError('');
    if (!form.name.trim()) return setError('Sport/game name is required.');
    if (!form.rules.rules.trim()) return setError('Rules are required.');
    if (!form.rules.winnerDeterminationMethod.trim()) return setError('Winner determination is required.');
    if (flagged && approvalStatus !== 'draft') return setError('Remove disallowed winner-selection wording before submitting for review.');
    if (!winnerMethodAllowed) return setError('Winner determination must be based on score, time, accuracy, distance, judging, standings, stats, or verified performance.');

    setSaving(true);
    try {
      const user = await base44.auth.me().catch(() => null);
      await base44.entities.CustomSportSubmission.create({
        submittedByUserId: user?.id || user?.email || 'anonymous',
        name: form.name.trim(),
        category: form.category,
        description: form.description,
        proposedFormats: [{
          name: form.teamBased ? 'Team-based custom format' : 'Individual custom format',
          minPlayers: 1,
          maxPlayers: Number(form.players || 2),
          teamBased: form.teamBased,
          winnerDeterminationMethod: form.rules.winnerDeterminationMethod,
        }],
        proposedRules: form.rules,
        proposedStatFields: form.statFields,
        winnerDeterminationMethod: form.rules.winnerDeterminationMethod,
        skillFactors: form.skillFactors,
        safetyNotes: form.safetyNotes,
        equipmentNeeded: form.equipmentNeeded,
        mediaExampleUrl: form.mediaExampleUrl,
        approvalStatus: approvalStatus === 'submitted' && !form.publicSubmission ? 'draft' : approvalStatus,
        privateToCreator: !form.publicSubmission,
        adminNotes: flagged ? 'Disallowed winner-selection wording detected for admin review.' : '',
      });
      navigate('/SouthPole');
    } catch (err) {
      setError(err.message || 'Could not save custom sport/game.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black px-3 py-4 text-white sm:px-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-black md:text-4xl">Create Custom Sport/Game</h1>
          <p className="mt-2 text-sm text-purple-100/65">Create a private league-specific sport or submit one for public admin review.</p>
        </div>
        {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100">{error}</div>}
        {flagged && (
          <div className="flex gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-100">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Disallowed winner-selection wording detected. Winner determination must be skill or performance based.
          </div>
        )}
        {!winnerMethodAllowed && form.rules.winnerDeterminationMethod && (
          <div className="flex gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-3 text-sm text-cyan-100">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Use an allowed skill/performance method: score, time, accuracy, distance, completion rate, judge scoring, referee decision, verified performance, league standings, best stat line, fastest time, or highest score.
          </div>
        )}

        <div className="grid gap-4 rounded-xl border border-purple-700/20 bg-black/20 p-4 sm:grid-cols-2">
          <label className="space-y-1">
            <Label>Sport/game name</Label>
            <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="border-purple-700/40 bg-black/40 text-white" />
          </label>
          <label className="space-y-1">
            <Label>Category</Label>
            <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="h-9 w-full rounded-md border border-purple-700/40 bg-black/40 px-3 text-sm text-white">
              {SPORT_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
          <label className="space-y-1 sm:col-span-2">
            <Label>Description</Label>
            <Textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="border-purple-700/40 bg-black/40 text-white" />
          </label>
          <label className="space-y-1">
            <Label>Number of players</Label>
            <Input type="number" min={1} value={form.players} onChange={(event) => setForm({ ...form, players: event.target.value })} className="border-purple-700/40 bg-black/40 text-white" />
          </label>
          <div className="flex items-center gap-3 rounded-lg border border-purple-700/15 bg-black/20 p-3 sm:pt-6">
            <Switch checked={form.teamBased} onCheckedChange={(checked) => setForm({ ...form, teamBased: checked })} />
            <Label>Team-based</Label>
          </div>
          <label className="space-y-1">
            <Label>Equipment needed</Label>
            <Textarea rows={2} value={form.equipmentNeeded} onChange={(event) => setForm({ ...form, equipmentNeeded: event.target.value })} className="border-purple-700/40 bg-black/40 text-white" />
          </label>
          <label className="space-y-1">
            <Label>Safety notes</Label>
            <Textarea rows={2} value={form.safetyNotes} onChange={(event) => setForm({ ...form, safetyNotes: event.target.value })} className="border-purple-700/40 bg-black/40 text-white" />
          </label>
          <label className="space-y-1">
            <Label>Skill factors measured</Label>
            <Textarea rows={2} value={form.skillFactors} onChange={(event) => setForm({ ...form, skillFactors: event.target.value })} className="border-purple-700/40 bg-black/40 text-white" />
          </label>
          <label className="space-y-1">
            <Label>Example image/video URL</Label>
            <Input value={form.mediaExampleUrl} onChange={(event) => setForm({ ...form, mediaExampleUrl: event.target.value })} className="border-purple-700/40 bg-black/40 text-white" />
          </label>
        </div>

        <SportRulesEditor value={form.rules} onChange={(rules) => setForm({ ...form, rules })} />
        <StatTemplateBuilder value={form.statFields} onChange={(statFields) => setForm({ ...form, statFields })} />

        <div className="flex flex-col items-stretch justify-between gap-3 rounded-xl border border-purple-700/25 bg-black/25 p-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <Switch checked={form.publicSubmission} onCheckedChange={(checked) => setForm({ ...form, publicSubmission: checked })} />
            <div>
              <p className="text-sm font-semibold">Submit for public approval</p>
              <p className="text-xs text-purple-300/60">Private custom sports can be used by your league. Public sports require admin review.</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => save('draft')} disabled={saving} className="border-purple-700/40 text-purple-200 hover:bg-purple-900/40">
              <Save className="mr-2 h-4 w-4" /> Save draft
            </Button>
            <Button onClick={() => save('submitted')} disabled={saving} className="bg-purple-700 text-white hover:bg-purple-600">
              <Send className="mr-2 h-4 w-4" /> {form.publicSubmission ? 'Submit for review' : 'Save private sport'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
