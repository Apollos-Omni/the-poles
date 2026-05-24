import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { BarChart3, ShieldCheck } from 'lucide-react';
import {
  VERIFICATION_LEVELS,
  fieldsForStatsMode,
  getFormatTemplate,
  getSportTemplate,
} from '@/lib/south-pole/statTemplates';

const SPORT_OPTIONS = [
  { value: 'basketball', label: 'Basketball' },
  { value: 'football', label: 'Football - template coming soon' },
  { value: 'soccer', label: 'Soccer - template coming soon' },
  { value: 'baseball', label: 'Baseball - template coming soon' },
  { value: 'volleyball', label: 'Volleyball - template coming soon' },
  { value: 'custom', label: 'Custom - basic template' },
];

export default function SPSportStatTemplateSelector({ value, onChange }) {
  const sportType = value?.sport_type || 'basketball';
  const statsMode = value?.stats_mode || 'basic';
  const sportTemplate = getSportTemplate(sportType);
  const format = getFormatTemplate(sportType, value?.game_format_id);
  const visibleFields = fieldsForStatsMode(format?.fields || [], statsMode);

  const update = (patch) => onChange?.({ ...value, ...patch });

  const selectSport = (nextSportType) => {
    const nextSport = getSportTemplate(nextSportType);
    const nextFormat = nextSport?.formats[0] || null;
    update({
      sport_type: nextSportType,
      game_format_id: nextFormat?.id || 'custom_basic',
      stat_template_id: nextFormat?.templateId || 'custom_basic_stats',
    });
  };

  const selectFormat = (formatId) => {
    const nextFormat = getFormatTemplate(sportType, formatId);
    update({
      game_format_id: formatId,
      stat_template_id: nextFormat?.templateId || null,
    });
  };

  return (
    <div className="space-y-4 rounded-xl border border-purple-700/25 bg-black/25 p-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-purple-300" />
        <div>
          <h3 className="text-sm font-bold text-white">Sport stat template</h3>
          <p className="text-xs text-purple-300/60">Choose a sport and gameplay format to load the right stat fields.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label className="text-purple-200 text-sm">Sport</Label>
          <Select value={sportType} onValueChange={selectSport}>
            <SelectTrigger className="mt-1 border-purple-700/40 bg-black/40 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-gray-700 bg-gray-900">
              {SPORT_OPTIONS.map((sport) => (
                <SelectItem key={sport.value} value={sport.value} className="text-white hover:bg-gray-800">
                  {sport.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-purple-200 text-sm">Gameplay format</Label>
          <Select value={format?.id || value?.game_format_id || 'custom_basic'} onValueChange={selectFormat} disabled={!sportTemplate}>
            <SelectTrigger className="mt-1 border-purple-700/40 bg-black/40 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-gray-700 bg-gray-900">
              {(sportTemplate?.formats || [{ id: 'custom_basic', label: 'Basic custom stats' }]).map((item) => (
                <SelectItem key={item.id} value={item.id} className="text-white hover:bg-gray-800">
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-purple-700/20 bg-purple-950/20 p-3">
        <div>
          <p className="text-sm font-semibold text-white">{statsMode === 'advanced' ? 'Advanced stats' : 'Basic stats'}</p>
          <p className="text-xs text-purple-300/60">Advanced leagues collect box-score detail for stronger matchmaking signals.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-purple-300">Basic</span>
          <Switch checked={statsMode === 'advanced'} onCheckedChange={(checked) => update({ stats_mode: checked ? 'advanced' : 'basic' })} />
          <span className="text-xs text-purple-300">Advanced</span>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-purple-300/70">Loaded stat fields</p>
        <div className="flex flex-wrap gap-2">
          {visibleFields.length ? visibleFields.map((field) => (
            <Badge key={field.key} className={`border text-xs ${field.tier === 'advanced' ? 'border-cyan-500/30 bg-cyan-500/15 text-cyan-100' : 'border-purple-500/30 bg-purple-500/15 text-purple-100'}`}>
              {field.label}{field.calculated ? ' (auto)' : ''}
            </Badge>
          )) : (
            <span className="text-xs text-purple-300/50">Custom leagues can add fields later.</span>
          )}
        </div>
      </div>

      <div className="grid gap-3 text-xs md:grid-cols-2">
        <div className="rounded-lg border border-green-700/25 bg-green-950/15 p-3 text-green-100/80">
          <p className="mb-1 font-semibold text-green-100">Auto-calculated for basketball</p>
          <p>FG%, 3P%, FT%, total rebounds, AST/TO, PPG, RPG, APG, win rate, and efficiency score.</p>
        </div>
        <div className="rounded-lg border border-yellow-700/25 bg-yellow-950/15 p-3 text-yellow-100/80">
          <p className="mb-1 flex items-center gap-1 font-semibold text-yellow-100">
            <ShieldCheck className="h-3.5 w-3.5" /> Verification levels
          </p>
          <p>{VERIFICATION_LEVELS.map((level) => level.label).join(', ')}.</p>
        </div>
      </div>
    </div>
  );
}
