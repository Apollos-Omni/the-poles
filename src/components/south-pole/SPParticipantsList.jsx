import React from "react";
import { Users, Star, Trophy, MessageSquare, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCents } from "./SPConstants";

export default function SPParticipantsList({ challenge, participants, onJoin, currentUserId, isLoading }) {
  const isJoined = participants.some(p => p.user_id === currentUserId);
  const isFull = participants.filter(p => p.payment_status === "confirmed").length >= (challenge.num_participants_needed || 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-400" />
          Competitors ({participants.length} / {challenge.num_participants_needed})
        </h3>
        {!isJoined && !isFull && ["open","funding_in_progress"].includes(challenge.status) && (
          <Button onClick={onJoin} disabled={isLoading}
            className="bg-cyan-700 hover:bg-cyan-600 text-white text-sm h-8">
            <Trophy className="w-3.5 h-3.5 mr-1.5" /> Join Challenge
          </Button>
        )}
        {isFull && !isJoined && <span className="text-xs text-orange-400 font-medium">Challenge Full</span>}
        {isJoined && <span className="text-xs text-green-400 font-medium">✅ You're in!</span>}
      </div>

      {participants.length === 0 ? (
        <div className="text-center py-8">
          <Users className="w-10 h-10 text-cyan-700/40 mx-auto mb-2" />
          <p className="text-sm text-cyan-400/50">No competitors yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {participants.map((p, i) => (
            <div key={p.id} className="flex items-center justify-between bg-black/20 border border-cyan-700/20 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-600 to-teal-600 flex items-center justify-center text-sm font-bold text-white">
                  {p.display_name?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <p className="font-medium text-white text-sm flex items-center gap-1.5">
                    {p.display_name}
                    {p.is_winner && <span className="text-yellow-400 text-xs">🏆 Winner</span>}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {(p.skill_tags || []).map(t => (
                      <span key={t} className="text-xs bg-teal-900/30 text-teal-300 px-1.5 py-0.5 rounded-full border border-teal-700/30">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className={`px-2 py-0.5 rounded-full border ${p.payment_status === "confirmed" ? "bg-green-900/30 text-green-300 border-green-700/30" : "bg-yellow-900/30 text-yellow-300 border-yellow-700/30"}`}>
                  {p.payment_status === "confirmed" ? "Paid" : "Pending"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}