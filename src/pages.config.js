/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import { lazy } from 'react';
import __Layout from './Layout.jsx';

const AgentDashboard = lazy(() => import('./pages/AgentDashboard'));
const Arcade = lazy(() => import('./pages/Arcade'));
const ComplianceDashboard = lazy(() => import('./pages/ComplianceDashboard'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const CreateMatch = lazy(() => import('./pages/CreateMatch'));
const CreatorPortal = lazy(() => import('./pages/CreatorPortal'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Diagnostics = lazy(() => import('./pages/Diagnostics'));
const Feed = lazy(() => import('./pages/Feed'));
const HingeAdmin = lazy(() => import('./pages/HingeAdmin'));
const HingeControl = lazy(() => import('./pages/HingeControl'));
const Home = lazy(() => import('./pages/Home'));
const HomeLayoutDesigner = lazy(() => import('./pages/HomeLayoutDesigner'));
const HomeWorld = lazy(() => import('./pages/HomeWorld'));
const HomelessToHomeowner = lazy(() => import('./pages/HomelessToHomeowner'));
const MVP = lazy(() => import('./pages/MVP'));
const MyHeavenOS = lazy(() => import('./pages/MyHeavenOS'));
const Organizations = lazy(() => import('./pages/Organizations'));
const Profile = lazy(() => import('./pages/Profile'));
const Promotions = lazy(() => import('./pages/Promotions'));
const NorthPole = lazy(() => import('./pages/NorthPole'));
const SantaClause = lazy(() => import('./pages/SantaClause'));
const SecurityMonitor = lazy(() => import('./pages/SecurityMonitor'));
const Settings = lazy(() => import('./pages/Settings'));
const SettingsAccount = lazy(() => import('./pages/SettingsAccount'));
const SettingsAppearance = lazy(() => import('./pages/SettingsAppearance'));
const SettingsDangerZone = lazy(() => import('./pages/SettingsDangerZone'));
const SettingsData = lazy(() => import('./pages/SettingsData'));
const SettingsIdentity = lazy(() => import('./pages/SettingsIdentity'));
const SettingsIntegrations = lazy(() => import('./pages/SettingsIntegrations'));
const SettingsNotifications = lazy(() => import('./pages/SettingsNotifications'));
const SettingsPayments = lazy(() => import('./pages/SettingsPayments'));
const SettingsPlaceholder = lazy(() => import('./pages/SettingsPlaceholder'));
const SettingsPrivacy = lazy(() => import('./pages/SettingsPrivacy'));
const SettingsProfile = lazy(() => import('./pages/SettingsProfile'));
const SettingsRegional = lazy(() => import('./pages/SettingsRegional'));
const SettingsSecurity = lazy(() => import('./pages/SettingsSecurity'));
const SettingsSupport = lazy(() => import('./pages/SettingsSupport'));
const Store = lazy(() => import('./pages/Store'));
const Unsent = lazy(() => import('./pages/Unsent'));
const VisionDetail = lazy(() => import('./pages/VisionDetail'));
const VisionTracker = lazy(() => import('./pages/VisionTracker'));


export const PAGES = {
    "AgentDashboard": AgentDashboard,
    "Arcade": Arcade,
    "ComplianceDashboard": ComplianceDashboard,
    "ContactUs": ContactUs,
    "CreateMatch": CreateMatch,
    "CreatorPortal": CreatorPortal,
    "Dashboard": Dashboard,
    "Diagnostics": Diagnostics,
    "Feed": Feed,
    "HingeAdmin": HingeAdmin,
    "HingeControl": HingeControl,
    "Home": Home,
    "HomeLayoutDesigner": HomeLayoutDesigner,
    "HomeWorld": HomeWorld,
    "HomelessToHomeowner": HomelessToHomeowner,
    "MVP": MVP,
    "MyHeavenOS": MyHeavenOS,
    "Organizations": Organizations,
    "Profile": Profile,
    "Promotions": Promotions,
    "NorthPole": NorthPole,
    "SantaClause": SantaClause,
    "SecurityMonitor": SecurityMonitor,
    "Settings": Settings,
    "SettingsAccount": SettingsAccount,
    "SettingsAppearance": SettingsAppearance,
    "SettingsDangerZone": SettingsDangerZone,
    "SettingsData": SettingsData,
    "SettingsIdentity": SettingsIdentity,
    "SettingsIntegrations": SettingsIntegrations,
    "SettingsNotifications": SettingsNotifications,
    "SettingsPayments": SettingsPayments,
    "SettingsPlaceholder": SettingsPlaceholder,
    "SettingsPrivacy": SettingsPrivacy,
    "SettingsProfile": SettingsProfile,
    "SettingsRegional": SettingsRegional,
    "SettingsSecurity": SettingsSecurity,
    "SettingsSupport": SettingsSupport,
    "Store": Store,
    "Unsent": Unsent,
    "VisionDetail": VisionDetail,
    "VisionTracker": VisionTracker,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};
