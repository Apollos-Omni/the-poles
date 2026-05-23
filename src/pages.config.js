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
import AgentDashboard from './pages/AgentDashboard';
import Arcade from './pages/Arcade';
import CommandCenter from './pages/CommandCenter';
import ComplianceDashboard from './pages/ComplianceDashboard';
import ContactUs from './pages/ContactUs';
import CreateMatch from './pages/CreateMatch';
import CreatorPortal from './pages/CreatorPortal';
import Dashboard from './pages/Dashboard';
import Diagnostics from './pages/Diagnostics';
import Feed from './pages/Feed';
import HingeAdmin from './pages/HingeAdmin';
import HingeControl from './pages/HingeControl';
import Home from './pages/Home';
import HomeLayoutDesigner from './pages/HomeLayoutDesigner';
import HomeWorld from './pages/HomeWorld';
import HomelessToHomeowner from './pages/HomelessToHomeowner';
import MVP from './pages/MVP';
import MyHeavenOS from './pages/MyHeavenOS';
import Organizations from './pages/Organizations';
import Profile from './pages/Profile';
import Promotions from './pages/Promotions';
import NorthPole from './pages/NorthPole';
import SantaClause from './pages/SantaClause';
import SecurityMonitor from './pages/SecurityMonitor';
import Settings from './pages/Settings';
import SettingsAccount from './pages/SettingsAccount';
import SettingsAppearance from './pages/SettingsAppearance';
import SettingsDangerZone from './pages/SettingsDangerZone';
import SettingsData from './pages/SettingsData';
import SettingsIdentity from './pages/SettingsIdentity';
import SettingsIntegrations from './pages/SettingsIntegrations';
import SettingsNotifications from './pages/SettingsNotifications';
import SettingsPayments from './pages/SettingsPayments';
import SettingsPlaceholder from './pages/SettingsPlaceholder';
import SettingsPrivacy from './pages/SettingsPrivacy';
import SettingsProfile from './pages/SettingsProfile';
import SettingsRegional from './pages/SettingsRegional';
import SettingsSecurity from './pages/SettingsSecurity';
import SettingsSupport from './pages/SettingsSupport';
import Store from './pages/Store';
import Sweepstakes from './pages/Sweepstakes';
import Unsent from './pages/Unsent';
import VisionDetail from './pages/VisionDetail';
import VisionTracker from './pages/VisionTracker';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AgentDashboard": AgentDashboard,
    "Arcade": Arcade,
    "CommandCenter": CommandCenter,
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
    "Sweepstakes": Sweepstakes,
    "Unsent": Unsent,
    "VisionDetail": VisionDetail,
    "VisionTracker": VisionTracker,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};