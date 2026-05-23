import React, { useState, useEffect, useCallback } from "react";
import { User } from "@/entities/User";
import { Hinge } from "@/entities/Hinge";
import { Vision } from "@/entities/Vision";
import { HingeEvent } from "@/entities/HingeEvent";
import { CommunityPost } from "@/entities/CommunityPost";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Sparkles, 
  DoorOpen,
  Target, 
  TrendingUp,
  Users,
  Crown,
  Zap,
  Activity,
  ChevronRight,
  Plus,
  Eye,
  Hexagon,
  AlertCircle
} from "lucide-react";

import HallwayHomeScreen from "../components/dashboard/HallwayHomeScreen";
import DivineAuraDisplay from "../components/dashboard/DivineAuraDisplay";
import VisionBoard from "../components/dashboard/VisionBoard";
import KarmaOverview from "../components/dashboard/KarmaOverview";
import QuickHingeCreation from "../components/dashboard/QuickHingeCreation";

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
        karma_level: 'Seeker',
        vision_count: 0,
        completed_visions: 0,
        heaven_coin_balance: 0,
        access_role: 'resident',
        aura_color: 'purple',
        divine_aura_level: 0,
        ...userData,
      };
      
      setUser(userWithDefaults);
      
      setHinges([]);
      setVisions([]);
      setRecentEvents([]);
      setCommunityPosts([]);

      const [hingesData, visionsData, eventsData, postsData] = await Promise.all([
        Hinge.filter({ owner_id: userWithDefaults.id }, '-updated_date').catch(() => []),
        Vision.filter({ created_by: userWithDefaults.email, status: 'active' }, '-updated_date', 5).catch(() => []),
        HingeEvent.filter({ user_id: userWithDefaults.id }, '-created_date', 10).catch(() => []),
        CommunityPost.list('-created_date', 5).catch(() => [])
      ]);

      setHinges(hingesData);
      setVisions(visionsData);
      setRecentEvents(eventsData);
      setCommunityPosts(postsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Unable to connect to servers. Please try again.');
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

  const handleRetry = () => {
    loadDashboardData();
  };

  // Loading state with skeleton
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-20 bg-purple-900/20 rounded-2xl mb-8"></div>
            <div className="grid gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-purple-700/30">
                  <div className="h-32 bg-purple-900/20 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white p-6 flex items-center justify-center">
        <div className="max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-white">Connection Error</h2>
          <p className="text-purple-200/80 mb-6">{error}</p>
          <button 
            onClick={handleRetry}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white relative">
      {/* Sacred Header */}
      <div className="relative p-6 md:p-8 border-b border-purple-700/30 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-black/40 to-purple-900/20"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <DivineAuraDisplay user={user} />
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 via-white to-purple-300 bg-clip-text text-transparent">
                  HeavenOS Portal
                </h1>
                <p className="text-purple-200/80">
                  Welcome to your divine realm, {user.full_name || 'Seeker'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowHingeCreation(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full hover:from-purple-500 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 backdrop-blur-sm border border-purple-500/30"
              >
                <Plus className="w-5 h-5" />
                Manifest Gateway
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-8">
        {/* Main Dashboard Grid */}
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column - Hallway & Primary Interface */}
          <div className="lg:col-span-8 space-y-8">
            {/* System Overview Card */}
            <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-blue-700/30 p-6 hover:border-blue-500/50 transition-all duration-500">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
                  <DoorOpen className="w-5 h-5 text-blue-400" />
                  Divine Hinge System
                </h3>
                <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${hinges.length > 0 ? 'bg-green-900/40 text-green-300 border border-green-700/40' : 'bg-gray-800/60 text-gray-400 border border-gray-700/40'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${hinges.length > 0 ? 'bg-green-400' : 'bg-gray-500'}`}></span>
                  {hinges.length > 0 ? 'Online' : 'No Devices'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {[
                  { label: "Connected Gateways", value: hinges.length, icon: "🔗", color: "text-blue-300" },
                  { label: "Active Doors", value: hinges.filter(h => h.status === 'online' || h.status === 'unlocked').length, icon: "🚪", color: "text-green-300" },
                  { label: "Active Visions", value: visions.length, icon: "🎯", color: "text-purple-300" },
                  { label: "Recent Events", value: recentEvents.length, icon: "⚡", color: "text-yellow-300" },
                ].map(stat => (
                  <div key={stat.label} className="bg-black/30 border border-white/5 rounded-xl p-3 text-center">
                    <div className="text-xl mb-1">{stat.icon}</div>
                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>

              {recentEvents.length > 0 && (
                <div className="mb-4 bg-black/20 border border-white/5 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">Recent Activity</p>
                  <div className="space-y-1.5">
                    {recentEvents.slice(0, 3).map((evt, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></span>
                        <span className="truncate">{evt.event_type || 'Event'} — {evt.device_id || 'Unknown device'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Link to={createPageUrl("HingeControl")}>
                <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-xl text-white text-sm font-medium transition-all duration-200 shadow-md shadow-blue-900/30">
                  <DoorOpen className="w-4 h-4" />
                  Open Gateway Control
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </div>

            <HallwayHomeScreen hinges={hinges} user={user} onHingeSelect={(hinge) => console.log('Selected hinge:', hinge)} />
            <VisionBoard visions={visions} />
          </div>

          {/* Right Column - Karma & Community */}
          <div className="lg:col-span-4 space-y-8">
            <KarmaOverview user={user} />
            
          </div>
        </div>
      </div>

      {/* Quick Hinge Creation Modal */}
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