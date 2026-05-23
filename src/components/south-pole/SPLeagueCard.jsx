import React from "react";
import { Users, MapPin, Calendar, Trophy, ChevronRight, Globe, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCents } from "./SPConstants";

const FORMAT_LABELS = {
  single_event: "Single Event",
  tournament: "Tournament",
  round_robin: "Round Robin",
  league_season: "League Season",
  playoff: "Playoffs",
};

const STATUS_COLORS = {
  draft: "bg-gray-500/20 text-gray-300 border-gray-600/30",
  open: "bg-blue-500/20 text-blue-300 border-blue-600/30",
  registration_closed: "bg-yellow-500/20 text-yellow-300 border-yellow-600/30",
  active: "bg-purple-500/20 text-purple-300 border-purple-600/30",
  awaiting_results: "bg-orange-500/20 text-orange-300 border-orange-600/30",
  completed: "bg-teal-500/20 text-teal-300 border-teal-600/30",
  cancelled: "bg-red-500/20 text-red-300 border-red-600/30",
};

export default function SPLeagueCard({ league, onClick }) {
  const spotsLeft = Math.max(0, (league.max_participants || 0) - (league.registered_count || 0));
  const statusCls = STATUS_COLORS[league.status] || STATUS_COLORS.draft;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-black/30 border border-purple-700/30 rounded-2xl overflow-hidden hover:border-purple-500/50 hover:bg-purple-900/10 transition-all group"
    >
      <div className="w-full h-20 bg-gradient-to-br from-purple-900/40 to-indigo-900/40 flex items-center justify-center text-4xl">
        {league.sport_emoji || "🏆"}
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-bold text-white truncate group-hover:text-purple-300 transition-colors">{league.title}</h3>
            <p className="text-sm text-purple-400/70 truncate">{league.prize_title}</p>
          </div>
          <Badge className={`${statusCls} text-xs shrink-0 border`}>
            {league.status?.replace(/_/g, " ")}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <span className="bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded-full border border-purple-700/30">
            {FORMAT_LABELS[league.format] || league.format}
          </span>
          <span className="bg-indigo-900/30 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-700/30">
            {league.sport_type}
          </span>
          {league.is_online ? (
            <span className="flex items-center gap-1 text-blue-300"><Globe className="w-3 h-3" /> Online</span>
          ) : league.location ? (
            <span className="flex items-center gap-1 text-pink-300"><MapPin className="w-3 h-3" />{league.location}</span>
          ) : null}
        </div>

        <div className="flex items-center justify-between text-xs text-purple-400/60">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {spotsLeft > 0 ? `${spotsLeft} spots left` : "Full"} / {league.max_participants}
          </span>
          {league.start_date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(league.start_date).toLocaleDateString()}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-pink-300 flex items-center gap-1">
            <Trophy className="w-3 h-3" /> {formatCents(league.prize_value_cents)}
          </span>
          <span className="flex items-center gap-1 text-purple-500 font-medium">
            {formatCents(league.entry_amount_cents)} entry <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </button>
  );
}