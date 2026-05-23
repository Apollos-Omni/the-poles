import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Trophy, Gamepad2, Edit3, Share2, MapPin, CheckCircle } from "lucide-react";

export default function ProfileHeader({ user, profile, onEdit }) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const initials = (profile?.displayName || user?.full_name || "?")
    .split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="bg-gradient-to-br from-purple-900/30 via-black/60 to-indigo-900/20 border border-purple-700/30 rounded-2xl overflow-hidden">
      {/* Cover band */}
      <div className="h-24 bg-gradient-to-r from-purple-800/40 via-indigo-700/30 to-cyan-800/20" />

      <div className="px-5 pb-5">
        {/* Avatar + actions row */}
        <div className="flex items-end justify-between -mt-10 mb-4 flex-wrap gap-3">
          <div className="relative">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt="avatar"
                className="w-20 h-20 rounded-2xl object-cover border-4 border-black"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-black border-4 border-black">
                {initials}
              </div>
            )}
            {profile?.verified && (
              <CheckCircle className="absolute -bottom-1 -right-1 w-5 h-5 text-blue-400 bg-black rounded-full" />
            )}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleShare}
              className="border-purple-700/40 text-purple-300 text-xs"
            >
              <Share2 className="w-3 h-3 mr-1" />
              {copied ? 'Copied!' : 'Share'}
            </Button>
            <Button
              size="sm"
              onClick={onEdit}
              className="bg-purple-700 hover:bg-purple-600 text-white text-xs"
            >
              <Edit3 className="w-3 h-3 mr-1" /> Edit Profile
            </Button>
          </div>
        </div>

        {/* Name + username */}
        <h2 className="text-2xl font-black text-white leading-tight">
          {profile?.displayName || user?.full_name || "Poles Player"}
        </h2>
        {profile?.username && (
          <p className="text-purple-400/70 text-sm">@{profile.username}</p>
        )}

        {/* Location + bio */}
        {profile?.location && (
          <div className="flex items-center gap-1 mt-1 text-purple-400/60 text-xs">
            <MapPin className="w-3 h-3" /> {profile.location}
          </div>
        )}
        {profile?.bio && (
          <p className="text-purple-200/70 text-sm mt-2 leading-relaxed">{profile.bio}</p>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge className="bg-yellow-900/30 text-yellow-300 border-yellow-700/30 text-xs">
            <Star className="w-3 h-3 mr-1 text-yellow-400 fill-yellow-400" />
            {profile?.hostRating || "4.6"} Host Rating
          </Badge>
          <Badge className="bg-green-900/30 text-green-300 border-green-700/30 text-xs">
            <Trophy className="w-3 h-3 mr-1" />
            {profile?.wins || 4} Wins
          </Badge>
          <Badge className="bg-red-900/30 text-red-300 border-red-700/30 text-xs">
            {profile?.losses || 7} Losses
          </Badge>
          <Badge className="bg-purple-900/30 text-purple-300 border-purple-700/30 text-xs">
            <Gamepad2 className="w-3 h-3 mr-1" />
            {(profile?.wins || 4) + (profile?.losses || 7)} Games
          </Badge>
          <Badge className="bg-indigo-900/30 text-indigo-300 border-indigo-700/30 text-xs">
            🏆 {profile?.prizesWon?.length || 2} Prizes Won
          </Badge>
        </div>
      </div>
    </div>
  );
}