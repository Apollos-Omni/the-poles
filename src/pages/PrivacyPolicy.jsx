import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import PublicBetaLayout, { BetaDisclosurePanel, PublicBetaBadge } from '@/components/public/PublicBetaLayout';

const Section = ({ title, children }) => (
  <section className="space-y-3">
    <h2 className="text-xl font-bold text-white">{title}</h2>
    <div className="space-y-3 text-sm leading-relaxed text-purple-100/75">{children}</div>
  </section>
);

export default function PrivacyPolicy() {
  return (
    <PublicBetaLayout>
      <div className="space-y-8">
        <div className="space-y-3">
          <PublicBetaBadge />
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-cyan-200" />
            <h1 className="text-4xl font-black">Privacy Policy Placeholder</h1>
          </div>
          <p className="text-sm text-purple-100/55">Last updated: May 23, 2026. Legal review pending.</p>
        </div>

        <BetaDisclosurePanel />

        <Section title="Placeholder Notice">
          <p>
            This page is a public beta privacy placeholder for testing and transparency. It is not a final legal policy
            and should be reviewed by qualified counsel before live payments, real prize fulfillment, or production
            launch claims are enabled.
          </p>
        </Section>

        <Section title="Information We Expect To Process">
          <p>Account details such as name, email, profile data, and authentication identifiers.</p>
          <p>Platform usage such as pages visited, match or challenge participation, search activity, and support requests.</p>
          <p>Affiliate click metadata such as offer id, merchant, timestamp, and source page when affiliate links are used.</p>
          <p>Technical data such as browser, device, IP-derived security data, logs, and backend health diagnostics.</p>
        </Section>

        <Section title="Beta Payment And Fulfillment Data">
          <p>
            Live payment collection is not enabled for this beta. Payment, retailer ordering, and fulfillment flows are
            simulated, and no final policy should imply that real transaction handling is active.
          </p>
        </Section>

        <Section title="Provider Search">
          <p>
            Prize and game search may call configured provider APIs or return sample fallback data when provider keys,
            network access, or upstream services are unavailable.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            For privacy questions during beta, contact <Link to="/Contact" className="text-cyan-200 hover:underline">support</Link>.
          </p>
        </Section>
      </div>
    </PublicBetaLayout>
  );
}
