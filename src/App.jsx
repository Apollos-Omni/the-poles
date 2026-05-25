import React, { Suspense, lazy } from 'react';
import './App.css'
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import VisualEditAgent from '@/lib/VisualEditAgent'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import SupabaseLogin from '@/components/auth/SupabaseLogin';
import RequireRole from '@/components/auth/RequireRole';
import { ADMIN_ROLES, AFFILIATE_ADMIN_ROLES } from '@/lib/rbac';
import { isSupabaseAuthMode } from '@/api/supabaseAuthClient';

const TeamPrizePool = lazy(() => import('@/pages/TeamPrizePool'));
const SouthPole = lazy(() => import('@/pages/SouthPole'));
const ThePoles = lazy(() => import('@/pages/ThePoles'));
const ThePolesFund = lazy(() => import('@/pages/ThePolesFund'));
const MissionLedger = lazy(() => import('@/pages/MissionLedger'));
const About = lazy(() => import('@/pages/About'));
const Contact = lazy(() => import('@/pages/Contact'));
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'));
const TermsOfUse = lazy(() => import('@/pages/TermsOfUse'));
const AffiliateDisclosure = lazy(() => import('@/pages/AffiliateDisclosure'));
const AffiliateOutRedirect = lazy(() => import('@/pages/AffiliateOutRedirect'));
const AffiliateAdmin = lazy(() => import('@/pages/AffiliateAdmin'));
const AffiliateCatalog = lazy(() => import('@/pages/AffiliateCatalog'));
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const OfficialSkillCompetitionRules = lazy(() => import('@/pages/OfficialSkillCompetitionRules'));
const AuthPage = lazy(() => import('@/pages/AuthPage'));
const AuthCallback = lazy(() => import('@/pages/AuthCallback'));
const PublicBetaReadiness = lazy(() => import('@/pages/PublicBetaReadiness'));
const CreateCustomSportPage = lazy(() => import('@/pages/CreateCustomSportPage'));
const CustomSportReviewAdminPage = lazy(() => import('@/pages/CustomSportReviewAdminPage'));
const SportDetailPage = lazy(() => import('@/pages/SportDetailPage'));
const LeagueHubPage = lazy(() => import('@/pages/LeagueHubPage'));
const CreateLeagueOrganizationPage = lazy(() => import('@/pages/CreateLeagueOrganizationPage'));
const LeagueOrganizationDetailPage = lazy(() => import('@/pages/LeagueOrganizationDetailPage'));

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];

const protectedPageRoles = {
  AgentDashboard: ADMIN_ROLES,
  ComplianceDashboard: ADMIN_ROLES,
  Diagnostics: ADMIN_ROLES,
  HingeAdmin: ADMIN_ROLES,
};

const publicRoutePaths = new Set([
  '/',
  '/About',
  '/Contact',
  '/PrivacyPolicy',
  '/TermsOfUse',
  '/OfficialSkillCompetitionRules',
  '/AffiliateDisclosure',
  '/ThePolesFund',
  '/MissionLedger',
  '/SignIn',
  '/CreateAccount',
  '/auth/callback',
]);

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const RouteLoading = () => (
  <div className="min-h-screen bg-black p-8 text-purple-100">
    <div className="mx-auto max-w-6xl rounded-xl border border-purple-700/25 bg-black/30 p-8 text-center text-sm text-purple-100/70">
      Loading...
    </div>
  </div>
);

const pageElement = (path, Page) => {
  const roles = protectedPageRoles[path];
  if (!roles) return <Page />;
  return (
    <RequireRole roles={roles}>
      <Page />
    </RequireRole>
  );
};

const AuthenticatedApp = () => {
  const location = useLocation();
  const {
    isLoadingAuth,
    isLoadingPublicSettings,
    authError,
    isAuthenticated,
    navigateToLogin,
    checkAppState,
  } = useAuth();

  const publicRoutes = (
    <Suspense fallback={<RouteLoading />}>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/About" element={<About />} />
      <Route path="/Contact" element={<Contact />} />
      <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
      <Route path="/TermsOfUse" element={<TermsOfUse />} />
      <Route path="/OfficialSkillCompetitionRules" element={<OfficialSkillCompetitionRules />} />
      <Route path="/AffiliateDisclosure" element={<AffiliateDisclosure />} />
      <Route path="/ThePolesFund" element={<ThePolesFund />} />
      <Route path="/MissionLedger" element={<MissionLedger />} />
      <Route path="/SignIn" element={<AuthPage mode="signin" />} />
      <Route path="/CreateAccount" element={<AuthPage mode="signup" />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
    </Suspense>
  );

  if (publicRoutePaths.has(location.pathname)) {
    return publicRoutes;
  }

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black text-purple-100">
        <div className="w-8 h-8 rounded-full border-4 border-purple-200/30 border-t-purple-400 animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      if (isSupabaseAuthMode) {
        return <SupabaseLogin onSuccess={checkAppState} error={authError} />;
      }
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  if (isSupabaseAuthMode && !isAuthenticated) {
    return <SupabaseLogin onSuccess={checkAppState} error={authError} />;
  }

  // Render the main app
  return (
    <LayoutWrapper currentPageName={mainPageKey}>
      <Suspense fallback={<RouteLoading />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {Object.entries(Pages).map(([path, Page]) => (
          <Route key={path} path={`/${path}`} element={pageElement(path, Page)} />
        ))}
        <Route path="/TeamPrizePool" element={<TeamPrizePool />} />
        <Route path="/SouthPole" element={<SouthPole />} />
        <Route path="/ThePoles" element={<ThePoles />} />
        <Route path="/ThePolesFund" element={<ThePolesFund />} />
        <Route path="/MissionLedger" element={<MissionLedger />} />
        <Route path="/About" element={<About />} />
        <Route path="/Contact" element={<Contact />} />
        <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
        <Route path="/TermsOfUse" element={<TermsOfUse />} />
        <Route path="/OfficialSkillCompetitionRules" element={<OfficialSkillCompetitionRules />} />
        <Route path="/AffiliateDisclosure" element={<AffiliateDisclosure />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/out/:offerId" element={<AffiliateOutRedirect />} />
        <Route path="/AffiliateAdmin" element={<RequireRole roles={AFFILIATE_ADMIN_ROLES}><AffiliateAdmin /></RequireRole>} />
        <Route path="/AffiliateCatalog" element={<AffiliateCatalog />} />
        <Route path="/PublicBetaReadiness" element={<RequireRole roles={ADMIN_ROLES}><PublicBetaReadiness /></RequireRole>} />
        <Route path="/CreateCustomSport" element={<CreateCustomSportPage />} />
        <Route path="/CustomSportReviewAdmin" element={<RequireRole roles={ADMIN_ROLES}><CustomSportReviewAdminPage /></RequireRole>} />
        <Route path="/Sports/:slug" element={<SportDetailPage />} />
        <Route path="/Leagues" element={<LeagueHubPage />} />
        <Route path="/Leagues/Create" element={<CreateLeagueOrganizationPage />} />
        <Route path="/Leagues/:slug" element={<LeagueOrganizationDetailPage />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      </Suspense>
    </LayoutWrapper>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <VisualEditAgent />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
