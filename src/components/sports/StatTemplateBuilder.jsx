import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';

const FIELD_TYPES = ['number', 'percentage', 'text', 'boolean', 'time', 'score', 'select'];
const APPLIES_TO = ['player', 'team', 'match', 'league'];

const blankField = () => ({
  id: `field-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
  name: '',
  label: '',
  type: 'number',
  description: '',
  required: false,
  calculated: false,
  formula: '',
  displayOrder: 0,
  appliesTo: 'player',
});

export default function StatTemplateBuilder({ value = [], onChange }) {
  const fields = value.length ? value : [blankField()];
  const update = (index, patch) => onChange?.(fields.map((field, i) => i === index ? { ...field, ...patch } : field));
  const remove = (index) => onChange?.(fields.filter((_, i) => i !== index));
  const add = () => onChange?.([...fields, { ...blankField(), displayOrder: fields.length + 1 }]);

  return (
    <div className="space-y-4 rounded-xl border border-purple-700/25 bg-black/25 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-bold text-white">Custom stat fields</h3>
          <p className="text-xs text-purple-300/60">Define what players, teams, matches, or leagues should track.</p>
        </div>
        <Button type="button" size="sm" onClick={add} className="w-full bg-purple-700 text-white hover:bg-purple-600 sm:w-auto">
          <Plus className="mr-1 h-4 w-4" /> Add field
        </Button>
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.id || index} className="rounded-lg border border-purple-700/20 bg-black/30 p-3">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold text-purple-200">Field {index + 1}</p>
              {fields.length > 1 && (
                <button type="button" onClick={() => remove(index)} className="text-purple-300/60 hover:text-red-200">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <label className="space-y-1">
                <Label className="text-purple-200">Name</Label>
                <Input value={field.name} onChange={(event) => update(index, { name: event.target.value })} className="border-purple-700/40 bg-black/40 text-white" />
              </label>
              <label className="space-y-1">
                <Label className="text-purple-200">Label</Label>
                <Input value={field.label} onChange={(event) => update(index, { label: event.target.value })} className="border-purple-700/40 bg-black/40 text-white" />
              </label>
              <label className="space-y-1">
                <Label className="text-purple-200">Type</Label>
                <select value={field.type} onChange={(event) => update(index, { type: event.target.value })} className="h-9 w-full rounded-md border border-purple-700/40 bg-black/40 px-3 text-sm text-white">
                  {FIELD_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </label>
              <label className="space-y-1">
                <Label className="text-purple-200">Applies to</Label>
                <select value={field.appliesTo} onChange={(event) => update(index, { appliesTo: event.target.value })} className="h-9 w-full rounded-md border border-purple-700/40 bg-black/40 px-3 text-sm text-white">
                  {APPLIES_TO.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </label>
              <label className="space-y-1 sm:col-span-2">
                <Label className="text-purple-200">Formula or description</Label>
                <Input value={field.formula || field.description || ''} onChange={(event) => update(index, { formula: event.target.value, description: event.target.value })} className="border-purple-700/40 bg-black/40 text-white" />
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
