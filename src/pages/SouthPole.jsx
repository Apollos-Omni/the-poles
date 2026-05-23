import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trophy, Plus, Search, Globe, Shield, Heart, Loader2, Compass, Star, Zap, AlertTriangle, Filter, Mountain, Layers, Users } from "lucide-react";
import SPChallengeCard from "@/components/south-pole/SPChallengeCard";
import SPChallengeDetail from "@/components/south-pole/SPChallengeDetail";
import SPCreateChallengeForm from "@/components/south-pole/SPCreateChallengeForm";
import SPAdminPanel from "@/components/south-pole/SPAdminPanel";
import SPLeagueCard from "@/components/south-pole/SPLeagueCard";
import SPCreateLeagueForm from "@/components/south-pole/SPCreateLeagueForm";
import SPLeagueDashboard from "@/components/south-pole/SPLeagueDashboard";
import SPLeagueGroups from "@/components/south-pole/SPLeagueGroups";
import { CATEGORIES, formatCents } from "@/components/south-pole/SPConstants";
import SPRewardLinkChips from "@/components/south-pole/SPRewardLinkChips";

function NorthPoleImpactPanel({ challenges }) {
  const totalDonation = challenges.reduce((s, c) => s + (c.north_pole_donation_cents || 0), 0);
  const completed = challenges.filter(c => c.status === "completed").length;
  const active = challenges.filter(c => ["open","funding_in_progress","fully_funded","scheduled","active"].includes(c.status)).length;

  return (
    <div className="bg-gradient-to-r from-pink-900/20 to-red-900/20 border border-pink-700/30 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Heart className="w-5 h-5 text-pink-400" />
        <h3 className="font-bold text-white">North Pole Fund Impact</h3>
      </div>
      <p className="text-sm text-pink-300/70 mb-4">
        10% of every South Pole Challenge prize value is donated to The North Pole Fund — turning competition into gifts for children.
      </p>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-2xl font-bold text-pink-300">{formatCents(totalDonation)}</p>
          <p className="text-xs text-pink-400/60">Total Donated</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{completed}</p>
          <p className="text-xs text-pink-400/60">Challenges Completed</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-cyan-300">{active}</p>
          <p className="text-xs text-pink-400/60">Active Now</p>
        </div>
      </div>
    </div>
  );
}

