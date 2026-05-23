import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trophy, Users, Info, Share2, BarChart3, Loader2, ArrowLeft, Globe, MapPin, Calendar, Shield, AlertTriangle, Play, CheckCircle } from "lucide-react";
import SPStatusBadge from "./SPStatusBadge";
import SPFundingBar from "./SPFundingBar";
import SPSharePanel from "./SPSharePanel";
import SPParticipantsList from "./SPParticipantsList";
import SPResultSubmission from "./SPResultSubmission";
import { CATEGORIES, PRIZE_TYPES, WINNING_CONDITIONS, VERIFICATION_METHODS, formatCents } from "./SPConstants";

export default function SPChallengeDetail({ challenge: initialChallenge, onBack, currentUserId, isAdmin }) {
  const [challenge, setChallenge] = useState(initialChallenge);
  const [participants, setParticipants] = useState([]);
  const [tab, setTab] = useState("info");
  const [loading, setLoading] = useState(false);
  const [joinName, setJoinName] = useState("");
  const [showJoinForm, setShowJoinForm] = useState(false);

  const load = async () => {
    const [c, ps] = await Promise.all([
      base44.entities.SouthPoleChallenge.filter({ id: challenge.id }),
      base44.entities.SouthPoleParticipant.filter({ challenge_id: challenge.id }),
    ]);
    if (c.length) setChallenge({ ...c[0], current_participants: ps.length });
    setParticipants(ps);
  };

  useEffect(() => { load(); }, [challenge.id]);

  const handleJoin = async () => {
    if (!joinName.trim()) { setShowJoinForm(true); return; }
    setLoading(true);
    const user = await base44.auth.me();
    await base44.entities.SouthPoleParticipant.create({
      challenge_id: challenge.id,
      user_id: user?.email || "anonymous",
      display_name: joinName.trim(),
      payment_status: "confirmed", // sandbox
      amount_paid_cents: challenge.entry_amount_cents || 0,
    });
    await base44.entities.SouthPoleEvent.create({ challenge_id: challenge.id, event_type: "participant_joined", note: `${joinName} joined` });
    const newCount = participants.length + 1;
    const newFunded = (challenge.total_funded_cents || 0) + (challenge.entry_amount_cents || 0);
    const isFullyFunded = newFunded >= (challenge.total_goal_cents || Infinity);
    await base44.entities.SouthPoleChallenge.update(challenge.id, {
      total_funded_cents: newFunded,
      ...(newCount >= challenge.num_participants_needed ? { status: "fully_funded" } : {}),
    });
    if (isFullyFunded) {
      await base44.entities.SouthPoleEvent.create({ challenge_id: challenge.id, event_type: "fully_funded", note: "Challenge fully funded!" });
    }
    await load();
    setShowJoinForm(false);
    setJoinName("");
    setLoading(false);
  };

  const handleSubmitResult = async ({ winner_participant_id, winner_notes, proof_url }) => {
    setLoading(true);
    const winner = participants.find(p => p.id === winner_participant_id);
    await base44.entities.SouthPoleChallenge.update(challenge.id, {
      status: "awaiting_verification",
      winner_user_id: winner?.user_id,
      winner_name: winner?.display_name,
      winner_notes,
    });
    await base44.entities.SouthPoleParticipant.update(winner_participant_id, { is_winner: true, result_proof_url: proof_url });
    await base44.entities.SouthPoleEvent.create({ challenge_id: challenge.id, event_type: "result_submitted", note: `Result submitted. Claimed winner: ${winner?.display_name}` });
    await load();
    setLoading(false);
  };

  const handleActivate = async () => {
    setLoading(true);
    await base44.entities.SouthPoleChallenge.update(challenge.id, { status: "active" });
    await base44.entities.SouthPoleEvent.create({ challenge_id: challenge.id, event_type: "challenge_started", note: "Challenge activated" });
    await load();
    setLoading(false);
  };

  const cat = CATEGORIES.find(c => c.value === challenge.category);
  const pt = PRIZE_TYPES.find(p => p.value === challenge.prize_type);
  const wc = WINNING_CONDITIONS.find(w => w.value === challenge.winning_condition);
  const vm = VERIFICATION_METHODS.find(v => v.value === challenge.verification_method);
  const isCreator = challenge.creator_user_id === currentUserId;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-cyan-400 mt-0.5 shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-white">{challenge.title}</h2>
            <SPStatusBadge status={challenge.status} />
          </div>
          <p className="text-sm text-cyan-400/70 mt-0.5">
            {cat?.label} · {challenge.is_online ? <><Globe className="w-3 h-3 inline" /> Online</> : <><MapPin className="w-3 h-3 inline" /> {challenge.location || "TBD"}</>}
            {challenge.challenge_date && <> · <Calendar className="w-3 h-3 inline" /> {new Date(challenge.challenge_date).toLocaleDateString()}</>}
          </p>
        </div>
      </div>

      {/* Prize highlight */}
      <div className="bg-gradient-to-r from-cyan-900/30 to-teal-900/30 border border-cyan-700/30 rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-cyan-400/60 uppercase tracking-wider mb-1">The Prize</p>
            <h3 className="text-2xl font-bold text-white">{challenge.prize_title}</h3>
            <p className="text-cyan-300 text-lg font-semibold mt-1">{formatCents(challenge.prize_value_cents)}</p>
            <span className="text-xs bg-teal-900/40 text-teal-300 border border-teal-700/30 px-2 py-0.5 rounded-full mt-2 inline-block">{pt?.label}</span>
          </div>
          <div className="text-5xl">{cat?.label.split(" ")[0] || "🏆"}</div>
        </div>
        {challenge.prize_description && <p className="text-sm text-cyan-200/60 mt-3">{challenge.prize_description}</p>}
        <div className="mt-4"><SPFundingBar challenge={challenge} /></div>
      </div>

      {/* Creator actions */}
      {isCreator && challenge.status === "fully_funded" && (
        <div className="bg-green-900/20 border border-green-700/30 rounded-xl p-4 flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-green-300">🎉 Fully Funded!</p>
            <p className="text-xs text-green-300/70">You can now activate the challenge when ready to compete.</p>
          </div>
          <Button onClick={handleActivate} disabled={loading} className="bg-green-700 hover:bg-green-600 text-white shrink-0">
            <Play className="w-4 h-4 mr-1" /> Activate
          </Button>
        </div>
      )}

      {challenge.status === "winner_confirmed" && (
        <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-4 text-center">
          <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <p className="font-bold text-white text-lg">Winner: {challenge.winner_name}</p>
          {challenge.winner_notes && <p className="text-sm text-emerald-300/70 mt-1">{challenge.winner_notes}</p>}
        </div>
      )}

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-black/40 border border-cyan-700/30 w-full grid grid-cols-4">
          <TabsTrigger value="info" className="data-[state=active]:bg-cyan-700 text-cyan-200 text-xs">Info</TabsTrigger>
          <TabsTrigger value="competitors" className="data-[state=active]:bg-cyan-700 text-cyan-200 text-xs">Competitors</TabsTrigger>
          <TabsTrigger value="results" className="data-[state=active]:bg-cyan-700 text-cyan-200 text-xs">Results</TabsTrigger>
          <TabsTrigger value="share" className="data-[state=active]:bg-cyan-700 text-cyan-200 text-xs">Share</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <div className="bg-black/20 border border-cyan-700/20 rounded-xl p-4 space-y-4 text-sm">
            {challenge.description && (
              <div>
                <p className="text-xs text-cyan-400/50 uppercase tracking-wider mb-1">About This Challenge</p>
                <p className="text-purple-200/80">{challenge.description}</p>
              </div>
            )}
            {challenge.rules && (
              <div>
                <p className="text-xs text-cyan-400/50 uppercase tracking-wider mb-1">Rules</p>
                <p className="text-purple-200/80 whitespace-pre-wrap">{challenge.rules}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><p className="text-cyan-400/50 mb-1">Winning Condition</p><p className="text-white">{wc?.label}</p></div>
              <div><p className="text-cyan-400/50 mb-1">Verification</p><p className="text-white">{vm?.label}</p></div>
              {challenge.min_age && <div><p className="text-cyan-400/50 mb-1">Min Age</p><p className="text-white">{challenge.min_age}+</p></div>}
              <div><p className="text-cyan-400/50 mb-1">Sandbox Mode</p><p className="text-yellow-300">{challenge.sandbox_mode ? "Demo / Sandbox" : "Live"}</p></div>
            </div>
            {challenge.safety_requirements && (
              <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-3">
                <p className="text-xs text-yellow-400 font-medium mb-1"><AlertTriangle className="w-3 h-3 inline mr-1" />Safety Requirements</p>
                <p className="text-xs text-yellow-300/70">{challenge.safety_requirements}</p>
              </div>
            )}
            {challenge.skill_tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {challenge.skill_tags.map(t => (
                  <span key={t} className="text-xs bg-teal-900/30 text-teal-300 px-2 py-0.5 rounded-full border border-teal-700/30">{t}</span>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="competitors">
          <div className="bg-black/20 border border-cyan-700/20 rounded-xl p-4 space-y-4">
            {showJoinForm && (
              <div className="bg-cyan-900/20 border border-cyan-700/30 rounded-xl p-4 space-y-3">
                <Label className="text-white font-medium">Your Display Name</Label>
                <Input value={joinName} onChange={e => setJoinName(e.target.value)}
                  placeholder="How should competitors see you?" className="bg-black/40 border-cyan-700/40 text-white" />
                <div className="flex gap-2">
                  <Button onClick={handleJoin} disabled={!joinName.trim() || loading}
                    className="bg-cyan-700 hover:bg-cyan-600 text-white flex-1">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm & Join"}
                  </Button>
                  <Button variant="ghost" onClick={() => setShowJoinForm(false)} className="text-gray-400">Cancel</Button>
                </div>
              </div>
            )}
            <SPParticipantsList
              challenge={challenge}
              participants={participants}
              onJoin={() => setShowJoinForm(true)}
              currentUserId={currentUserId}
              isLoading={loading}
            />
          </div>
        </TabsContent>

        <TabsContent value="results">
          <div className="bg-black/20 border border-cyan-700/20 rounded-xl p-4">
            {["active"].includes(challenge.status) && (isCreator || isAdmin) ? (
              <SPResultSubmission
                challenge={challenge}
                participants={participants}
                onSubmit={handleSubmitResult}
                isLoading={loading}
              />
            ) : challenge.status === "awaiting_verification" ? (
              <div className="text-center py-8 space-y-2">
                <Shield className="w-10 h-10 text-orange-400/60 mx-auto" />
                <p className="text-orange-300 font-semibold">Awaiting Admin Verification</p>
                <p className="text-sm text-orange-300/60">Result has been submitted. An admin will verify and confirm the winner.</p>
              </div>
            ) : ["winner_confirmed","completed","donation_recorded","fulfillment_pending","prize_shipped"].includes(challenge.status) ? (
              <div className="text-center py-8 space-y-2">
                <Trophy className="w-10 h-10 text-yellow-400 mx-auto" />
                <p className="text-white font-bold text-lg">Winner: {challenge.winner_name}</p>
                {challenge.winner_notes && <p className="text-sm text-cyan-300/70">{challenge.winner_notes}</p>}
                <span className="text-xs text-green-400">✅ Verified by Admin</span>
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="w-10 h-10 text-cyan-700/40 mx-auto mb-2" />
                <p className="text-sm text-cyan-400/50">Results will be available once the challenge is active.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="share">
          <SPSharePanel challenge={challenge} />
        </TabsContent>
      </Tabs>
    </div>
  );
}