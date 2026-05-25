import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, AlertTriangle } from "lucide-react";
import { VideoBackgroundCard, mediaImages } from "@/components/media/MediaPrimitives";

const CONDITION_LABELS = {
  championship_winner: "Championship Winner",
  best_record: "Best Record",
  tournament_winner: "Tournament Winner",
  playoff_winner: "Playoff Winner",
  verified_standings: "Verified Final Standings",
  admin_approved_outcome: "Admin-Approved Outcome",
};

export default function ResultVerification({ campaign, players, onSubmitResult, isLoading }) {
  const [winnerTeamName, setWinnerTeamName] = useState(campaign?.team_name || "");
  const [resultNotes, setResultNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    await onSubmitResult({ winner_team_name: winnerTeamName, result_notes: resultNotes });
    setSubmitted(true);
  };

  if (campaign?.status === "winner_confirmed") {
    return (
      <div className="text-center py-8 space-y-3">
        <ShieldCheck className="w-12 h-12 text-green-400 mx-auto" />
        <p className="text-lg font-bold text-white">Winner Confirmed!</p>
        <p className="text-purple-300">{campaign.winner_team_name}</p>
        <p className="text-sm text-purple-400/70">{campaign.result_notes}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <VideoBackgroundCard
        title="Verify the moment"
        subtitle="Confirm the result before prizes move into fulfillment."
        image={mediaImages.winnerMoment}
        tone="cyan"
      />

      <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-lg p-3 flex gap-2">
        <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-yellow-200/80">
          Results must be verified by an admin before prizes are released. 
          Winning condition: <strong>{CONDITION_LABELS[campaign?.winning_condition]}</strong>.
          Results are subject to review and may require supporting documentation.
        </p>
      </div>

      <div className="space-y-1">
        <Label className="text-purple-200">Winning Team / Group Name</Label>
        <Input value={winnerTeamName} onChange={e => setWinnerTeamName(e.target.value)}
          className="bg-black/40 border-purple-700/40 text-white" />
      </div>

      <div className="space-y-1">
        <Label className="text-purple-200">Result Details / Evidence</Label>
        <Textarea value={resultNotes} onChange={e => setResultNotes(e.target.value)} rows={4}
          placeholder="Describe the season outcome, link to official standings, league confirmation, etc."
          className="bg-black/40 border-purple-700/40 text-white placeholder:text-purple-400/50" />
      </div>

      <Button onClick={handleSubmit} disabled={!winnerTeamName || isLoading || submitted}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white">
        <ShieldCheck className="w-4 h-4 mr-2" />
        {submitted ? "Result Submitted — Awaiting Admin Approval" : "Submit Result for Verification"}
      </Button>
    </div>
  );
}