export default function SouthPole() {
  const [tab, setTab] = useState("browse");
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [currentUser, setCurrentUser] = useState(null);

  // League / event organizer state
  const [leagues, setLeagues] = useState([]);
  const [creatingLeague, setCreatingLeague] = useState(false);
  const [leagueCreateLoading, setLeagueCreateLoading] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [leagueParticipants, setLeagueParticipants] = useState([]);
  const [groupFilter, setGroupFilter] = useState(null);
  const [leagueSearch, setLeagueSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const [all, user] = await Promise.all([
      base44.entities.SouthPoleChallenge.list("-created_date", 100),
      base44.auth.me().catch(() => null),
    ]);
    const withCounts = all.map(c => ({ ...c, current_participants: 0 }));
    setChallenges(withCounts);
    setCurrentUser(user);
    setLoading(false);
  };

  const loadLeagues = async () => {
    try {
      const all = await base44.entities.SouthPoleChallenge.filter({ category: "__league__" }, "-created_date", 100).catch(() => []);
      setLeagues(all);
    } catch { setLeagues([]); }
  };

  const handleCreateLeague = async (formData) => {
    setLeagueCreateLoading(true);
    const user = currentUser;
    const created = await base44.entities.SouthPoleChallenge.create({
      ...formData,
      category: formData.sport_type,
      prize_type: "community_funded",
      creator_user_id: user?.email || "anonymous",
      num_participants_needed: formData.max_participants,
      challenge_date: formData.start_date,
      is_public: formData.is_public,
      sandbox_mode: true,
      skill_tags: formData.group_tags,
    });
    setLeagueCreateLoading(false);
    setCreatingLeague(false);
    setSelectedLeague({ ...created, max_participants: formData.max_participants, format: formData.format, sport_emoji: formData.sport_emoji, host_name: formData.host_name });
    setLeagueParticipants([]);
  };

  useEffect(() => { load(); loadLeagues(); }, []);

  const handleCreate = async (formData) => {
    setCreateLoading(true);
    const count = challenges.length + 1;
    const challenge_id = `SPC-${String(count).padStart(4, "0")}`;
    const user = currentUser;
    const created = await base44.entities.SouthPoleChallenge.create({
      ...formData,
      challenge_id,
      creator_user_id: user?.email || "anonymous",
      status: "draft",
    });
    await base44.entities.SouthPoleEvent.create({
      challenge_id: created.id, event_type: "challenge_created",
      note: `Challenge "${formData.title}" created`,
    });
    await load();
    setCreating(false);
    setSelected({ ...created, current_participants: 0 });
    setCreateLoading(false);
  };

  const filteredChallenges = challenges.filter(c => {
    const matchSearch = !search || c.title?.toLowerCase().includes(search.toLowerCase()) || c.prize_title?.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "all" || c.category === catFilter;
    const isPublic = c.is_public !== false;
    return matchSearch && matchCat && isPublic && c.status !== "draft" || (c.creator_user_id === currentUser?.email);
  });

  const myChallengeDrafts = challenges.filter(c => c.creator_user_id === currentUser?.email && c.status === "draft");
  const myChallenges = challenges.filter(c => c.creator_user_id === currentUser?.email);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-cyan-950/30 to-black text-white">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-black via-cyan-900/20 to-teal-900/20 border-b border-cyan-700/20">
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 3}s` }} />
          ))}
        </div>
        <div className="relative max-w-5xl mx-auto px-4 py-10 md:py-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg shadow-cyan-900/50">
              <Mountain className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">The South Pole</h1>
              <p className="text-cyan-400 font-medium">Create the challenge. Find the competition. Win the experience.</p>
            </div>
          </div>
          <p className="text-cyan-200/60 text-sm max-w-2xl leading-relaxed">
            Real-world skill-based challenges for vacations, concerts, cruises, events, and experiences. Compete for what you want. Meet people who share your drive. 10% funds gifts for children.
          </p>
          <SPRewardLinkChips />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <Tabs value={tab} onValueChange={v => { setTab(v); setSelected(null); setCreating(false); }}>
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <div className="overflow-x-auto flex-1">
            <TabsList className="bg-black/40 border border-cyan-700/30 inline-flex min-w-max">
              <TabsTrigger value="browse" className="data-[state=active]:bg-cyan-700 text-cyan-200 text-xs sm:text-sm">
                <Compass className="w-4 h-4 mr-1.5" />Browse
              </TabsTrigger>
              <TabsTrigger value="leagues" className="data-[state=active]:bg-purple-700 text-purple-200 text-xs sm:text-sm">
                <Layers className="w-4 h-4 mr-1.5" />Leagues & Events
              </TabsTrigger>
              <TabsTrigger value="my_challenges" className="data-[state=active]:bg-cyan-700 text-cyan-200 text-xs sm:text-sm">
                <Star className="w-4 h-4 mr-1.5" />My Challenges
              </TabsTrigger>
              <TabsTrigger value="impact" className="data-[state=active]:bg-cyan-700 text-cyan-200 text-xs sm:text-sm">
                <Heart className="w-4 h-4 mr-1.5" />Impact
              </TabsTrigger>
              <TabsTrigger value="admin" className="data-[state=active]:bg-cyan-700 text-cyan-200 text-xs sm:text-sm">
                <Shield className="w-4 h-4 mr-1.5" />Admin
              </TabsTrigger>
            </TabsList>
          </div>
            {!creating && !selected && tab !== "leagues" && (
              <Button onClick={() => { setCreating(true); setTab("browse"); }}
                className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white shadow-lg">
                <Plus className="w-4 h-4 mr-2" /> Create Challenge
              </Button>
            )}
          </div>

          {/* BROWSE */}
          <TabsContent value="browse">
            {creating ? (
              <div className="bg-black/30 border border-cyan-700/30 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                  <Mountain className="w-5 h-5 text-cyan-400" /> New South Pole Challenge
                </h2>
                <SPCreateChallengeForm onSubmit={handleCreate} onCancel={() => setCreating(false)} isLoading={createLoading} />
              </div>
            ) : selected ? (
              <SPChallengeDetail
                challenge={selected}
                onBack={() => { setSelected(null); load(); }}
                currentUserId={currentUser?.email}
                isAdmin={currentUser?.role === "admin"}
              />
            ) : (
              <div className="space-y-4">
                {/* Search + filter */}
                <div className="flex gap-3 flex-wrap">
                  <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/40" />
                    <Input value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Search challenges..." className="bg-black/40 border-cyan-700/40 text-white pl-9" />
                  </div>
                  <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
                    className="bg-black/40 border border-cyan-700/40 rounded-lg px-3 py-2 text-white text-sm">
                    <option value="all">All Categories</option>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>

                {loading ? (
                  <div className="text-center py-16"><Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" /></div>
                ) : filteredChallenges.length === 0 ? (
                  <div className="text-center py-20 space-y-4">
                    <Mountain className="w-16 h-16 text-cyan-700/30 mx-auto" />
                    <p className="text-cyan-400/50 text-lg font-semibold">No challenges found</p>
                    <p className="text-cyan-400/30 text-sm">Be the first to create a South Pole Challenge!</p>
                    <Button onClick={() => setCreating(true)} className="bg-cyan-700 hover:bg-cyan-600 text-white">
                      <Plus className="w-4 h-4 mr-2" /> Create the First Challenge
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredChallenges.map(c => (
                      <SPChallengeCard key={c.id} challenge={c} onClick={() => setSelected(c)} />
                    ))}
                  </div>
                )}

                {/* Disclaimer */}
                <div className="bg-gray-900/40 border border-gray-700/30 rounded-xl p-4 mt-4">
                  <div className="flex gap-2 text-xs text-gray-400">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-300">Platform Disclaimer</p>
                      <p>The South Pole is a skill-based, performance-based competitive challenge platform. No random winner selection occurs. All challenges must comply with local laws, venue rules, age restrictions, travel restrictions, event ticket terms, safety requirements, and charitable contribution rules. Winners are determined solely by skill, performance, judging, scoring, or verified completion based on the rules stated before the challenge begins. 10% of each prize value is donated to The North Pole Fund. Platform approval is required for high-value prizes. This is currently in demo/sandbox mode.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* LEAGUES & EVENTS */}
          <TabsContent value="leagues">
            {selectedLeague ? (
              <SPLeagueDashboard
                league={selectedLeague}
                participants={leagueParticipants}
                onBack={() => { setSelectedLeague(null); setLeagueParticipants([]); }}
                isOrganizer={selectedLeague.creator_user_id === currentUser?.email || currentUser?.role === "admin"}
                onActivate={async () => {
                  await base44.entities.SouthPoleChallenge.update(selectedLeague.id, { status: "active" });
                  setSelectedLeague(l => ({ ...l, status: "active" }));
                }}
                onVerifyWinner={async ({ winner_id, notes, proof }) => {
                  const winner = leagueParticipants.find(p => p.id === winner_id);
                  await base44.entities.SouthPoleChallenge.update(selectedLeague.id, {
                    status: "winner_confirmed", winner_name: winner?.display_name || winner?.player_name, winner_notes: notes,
                  });
                  setSelectedLeague(l => ({ ...l, status: "winner_confirmed", winner_name: winner?.display_name || winner?.player_name, winner_notes: notes }));
                }}
                onAddPlayer={() => {}}
              />
            ) : creatingLeague ? (
              <div className="bg-black/30 border border-purple-700/30 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-400" /> Create League / Event
                </h2>
                <SPCreateLeagueForm
                  onSubmit={handleCreateLeague}
                  onCancel={() => setCreatingLeague(false)}
                  isLoading={leagueCreateLoading}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/40" />
                    <Input value={leagueSearch} onChange={e => setLeagueSearch(e.target.value)}
                      placeholder="Search leagues & events..." className="bg-black/40 border-purple-700/40 text-white pl-9" />
                  </div>
                  <Button onClick={() => setCreatingLeague(true)}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg">
                    <Plus className="w-4 h-4 mr-2" /> Create League / Event
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Groups sidebar */}
                  <div className="lg:col-span-1">
                    <h3 className="text-sm font-semibold text-purple-300/70 mb-2 flex items-center gap-1.5">
                      <Users className="w-4 h-4" /> Browse by Group
                    </h3>
                    <SPLeagueGroups onGroupSelect={setGroupFilter} selectedGroup={groupFilter} />
                  </div>

                  {/* League listings */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="bg-purple-900/20 border border-purple-700/20 rounded-xl p-4 text-center">
                      <Layers className="w-10 h-10 text-purple-700/40 mx-auto mb-2" />
                      <p className="text-purple-400/60 text-sm font-semibold">No leagues or events created yet.</p>
                      <p className="text-purple-400/30 text-xs mt-1">Be the first to organize a league, tournament, or local event!</p>
                      <Button onClick={() => setCreatingLeague(true)} className="mt-3 bg-purple-700 hover:bg-purple-600 text-white text-sm">
                        <Plus className="w-4 h-4 mr-1" /> Create the First Event
                      </Button>
                    </div>

                    <div className="bg-indigo-900/20 border border-indigo-700/20 rounded-xl p-4 space-y-2">
                      <h4 className="text-sm font-bold text-indigo-300">🏅 What is a South Pole League?</h4>
                      <div className="grid sm:grid-cols-2 gap-2 text-xs text-indigo-200/60">
                        {[
                          { icon: "🏆", text: "Tournaments — bracket-style elimination events" },
                          { icon: "📋", text: "Round Robins — everyone plays everyone" },
                          { icon: "📅", text: "League Seasons — multi-week standings" },
                          { icon: "🎯", text: "Single Events — one day, one winner" },
                          { icon: "🤝", text: "Team Events — organized by team or squad" },
                          { icon: "📍", text: "Local or online — you choose" },
                        ].map(item => (
                          <div key={item.text} className="flex items-start gap-2">
                            <span>{item.icon}</span>
                            <span>{item.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* MY CHALLENGES */}
          <TabsContent value="my_challenges">
            {selected ? (
              <SPChallengeDetail
                challenge={selected}
                onBack={() => { setSelected(null); load(); }}
                currentUserId={currentUser?.email}
                isAdmin={currentUser?.role === "admin"}
              />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-cyan-400/60">{myChallenges.length} challenge{myChallenges.length !== 1 ? "s" : ""} created by you</p>
                  <Button onClick={() => { setCreating(true); setTab("browse"); }} size="sm"
                    className="bg-cyan-700 hover:bg-cyan-600 text-white">
                    <Plus className="w-4 h-4 mr-1" /> New
                  </Button>
                </div>
                {loading ? (
                  <div className="text-center py-12"><Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" /></div>
                ) : myChallenges.length === 0 ? (
                  <div className="text-center py-16">
                    <Star className="w-12 h-12 text-cyan-700/30 mx-auto mb-3" />
                    <p className="text-cyan-400/50">You haven't created any challenges yet.</p>
                    <Button onClick={() => { setCreating(true); setTab("browse"); }} className="mt-4 bg-cyan-700 hover:bg-cyan-600 text-white">
                      <Plus className="w-4 h-4 mr-2" /> Create Your First Challenge
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myChallenges.map(c => (
                      <SPChallengeCard key={c.id} challenge={c} onClick={() => setSelected(c)} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* IMPACT */}
          <TabsContent value="impact">
            <div className="space-y-6">
              <NorthPoleImpactPanel challenges={challenges} />
              <div className="bg-black/30 border border-pink-700/20 rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-400" /> The Connection
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-purple-200/70">
                  <div className="bg-cyan-900/20 border border-cyan-700/20 rounded-xl p-4 space-y-2">
                    <h4 className="font-semibold text-cyan-300">🧊 The South Pole</h4>
                    <p>Real-world competitions. Skill challenges. Life experiences. Travel. Events. Adventure. People who want to compete for something meaningful.</p>
                  </div>
                  <div className="bg-blue-900/20 border border-blue-700/20 rounded-xl p-4 space-y-2">
                    <h4 className="font-semibold text-blue-300">🎅 The North Pole</h4>
                    <p>Gifts for children. Physical prizes. Family joy. Every South Pole Challenge donates 10% of its prize value to help make that possible.</p>
                  </div>
                </div>
                <p className="text-sm text-pink-300/60 italic text-center">
                  "The South Pole brings people together through competition. The North Pole turns that competition into gifts for children."
                </p>
              </div>

              <div className="bg-black/30 border border-teal-700/20 rounded-2xl p-5 space-y-3">
                <h3 className="font-bold text-white flex items-center gap-2"><Zap className="w-4 h-4 text-teal-400" /> Why Compete?</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  {[
                    { icon: "🤝", text: "Meet new people" },
                    { icon: "💪", text: "Prove yourself" },
                    { icon: "✈️", text: "Win experiences" },
                    { icon: "🔥", text: "Challenge your limits" },
                    { icon: "🌍", text: "Explore the world" },
                    { icon: "❤️", text: "Give back to kids" },
                  ].map(item => (
                    <div key={item.text} className="bg-teal-900/20 border border-teal-700/20 rounded-lg p-3 text-center">
                      <div className="text-xl mb-1">{item.icon}</div>
                      <p className="text-teal-300">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ADMIN */}
          <TabsContent value="admin">
            <SPAdminPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}