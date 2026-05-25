import React from "react";
import { Users, MapPin, Calendar, ChevronRight, Globe, Lock } from "lucide-react";
import { CATEGORIES, PRIZE_TYPES, formatCents } from "./SPConstants";
import SPStatusBadge from "./SPStatusBadge";
import SPFundingBar from "./SPFundingBar";
import { mediaImages } from "@/components/media/MediaPrimitives";

export default function SPChallengeCard({ challenge, onClick }) {
  const cat = CATEGORIES.find(c => c.value === challenge.category);
  const pt = PRIZE_TYPES.find(p => p.value === challenge.prize_type);
  const goal = challenge.total_goal_cents || 0;
  const funded = challenge.total_funded_cents || 0;
  const pct = goal > 0 ? Math.min(100, Math.round((funded / goal) * 100)) : 0;
  const spotsLeft = Math.max(0, (challenge.num_participants_needed || 0) - (challenge.current_participants || 0));

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-black/30 border border-cyan-700/30 rounded-2xl overflow-hidden hover:border-cyan-500/50 hover:bg-cyan-900/10 transition-all group"
    >
      {challenge.cover_image_url ? (
        <img src={challenge.cover_image_url} alt="" loading="lazy" decoding="async" className="w-full h-32 object-cover" />
      ) : (
        <div className="relative h-32 overflow-hidden">
          <img src={mediaImages.southCourt} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover opacity-70 transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-cyan-950/20 to-transparent" />
          <div className="absolute bottom-3 left-3 rounded-full border border-cyan-200/20 bg-black/45 px-3 py-1 text-xs font-bold text-cyan-100">
            {cat?.label || "Competition"}
          </div>
        </div>
      )}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-bold text-white truncate group-hover:text-cyan-300 transition-colors">{challenge.title}</h3>
            <p className="text-sm text-cyan-400/70 truncate">{challenge.prize_title}</p>
          </div>
          <SPStatusBadge status={challenge.status} />
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <span className="bg-cyan-900/30 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-700/30">{cat?.label || challenge.category}</span>
          <span className="bg-teal-900/30 text-teal-300 px-2 py-0.5 rounded-full border border-teal-700/30">{pt?.label || challenge.prize_type}</span>
          {challenge.is_online ? (
            <span className="flex items-center gap-1 text-blue-300"><Globe className="w-3 h-3" /> Online</span>
          ) : challenge.location ? (
            <span className="flex items-center gap-1 text-purple-300"><MapPin className="w-3 h-3" />{challenge.location}</span>
          ) : null}
          {challenge.is_public ? null : <span className="flex items-center gap-1 text-gray-400"><Lock className="w-3 h-3" /> Private</span>}
        </div>

        <SPFundingBar challenge={challenge} />

        <div className="flex items-center justify-between text-xs text-cyan-400/60">
          <span className="flex items-center gap-1"><Users className="w-3 h-3" />
            {spotsLeft > 0 ? `Needs ${spotsLeft} more competitor${spotsLeft !== 1 ? "s" : ""}` : "Full!"}
          </span>
          <span className="flex items-center gap-1 text-cyan-500 font-medium">
            {formatCents(challenge.entry_amount_cents)} entry <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </button>
  );
}
