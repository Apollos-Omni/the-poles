import React from "react";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";

const Section = ({ title, children }) => (
  <section className="space-y-3">
    <h2 className="text-xl font-bold text-white">{title}</h2>
    <div className="text-purple-200/70 text-sm leading-relaxed space-y-3">{children}</div>
  </section>
);

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/20 to-black text-white">
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-10">

        <div className="space-y-2">
          <Link to="/ThePoles" className="text-purple-400 text-sm hover:underline">← Back to The Poles</Link>
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-black text-white">Terms of Use</h1>
          </div>
          <p className="text-purple-300/60 text-sm">Last updated: May 2026</p>
        </div>

        <Section title="1. Acceptance of Terms">
          <p>By accessing or using The Poles platform, you agree to be bound by these Terms of Use and our Privacy Policy. If you do not agree, please do not use the platform.</p>
        </Section>

        <Section title="2. Skill-Based Competition Only">
          <p>All competitions on The Poles platform are determined by skill — never by random selection, chance, or luck. This platform does not operate a gambling service, lottery, sweepstakes, or any game of chance.</p>
          <p>Winners are determined by verifiable performance metrics such as scores, times, judges, referees, or other objective skill-based criteria defined per event.</p>
        </Section>

        <Section title="3. Acceptable Use">
          <ul className="space-y-1.5">
            {[
              "You must be 18 years or older to participate in prize-funded competitions (or 13+ with parental consent for non-monetary participation).",
              "You may not misrepresent your identity or skill level.",
              "You may not attempt to manipulate match outcomes, scores, or results.",
              "You may not use the platform for any illegal purpose.",
              "You may not scrape, copy, or redistribute platform content without permission.",
            ].map((item, i) => <li key={i} className="flex gap-2"><span className="text-purple-400">•</span>{item}</li>)}
          </ul>
        </Section>

        <Section title="4. Prize & Match Disclaimers">
          <p><strong className="text-white">Sandbox Mode:</strong> All matches and events are currently in sandbox/demo mode. No real payments are processed and no physical prizes are shipped unless explicitly stated.</p>
          <p><strong className="text-white">Prize Values:</strong> Estimated prize values are approximate and may change based on retailer pricing. Final prize value is determined at time of purchase.</p>
          <p><strong className="text-white">Retailer Independence:</strong> Retailers (Amazon, Walmart, eBay, etc.) are independent third parties and are NOT sponsors of The Poles events unless a written partnership agreement is disclosed on the relevant event page.</p>
          <p><strong className="text-white">Fulfillment:</strong> Prize fulfillment is subject to admin verification and approval. We reserve the right to substitute prizes of equal or greater value if the selected item becomes unavailable.</p>
        </Section>

        <Section title="5. Affiliate Links">
          <p>Some product links are affiliate links. Clicking them and making a purchase may result in a commission for The Poles platform. This does not affect the price you pay. See our <Link to="/AffiliateDisclosure" className="text-purple-300 hover:underline">Affiliate Disclosure</Link> for full details.</p>
          <p>Affiliate commissions are used to support platform operations and The North Pole Fund charitable initiative.</p>
        </Section>

        <Section title="6. The North Pole Fund">
          <p>10% of prize pool values is allocated to The North Pole Fund, a charitable initiative to provide gifts to children in need. This contribution is calculated based on prize value at time of match creation. The fund is administered by platform operators and is subject to operational costs.</p>
        </Section>

        <Section title="7. Account Suspension & Deletion">
          <p>We reserve the right to suspend or terminate accounts that violate these terms, engage in fraud, or misuse the platform. You may request account deletion at any time by contacting us.</p>
          <p>Upon deletion: your profile is removed, active match participations are forfeited, and any pending winnings subject to unresolved disputes may be held during investigation.</p>
        </Section>

        <Section title="8. Refunds">
          <p>In sandbox/demo mode, all transactions are simulated and no refunds apply. When real payments are enabled, refunds are governed by the refund policy displayed at the time of purchase. Match entry fees are generally non-refundable after a match has started.</p>
        </Section>

        <Section title="9. Disclaimers & Limitation of Liability">
          <p>The Poles platform is provided "as is" without warranties of any kind. We are not liable for: losses arising from match outcomes, retailer pricing changes, affiliate link behavior, technical failures, or any indirect damages.</p>
        </Section>

        <Section title="10. Changes to Terms">
          <p>We may update these Terms periodically. Continued use of the platform constitutes acceptance of the updated Terms. Material changes will be communicated via email or in-app notice.</p>
        </Section>

        <div className="pt-4 border-t border-purple-700/20">
          <p className="text-purple-400/60 text-sm">Questions? <Link to="/Contact" className="text-purple-300 hover:underline">Contact us</Link></p>
        </div>

      </div>
    </div>
  );
}