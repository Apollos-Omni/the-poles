import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { SPORT_CATEGORIES, chanceLanguageDetected, defaultSportPayload, hasAllowedWinnerMethod } from '@/lib/sports/sportCatalog';
import { CheckCircle2, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

export default function CustomSportReviewAdminPage() {
  const [rows, setRows] = useState([]);
  const [notes, setNotes] = useState({});
  const [edits, setEdits] = useState({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.CustomSportSubmission.list('-created_date', 100).catch(() => []);
    setRows(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (row, approvalStatus) => {
    const adminNotes = notes[row.id] || row.adminNotes || '';
    const edit = edits[row.id] || {};
    const nextPatch = {
      approvalStatus,
      adminNotes,
      category: edit.category || row.category,
      proposedRules: edit.proposedRules || row.proposedRules,
      privateToCreator: edit.privateToCreator ?? row.privateToCreator,
    };
    await base44.entities.CustomSportSubmission.update(row.id, nextPatch);
    if (approvalStatus === 'approved') {
      await base44.entities.Sport.create({
        ...defaultSportPayload(row.name, nextPatch.category, row.submittedByUserId),
        description: row.description,
        defaultFormats: (row.proposedFormats || []).map((format) => format.name || 'Custom Format'),
        approvalStatus: 'approved',
        isActive: nextPatch.privateToCreator !== true,
      }).catch(() => null);
    }
    await load();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black p-4 text-white md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge className="mb-3 border border-yellow-400/30 bg-yellow-500/15 text-yellow-100">Admin review</Badge>
            <h1 className="text-3xl font-black">Custom Sport/Game Review</h1>
            <p className="mt-2 text-sm text-purple-100/65">Approve, reject, request changes, and convert submissions into approved sport/game types.</p>
          </div>
          <Button onClick={load} variant="outline" className="border-purple-700/40 text-purple-200 hover:bg-purple-900/40">
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>

        {loading ? <p className="text-purple-200/60">Loading submissions...</p> : rows.length === 0 ? (
          <div className="rounded-xl border border-purple-700/20 bg-black/25 p-8 text-center text-purple-200/60">No custom sport submissions yet.</div>
        ) : (
          <div className="space-y-4">
            {rows.map((row) => {
              const edit = edits[row.id] || {};
              const effectiveRules = edit.proposedRules || row.proposedRules || row.proposed_rules || {};
              const effectiveWinnerMethod = effectiveRules.winnerDeterminationMethod || row.winnerDeterminationMethod || '';
              const flagged = chanceLanguageDetected(JSON.stringify({ ...row, proposedRules: effectiveRules }));
              const winnerMethodAllowed = hasAllowedWinnerMethod(effectiveWinnerMethod);
              const approvalBlocked = flagged || !winnerMethodAllowed;
              return (
                <div key={row.id} className="rounded-xl border border-purple-700/25 bg-black/35 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold">{row.name}</h2>
                      <p className="text-sm text-purple-200/60">{row.category} - {row.approvalStatus || row.approval_status || 'draft'}</p>
                    </div>
                    {flagged && (
                      <Badge className="border border-yellow-500/30 bg-yellow-500/15 text-yellow-100">
                        <AlertTriangle className="mr-1 h-3.5 w-3.5" /> Chance wording flagged
                      </Badge>
                    )}
                  </div>
                  {approvalBlocked && (
                    <div className="mt-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-100">
                      Approval is disabled until chance-based wording is removed and winner determination clearly uses skill, score, time, accuracy, distance, judging, standings, stats, or verified performance.
                    </div>
                  )}
                  <p className="mt-3 text-sm text-purple-100/75">{row.description}</p>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <label className="space-y-1">
                      <span className="text-xs text-purple-200">Edit category</span>
                      <select
                        value={edits[row.id]?.category || row.category || 'Custom / Other'}
                        onChange={(event) => setEdits((prev) => ({ ...prev, [row.id]: { ...prev[row.id], category: event.target.value } }))}
                        className="h-9 w-full rounded-md border border-purple-700/40 bg-black/40 px-3 text-sm text-white"
                      >
                        {SPORT_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
                      </select>
                    </label>
                    <label className="flex items-center gap-2 pt-6 text-sm text-purple-100">
                      <input
                        type="checkbox"
                        checked={edits[row.id]?.privateToCreator ?? row.privateToCreator ?? false}
                        onChange={(event) => setEdits((prev) => ({ ...prev, [row.id]: { ...prev[row.id], privateToCreator: event.target.checked } }))}
                      />
                      Keep private to creator/league
                    </label>
                  </div>
                  <Textarea
                    value={effectiveRules.rules || effectiveRules.rulesText || ''}
                    onChange={(event) => setEdits((prev) => ({
                      ...prev,
                      [row.id]: {
                        ...prev[row.id],
                        proposedRules: { ...(row.proposedRules || {}), ...(prev[row.id]?.proposedRules || {}), rules: event.target.value },
                      },
                    }))}
                    placeholder="Edit rules before approval..."
                    className="mt-3 border-purple-700/40 bg-black/40 text-white"
                  />
                  <div className="mt-3 grid gap-3 text-xs md:grid-cols-2">
                    <div className="rounded-lg bg-black/30 p-3">
                      <p className="font-semibold text-white">Winner determination</p>
                      <p className="text-purple-200/65">{effectiveWinnerMethod || 'Not specified'}</p>
                    </div>
                    <div className="rounded-lg bg-black/30 p-3">
                      <p className="font-semibold text-white">Skill factors</p>
                      <p className="text-purple-200/65">{row.skillFactors}</p>
                    </div>
                  </div>
                  <Textarea
                    value={notes[row.id] ?? row.adminNotes ?? ''}
                    onChange={(event) => setNotes((prev) => ({ ...prev, [row.id]: event.target.value }))}
                    placeholder="Admin notes or requested changes..."
                    className="mt-3 border-purple-700/40 bg-black/40 text-white"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button onClick={() => updateStatus(row, 'approved')} disabled={approvalBlocked} className="bg-green-700 text-white hover:bg-green-600 disabled:opacity-50">
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Approve and make public
                    </Button>
                    <Button onClick={() => updateStatus(row, 'needs_changes')} variant="outline" className="border-yellow-700/40 text-yellow-100 hover:bg-yellow-900/30">
                      Request changes
                    </Button>
                    <Button onClick={() => updateStatus(row, 'rejected')} variant="outline" className="border-red-700/40 text-red-100 hover:bg-red-900/30">
                      <XCircle className="mr-2 h-4 w-4" /> Reject
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
