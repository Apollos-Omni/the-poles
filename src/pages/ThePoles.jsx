import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Globe, Heart, Zap, Mountain, Gift,
  Gamepad2, UserCircle, Search, Plus, AlertTriangle,
  ShoppingBag, Menu, ChevronDown, Settings
} from "lucide-react";
import { MediaHero, MissionMediaCard, PrizeMediaCard, VideoBackgroundCard, WorldFeatureCard, mediaImages } from "@/components/media/MediaPrimitives";

import GameRoomTab from "@/components/poles/GameRoomTab";
import UserProfileTab from "@/components/poles/UserProfileTab";
import EventMatchCard from "@/components/poles/EventMatchCard";
import { DEMO_EVENTS, DEMO_MATCHES, PRIZE_CATEGORIES, DEMO_PRIZES } from "@/components/poles/demo-data";

// ─── Dropdown menu items ───────────────────────────────────────────────────────
const MENU_ITEMS = [
  { id: "home",     label: "🏠 Home" },
  { id: "prizes",   label: "🛍️ Prize Shop" },
  { id: "gameroom", label: "🎮 Game Room" },
  { id: "create",   label: "➕ Create" },
  { id: "profile",  label: "👤 Profile" },
  { id: "settings", label: "⚙️ Settings" },
];

