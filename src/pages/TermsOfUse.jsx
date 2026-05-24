import React from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import PublicBetaLayout, { BetaDisclosurePanel, PublicBetaBadge } from '@/components/public/PublicBetaLayout';
import { SUPPORT_EMAIL, supportMailto } from '@/config/contact';

const Section = ({ title, children }) => (
  <section className="space-y-3">
    <h2 className="text-xl font-bold text-white">{title}</h2>
    <div className="space-y-3 text-sm leading-relaxed text-purple-100/75">{children}</div>
  </section>
);

export default function TermsOfUse() {
  return (
    <PublicBetaLayout>
      <div className="space-y-8">
        <div className="space-y-3">
          <PublicBetaBadge />
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-cyan-200" />
            <h1 className="text-4xl font-black">Terms of Use Placeholder</h1>
          </div>
          <p className="text-sm text-purple-100/55">Last updated: May 23, 2026. Legal review pending.</p>
        </div>

        <BetaDisclosurePanel />

        <Section title="Placeholder Notice">
          <p>
            These terms are a beta placeholder for public testing. They do not represent completed legal compliance,
            payment approval, prize fulfillment approval, or jurisdiction-by-jurisdiction skill competition review.
          </p>
        </Section>

        <Section title="Beta Access">
          <p>
            Users may create accounts, test the North Pole and South Pole flows, search sample or provider-backed
            catalogs, and review simulated match or challenge states.
          </p>
        </Section>

        <Section title="No Live Payments Or Fulfillment">
          <p>
            The current beta does not process live entry fees, charge cards, collect prize pools, order retailer items,
            or ship prizes. Any payment, ordering, buy-in, fund, or fulfillment language in the application is for
            simulation and readiness testing unless explicitly changed in a future production release.
          </p>
        </Section>

        <Section title="Skill Competition Rules">
          <p>
            Skill competition rules are provided as a separate placeholder at{' '}
            <Link to="/OfficialSkillCompetitionRules" className="text-cyan-200 hover:underline">Official Skill Competition Rules</Link>.
            Final rules require legal and operational review before live paid competitions.
          </p>
        </Section>

        <Section title="Affiliate Links">
          <p>
            The platform may display affiliate links or referral disclosures. Affiliate relationships do not mean a
            retailer sponsors, administers, or fulfills a competition unless that relationship is expressly stated.
          </p>
        </Section>

        <Section title="Support">
          <p>
            For login help, account issues, parent questions, safety concerns, payment/refund questions, or fulfillment and shipping issues, contact <a href={supportMailto({ subject: 'Terms support question for The Poles' })} className="text-cyan-200 hover:underline">{SUPPORT_EMAIL}</a>.
          </p>
        </Section>
      </div>
    </PublicBetaLayout>
  );
}
