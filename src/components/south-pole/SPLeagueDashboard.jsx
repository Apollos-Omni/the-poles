import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, Users, Calendar, Trophy, MessageSquare, BarChart3,
  Heart, Shield, CheckCircle, AlertTriangle, Send, Upload,
  Plus, Edit3, Play, ClipboardList, Star, Layers, Activity
} from "lucide-react";
import { formatCents } from "./SPConstants";
import SPStatTemplatePanel from "./SPStatTemplatePanel";

// ─── Mock schedule generator ──────────────────────────────────────────────────
function generateBracket(participants, format) {
  if (!participants.length) return [];
  if (format === "round_robin") {
    const matches = [];
    for (let i = 0; i < participants.length; i++) {
      for (let j = i + 1; j < participants.length; j++) {
        matches.push({ id: `${i}-${j}`, p1: participants[i], p2: participants[j], score1: null, score2: null, status: "pending" });
      }
    }
    return matches;
  }
  // Tournament bracket (pairs)
  const matches = [];
  const shuffled = [...participants];
  for (let i = 0; i < shuffled.length; i += 2) {
    if (shuffled[i + 1]) {
      matches.push({ id: `r1-${i}`, round: "Round 1", p1: shuffled[i], p2: shuffled[i + 1], score1: null, score2: null, status: "pending" });
    } else {
      matches.push({ id: `r1-bye-${i}`, round: "Round 1", p1: shuffled[i], p2: "BYE", score1: null, score2: null, status: "bye" });
    }
  }
  return matches;
};

