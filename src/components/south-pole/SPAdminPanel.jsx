import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Check, X, Trophy, Heart, Package, Loader2, AlertTriangle } from "lucide-react";
import SPStatusBadge from "./SPStatusBadge";
import { formatCents } from "./SPConstants";
import { VideoBackgroundCard, mediaImages } from "@/components/media/MediaPrimitives";

const ADMIN_ACTIONS = {
  draft:                 [{ label: "Approve & Open", action: "approve_open", color: "bg-green-700 hover:bg-green-600" }],
  awaiting_verification: [{ label: "Confirm Winner", action: "confirm_winner", color: "bg-emerald-700 hover:bg-emerald-600" },
                          { label: "Reject & Re-verify", action: "reject_result", color: "bg-orange-700 hover:bg-orange-600" }],
  winner_confirmed:      [{ label: "Start Fulfillment", action: "start_fulfillment", color: "bg-indigo-700 hover:bg-indigo-600" }],
  fulfillment_pending:   [{ label: "Mark Prize Delivered", action: "prize_delivered", color: "bg-teal-700 hover:bg-teal-600" },
                          { label: "Record Donation", action: "record_donation", color: "bg-pink-700 hover:bg-pink-600" }],
  donation_recorded:     [{ label: "Mark Completed", action: "complete", color: "bg-teal-700 hover:bg-teal-600" }],
};

function AdminChallengeRow({ challenge, onAction }) {
  const [notes, setNotes] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const actions = ADMIN_ACTIONS[challenge.status] || [];

  const handleAction = async (action) => {
    setLoading(true);
    await onAction(challenge, action, notes);
    setLoading(false);
    setNotes("");
  };

  return (
    <div className="bg-black/30 border border-cyan-700/20 rounded-xl overflow-hidden">
      <button onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-cyan-900/10 transition-colors">
        <div className="min-w-0">
          <p className="font-semibold text-white truncate">{challenge.title}</p>
          <p className="text-sm text-cyan-400/70">{challenge.prize_title} · {formatCents(challenge.prize_value_cents)}</p>
        </div>
        <div className="flex items-center gap-2 ml-2 shrink-0">
          <SPStatusBadge status={challenge.status} />
          <span className="text-cyan-500 text-xs">{expanded ? "▲" : "▼"}</span>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-cyan-700/20 pt-3 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs text-purple-300/70">
            <span>ID: {challenge.challenge_id}</span>
            <span>Participants: {challenge.num_participants_needed}</span>
            <span>Funded: {formatCents(challenge.total_funded_cents)} / {formatCents(challenge.total_goal_cents)}</span>
            <span>The Poles Fund: {formatCents(challenge.north_pole_donation_cents)}</span>
            {challenge.winner_name && <span className="col-span-2 text-emerald-300">Winner: {challenge.winner_name}</span>}
          </div>
          {challenge.winner_notes && (
            <div className="bg-orange-900/20 rounded-lg p-3 text-xs text-orange-300">
              <p className="font-medium mb-1">Submitted result:</p>
              <p>{challenge.winner_notes}</p>
            </div>
          )}
          {challenge.admin_notes && (
            <div className="bg-gray-800/40 rounded-lg p-2 text-xs text-gray-300">Admin notes: {challenge.admin_notes}</div>
          )}
          {actions.length > 0 && (
            <div className="space-y-2">
              <Textarea value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Admin notes (optional)" rows={2}
                className="bg-black/40 border-cyan-700/30 text-white text-xs" />
              <div className="flex flex-wrap gap-2">
                {actions.map(a => (
                  <Button key={a.action} size="sm" onClick={() => handleAction(a.action)}
                    disabled={loading} className={`${a.color} text-white text-xs`}>
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : a.label}
                  </Button>
                ))}
                <Button size="sm" variant="outline" onClick={() => handleAction("cancel")}
                  disabled={loading} className="border-red-700/40 text-red-400 hover:bg-red-900/20 text-xs">
                  Cancel Challenge
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SPAdminPanel() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    const all = await base44.entities.SouthPoleChallenge.list("-created_date", 100);
    setChallenges(all);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (challenge, action, notes) => {
    const updates = { admin_notes: notes || challenge.admin_notes };
    let eventType = "admin_approved";
    switch (action) {
      case "approve_open":
        updates.status = "open"; updates.admin_approved = true; eventType = "admin_approved"; break;
      case "confirm_winner":
        updates.status = "winner_confirmed"; updates.admin_approved = true; eventType = "winner_verified"; break;
      case "reject_result":
        updates.status = "active"; eventType = "admin_rejected"; break;
      case "start_fulfillment":
        updates.status = "fulfillment_pending"; eventType = "fulfillment_started"; break;
      case "prize_delivered":
        updates.status = "donation_recorded"; eventType = "prize_delivered"; break;
      case "record_donation":
        updates.status = "donation_recorded"; updates.donation_recorded_at = new Date().toISOString(); eventType = "donation_recorded"; break;
      case "complete":
        updates.status = "completed"; eventType = "challenge_completed"; break;
      case "cancel":
        updates.status = "cancelled"; eventType = "challenge_cancelled"; break;
    }
    await base44.entities.SouthPoleChallenge.update(challenge.id, updates);
    await base44.entities.SouthPoleEvent.create({ challenge_id: challenge.id, event_type: eventType, note: notes || `Admin action: ${action}` });
    await load();
  };

  const filtered = filter === "all" ? challenges : challenges.filter(c => c.status === filter);

  const statuses = ["all", "draft", "awaiting_verification", "winner_confirmed", "fulfillment_pending"];

  // Stats
  const totalDonation = challenges.reduce((s, c) => s + (c.north_pole_donation_cents || 0), 0);
  const completed = challenges.filter(c => c.status === "completed").length;
  const pending = challenges.filter(c => ["draft","awaiting_verification"].includes(c.status)).length;

  return (
    <div className="space-y-6">
      <VideoBackgroundCard
        title="Challenge review room"
        subtitle="Verify sports outcomes with the same championship energy players see."
        image={mediaImages.southCourt}
        tone="cyan"
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-black/30 border border-cyan-700/20 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-white">{challenges.length}</p>
          <p className="text-xs text-cyan-400/60">Total Challenges</p>
        </div>
        <div className="bg-black/30 border border-orange-700/20 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-orange-300">{pending}</p>
          <p className="text-xs text-orange-400/60">Needs Action</p>
        </div>
        <div className="bg-black/30 border border-pink-700/20 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-pink-300">{formatCents(totalDonation)}</p>
          <p className="text-xs text-pink-400/60 flex items-center justify-center gap-1"><Heart className="w-3 h-3" />The Poles Fund</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-full text-xs border transition-colors ${filter === s ? "bg-cyan-700/40 border-cyan-600 text-cyan-200" : "border-gray-700/40 text-gray-400 hover:border-cyan-700/40"}`}>
            {s === "all" ? "All" : s.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12"><Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Shield className="w-10 h-10 text-cyan-700/40 mx-auto mb-2" />
          <p className="text-cyan-400/50 text-sm">No challenges to review.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => <AdminChallengeRow key={c.id} challenge={c} onAction={handleAction} />)}
        </div>
      )}
    </div>
  );
}
