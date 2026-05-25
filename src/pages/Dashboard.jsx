import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { User } from "@/entities/User";
import { Hinge } from "@/entities/Hinge";
import { Vision } from "@/entities/Vision";
import { HingeEvent } from "@/entities/HingeEvent";
import { CommunityPost } from "@/entities/CommunityPost";
import { createPageUrl } from "@/utils";
import {
  AlertCircle,
  ChevronRight,
  DoorOpen,
  Gift,
  LifeBuoy,
  Loader2,
  Mountain,
  Plus,
  ShieldCheck,
  Target,
  Trophy,
  User as UserIcon,
  Users,
  Zap,
} from "lucide-react";

import DivineAuraDisplay from "@/components/dashboard/DivineAuraDisplay";
import HallwayHomeScreen from "@/components/dashboard/HallwayHomeScreen";
import KarmaOverview from "@/components/dashboard/KarmaOverview";
import QuickHingeCreation from "@/components/dashboard/QuickHingeCreation";
import VisionBoard from "@/components/dashboard/VisionBoard";
import { MediaHero, VideoBackgroundCard, WorldFeatureCard, mediaImages } from "@/components/media/MediaPrimitives";

const actionCards = [
  {
    title: "North Pole",
    description: "Digital skill matches, prize paths, and The Poles Fund.",
    href: "/NorthPole",
    icon: Gift,
    image: mediaImages.northArena,
    mediaAccent: "gold",
    accent: "from-cyan-500/25 via-blue-500/15 to-purple-500/20",
    border: "border-cyan-300/25",
  },
  {
    title: "South Pole",
    description: "Leagues, real-world challenges, standings, and verified results.",
    href: "/SouthPole",
    icon: Mountain,
    image: mediaImages.southCourt,
    mediaAccent: "cyan",
    accent: "from-purple-500/25 via-fuchsia-500/15 to-cyan-500/15",
    border: "border-purple-300/25",
  },
  {
    title: "Create Skill Match",
    description: "Choose a game, set rules, and build a verified challenge.",
    href: createPageUrl("CreateMatch"),
    icon: Trophy,
    image: mediaImages.northPrize,
    mediaAccent: "gold",
    accent: "from-yellow-500/20 via-purple-500/15 to-cyan-500/15",
    border: "border-yellow-200/20",
  },
  {
    title: "Leagues",
    description: "Open seasons, teams, schedules, media, and reward tracking.",
    href: "/Leagues",
    icon: Users,
    image: mediaImages.southTeam,
    mediaAccent: "cyan",
    accent: "from-indigo-500/25 via-purple-500/15 to-blue-500/15",
    border: "border-indigo-300/25",
  },
  {
    title: "Profile",
    description: "Manage your player profile, security, wallet, and history.",
    href: createPageUrl("Profile"),
    icon: UserIcon,
    image: mediaImages.profileStudio,
    mediaAccent: "purple",
    accent: "from-blue-500/20 via-cyan-500/15 to-purple-500/15",
    border: "border-blue-300/25",
  },
  {
    title: "Support",
    description: "Send feedback, report issues, or get account help.",
    href: createPageUrl("ContactUs"),
    icon: LifeBuoy,
    image: mediaImages.fundGifts,
    mediaAccent: "rose",
    accent: "from-pink-500/20 via-purple-500/15 to-cyan-500/15",
    border: "border-pink-300/20",
  },
];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [hinges, setHinges] = useState([]);
  const [visions, setVisions] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showHingeCreation, setShowHingeCreation] = useState(false);
  const [error, setError] = useState(null);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const userData = await User.me();
      const userWithDefaults = {
        karma_points: 0,
        karma_level: "Seeker",
        vision_count: 0,
        completed_visions: 0,
        heaven_coin_balance: 0,
        access_role: "resident",
        aura_color: "purple",
        divine_aura_level: 0,
        ...userData,
      };

      setUser(userWithDefaults);

      const [hingesData, visionsData, eventsData, postsData] = await Promise.all([
        Hinge.filter({ owner_id: userWithDefaults.id }, "-updated_date").catch(() => []),
        Vision.filter({ created_by: userWithDefaults.email, status: "active" }, "-updated_date", 5).catch(() => []),
        HingeEvent.filter({ user_id: userWithDefaults.id }, "-created_date", 10).catch(() => []),
        CommunityPost.list("-created_date", 5).catch(() => []),
      ]);

      setHinges(hingesData);
      setVisions(visionsData);
      setRecentEvents(eventsData);
      setCommunityPosts(postsData);
    } catch (loadError) {
      console.error("Failed to load dashboard data:", loadError);
      setError("Unable to connect to servers. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleHingeCreated = () => {
    setShowHingeCreation(false);
    loadDashboardData();
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-transparent p-4 text-white sm:p-6">
        <div className="mx-auto max-w-7xl animate-pulse space-y-4">
          <div className="h-36 rounded-2xl border border-purple-300/15 bg-white/[0.05]" />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-36 rounded-2xl border border-white/10 bg-white/[0.05]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent p-4 text-white">
        <div className="max-w-md rounded-2xl border border-red-300/20 bg-red-950/20 p-6 text-center backdrop-blur-xl">
          <AlertCircle className="mx-auto mb-4 h-14 w-14 text-red-300" />
          <h2 className="text-2xl font-bold text-white">Connection Error</h2>
          <p className="mb-6 mt-2 text-purple-100/75">{error}</p>
          <button
            onClick={loadDashboardData}
            className="min-h-11 rounded-xl bg-purple-600 px-6 py-3 text-white transition-colors hover:bg-purple-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Connected Gateways", value: hinges.length, icon: DoorOpen, color: "text-blue-300" },
    { label: "Active Doors", value: hinges.filter((hinge) => hinge.status === "online" || hinge.status === "unlocked").length, icon: ShieldCheck, color: "text-green-300" },
    { label: "Active Visions", value: visions.length, icon: Target, color: "text-purple-300" },
    { label: "Recent Events", value: recentEvents.length, icon: Zap, color: "text-yellow-300" },
  ];

  return (
    <div className="relative min-h-screen bg-transparent text-white">
      <MediaHero
        eyebrow="Command Center"
        title="Step into the competition."
        description={`Welcome back, ${user.full_name || user.name || "Player"}. Choose a digital arena, join a real-world challenge, build your profile, and make every match point toward something bigger.`}
        image={mediaImages.northArena}
        badges={["Verified skill paths", "Prize rooms", "Mission-backed competition"]}
        primaryAction={{ href: "/NorthPole", label: "Enter North Pole" }}
        secondaryAction={{ href: "/SouthPole", label: "Find South Pole events" }}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-2xl border border-white/15 bg-black/38 p-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <DivineAuraDisplay user={user} />
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">Player identity</p>
                <p className="text-lg font-black text-white">{user.full_name || user.name || "Player"}</p>
              </div>
            </div>
          </div>
          <VideoBackgroundCard
            title="Purpose-built play"
            description="Prize rooms, leagues, and fund impact are grouped into one clear path from preparation to verified result."
            image={mediaImages.fundGifts}
            label="Mission reel"
            metric="Mission"
          />
        </div>
      </MediaHero>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-5 sm:px-6 md:px-8 md:py-8">
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {actionCards.map(({ title, description, href, icon: Icon, image, mediaAccent }) => (
            <WorldFeatureCard
              key={title}
              title={title}
              description={description}
              href={href}
              icon={Icon}
              image={image}
              accent={mediaAccent}
            />
          ))}
        </section>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <div className="rounded-2xl border border-blue-300/20 bg-white/[0.055] p-4 shadow-2xl shadow-blue-950/20 backdrop-blur-xl sm:p-6">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                  <DoorOpen className="h-5 w-5 text-blue-300" />
                  Gateway System
                </h3>
                <span className={`flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${hinges.length > 0 ? "border-green-700/40 bg-green-900/40 text-green-300" : "border-gray-700/40 bg-gray-800/60 text-gray-400"}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${hinges.length > 0 ? "bg-green-400" : "bg-gray-500"}`} />
                  {hinges.length > 0 ? "Online" : "No Devices"}
                </span>
              </div>

              <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {stats.map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="rounded-xl border border-white/10 bg-black/28 p-3 text-center">
                    <Icon className={`mx-auto mb-1 h-5 w-5 ${color}`} />
                    <div className={`text-2xl font-bold ${color}`}>{value}</div>
                    <div className="mt-0.5 text-xs text-purple-100/45">{label}</div>
                  </div>
                ))}
              </div>

              {recentEvents.length > 0 && (
                <div className="mb-4 rounded-xl border border-white/10 bg-black/24 p-3">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-purple-100/50">Recent Activity</p>
                  <div className="space-y-1.5">
                    {recentEvents.slice(0, 3).map((event, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs text-purple-100/70">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-300" />
                        <span className="truncate">{event.event_type || "Event"} - {event.device_id || "Unknown device"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Link to={createPageUrl("HingeControl")}>
                <button className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-700 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-900/30 transition-all hover:from-blue-500 hover:to-cyan-600">
                  <DoorOpen className="h-4 w-4" />
                  Open Gateway Control
                  <ChevronRight className="h-4 w-4" />
                </button>
              </Link>
            </div>

            <HallwayHomeScreen hinges={hinges} user={user} onHingeSelect={(hinge) => console.log("Selected hinge:", hinge)} />
            <VisionBoard visions={visions} />
          </div>

          <div className="space-y-6 lg:col-span-4">
            <KarmaOverview user={user} />
          </div>
        </div>
      </div>

      {showHingeCreation && (
        <QuickHingeCreation
          user={user}
          onClose={() => setShowHingeCreation(false)}
          onCreated={handleHingeCreated}
        />
      )}
    </div>
  );
}