// ─── Chat ─────────────────────────────────────────────────────────────────────
function EventChat({ leagueTitle }) {
  const [messages, setMessages] = useState([
    { id: 1, author: "Organizer", text: "Welcome to the event chat! Use this to coordinate and communicate.", time: "Just now", isOrganizer: true },
  ]);
  const [newMsg, setNewMsg] = useState("");

  const send = () => {
    if (!newMsg.trim()) return;
    setMessages(m => [...m, { id: Date.now(), author: "You", text: newMsg.trim(), time: "Just now", isOrganizer: false }]);
    setNewMsg("");
  };

  return (
    <div className="flex flex-col h-80">
      <div className="flex-1 overflow-y-auto space-y-3 mb-3">
        {messages.map(m => (
          <div key={m.id} className={`flex gap-2 ${m.isOrganizer ? "flex-row" : "flex-row"}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 ${m.isOrganizer ? "bg-purple-700" : "bg-indigo-700"}`}>
              {m.author[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-purple-300">{m.author}</span>
                {m.isOrganizer && <Badge className="bg-purple-700/30 text-purple-300 border-purple-600/30 text-xs py-0">Organizer</Badge>}
                <span className="text-xs text-gray-500">{m.time}</span>
              </div>
              <p className="text-sm text-white/80 mt-0.5">{m.text}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input value={newMsg} onChange={e => setNewMsg(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Type a message..." className="bg-black/40 border-purple-700/40 text-white text-sm" />
        <Button onClick={send} size="sm" className="bg-purple-700 hover:bg-purple-600 text-white">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Schedule / Bracket ───────────────────────────────────────────────────────
function SchedulePanel({ league, participants }) {
  const [matches, setMatches] = useState(() => generateBracket(participants.map(p => p.display_name || p.player_name || "Player"), league.format));
  const [editing, setEditing] = useState(null);
  const [s1, setS1] = useState(""); const [s2, setS2] = useState("");

  const submitScore = (matchId) => {
    setMatches(ms => ms.map(m => m.id === matchId ? { ...m, score1: s1, score2: s2, status: "completed" } : m));
    setEditing(null); setS1(""); setS2("");
  };

  if (!participants.length) return (
    <div className="text-center py-8 text-purple-400/50">
      <Layers className="w-10 h-10 mx-auto mb-2 opacity-40" />
      <p>Schedule will generate once participants register.</p>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-purple-300/70">{matches.length} match{matches.length !== 1 ? "es" : ""} · {league.format?.replace(/_/g, " ")}</p>
      </div>
      {matches.map(m => (
        <div key={m.id} className={`bg-black/30 border rounded-xl p-3 ${m.status === "completed" ? "border-teal-700/30" : "border-purple-700/30"}`}>
          <div className="flex items-center justify-between">
            <div className="flex-1 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="font-medium text-white">{m.p1}</span>
                {m.status === "completed" ? (
                  <span className="text-teal-300 font-bold text-xs">{m.score1} – {m.score2}</span>
                ) : (
                  <span className="text-purple-400/40 text-xs">vs</span>
                )}
                <span className="font-medium text-white text-right">{m.p2}</span>
              </div>
              {m.round && <p className="text-xs text-purple-400/50 mt-0.5">{m.round}</p>}
            </div>
            {m.status !== "bye" && m.status !== "completed" && (
              <Button size="sm" variant="ghost" onClick={() => setEditing(m.id)} className="text-purple-400 hover:text-white ml-2">
                <Edit3 className="w-3 h-3" />
              </Button>
            )}
            {m.status === "completed" && <CheckCircle className="w-4 h-4 text-teal-400 ml-2 shrink-0" />}
          </div>
          {editing === m.id && (
            <div className="mt-3 pt-3 border-t border-purple-700/20 flex gap-2 items-center">
              <Input value={s1} onChange={e => setS1(e.target.value)} placeholder={m.p1 + " score"} className="bg-black/40 border-purple-700/40 text-white text-xs h-8" />
              <span className="text-purple-400">–</span>
              <Input value={s2} onChange={e => setS2(e.target.value)} placeholder={m.p2 + " score"} className="bg-black/40 border-purple-700/40 text-white text-xs h-8" />
              <Button size="sm" onClick={() => submitScore(m.id)} className="bg-teal-700 hover:bg-teal-600 text-white text-xs h-8">Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(null)} className="text-gray-400 text-xs h-8">✕</Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Standings ────────────────────────────────────────────────────────────────
function StandingsPanel({ participants }) {
  const standings = participants.map((p, i) => ({
    name: p.display_name || p.player_name || "Player",
    wins: 0, losses: 0, points: 0, paid: p.payment_status === "confirmed",
  }));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-purple-400/60 border-b border-purple-700/20">
            <th className="text-left py-2 px-3">#</th>
            <th className="text-left py-2 px-3">Player / Team</th>
            <th className="text-center py-2 px-3">W</th>
            <th className="text-center py-2 px-3">L</th>
            <th className="text-center py-2 px-3">Pts</th>
            <th className="text-center py-2 px-3">Paid</th>
          </tr>
        </thead>
        <tbody>
          {standings.length === 0 ? (
            <tr><td colSpan={6} className="text-center py-6 text-purple-400/40">No participants yet.</td></tr>
          ) : standings.map((s, i) => (
            <tr key={i} className="border-b border-purple-700/10 hover:bg-purple-900/10">
              <td className="py-2 px-3 text-purple-400/60">{i + 1}</td>
              <td className="py-2 px-3 font-medium text-white">{s.name}</td>
              <td className="py-2 px-3 text-center text-teal-400">{s.wins}</td>
              <td className="py-2 px-3 text-center text-red-400">{s.losses}</td>
              <td className="py-2 px-3 text-center text-yellow-300">{s.points}</td>
              <td className="py-2 px-3 text-center">
                {s.paid ? <CheckCircle className="w-4 h-4 text-green-400 mx-auto" /> : <span className="text-yellow-400 text-xs">Pending</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Roster ───────────────────────────────────────────────────────────────────
function RosterPanel({ league, participants, isOrganizer, onAddPlayer }) {
  const spotsLeft = Math.max(0, (league.max_participants || 0) - participants.length);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-purple-300/70">{participants.length} / {league.max_participants} registered · {spotsLeft} spots left</p>
        {isOrganizer && (
          <Button size="sm" onClick={onAddPlayer} className="bg-purple-700 hover:bg-purple-600 text-white text-xs">
            <Plus className="w-3 h-3 mr-1" /> Add Player
          </Button>
        )}
      </div>
      {participants.length === 0 ? (
        <div className="text-center py-10 text-purple-400/40">
          <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p>No participants yet. Share the event to recruit competitors!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {participants.map((p, i) => (
            <div key={p.id || i} className="flex items-center justify-between bg-black/30 border border-purple-700/20 rounded-xl p-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-800 flex items-center justify-center text-sm font-bold text-white">
                  {(p.display_name || p.player_name || "?")[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-white text-sm">{p.display_name || p.player_name}</p>
                  {p.skill_tags?.length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-0.5">
                      {p.skill_tags.slice(0, 2).map(t => <span key={t} className="text-xs text-purple-400/60">{t}</span>)}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {p.is_winner && <Trophy className="w-4 h-4 text-yellow-400" />}
                <Badge className={`text-xs border ${p.payment_status === "confirmed" ? "bg-green-900/30 text-green-300 border-green-700/30" : "bg-yellow-900/30 text-yellow-300 border-yellow-700/30"}`}>
                  {p.payment_status === "confirmed" ? "Paid" : "Pending"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Results / Winner ─────────────────────────────────────────────────────────
function ResultsPanel({ league, participants, isOrganizer, onVerifyWinner }) {
  const [selectedWinner, setSelectedWinner] = useState("");
  const [notes, setNotes] = useState("");
  const [proof, setProof] = useState("");

  return (
    <div className="space-y-4">
      {league.winner_name ? (
        <div className="text-center py-6 space-y-2">
          <Trophy className="w-12 h-12 text-yellow-400 mx-auto" />
          <p className="text-2xl font-black text-white">{league.winner_name}</p>
          <p className="text-sm text-teal-300">🏆 Winner Confirmed</p>
          {league.winner_notes && <p className="text-sm text-purple-200/60">{league.winner_notes}</p>}
          <div className="bg-pink-900/20 border border-pink-700/20 rounded-xl p-3 mt-4 inline-block">
            <p className="text-xs text-pink-300">❤️ North Pole Fund donation: {formatCents(league.north_pole_donation_cents)}</p>
          </div>
        </div>
      ) : isOrganizer ? (
        <div className="space-y-4">
          <p className="text-sm text-purple-300/70 font-medium">Submit Winner Result</p>
          <div>
            <label className="text-purple-200 text-sm block mb-1">Select Winner</label>
            <select value={selectedWinner} onChange={e => setSelectedWinner(e.target.value)}
              className="w-full bg-black/40 border border-purple-700/40 rounded-lg px-3 py-2 text-white text-sm">
              <option value="">— Select participant —</option>
              {participants.map(p => <option key={p.id} value={p.id}>{p.display_name || p.player_name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-purple-200 text-sm block mb-1">Result Notes</label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Final score, how the winner was determined, any disputes resolved..." rows={3}
              className="bg-black/40 border-purple-700/40 text-white" />
          </div>
          <div>
            <label className="text-purple-200 text-sm block mb-1">Proof URL (photo/video, optional)</label>
            <Input value={proof} onChange={e => setProof(e.target.value)}
              placeholder="https://..." className="bg-black/40 border-purple-700/40 text-white" />
          </div>
          <Button onClick={() => onVerifyWinner({ winner_id: selectedWinner, notes, proof })}
            disabled={!selectedWinner}
            className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white w-full">
            <Trophy className="w-4 h-4 mr-2" /> Submit & Verify Winner
          </Button>
          <div className="bg-yellow-900/20 border border-yellow-700/20 rounded-xl p-3 text-xs text-yellow-300/70">
            <AlertTriangle className="w-3 h-3 inline mr-1" />
            Winner submission triggers prize fulfillment review and North Pole Fund donation recording.
          </div>
        </div>
      ) : (
        <div className="text-center py-10 text-purple-400/40">
          <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p>Results will appear once the organizer confirms the winner.</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function SPLeagueDashboard({ league, participants = [], onBack, isOrganizer, onActivate, onVerifyWinner, onAddPlayer }) {
  const [tab, setTab] = useState("roster");

  const totalFunded = (league.entry_amount_cents || 0) * participants.length;
  const goalPct = league.total_goal_cents > 0 ? Math.min(100, Math.round((totalFunded / league.total_goal_cents) * 100)) : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-purple-400 mt-0.5 shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-2xl">{league.sport_emoji || "🏆"}</span>
            <h2 className="text-xl font-bold text-white">{league.title}</h2>
            <Badge className="bg-purple-700/30 text-purple-300 border-purple-600/30 text-xs border">
              {league.status?.replace(/_/g, " ")}
            </Badge>
          </div>
          <p className="text-sm text-purple-400/60 mt-0.5">
            Hosted by {league.host_name} · {league.format?.replace(/_/g, " ")}
            {league.location && ` · ${league.location}`}
          </p>
        </div>
      </div>

      {/* Prize + funding summary */}
      <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-700/30 rounded-2xl p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-purple-400/50 uppercase tracking-wider">Prize</p>
            <h3 className="text-lg font-bold text-white">{league.prize_title}</h3>
            <p className="text-purple-300 font-semibold">{formatCents(league.prize_value_cents)}</p>
          </div>
          <div className="text-right text-xs text-purple-400/60 space-y-1">
            <p>{participants.length} / {league.max_participants} registered</p>
            <p className="text-pink-300 flex items-center gap-1 justify-end">
              <Heart className="w-3 h-3" /> {formatCents(league.north_pole_donation_cents)} → NP Fund
            </p>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-purple-400/60 mb-1">
            <span>Funding progress</span>
            <span>{goalPct}%</span>
          </div>
          <div className="h-2 rounded-full bg-purple-900/40">
            <div className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all" style={{ width: `${goalPct}%` }} />
          </div>
        </div>
      </div>

      {/* Organizer actions */}
      {isOrganizer && league.status === "open" && participants.length >= (league.max_participants || 0) && (
        <div className="bg-green-900/20 border border-green-700/30 rounded-xl p-3 flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-green-300 text-sm">🎉 Full Roster!</p>
            <p className="text-xs text-green-300/60">All spots filled. Activate the event to begin.</p>
          </div>
          <Button onClick={onActivate} size="sm" className="bg-green-700 hover:bg-green-600 text-white shrink-0">
            <Play className="w-4 h-4 mr-1" /> Activate
          </Button>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <div className="overflow-x-auto">
          <TabsList className="bg-black/40 border border-purple-700/30 inline-flex min-w-max">
            {[
              { v: "roster", label: "Roster", icon: Users },
              { v: "schedule", label: "Schedule", icon: Calendar },
              { v: "standings", label: "Standings", icon: BarChart3 },
              { v: "stats", label: "Stats", icon: Activity },
              { v: "results", label: "Results", icon: Trophy },
              { v: "chat", label: "Chat", icon: MessageSquare },
              { v: "rules", label: "Rules", icon: ClipboardList },
              { v: "prize", label: "Prize & Fund", icon: Heart },
            ].map(({ v, label, icon: Icon }) => (
              <TabsTrigger key={v} value={v} className="data-[state=active]:bg-purple-700 text-purple-200 text-xs whitespace-nowrap">
                <Icon className="w-3 h-3 mr-1" />{label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="bg-black/20 border border-purple-700/20 rounded-xl p-4 mt-2">
          <TabsContent value="roster">
            <RosterPanel league={league} participants={participants} isOrganizer={isOrganizer} onAddPlayer={onAddPlayer} />
          </TabsContent>
          <TabsContent value="schedule">
            <SchedulePanel league={league} participants={participants} />
          </TabsContent>
          <TabsContent value="standings">
            <StandingsPanel participants={participants} />
          </TabsContent>
          <TabsContent value="stats">
            <SPStatTemplatePanel league={league} />
          </TabsContent>
          <TabsContent value="results">
            <ResultsPanel league={league} participants={participants} isOrganizer={isOrganizer} onVerifyWinner={onVerifyWinner} />
          </TabsContent>
          <TabsContent value="chat">
            <EventChat leagueTitle={league.title} />
          </TabsContent>
          <TabsContent value="rules">
            <div className="space-y-3 text-sm text-purple-200/70">
              <h4 className="font-bold text-white">Rules & Requirements</h4>
              {league.rules ? <p className="whitespace-pre-wrap">{league.rules}</p> : <p className="text-purple-400/40">No rules posted yet.</p>}
              {league.safety_requirements && (
                <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-3 mt-3">
                  <p className="text-xs text-yellow-400 font-medium mb-1"><AlertTriangle className="w-3 h-3 inline mr-1" />Safety Requirements</p>
                  <p className="text-xs text-yellow-300/70">{league.safety_requirements}</p>
                </div>
              )}
              {league.waiver_required && (
                <div className="bg-orange-900/20 border border-orange-700/30 rounded-lg p-3">
                  <p className="text-xs text-orange-400 font-medium">⚠️ Waiver Required — participants must sign a waiver before competing.</p>
                </div>
              )}
              {league.min_age && (
                <p className="text-xs text-purple-400/60">Minimum age: {league.min_age}+</p>
              )}
            </div>
          </TabsContent>
          <TabsContent value="prize">
            <div className="space-y-4">
              <div className="bg-purple-900/20 border border-purple-700/20 rounded-xl p-4 space-y-2 text-sm">
                <h4 className="font-bold text-white">Prize Details</h4>
                <p className="text-purple-300 font-semibold">{league.prize_title}</p>
                {league.prize_description && <p className="text-purple-200/60">{league.prize_description}</p>}
                <p className="text-yellow-300">Estimated value: {formatCents(league.prize_value_cents)}</p>
              </div>
              <div className="bg-pink-900/20 border border-pink-700/20 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-pink-400" />
                  <h4 className="font-bold text-white">North Pole Fund</h4>
                </div>
                <p className="text-pink-200/70">10% of the prize value is donated to The North Pole Fund — helping provide gifts for children.</p>
                <p className="text-pink-300 font-bold text-lg">{formatCents(league.north_pole_donation_cents)}</p>
                <p className="text-xs text-pink-400/50">Recorded upon prize fulfillment.</p>
              </div>
              <div className="space-y-2 text-xs text-purple-400/60">
                <div className="flex justify-between"><span>Prize value</span><span>{formatCents(league.prize_value_cents)}</span></div>
                <div className="flex justify-between"><span>Platform fees (~5%)</span><span>{formatCents(Math.ceil((league.prize_value_cents || 0) * 0.05))}</span></div>
                <div className="flex justify-between text-pink-300"><span>NP Fund donation (10%)</span><span>{formatCents(league.north_pole_donation_cents)}</span></div>
                <div className="flex justify-between font-bold text-white border-t border-purple-700/20 pt-2"><span>Total goal</span><span>{formatCents(league.total_goal_cents)}</span></div>
                <div className="flex justify-between"><span>Per participant entry</span><span>{formatCents(league.entry_amount_cents)}</span></div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