// ─── Top Header with dropdown ──────────────────────────────────────────────────
function TopHeader({ activeTab, onNavigate }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const currentLabel = MENU_ITEMS.find(m => m.id === activeTab)?.label || "🏠 Home";

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-lg border-b border-purple-700/30">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Left: dropdown */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 bg-purple-900/40 hover:bg-purple-800/50 border border-purple-700/40 rounded-xl px-3 py-2 transition-all"
          >
            <Menu className="w-4 h-4 text-purple-300" />
            <span className="text-sm font-semibold text-white">{currentLabel}</span>
            <ChevronDown className={`w-4 h-4 text-purple-300 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>

          {open && (
            <div className="absolute top-full left-0 mt-2 w-52 bg-black/95 border border-purple-700/40 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
              {MENU_ITEMS.map(item => (
                <button
                  key={item.id}
                  onClick={() => { onNavigate(item.id); setOpen(false); }}
                  className={`w-full text-left px-4 py-3 text-sm font-medium transition-all hover:bg-purple-900/40 ${
                    activeTab === item.id ? 'bg-purple-800/50 text-purple-200' : 'text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Center: brand */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
            <Globe className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-white text-base tracking-tight">The Poles</span>
        </div>

        {/* Right: settings shortcut */}
        <button
          onClick={() => onNavigate('settings')}
          className="p-2 rounded-xl hover:bg-purple-900/40 transition-all"
        >
          <Settings className="w-5 h-5 text-purple-400" />
        </button>
      </div>
    </div>
  );
}

// ─── Screen components ─────────────────────────────────────────────────────────

function HomeScreen({ onCreateMatch, onNavigate }) {
  const allItems = [...DEMO_MATCHES, ...DEMO_EVENTS];
  const featured = allItems.slice(0, 4);

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-3xl border border-purple-700/20">
        <MediaHero
          eyebrow="The Poles"
          title="Enter the world of skill."
          description="Choose a prize, join a room, back a league, or promote a creator match. Every path should feel like a real stage for confidence, preparation, and verified performance."
          image={mediaImages.winnerMoment}
          badges={["Digital arenas", "Local leagues", "Prize rooms", "Mission progress"]}
        >
          <div className="space-y-3">
            <VideoBackgroundCard title="Featured room energy" description="Poster-style media keeps every match, prize, and event feeling alive before a player commits." image={mediaImages.northArena} label="World reel" metric="Live" />
            <div className="grid grid-cols-2 gap-3">
              <Button className="min-h-12 bg-purple-700 text-white hover:bg-purple-600" onClick={() => onCreateMatch('north')}>
                <Zap className="w-4 h-4 mr-1" /> North Match
              </Button>
              <Button className="min-h-12 bg-cyan-700 text-white hover:bg-cyan-600" onClick={() => onCreateMatch('south')}>
                <Mountain className="w-4 h-4 mr-1" /> South Event
              </Button>
            </div>
          </div>
        </MediaHero>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Active Matches", value: DEMO_MATCHES.filter(m => m.status === 'open').length, icon: "🎮" },
          { label: "Active Events", value: DEMO_EVENTS.filter(e => e.status === 'open').length, icon: "⚡" },
          { label: "Total Prize Value", value: "$280K+", icon: "🏆" },
          { label: "The Poles Fund", value: "Mission", icon: "❤️" },
        ].map(s => (
          <div key={s.label} className="bg-black/40 border border-purple-700/20 rounded-2xl p-4 text-center">
            <p className="text-2xl mb-1">{s.icon}</p>
            <p className="text-xl font-black text-white">{s.value}</p>
            <p className="text-xs text-purple-400/60">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Featured */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Featured Matches & Events</h2>
          <button onClick={() => onNavigate('gameroom')} className="text-xs text-purple-400 hover:text-purple-300">View All →</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {featured.map(item => <EventMatchCard key={item.id} item={item} />)}
        </div>
      </div>

      {/* Pole cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <WorldFeatureCard icon={Gift} title="North Pole prize rooms" description="Gaming setup, creator match nights, digital arena energy, and prize vaults for players ready to prove skill." image={mediaImages.northPrize} accent="gold" />
        <WorldFeatureCard icon={Mountain} title="South Pole leagues" description="Sports teams, courts, fields, local pride, brackets, training, and championship moments." image={mediaImages.southTeam} accent="cyan" />
      </div>

      {/* Legacy action cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-700/20 rounded-2xl p-5 space-y-3">
         <div className="flex items-center gap-2 mb-2">
           <span className="text-3xl">🎅</span>
           <h3 className="font-black text-white">The North Pole</h3>
         </div>
         <p className="text-purple-300/60 text-xs">Select your prize. Compete in a digital skill match based on preparation and performance. The verified winner takes the prize.</p>
          <div className="flex gap-2">
            <Link to="/NorthPole"><Button size="sm" className="bg-purple-700 hover:bg-purple-600 text-white text-xs">Browse Matches</Button></Link>
            <Link to="/NorthPole"><Button size="sm" variant="outline" className="border-purple-700/40 text-purple-300 text-xs">Shop & Create</Button></Link>
          </div>
        </div>
        <div className="bg-gradient-to-br from-cyan-900/20 to-teal-900/20 border border-cyan-700/20 rounded-2xl p-5 space-y-3">
         <div className="flex items-center gap-2 mb-2">
           <span className="text-3xl">🧊</span>
           <h3 className="font-black text-white">The South Pole</h3>
         </div>
         <p className="text-cyan-300/60 text-xs">Real-world skill competitions — races, tournaments, escape rooms, trivia nights, performances. Compete for vacations, experiences, and prizes.</p>
          <div className="flex gap-2">
            <Button size="sm" className="bg-cyan-700 hover:bg-cyan-600 text-white text-xs" onClick={() => onNavigate('gameroom')}>Browse Events</Button>
            <Link to="/SouthPole"><Button size="sm" variant="outline" className="border-cyan-700/40 text-cyan-300 text-xs">Full South Pole</Button></Link>
          </div>
        </div>
      </div>

      {/* Fund impact */}
      <MissionMediaCard
        title="The Poles Fund"
        description="Creator contributions across matches, events, and campaigns can support approved gift and growth categories without exposing private child information."
        image={mediaImages.fundGifts}
        points={["Approved gifts", "Books and tools", "Sports and art supplies", "Community service"]}
      />

      {/* Fund impact */}
      <div className="bg-gradient-to-r from-pink-900/20 to-rose-900/20 border border-pink-700/30 rounded-2xl p-5 flex items-start gap-4">
        <Heart className="w-8 h-8 text-pink-400 flex-shrink-0 mt-1" />
        <div>
          <h3 className="font-bold text-white text-sm mb-1">The Poles Fund</h3>
          <p className="text-pink-200/60 text-xs">Creator contributions across matches, events, and campaigns can support approved gift and growth categories.</p>
        </div>
      </div>

      <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-4 flex gap-2">
      <AlertTriangle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
      <p className="text-xs text-blue-300/80">
      <strong>Skill-Based Competitions Only.</strong> Winners are determined by verified skill — never by chance, luck, or random selection. Every match is built on confidence, preparation, and performance. All events are in sandbox/demo mode. No real payments processed.
      </p>
      </div>
    </div>
  );
}

function PrizeShopScreen({ onCompete }) {
  // onCompete(poleType) navigates to the correct page
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(null);

  const filtered = DEMO_PRIZES.filter(p => {
    const q = search.toLowerCase();
    return (!q || p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
        && (!category || p.category === category);
  });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-black text-white mb-1">🛍️ Prize Shop</h2>
        <p className="text-purple-400/60 text-sm">All prizes available to compete for across North Pole and South Pole events.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <PrizeMediaCard title="Prize vault" description="Gaming, tech, collectibles, and creator-ready rewards." image={mediaImages.northPrize} meta="North" />
        <PrizeMediaCard title="Team gear" description="Sports gear and event prizes for leagues and local competition." image={mediaImages.southTeam} meta="South" />
        <PrizeMediaCard title="Mission categories" description="Approved gift and growth categories for public-safe fund storytelling." image={mediaImages.fundTools} meta="Fund" />
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/60" />
        <Input
          placeholder="Search vacations, concerts, gaming, sneakers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 bg-black/30 border-purple-700/30 focus:border-purple-500 text-white placeholder:text-purple-400/60"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setCategory(null)}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${!category ? 'bg-purple-700 text-white' : 'bg-black/30 border border-purple-700/30 text-purple-300 hover:border-purple-500'}`}>
          All
        </button>
        {PRIZE_CATEGORIES.map(c => (
          <button key={c.label} onClick={() => setCategory(c.label === category ? null : c.label)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${category === c.label ? 'bg-purple-700 text-white' : 'bg-black/30 border border-purple-700/30 text-purple-300 hover:border-purple-500'}`}>
            {c.icon} {c.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(prize => (
          <div key={prize.id} className="bg-black/40 border border-purple-700/20 hover:border-purple-500/40 rounded-2xl overflow-hidden transition-all">
            <div className="h-40 overflow-hidden">
              <img src={prize.image} alt={prize.title} loading="lazy" decoding="async" className="w-full h-full object-cover" onError={e => { e.target.src = 'https://images.unsplash.com/photo-1549396535-c11d5c55b9df?w=400'; }} />
            </div>
            <div className="p-4 space-y-2">
              <Badge className="bg-purple-900/40 text-purple-300 border-purple-700/30 text-xs">{prize.category}</Badge>
              <h4 className="font-semibold text-white text-sm leading-tight">{prize.title}</h4>
              <p className="text-purple-300 font-bold">${(prize.estimatedValue / 100).toFixed(2)}</p>
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" className="bg-purple-700 hover:bg-purple-600 text-white text-xs" onClick={() => onCompete('north', prize)}>
                  🎅 North Match
                </Button>
                <Button size="sm" className="bg-cyan-700 hover:bg-cyan-600 text-white text-xs" onClick={() => onCompete('south', prize)}>
                  🧊 South Event
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsScreen() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-white">⚙️ Settings</h2>
      <div className="space-y-3">
        {[
          { label: "Account Settings", desc: "Manage your username, display name, and credentials", href: "/Settings" },
          { label: "Privacy Settings", desc: "Control who can see your profile and activity", href: "/SettingsPrivacy" },
          { label: "Notifications", desc: "Manage push and email notification preferences", href: "/SettingsNotifications" },
          { label: "Payments & Billing", desc: "Manage payment methods and transaction history", href: "/SettingsPayments" },
          { label: "Appearance", desc: "Customize theme and display preferences", href: "/SettingsAppearance" },
        ].map(item => (
          <Link key={item.href} to={item.href}>
            <div className="bg-black/40 border border-purple-700/20 hover:border-purple-500/40 rounded-2xl p-4 flex items-center justify-between transition-all cursor-pointer">
              <div>
                <p className="font-semibold text-white text-sm">{item.label}</p>
                <p className="text-purple-400/60 text-xs mt-0.5">{item.desc}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-purple-500 -rotate-90" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ThePoles() {
  const [activeTab, setActiveTab] = useState("home");
  const navigate = useNavigate();

  const handleNavigate = (tabId) => {
    if (tabId === 'create') {
      // Go directly to the full North Pole match flow
      navigate('/NorthPole');
    } else {
      setActiveTab(tabId);
    }
  };

  const handleCreateNew = (poleType) => {
    if (poleType === 'north') {
      navigate('/NorthPole');
    } else {
      navigate('/SouthPole');
    }
  };

  const currentNavTab = activeTab;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/30 to-black text-white">

      {/* Fixed top header with dropdown */}
      <TopHeader activeTab={currentNavTab} onNavigate={handleNavigate} />

      {/* Scrollable content — padded for top header */}
      <div className="max-w-6xl mx-auto px-4 pt-20 pb-24">
        {activeTab === 'home'     && <HomeScreen onCreateMatch={handleCreateNew} onNavigate={handleNavigate} />}
        {activeTab === 'prizes'   && <PrizeShopScreen onCompete={(pt) => handleCreateNew(pt)} />}
        {activeTab === 'gameroom' && <GameRoomTab onCreateNew={() => handleCreateNew('north')} />}
        {activeTab === 'profile'  && <UserProfileTab />}
        {activeTab === 'settings' && <SettingsScreen />}

        {/* Legal footer */}
        <div className="mt-12 pt-6 border-t border-purple-700/20 flex flex-wrap gap-x-5 gap-y-2 text-xs text-purple-500/50">
          <Link to="/About" className="hover:text-purple-300 transition-colors">About</Link>
          <Link to="/Contact" className="hover:text-purple-300 transition-colors">Contact</Link>
          <Link to="/PrivacyPolicy" className="hover:text-purple-300 transition-colors">Privacy Policy</Link>
          <Link to="/TermsOfUse" className="hover:text-purple-300 transition-colors">Terms of Use</Link>
          <Link to="/AffiliateDisclosure" className="hover:text-purple-300 transition-colors">Affiliate Disclosure</Link>
          <Link to="/AffiliateCatalog" className="hover:text-purple-300 transition-colors">Prize Catalog</Link>
          <span className="text-purple-700/30">© 2026 The Poles Platform</span>
        </div>
      </div>

    </div>
  );
}
