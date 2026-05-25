import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Trophy,
  Gamepad2,
  Edit3,
  Share2,
  MapPin,
  CheckCircle,
  Link as LinkIcon,
  Radio,
  Clapperboard,
  Users,
} from "lucide-react";
import { mediaImages } from "@/components/media/MediaPrimitives";

export default function ProfileHeader({ user, profile, onEdit }) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const initials = (profile?.displayName || user?.full_name || "?")
    .split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const displayName = profile?.displayName || user?.full_name || "Poles Player";
  const avatarUrl = profile?.avatarUrl || profile?.avatar_url;
  const bannerUrl = profile?.bannerUrl || profile?.banner_url || mediaImages.profileStudio;
  const wins = profile?.wins || 4;
  const losses = profile?.losses || 7;
  const prizesWon = profile?.prizesWon?.length || 2;
  const profileLinks = Array.isArray(profile?.creator_links)
    ? profile.creator_links
    : Array.isArray(profile?.links)
      ? profile.links
      : ["Twitch", "YouTube", "Instagram"];
  const links = profileLinks.slice(0, 4);

  return (
    <div className="overflow-hidden rounded-2xl border border-purple-700/30 bg-gradient-to-br from-purple-900/30 via-black/60 to-indigo-900/20 shadow-2xl shadow-purple-950/30">
      <div className="relative h-44 sm:h-56">
        <img
          src={bannerUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />
        <div className="absolute bottom-4 left-5 right-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/55">Promotion hub</p>
            <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">{displayName}</h2>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleShare}
              className="border-white/25 bg-black/35 text-xs text-white hover:bg-white/10"
            >
              <Share2 className="mr-1 h-3 w-3" />
              {copied ? 'Copied!' : 'Share'}
            </Button>
            <Button
              size="sm"
              onClick={onEdit}
              className="bg-purple-700 text-xs text-white hover:bg-purple-600"
            >
              <Edit3 className="mr-1 h-3 w-3" /> Edit
            </Button>
          </div>
        </div>
      </div>

      <div className="px-5 pb-5">
        <div className="-mt-12 mb-4 flex flex-wrap items-end justify-between gap-3">
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-24 w-24 rounded-2xl border-4 border-black object-cover shadow-xl shadow-black/40"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-black bg-gradient-to-br from-purple-500 to-indigo-600 text-2xl font-black text-white shadow-xl shadow-black/40">
                {initials}
              </div>
            )}
            {profile?.verified && (
              <CheckCircle className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-black text-blue-400" />
            )}
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: "Wins", value: wins },
              { label: "Losses", value: losses },
              { label: "Prizes", value: prizesWon },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2">
                <p className="text-lg font-black text-white">{item.value}</p>
                <p className="text-[11px] text-white/45">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {profile?.username && (
          <p className="text-sm text-purple-400/70">@{profile.username}</p>
        )}

        {profile?.location && (
          <div className="mt-1 flex items-center gap-1 text-xs text-purple-400/60">
            <MapPin className="h-3 w-3" /> {profile.location}
          </div>
        )}
        {profile?.bio && (
          <p className="mt-2 text-sm leading-relaxed text-purple-200/70">{profile.bio}</p>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          <Badge className="border-yellow-700/30 bg-yellow-900/30 text-xs text-yellow-300">
            <Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
            {profile?.hostRating || "4.6"} Host Rating
          </Badge>
          <Badge className="border-green-700/30 bg-green-900/30 text-xs text-green-300">
            <Trophy className="mr-1 h-3 w-3" />
            {wins} Wins
          </Badge>
          <Badge className="border-red-700/30 bg-red-900/30 text-xs text-red-300">
            {losses} Losses
          </Badge>
          <Badge className="border-purple-700/30 bg-purple-900/30 text-xs text-purple-300">
            <Gamepad2 className="mr-1 h-3 w-3" />
            {wins + losses} Games
          </Badge>
          <Badge className="border-indigo-700/30 bg-indigo-900/30 text-xs text-indigo-300">
            {prizesWon} Prizes Won
          </Badge>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            { icon: Radio, title: "Created prize rooms", value: profile?.created_rooms || "3 active" },
            { icon: Clapperboard, title: "Highlight clips", value: profile?.highlight_clips || "Ready to post" },
            { icon: Users, title: "Leagues supported", value: profile?.leagues_supported || "2 communities" },
          ].map(({ icon: Icon, title, value }) => (
            <div key={title} className="rounded-xl border border-white/10 bg-black/28 p-3">
              <Icon className="mb-2 h-4 w-4 text-cyan-200" />
              <p className="text-xs font-semibold uppercase tracking-wide text-white/45">{title}</p>
              <p className="mt-1 text-sm font-bold text-white">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {links.map((link) => (
            <span key={typeof link === "string" ? link : link.label || link.url} className="inline-flex min-h-9 items-center gap-2 rounded-full border border-cyan-200/15 bg-cyan-400/10 px-3 text-xs font-semibold text-cyan-100">
              <LinkIcon className="h-3.5 w-3.5" />
              {typeof link === "string" ? link : link.label || link.url}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
