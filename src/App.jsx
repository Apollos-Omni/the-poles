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
import TeamPrizePool from '@/pages/TeamPrizePool';
import SouthPole from '@/pages/SouthPole';
import ThePoles from '@/pages/ThePoles';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfUse from '@/pages/TermsOfUse';
import AffiliateDisclosure from '@/pages/AffiliateDisclosure';
import AffiliateOutRedirect from '@/pages/AffiliateOutRedirect';
import AffiliateAdmin from '@/pages/AffiliateAdmin';
import AffiliateCatalog from '@/pages/AffiliateCatalog';
import LandingPage from '@/pages/LandingPage';
import OfficialSkillCompetitionRules from '@/pages/OfficialSkillCompetitionRules';
import AuthPage from '@/pages/AuthPage';
import PublicBetaReadiness from '@/pages/PublicBetaReadiness';
import RequireRole from '@/components/auth/RequireRole';
import { ADMIN_ROLES, AFFILIATE_ADMIN_ROLES } from '@/lib/rbac';
import { isSupabaseAuthMode } from '@/api/supabaseAuthClient';

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
  '/SignIn',
  '/CreateAccount',
]);

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

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
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/About" element={<About />} />
      <Route path="/Contact" element={<Contact />} />
      <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
      <Route path="/TermsOfUse" element={<TermsOfUse />} />
      <Route path="/OfficialSkillCompetitionRules" element={<OfficialSkillCompetitionRules />} />
      <Route path="/AffiliateDisclosure" element={<AffiliateDisclosure />} />
      <Route path="/SignIn" element={<AuthPage mode="signin" />} />
      <Route path="/CreateAccount" element={<AuthPage mode="signup" />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );

  if (publicRoutePaths.has(location.pathname)) {
    return publicRoutes;
  }

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
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
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {Object.entries(Pages).map(([path, Page]) => (
          <Route key={path} path={`/${path}`} element={pageElement(path, Page)} />
        ))}
        <Route path="/TeamPrizePool" element={<TeamPrizePool />} />
        <Route path="/SouthPole" element={<SouthPole />} />
        <Route path="/ThePoles" element={<ThePoles />} />
        <Route path="/About" element={<About />} />
        <Route path="/Contact" element={<Contact />} />
        <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
        <Route path="/TermsOfUse" element={<TermsOfUse />} />
        <Route path="/OfficialSkillCompetitionRules" element={<OfficialSkillCompetitionRules />} />
        <Route path="/AffiliateDisclosure" element={<AffiliateDisclosure />} />
        <Route path="/out/:offerId" element={<AffiliateOutRedirect />} />
        <Route path="/AffiliateAdmin" element={<RequireRole roles={AFFILIATE_ADMIN_ROLES}><AffiliateAdmin /></RequireRole>} />
        <Route path="/AffiliateCatalog" element={<AffiliateCatalog />} />
        <Route path="/PublicBetaReadiness" element={<RequireRole roles={ADMIN_ROLES}><PublicBetaReadiness /></RequireRole>} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
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
