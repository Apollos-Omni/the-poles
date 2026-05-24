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
    <div className="min-h-screen overflow-x-hidden bg-transparent text-white">
      <div className="mx-auto max-w-7xl p-4 md:p-8">
        <div className="mb-6 rounded-2xl border border-cyan-300/15 bg-white/[0.055] p-5 shadow-2xl shadow-purple-950/20 backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/55">Account Control</p>
          <h1 className="mt-1 text-3xl font-black text-white">Settings</h1>
        </div>
        <div className="flex flex-col gap-5 md:flex-row md:gap-8">
          <aside className="w-full flex-shrink-0 md:w-64">
            <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 md:mx-0 md:block md:space-y-1 md:overflow-visible md:px-0 md:pb-0">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  to={createPageUrl(item.href)}
                  className={`flex min-h-11 shrink-0 items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all duration-200 md:w-full ${
                    currentPage === item.href
                      ? 'border-cyan-300/25 bg-cyan-400/10 text-white'
                      : 'border-white/5 bg-white/[0.035] text-purple-100/70 hover:bg-purple-800/30 hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span className="font-medium whitespace-nowrap md:whitespace-normal">{item.label}</span>
                </Link>
              ))}
            </nav>
          </aside>
          <main className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.055] p-4 shadow-2xl shadow-purple-950/20 backdrop-blur-xl md:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
