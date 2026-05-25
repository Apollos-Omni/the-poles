import React, { useState, useEffect } from 'react';
import AppSidebar from './components/layout/AppSidebar';
import { useAuth } from './lib/AuthContext';
import { SecurityAuditor } from './components/security/SecurityAuditor';
import { CrashReporter } from './components/observability/CrashReporter';
import { AnalyticsProvider } from './components/analytics/Analytics'; 
import { PerformanceDebugger } from './components/performance/PerformanceMonitor';
import { HealthIndicator } from './components/health/HealthCheck';
import { Home, User as UserIcon, Menu as MenuIcon, Gift, LogIn, LogOut, Loader2, Mountain, ShieldCheck, Trophy, X, Heart, ReceiptText } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { ServiceWorkerManager, PWAInstallManager } from '@/components/pwa/ServiceWorkerManager';
import DeepLinkHandler from '@/components/notifications/DeepLinkHandler';
import { MobileActionBar } from '@/components/media/MediaPrimitives';

const mobileNavItems = [
  { title: "Home", href: createPageUrl("Dashboard"), icon: Home },
  { title: "North", href: "/NorthPole", icon: Gift },
  { title: "South", href: "/SouthPole", icon: Mountain },
  { title: "Fund", href: "/ThePolesFund", icon: Heart },
  { title: "Ledger", href: "/MissionLedger", icon: ReceiptText },
  { title: "Create", href: createPageUrl("CreateMatch"), icon: Trophy },
  { title: "Profile", href: createPageUrl("Profile"), icon: UserIcon },
];

const LoginPage = () => {
  const { navigateToLogin, authError } = useAuth();
  
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-black via-purple-900 to-black text-white">
      <div className="text-center p-8 bg-black/30 backdrop-blur-lg rounded-2xl border border-purple-700/30">
        <Gift className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Welcome to The Poles</h1>
        <p className="text-purple-200/80 mb-6">Please sign in to continue.</p>
        
        {authError && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg">
            <p className="text-red-300 text-sm">
              {authError.message || 'Authentication failed. Please try again.'}
            </p>
          </div>
        )}
        
        <Button 
          onClick={() => navigateToLogin()} 
          className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-6"
        >
          <LogIn className="w-5 h-5 mr-2" />
          Sign In with Google
        </Button>
        
        <p className="text-xs text-purple-300/60 mt-4">
          Secure authentication for The Poles
        </p>
      </div>
    </div>
  );
};

const LayoutContent = ({ children, currentPageName }) => {
  const { user, isLoadingAuth, isLoadingPublicSettings, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Check if we're in development mode using window location
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname.includes('preview');

  const isActive = (url) => location.pathname === url || (url === createPageUrl("Dashboard") && location.pathname === "/");

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Show loading screen while checking authentication
  if (isLoadingAuth || isLoadingPublicSettings) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-purple-300">Verifying security credentials...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!user) {
    return <LoginPage />;
  }

  const displayName = user.full_name || user.name || user.email || 'Player';

  return (
    <AnalyticsProvider>
      <CrashReporter />
      <div className="relative flex h-screen min-w-0 overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.22),transparent_30%),linear-gradient(135deg,#020617,#0b0618_42%,#020617)] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:44px_44px]" />
        {/* PWA and Service Worker Setup */}
        <ServiceWorkerManager />
        <PWAInstallManager />
        <DeepLinkHandler />
        
        {/* Desktop sidebar - Always visible on large screens */}
        <aside className="relative z-10 hidden h-full flex-shrink-0 overflow-y-auto border-r border-cyan-200/10 bg-black/25 backdrop-blur-xl lg:block lg:w-64">
          <AppSidebar />
        </aside>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {/* Mobile Sidebar */}
            <div 
              className="fixed bottom-0 left-0 top-0 w-80 max-w-[88vw] overflow-y-auto border-r border-cyan-200/10 bg-gradient-to-b from-black via-purple-950/95 to-slate-950 shadow-2xl shadow-purple-950/60"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <div className="flex items-center justify-between p-4 border-b border-purple-700/30">
                <div className="flex items-center gap-2">
                  <Gift className="w-8 h-8 text-purple-400" />
                  <span className="text-xl font-bold text-white">The Poles</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-purple-900/40 transition-colors"
                >
                  <X className="w-6 h-6 text-purple-300" />
                </button>
              </div>

              {/* Sidebar Content */}
              <div className="p-4">
                <AppSidebar onNavigate={() => setIsMobileMenuOpen(false)} />
              </div>
            </div>
          </div>
        )}
        
        {/* Main content area */}
        <main className="relative z-10 min-w-0 flex-1 overflow-y-auto overflow-x-hidden bg-black/10 pb-24 lg:pb-0">
          <div className="sticky top-0 z-30 border-b border-white/10 bg-black/45 px-3 py-2.5 backdrop-blur-xl md:px-6 md:py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-purple-100 hover:bg-purple-900/40 lg:hidden"
                  aria-label="Open menu"
                >
                  <MenuIcon className="h-5 w-5" />
                </button>
                <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/55">The Poles Command</p>
                <h2 className="truncate text-sm font-semibold text-white md:text-base">{displayName}</h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-100 sm:flex">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Skill verified beta
                </div>
                <button
                  type="button"
                  onClick={() => logout(true)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-purple-100 hover:bg-red-950/40 hover:text-red-100"
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          {children}
        </main>
        
        {/* Mobile Bottom Navigation */}
        <MobileActionBar items={mobileNavItems} isActive={isActive} />
        
        {/* Always show health indicator */}
        <HealthIndicator />
      </div>
    </AnalyticsProvider>
  );
};

export default function Layout({ children, currentPageName }) {
  return <LayoutContent children={children} currentPageName={currentPageName} />;
}
