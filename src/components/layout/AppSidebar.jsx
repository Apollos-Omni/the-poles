import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Home,
  Target,
  User as UserIcon,
  LogOut,
  Settings,
  Bot,
  Gift,
  Zap,
  Shield,
  DoorOpen,
  Globe,
  Store,
  Gamepad2,
  Users,
  Layout,
  LifeBuoy,
  FileText,
  Building,
  Heart,
  Terminal,
  Server,
  Mail,
  Trophy,
  Mountain,
  ClipboardList
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/lib/AuthContext';
import { ADMIN_ROLES, AFFILIATE_ADMIN_ROLES, userHasRole } from '@/lib/rbac';

const mainNavItems = [
  { name: 'Dashboard', icon: Home, page: 'Dashboard' },
  { name: 'The Poles', icon: Globe, page: 'ThePoles', href: '/ThePoles' },
  { name: 'The North Pole', icon: Gift, page: 'NorthPole', href: '/NorthPole' },
  { name: 'The South Pole', icon: Mountain, page: 'SouthPole', href: '/SouthPole' },
  { name: 'League Hub', icon: Trophy, page: 'LeagueHub', href: '/Leagues' },
  { name: 'The Poles Fund', icon: Heart, page: 'ThePolesFund', href: '/ThePolesFund' },
  { name: 'Mission Ledger', icon: ClipboardList, page: 'MissionLedger', href: '/MissionLedger' },
  { name: 'Browse Prizes', icon: Trophy, page: 'NorthPole', href: '/NorthPole#north-pole-flow' },
  { name: 'Profile', icon: UserIcon, page: 'Profile' },
  { name: 'Support', icon: LifeBuoy, page: 'ContactUs' },
];

const exploreNavItems = [
  { name: 'Feed', icon: Target, page: 'Feed' },
  { name: 'Visions', icon: Zap, page: 'VisionTracker' },
  { name: 'Arcade', icon: Gamepad2, page: 'Arcade' },
  { name: 'Store', icon: Store, page: 'Store' },
  { name: 'Gateway Control', icon: DoorOpen, page: 'HingeControl' },
  { name: 'Home World', icon: Globe, page: 'HomeWorld' },
  { name: 'Home Layout', icon: Layout, page: 'HomeLayoutDesigner' },
  { name: 'Security Monitor', icon: Shield, page: 'SecurityMonitor'},
  { name: 'Homeless to Homeowner', icon: Heart, page: 'HomelessToHomeowner' },
  { name: 'Affiliate Catalog', icon: Store, page: 'AffiliateCatalog', href: '/AffiliateCatalog' },
  { name: 'Organizations', icon: Users, page: 'Organizations' },
];

const secondaryNavItems = [
  { title: "Hinge Admin", href: createPageUrl("HingeAdmin"), icon: Terminal, roles: ADMIN_ROLES },
  { title: "Agent Dashboard", href: createPageUrl("AgentDashboard"), icon: Bot, roles: ADMIN_ROLES },
  { title: "Compliance", href: createPageUrl("ComplianceDashboard"), icon: Shield, roles: ADMIN_ROLES },
  { title: "Beta Readiness", href: "/PublicBetaReadiness", icon: Trophy, roles: ADMIN_ROLES },
  { title: "Custom Sports", href: "/CustomSportReviewAdmin", icon: ClipboardList, roles: ADMIN_ROLES },
  { title: "Affiliate Admin", href: "/AffiliateAdmin", icon: Building, roles: AFFILIATE_ADMIN_ROLES },
  { title: "Diagnostics", href: createPageUrl("Diagnostics"), icon: Server, roles: ADMIN_ROLES },
];

const NavItem = ({ label, to, icon: Icon, onNavigate }) => {
  const location = useLocation();
  const isActive = location.pathname.toLowerCase() === to.toLowerCase() || (to === createPageUrl("Dashboard") && location.pathname === '/');

  return (
    <Link
      to={to}
      onClick={onNavigate}
      className={`flex min-h-11 items-center rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'border border-cyan-300/25 bg-cyan-400/10 text-cyan-50 shadow-lg shadow-cyan-950/20'
          : 'border border-transparent text-purple-100/70 hover:border-purple-300/15 hover:bg-purple-900/30 hover:text-white'
      }`}
    >
      <Icon className="mr-3 h-5 w-5 shrink-0" />
      <span className="min-w-0 truncate">{label}</span>
    </Link>
  );
};

export default function AppSidebar({ onNavigate }) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout(true);
  };

  const hasAccess = (item) => {
      if (!item.roles) return true;
      return userHasRole(user, item.roles);
  };

  const userAccountItems = [
    { name: 'Profile', icon: UserIcon, page: 'Profile' },
    { name: 'My HeavenOS', icon: FileText, page: 'MyHeavenOS' },
    { name: 'Settings', icon: Settings, page: 'Settings' },
    { name: 'Contact Us', icon: LifeBuoy, page: 'ContactUs' },
  ];

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-black/45 via-purple-950/30 to-slate-950/50 p-3 text-white sm:p-4">
      <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.04] p-3 shadow-xl shadow-purple-950/20">
        <Link to={createPageUrl("Dashboard")} className="flex items-center gap-2 px-2">
          <Gift className="w-8 h-8 text-cyan-200" />
          <span className="text-xl font-bold text-white">The Poles</span>
        </Link>
        <p className="mt-2 px-2 text-xs text-purple-100/45">Verified challenge operations</p>
      </div>

      <nav className="mb-6 space-y-2">
        <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-cyan-100/45">Core</h3>
        {mainNavItems.filter(hasAccess).map((item) => (
          <NavItem
            key={item.name}
            label={item.name}
            to={item.href || createPageUrl(item.page)}
            icon={item.icon}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <div className="mb-6 space-y-2">
        <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-purple-100/45">Explore</h3>
        {exploreNavItems.filter(hasAccess).map((item) => (
          <NavItem
            key={item.name}
            label={item.name}
            to={item.href || createPageUrl(item.page)}
            icon={item.icon}
            onNavigate={onNavigate}
          />
        ))}
      </div>

      <div className="mb-6 space-y-2">
        <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-purple-100/45">Account</h3>
        {userAccountItems.map((item) => (
          <NavItem
            key={item.name}
            label={item.name}
            to={createPageUrl(item.page)}
            icon={item.icon}
            onNavigate={onNavigate}
          />
        ))}
      </div>

      <div className="mb-6 space-y-2">
        <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-purple-100/45">Admin Tools</h3>
        {secondaryNavItems.filter(hasAccess).map((item) => (
          <NavItem
            key={item.title}
            label={item.title}
            to={item.href}
            icon={item.icon}
            onNavigate={onNavigate}
          />
        ))}
      </div>

      <Button
        variant="ghost"
        onClick={handleLogout}
        className="w-full justify-start text-purple-300/70 hover:bg-red-900/40 hover:text-red-100"
      >
        <LogOut className="w-5 h-5 mr-3" />
        <span>Logout</span>
      </Button>
    </div>
  );
}
