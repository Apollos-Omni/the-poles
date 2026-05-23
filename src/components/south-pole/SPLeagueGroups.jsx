import React, { useState } from "react";
import { Users, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const GROUPS = [
  { id: "basketball", label: "🏀 Basketball", count: 0, desc: "Pickup games, leagues, tournaments" },
  { id: "football", label: "🏈 Football", count: 0, desc: "Flag football, tackle, fantasy" },
  { id: "soccer", label: "⚽ Soccer", count: 0, desc: "Outdoor and indoor leagues" },
  { id: "pool", label: "🎱 Pool / Billiards", count: 0, desc: "8-ball, 9-ball, tournaments" },
  { id: "bowling", label: "🎳 Bowling", count: 0, desc: "League nights and competitions" },
  { id: "video_games", label: "🎮 Video Games", count: 0, desc: "Online tournaments and local matchups" },
  { id: "chess", label: "♟️ Chess", count: 0, desc: "Rated games, speed chess, club play" },
  { id: "fitness", label: "💪 Fitness Challenges", count: 0, desc: "5K, HIIT, lifting, endurance" },
  { id: "sf_local", label: "📍 Local SF Events", count: 0, desc: "San Francisco area challenges and meetups" },
  { id: "youth", label: "👦 Youth Sports", count: 0, desc: "Under-18 leagues and events" },
  { id: "adult", label: "🧑 Adult Leagues", count: 0, desc: "21+ competitive leagues" },
  { id: "trivia", label: "🧠 Trivia Night", count: 0, desc: "Pub trivia, team trivia, championships" },
  { id: "cooking", label: "🍳 Cooking", count: 0, desc: "Battle nights, baking contests, cook-offs" },
  { id: "dance", label: "💃 Dance", count: 0, desc: "Battles, showcases, style competitions" },
  { id: "fishing", label: "🎣 Fishing", count: 0, desc: "Local tournaments, catch & release" },
  { id: "outdoor", label: "🏕️ Outdoor Adventures", count: 0, desc: "Hiking, kayaking, obstacle races" },
  { id: "running", label: "🏃 Running", count: 0, desc: "5K, 10K, relay, track events" },
  { id: "golf", label: "⛳ Golf", count: 0, desc: "Stroke play, match play, scrambles" },
  { id: "general", label: "✨ General", count: 0, desc: "All categories and custom challenges" },
];

export default function SPLeagueGroups({ onGroupSelect, selectedGroup }) {
  const [search, setSearch] = useState("");

  const filtered = GROUPS.filter(g =>
    !search || g.label.toLowerCase().includes(search.toLowerCase()) || g.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/40" />
        <Input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search groups..." className="bg-black/40 border-purple-700/40 text-white pl-9 text-sm" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {filtered.map(g => (
          <button
            key={g.id}
            onClick={() => onGroupSelect(selectedGroup === g.id ? null : g.id)}
            className={`w-full text-left p-3 rounded-xl border transition-all ${
              selectedGroup === g.id
                ? "bg-purple-900/40 border-purple-500 text-white"
                : "bg-black/30 border-purple-700/30 text-purple-300 hover:border-purple-500/60 hover:bg-purple-900/20"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">{g.label}</span>
              <span className="flex items-center gap-1 text-xs text-purple-400/50">
                <Users className="w-3 h-3" />{g.count}
              </span>
            </div>
            <p className="text-xs text-purple-400/50 mt-0.5">{g.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}