import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';
import { chanceLanguageDetected } from '@/lib/sports/sportCatalog';

export default function SportRulesEditor({ value = {}, onChange }) {
  const update = (key, nextValue) => onChange?.({ ...value, [key]: nextValue });
  const flagged = chanceLanguageDetected(Object.values(value).join(' '));

  return (
    <div className="space-y-4 rounded-xl border border-purple-700/25 bg-black/25 p-4">
      <div>
        <h3 className="text-sm font-bold text-white">Rules and winner determination</h3>
        <p className="text-xs text-purple-300/60">Rules must use skill, score, time, accuracy, distance, judging, or verified performance.</p>
      </div>
      {flagged && (
        <div className="flex gap-2 rounded-lg border border-yellow-600/30 bg-yellow-950/30 p-3 text-xs text-yellow-100">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Disallowed winner-selection wording was detected. This must be removed or reviewed by an admin.
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1">
          <Label className="text-purple-200">Scoring method</Label>
          <Input value={value.scoringMethod || ''} onChange={(event) => update('scoringMethod', event.target.value)} className="border-purple-700/40 bg-black/40 text-white" />
        </label>
        <label className="space-y-1">
          <Label className="text-purple-200">Winner determination</Label>
          <Input value={value.winnerDeterminationMethod || ''} onChange={(event) => update('winnerDeterminationMethod', event.target.value)} className="border-purple-700/40 bg-black/40 text-white" />
        </label>
      </div>
      <label className="space-y-1 block">
        <Label className="text-purple-200">Rules</Label>
        <Textarea rows={5} value={value.rules || ''} onChange={(event) => update('rules', event.target.value)} className="border-purple-700/40 bg-black/40 text-white" />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1">
          <Label className="text-purple-200">Tie-breaker rules</Label>
          <Textarea rows={3} value={value.tieBreakerRules || ''} onChange={(event) => update('tieBreakerRules', event.target.value)} className="border-purple-700/40 bg-black/40 text-white" />
        </label>
        <label className="space-y-1">
          <Label className="text-purple-200">Fouls / penalties</Label>
          <Textarea rows={3} value={value.foulRules || ''} onChange={(event) => update('foulRules', event.target.value)} className="border-purple-700/40 bg-black/40 text-white" />
        </label>
      </div>
    </div>
  );
}
