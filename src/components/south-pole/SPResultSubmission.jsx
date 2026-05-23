import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Trophy, Upload, Send, Loader2 } from "lucide-react";
import { VERIFICATION_METHODS } from "./SPConstants";

export default function SPResultSubmission({ challenge, participants, onSubmit, isLoading }) {
  const [winnerId, setWinnerId] = useState("");
  const [winnerNotes, setWinnerNotes] = useState("");
  const [proofUrl, setProofUrl] = useState("");

  const vm = VERIFICATION_METHODS.find(v => v.value === challenge.verification_method);

  const canSubmit = winnerId && winnerNotes.trim();
  const confirmed = participants.find(p => p.id === winnerId);

  return (
    <div className="space-y-4">
      <div className="bg-orange-900/20 border border-orange-700/30 rounded-xl p-3 text-sm text-orange-300">
        <p className="font-semibold mb-1">Result Submission</p>
        <p className="text-xs text-orange-300/70">Verification method: <strong>{vm?.label || challenge.verification_method}</strong>. The winner must be determined by skill, performance, or stated rules — not randomly.</p>
      </div>

      <div>
        <Label className="text-purple-200 text-sm">Select Winner *</Label>
        <select value={winnerId} onChange={e => setWinnerId(e.target.value)}
          className="w-full mt-1 bg-black/40 border border-cyan-700/40 rounded-lg px-3 py-2 text-white text-sm">
          <option value="">— Select the winning competitor —</option>
          {participants.filter(p => p.payment_status === "confirmed").map(p => (
            <option key={p.id} value={p.id}>{p.display_name}</option>
          ))}
        </select>
      </div>

      <div>
        <Label className="text-purple-200 text-sm">Result Notes & Justification *</Label>
        <Textarea value={winnerNotes} onChange={e => setWinnerNotes(e.target.value)}
          placeholder="Describe how the winner was determined. Include scores, times, judge decisions, or other evidence."
          rows={4} className="bg-black/40 border-cyan-700/40 text-white mt-1" />
      </div>

      <div>
        <Label className="text-purple-200 text-sm">Proof URL (optional — photo/video/link)</Label>
        <Input value={proofUrl} onChange={e => setProofUrl(e.target.value)}
          placeholder="https://..." className="bg-black/40 border-cyan-700/40 text-white mt-1" />
      </div>

      {confirmed && (
        <div className="bg-cyan-900/20 border border-cyan-700/30 rounded-xl p-3 text-sm text-cyan-300">
          🏆 Selected winner: <strong>{confirmed.display_name}</strong>
        </div>
      )}

      <Button onClick={() => onSubmit({ winner_participant_id: winnerId, winner_notes: winnerNotes, proof_url: proofUrl })}
        disabled={!canSubmit || isLoading}
        className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 text-white">
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
        Submit Result for Verification
      </Button>
    </div>
  );
}