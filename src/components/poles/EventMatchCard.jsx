import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, MapPin, Heart, Clock } from "lucide-react";
import { formatCountdown, formatDate } from './demo-data';

const statusConfig = {
  open: { label: "Open", color: "bg-green-900/40 text-green-300 border-green-700/30" },
  active: { label: "Live Now 🔴", color: "bg-red-900/40 text-red-300 border-red-700/30" },
  coming_soon: { label: "Coming Soon", color: "bg-yellow-900/40 text-yellow-300 border-yellow-700/30" },
  completed: { label: "Completed", color: "bg-gray-800/40 text-gray-400 border-gray-700/30" },
};

export default function EventMatchCard({ item, onJoin, onViewDetails }) {
  const isPole = item.poleType === "north";
  const borderColor = isPole ? "border-purple-700/20 hover:border-purple-500/40" : "border-cyan-700/20 hover:border-cyan-500/40";
  const accentColor = isPole ? "from-purple-900/30 to-indigo-900/30 border-purple-700/20" : "from-cyan-900/30 to-teal-900/30 border-cyan-700/20";
  const btnColor = isPole ? "bg-purple-700 hover:bg-purple-600" : "bg-cyan-700 hover:bg-cyan-600";
  const poleLabel = isPole ? "🎅 North Pole" : "🧊 South Pole";
  const status = statusConfig[item.status] || statusConfig.open;
  const isFull = item.playersJoined >= item.playersNeeded;

  return (
    <div className={`bg-black/40 border ${borderColor} rounded-2xl overflow-hidden transition-all flex flex-col`}>
      {/* Prize image banner */}
      {item.prizeSnapshot?.image && (
        <div className="relative h-32 overflow-hidden">
          <img
            src={item.prizeSnapshot.image}
            alt={item.prizeSnapshot.title}
            className="w-full h-full object-cover"
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1549396535-c11d5c55b9df?w=400'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-2 left-3 right-3">
            <p className="text-white text-xs font-semibold truncate">🏆 {item.prizeSnapshot.title}</p>
            <p className="text-yellow-300 text-xs">${(item.prizeSnapshot.estimatedValue / 100).toFixed(2)} value</p>
          </div>
          <div className="absolute top-2 right-2">
            <Badge className={`${status.color} text-xs border`}>{status.label}</Badge>
          </div>
        </div>
      )}

      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Title + pole type */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-purple-400/60">{poleLabel}</span>
            <span className="text-xs text-purple-400/60">{item.eventType || item.gameType}</span>
          </div>
          <h4 className="font-bold text-white text-sm leading-tight">{item.title}</h4>
        </div>

        {/* Prize block */}
        <div className={`bg-gradient-to-r ${accentColor} border rounded-xl p-2.5 text-xs`}>
          <div className="flex items-center gap-2">
            <img
              src={item.prizeSnapshot?.image}
              alt={item.prizeSnapshot?.title}
              className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
              onError={e => { e.target.src = 'https://images.unsplash.com/photo-1549396535-c11d5c55b9df?w=60'; }}
            />
            <div className="min-w-0">
              <p className="text-white font-semibold truncate">{item.prizeSnapshot?.title}</p>
              <p className="text-purple-400/60">{item.prizeSnapshot?.category}</p>
            </div>
          </div>
        </div>

        {/* Meta info */}
        <div className="grid grid-cols-2 gap-1.5 text-xs text-purple-200/60">
          <div className="flex items-center gap-1.5">
            <Users className="w-3 h-3" />
            <span className={isFull ? "text-red-400" : ""}>{item.playersJoined}/{item.playersNeeded} players</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            <span>{formatCountdown(item.startDate)}</span>
          </div>
          {item.location && (
            <div className="flex items-center gap-1.5 col-span-2">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{item.location}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 col-span-2">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(item.startDate)}</span>
          </div>
        </div>

        {/* Entry + donation */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-green-300 font-semibold">Entry: {item.entryContribution}</span>
          {item.donation && (
            <span className="flex items-center gap-1 text-pink-300">
              <Heart className="w-3 h-3" /> {item.donation} → NP Fund
            </span>
          )}
        </div>

        <p className="text-xs text-purple-400/50">Host: {item.hostName}</p>

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <Button
            size="sm"
            className={`flex-1 ${btnColor} text-white text-xs`}
            disabled={isFull || item.status === "completed"}
            onClick={() => onJoin && onJoin(item)}
          >
            {isFull ? "Full" : item.status === "active" ? "Join Live" : "Join"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-purple-700/40 text-purple-300 text-xs"
            onClick={() => onViewDetails && onViewDetails(item)}
          >
            Details
          </Button>
        </div>
      </div>
    </div>
  );
}