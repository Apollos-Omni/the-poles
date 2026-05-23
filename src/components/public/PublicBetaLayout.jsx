import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { FlaskConical } from 'lucide-react';

const footerLinks = [
  { to: '/PrivacyPolicy', label: 'Privacy' },
  { to: '/TermsOfUse', label: 'Terms' },
  { to: '/OfficialSkillCompetitionRules', label: 'Rules' },
  { to: '/AffiliateDisclosure', label: 'Affiliate Disclosure' },
  { to: '/Contact', label: 'Contact' },
];

export function PublicBetaBadge({ className = '' }) {
  return (
    <Badge className={`border border-cyan-400/30 bg-cyan-500/15 text-cyan-100 ${className}`}>
      <FlaskConical className="mr-1 h-3.5 w-3.5" />
      Public Beta - simulated payments and fulfillment
    </Badge>
  );
}

export function BetaDisclosurePanel() {
  return (
    <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-100">
      <p className="font-semibold text-yellow-50">Public beta disclosure</p>
      <p className="mt-1 text-yellow-100/80">
        Payments, retailer ordering, and prize fulfillment are simulated during beta. Prize and game search may use
        configured provider APIs or sample fallback catalogs.
      </p>
    </div>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-white/10 bg-black/45">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 text-sm text-purple-100/70 md:flex-row md:items-center md:justify-between">
        <div>
          <Link to="/" className="font-semibold text-white">The Poles</Link>
          <p className="mt-1 text-xs text-purple-100/50">Public beta. No live payments or real prize fulfillment enabled.</p>
        </div>
        <nav className="flex flex-wrap gap-4">
          {footerLinks.map((link) => (
            <Link key={link.to} to={link.to} className="hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

export default function PublicBetaLayout({ children, maxWidth = 'max-w-4xl' }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 bg-black/70">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link to="/" className="text-lg font-black text-white">The Poles</Link>
          <nav className="flex flex-wrap items-center gap-3 text-sm text-purple-100/75">
            <Link to="/About" className="hover:text-white">About</Link>
            <Link to="/NorthPole" className="hover:text-white">North Pole</Link>
            <Link to="/SouthPole" className="hover:text-white">South Pole</Link>
            <Link to="/SignIn" className="hover:text-white">Sign in</Link>
          </nav>
        </div>
      </header>
      <main className={`mx-auto ${maxWidth} px-4 py-12`}>
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
