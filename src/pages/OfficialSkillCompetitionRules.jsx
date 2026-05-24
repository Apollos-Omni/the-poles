import React from 'react';
import { Trophy } from 'lucide-react';
import PublicBetaLayout, { BetaDisclosurePanel, PublicBetaBadge } from '@/components/public/PublicBetaLayout';

const Section = ({ title, children }) => (
  <section className="space-y-3">
    <h2 className="text-xl font-bold text-white">{title}</h2>
    <div className="space-y-3 text-sm leading-relaxed text-purple-100/75">{children}</div>
  </section>
);

export default function OfficialSkillCompetitionRules() {
  return (
    <PublicBetaLayout>
      <div className="space-y-8">
        <div className="space-y-3">
          <PublicBetaBadge />
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8 text-yellow-200" />
            <h1 className="text-4xl font-black">Official Skill Competition Rules Placeholder</h1>
          </div>
          <p className="text-sm text-purple-100/55">Draft placeholder for public beta. Legal review pending.</p>
        </div>

        <BetaDisclosurePanel />

        <Section title="No Final Legal Guarantee">
          <p>
            These rules are a beta-readiness placeholder. They are intended to describe the product direction and
            testing boundaries, not to claim that legal compliance is complete.
          </p>
        </Section>

        <Section title="Skill-Based Outcomes">
          <p>
            Competitions should be structured so outcomes are determined by objective skill measures such as score,
            time, completion accuracy, judged performance criteria, or verified event results. Chance-based winner selection
            is not part of the intended competition model.
          </p>
        </Section>

        <Section title="Beta Match Status">
          <p>
            North Pole matches and South Pole challenges are available for testing user experience, agreement capture,
            admin review, and result workflows. Payments, retailer ordering, and prize fulfillment remain simulated.
          </p>
        </Section>

        <Section title="Participant Responsibilities">
          <p>Participants should use accurate account information and avoid manipulating scores, submissions, or results.</p>
          <p>Any future paid competition rules should define eligibility, location restrictions, disputes, taxes, and prize limits before launch.</p>
        </Section>

        <Section title="Admin Review">
          <p>
            Admin review screens may be used to test verification and fulfillment workflows. During beta, admin approval
            does not create a real shipping, ordering, payment, or prize obligation.
          </p>
        </Section>
      </div>
    </PublicBetaLayout>
  );
}
