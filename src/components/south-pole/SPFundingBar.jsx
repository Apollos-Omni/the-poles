import React from "react";
import { Heart } from "lucide-react";
import { formatCents } from "./SPConstants";

export default function SPFundingBar({ challenge }) {
  const goal = challenge.total_goal_cents || 0;
  const funded = challenge.total_funded_cents || 0;
  const pct = goal > 0 ? Math.min(100, Math.round((funded / goal) * 100)) : 0;
  const donation = challenge.north_pole_donation_cents || 0;
  const remaining = Math.max(0, goal - funded);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-purple-300/70">
        <span>{formatCents(funded)} raised</span>
        <span>{formatCents(goal)} goal</span>
      </div>
      <div className="w-full bg-black/40 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className={`font-semibold ${pct >= 100 ? "text-green-400" : "text-purple-300"}`}>
          {pct >= 100 ? "✅ Fully Funded!" : `${pct}% funded · ${formatCents(remaining)} remaining`}
        </span>
        <span className="flex items-center gap-1 text-pink-400">
          <Heart className="w-3 h-3" />
          {formatCents(donation)} to North Pole Fund
        </span>
      </div>
    </div>
  );
}