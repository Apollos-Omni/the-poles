import React, { useState, useEffect } from 'react';
import AppSidebar from './components/layout/AppSidebar';
import { AuthProvider, useAuth } from './components/auth/AuthProvider';
import { SessionExpiredModal } from './components/auth/SessionExpiredModal';
import { SecurityAuditor } from './components/security/SecurityAuditor';
import { CrashReporter } from './components/observability/CrashReporter';
import { AnalyticsProvider } from './components/analytics/Analytics'; 
import { PerformanceDebugger } from './components/performance/PerformanceMonitor';
import { HealthIndicator } from './components/health/HealthCheck';
import { Home, Target, User as UserIcon, Menu as MenuIcon, Settings, Bot, Gift, LogIn, Loader2, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { ServiceWorkerManager, PWAInstallManager } from '@/components/pwa/ServiceWorkerManager';
import DeepLinkHandler from '@/components/notifications/DeepLinkHandler';

const mobileNavItems = [
  { title: "Feed", href: createPageUrl("Feed"), icon: Home },
  { title: "Visions", href: createPageUrl("VisionTracker"), icon: Target },
  { title: "North Pole", href: "/NorthPole", icon: Gift },
  { title: "Profile", href: createPageUrl("Profile"), icon: UserIcon },
];

const LoginPage = () => {
  const { login, authError } = useAuth();
  
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-black via-purple-900 to-black text-white">
      <div className="text-center p-8 bg-black/30 backdrop-blur-lg rounded-2xl border border-purple-700/30">
        <Gift className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Welcome to DivineHinge</h1>
        <p className="text-purple-200/80 mb-6">Please sign in to continue.</p>
        
        {authError && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg">
            <p className="text-red-300 text-sm">
              {authError.message || 'Authentication failed. Please try again.'}
            </p>
          </div>
        )}
        
        <Button 
          onClick={() => login()} 
          className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-6"
        >
          <LogIn className="w-5 h-5 mr-2" />
          Sign In with Google
        </Button>
        
        <p className="text-xs text-purple-300/60 mt-4">
          Secure authentication powered by Base44
        </p>
      </div>
    </div>
  );
};

const LayoutContent = ({ children, currentPageName }) => {
  const { user, isLoading, sessionExpired, login, refreshSession } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Check if we're in development mode using window location
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname.includes('preview');

  const isActive = (url) => location.pathname === url || (url === createPageUrl("Feed") && location.pathname === "/");

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-purple-300">Verifying security credentials...</p>
        </div>
      </div>
    );
  }

  // Show session expired modal
  if (sessionExpired) {
    return (
      <SessionExpiredModal 
        onRefresh={refreshSession}
        onLogin={() => login()}
      />
    );
  }

  // Show login page if not authenticated
  if (!user) {
    return <LoginPage />;
  }

  return (
    <AnalyticsProvider>
      <CrashReporter />
      <div className="flex h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white">
        {/* PWA and Service Worker Setup */}
        <ServiceWorkerManager />
        <PWAInstallManager />
        <DeepLinkHandler />
        
        {/* Desktop sidebar - Always visible on large screens */}
        <aside className="hidden lg:block lg:w-64 h-full flex-shrink-0 overflow-y-auto border-r border-purple-700/30">
          <AppSidebar />
        </aside>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {/* Mobile Sidebar */}
            <div 
              className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-gradient-to-b from-black via-purple-950/95 to-black shadow-2xl transform transition-transform duration-300 ease-out overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <div className="flex items-center justify-between p-4 border-b border-purple-700/30">
                <div className="flex items-center gap-2">
                  <Gift className="w-8 h-8 text-purple-400" />
                  <span className="text-xl font-bold text-white">DivineHinge</span>
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
        <main className="flex-1 w-full overflow-y-auto bg-black/20 backdrop-blur-sm pb-20 lg:pb-0">
          {children}
        </main>
        
        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-lg border-t border-purple-700/30 flex justify-around items-center lg:hidden z-40">
          {mobileNavItems.map(item => (
            <Link 
              key={item.href} 
              to={item.href} 
              className={`flex flex-col items-center justify-center w-full h-full ${isActive(item.href) ? 'text-purple-400' : 'text-purple-200/70'}`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs mt-1">{item.title}</span>
            </Link>
          ))}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className={`flex flex-col items-center justify-center w-full h-full ${isMobileMenuOpen ? 'text-purple-400' : 'text-purple-200/70'}`}
          >
            <MenuIcon className="w-6 h-6" />
            <span className="text-xs mt-1">Menu</span>
          </button>
        </div>
        
        {/* Always show health indicator */}
        <HealthIndicator />
      </div>
    </AnalyticsProvider>
  );
};

export default function Layout({ children, currentPageName }) {
  return (
    <AuthProvider>
      <LayoutContent children={children} currentPageName={currentPageName} />
    </AuthProvider>
  );
}
