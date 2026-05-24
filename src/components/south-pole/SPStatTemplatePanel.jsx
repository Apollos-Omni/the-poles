import React, { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  VERIFICATION_LEVELS,
  calculateBasketballStats,
  fieldsForStatsMode,
  getFormatTemplate,
  skillTierForPerformance,
} from '@/lib/south-pole/statTemplates';
import { Activity, BarChart3, ShieldCheck, Target } from 'lucide-react';

function initialStats(fields) {
  return fields.reduce((acc, field) => {
    acc[field.key] = field.defaultValue ?? '';
    return acc;
  }, {});
}

export default function SPStatTemplatePanel({ league }) {
  const format = getFormatTemplate(league.sport_type, league.game_format_id);
  const fields = useMemo(
    () => fieldsForStatsMode(format?.fields || [], league.stats_mode || 'basic'),
    [format, league.stats_mode]
  );
  const [stats, setStats] = useState(() => initialStats(fields));
  const [verificationLevel, setVerificationLevel] = useState('self_reported');

  const calculated = useMemo(() => {
    if (league.sport_type !== 'basketball') return {};
    return calculateBasketballStats(stats, 1);
  }, [league.sport_type, stats]);
  const skill = skillTierForPerformance(calculated, verificationLevel);

  if (!format) {
    return (
      <div className="rounded-xl border border-purple-700/20 bg-black/20 p-4 text-sm text-purple-300/60">
        No stat template is configured for this league yet.
      </div>
    );
  }

  const updateStat = (key, value) => {
    setStats((prev) => ({ ...prev, [key]: value === '' ? '' : Number(value) }));
  };

  const applySampleLine = () => {
    setStats((prev) => ({
      ...prev,
      points: 24,
      two_point_made: 6,
      two_point_attempted: 11,
      three_point_made: 3,
      three_point_attempted: 7,
      free_throws_made: 3,
      free_throws_attempted: 4,
      offensive_rebounds: 2,
      defensive_rebounds: 7,
      total_rebounds: 9,
      assists: 6,
      steals: 2,
      blocks: 1,
      turnovers: 3,
      fouls: 2,
      minutes_played: 31,
      plus_minus: 8,
      result: 'win',
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-300" />
            <h4 className="font-bold text-white">{format.label} stat template</h4>
            <Badge className="border border-purple-500/30 bg-purple-500/15 text-purple-100">
              {league.stats_mode === 'advanced' ? 'Advanced stats' : 'Basic stats'}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-purple-300/60">
            Stat lines become performance records, then verified history feeds skill tier and matchmaking eligibility.
          </p>
        </div>
        {league.sport_type === 'basketball' && (
          <Button size="sm" variant="outline" onClick={applySampleLine} className="border-purple-700/40 text-purple-200 hover:bg-purple-900/40">
            Load sample line
          </Button>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {fields.map((field) => (
          <label key={field.key} className="space-y-1">
            <span className="text-xs text-purple-200">{field.label}</span>
            {field.type === 'select' ? (
              <select
                value={stats[field.key] ?? field.defaultValue}
                onChange={(event) => setStats((prev) => ({ ...prev, [field.key]: event.target.value }))}
                className="h-9 w-full rounded-md border border-purple-700/40 bg-black/40 px-3 text-sm text-white"
              >
                {(field.options || []).map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            ) : (
              <Input
                type="number"
                value={stats[field.key] ?? ''}
                onChange={(event) => updateStat(field.key, event.target.value)}
                className="border-purple-700/40 bg-black/40 text-white"
              />
            )}
          </label>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-cyan-700/25 bg-cyan-950/15 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-200" />
            <h5 className="text-sm font-bold text-white">Calculated metrics</h5>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(calculated).map(([key, value]) => (
              <div key={key} className="rounded-lg bg-black/30 p-2">
                <p className="text-cyan-200/60">{key.replace(/_/g, ' ')}</p>
                <p className="font-bold text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-green-700/25 bg-green-950/15 p-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-green-200" />
            <h5 className="text-sm font-bold text-white">Verification and matchmaking</h5>
          </div>
          <select
            value={verificationLevel}
            onChange={(event) => setVerificationLevel(event.target.value)}
            className="h-9 w-full rounded-md border border-green-700/40 bg-black/40 px-3 text-sm text-white"
          >
            {VERIFICATION_LEVELS.map((level) => <option key={level.value} value={level.value}>{level.label}</option>)}
          </select>
          <div className="rounded-lg bg-black/30 p-3 text-sm">
            <p className="flex items-center gap-2 font-semibold text-white">
              <Target className="h-4 w-4 text-green-200" /> Skill tier: {skill.tier}
            </p>
            <p className="mt-1 text-xs text-green-100/65">
              Skill score {skill.score}. Higher verification levels carry more matchmaking weight.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
