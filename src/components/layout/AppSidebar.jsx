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
  MessageSquare,
  Building,
  Heart,
  Terminal,
  Server,
  Mail,
  Trophy,
  Mountain
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/components/auth/AuthProvider';
import { ADMIN_ROLES, AFFILIATE_ADMIN_ROLES, userHasRole } from '@/lib/rbac';

const mainNavItems = [
  { name: 'Dashboard', icon: Home, page: 'Dashboard' },
  { name: 'Feed', icon: Target, page: 'Feed' },
  { name: 'Visions', icon: Zap, page: 'VisionTracker' },
  { name: 'Unsent', icon: Mail, page: 'Unsent' },
  { name: 'Gateway Control', icon: DoorOpen, page: 'HingeControl' },
  { name: 'Home World', icon: Globe, page: 'HomeWorld' },
  { name: 'Home Layout', icon: Layout, page: 'HomeLayoutDesigner' },
  { name: 'Security', icon: Shield, page: 'SecurityMonitor'},
  { name: 'Homeless to Homeowner', icon: Heart, page: 'HomelessToHomeowner' },
  { name: 'Store', icon: Store, page: 'Store' },
  { name: 'Arcade', icon: Gamepad2, page: 'Arcade' },
  { name: 'The North Pole', icon: Gift, page: 'NorthPole', href: '/NorthPole' },
  { name: 'The South Pole', icon: Mountain, page: 'SouthPole', href: '/SouthPole' },
  { name: 'Affiliate Catalog', icon: Store, page: 'AffiliateCatalog', href: '/AffiliateCatalog' },
  { name: 'Agent Dashboard', icon: Bot, page: 'AgentDashboard', roles: ADMIN_ROLES },
  { name: 'Compliance', icon: Shield, page: 'ComplianceDashboard', roles: ADMIN_ROLES },
  { name: 'Organizations', icon: Users, page: 'Organizations' },
];

const secondaryNavItems = [
  { title: "Hinge Admin", href: createPageUrl("HingeAdmin"), icon: Terminal, roles: ADMIN_ROLES },
  { title: "Agent Control", href: createPageUrl("AgentDashboard"), icon: Bot, roles: ADMIN_ROLES },
  { title: "Compliance", href: createPageUrl("ComplianceDashboard"), icon: Shield, roles: ADMIN_ROLES },
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
      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
        isActive
          ? 'bg-purple-600/20 text-purple-100'
          : 'text-purple-300/70 hover:bg-purple-900/40 hover:text-purple-100'
      }`}
    >
      <Icon className="w-5 h-5 mr-3" />
      <span>{label}</span>
    </Link>
  );
};

export default function AppSidebar({ onNavigate }) {
  const { user } = useAuth();

  const handleLogout = async () => {
    await base44.auth.logout();
    window.location.reload();
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
    <div className="h-full overflow-y-auto p-4 bg-gradient-to-b from-black via-purple-950/30 to-black text-white">
      <div className="mb-8">
        <Link to={createPageUrl("Dashboard")} className="flex items-center gap-2 px-2">
          <Gift className="w-8 h-8 text-purple-400" />
          <span className="text-xl font-bold text-white">DivineHinge</span>
        </Link>
      </div>

      <nav className="space-y-2 mb-6">
        <h3 className="px-4 text-xs font-semibold text-purple-400/50 uppercase tracking-wider">Main</h3>
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

      <div className="space-y-2 mb-6">
        <h3 className="px-4 text-xs font-semibold text-purple-400/50 uppercase tracking-wider">Account</h3>
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

      <div className="space-y-2 mb-6">
        <h3 className="px-4 text-xs font-semibold text-purple-400/50 uppercase tracking-wider">Admin Tools</h3>
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
