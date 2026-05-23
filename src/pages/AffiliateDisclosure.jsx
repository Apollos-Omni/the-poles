import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import PublicBetaLayout, { BetaDisclosurePanel, PublicBetaBadge } from '@/components/public/PublicBetaLayout';

const Section = ({ title, children }) => (
  <section className="space-y-3">
    <h2 className="text-xl font-bold text-white">{title}</h2>
    <div className="space-y-3 text-sm leading-relaxed text-purple-100/75">{children}</div>
  </section>
);

export default function AffiliateDisclosure() {
  return (
    <PublicBetaLayout>
      <div className="space-y-8">
        <div className="space-y-3">
          <PublicBetaBadge />
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-yellow-200" />
            <h1 className="text-4xl font-black">Affiliate Disclosure</h1>
          </div>
          <p className="text-sm text-purple-100/55">Last updated: May 23, 2026.</p>
        </div>

        <BetaDisclosurePanel />

        <Section title="Affiliate Links">
          <p>
            Some links on The Poles may be affiliate links. If you click a link and buy something from a retailer, The
            Poles may earn a commission at no additional cost to you.
          </p>
        </Section>

        <Section title="Beta Provider Search">
          <p>
            Prize search may use configured provider APIs or sample fallback results. Product availability, pricing,
            images, and retailer metadata may be incomplete or stale during beta.
          </p>
        </Section>

        <Section title="Prize Fulfillment Is Separate">
          <p>
            Affiliate browsing is not the same as competition fulfillment. During public beta, fulfillment is simulated
            and no retailer order is placed for a match winner.
          </p>
        </Section>

        <Section title="Retailer Independence">
          <p>
            Retailers and affiliate networks are independent third parties. They do not sponsor, administer, judge, or
            fulfill The Poles competitions unless a specific written partnership is disclosed.
          </p>
        </Section>

        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm text-purple-100/75">
          Questions about affiliate links?{' '}
          <Link to="/Contact" className="inline-flex items-center gap-1 text-cyan-200 hover:underline">
            Contact support <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </PublicBetaLayout>
  );
}
