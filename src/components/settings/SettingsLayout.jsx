import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { User, Shield, Bell, Paintbrush, Globe, Box, LifeBuoy, AlertTriangle, KeyRound, DollarSign, Fingerprint, Lock, Database } from 'lucide-react';

const navItems = [
  { href: 'SettingsProfile', icon: User, label: 'Profile' },
  { href: 'SettingsAccount', icon: KeyRound, label: 'Account' },
  { href: 'SettingsPrivacy', icon: Shield, label: 'Privacy & Safety' },
  { href: 'SettingsNotifications', icon: Bell, label: 'Notifications' },
  { href: 'SettingsPayments', icon: DollarSign, label: 'Payments & Payouts' },
  { href: 'SettingsIdentity', icon: Fingerprint, label: 'Identity Verification' },
  { href: 'SettingsSecurity', icon: Lock, label: 'Devices & Security' },
  { href: 'SettingsData', icon: Database, label: 'Data & Storage' },
  { href: 'SettingsAppearance', icon: Paintbrush, label: 'Appearance' },
  { href: 'SettingsRegional', icon: Globe, label: 'Language & Region' },
  { href: 'SettingsIntegrations', icon: Box, label: 'Integrations' },
  { href: 'SettingsSupport', icon: LifeBuoy, label: 'Support' },
  { href: 'SettingsDangerZone', icon: AlertTriangle, label: 'Danger Zone' },
];

export default function SettingsLayout({ children, currentPage }) {
  return (
    <div className="min-h-screen bg-[rgb(var(--dark-base))] text-[rgb(var(--accent-soft-white))]">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  to={createPageUrl(item.href)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                    currentPage === item.href
                      ? 'bg-purple-600/20 text-white'
                      : 'text-purple-200 hover:bg-purple-800/30 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
          </aside>
          <main className="flex-1 bg-[rgb(var(--grey-1))] rounded-2xl p-6 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}