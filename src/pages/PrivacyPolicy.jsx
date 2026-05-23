import React from "react";
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

const Section = ({ title, children }) => (
  <section className="space-y-3">
    <h2 className="text-xl font-bold text-white">{title}</h2>
    <div className="text-purple-200/70 text-sm leading-relaxed space-y-3">{children}</div>
  </section>
);

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/20 to-black text-white">
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-10">

        <div className="space-y-2">
          <Link to="/ThePoles" className="text-purple-400 text-sm hover:underline">← Back to The Poles</Link>
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-black text-white">Privacy Policy</h1>
          </div>
          <p className="text-purple-300/60 text-sm">Last updated: May 2026 · Effective immediately</p>
        </div>

        <Section title="Who We Are">
          <p>The Poles is a skill-based competition and prize discovery platform. This Privacy Policy explains how we collect, use, and protect your information when you use our application and website.</p>
          <p>Contact: <span className="text-purple-300">privacy@thepolesplatform.com</span></p>
        </Section>

        <Section title="Information We Collect">
          <p><strong className="text-white">Account Information:</strong> Name, email address, and profile details you provide when creating an account.</p>
          <p><strong className="text-white">Usage Data:</strong> Pages visited, features used, match participation history, and in-app interactions.</p>
          <p><strong className="text-white">Affiliate Click Data:</strong> When you click an affiliate link, we log the offer ID, merchant, timestamp, source page, and your user ID (if logged in) to track referral attribution.</p>
          <p><strong className="text-white">Device & Technical Data:</strong> Browser type, operating system, and IP address for security and analytics.</p>
          <p><strong className="text-white">Payment Information:</strong> We do not store full payment card data. Any payment processing is handled by certified third-party processors.</p>
        </Section>

        <Section title="How We Use Your Information">
          <ul className="space-y-1.5">
            {[
              "To provide and improve the platform's features",
              "To verify skill-match results and manage prize fulfillment",
              "To track affiliate referrals for commission purposes",
              "To send account notifications and match updates (with your consent)",
              "To detect fraud and maintain platform security",
              "To comply with legal obligations",
            ].map((item, i) => <li key={i} className="flex gap-2"><span className="text-purple-400">•</span>{item}</li>)}
          </ul>
        </Section>

        <Section title="Sharing Your Information">
          <p>We do not sell your personal information. We may share data with:</p>
          <ul className="space-y-1.5">
            {[
              "Affiliate networks and merchants (click/conversion data only — no personal PII)",
              "Payment processors for transaction handling",
              "Analytics providers (aggregated, anonymized data)",
              "Law enforcement when required by law",
            ].map((item, i) => <li key={i} className="flex gap-2"><span className="text-purple-400">•</span>{item}</li>)}
          </ul>
        </Section>

        <Section title="Affiliate Tracking">
          <p>When you click a product or prize link, we log the click for affiliate commission tracking. This data is shared with the relevant affiliate network (e.g., Amazon Associates, eBay Partner Network) in accordance with their privacy policies. We do not share your name or email with retailers via affiliate links.</p>
        </Section>

        <Section title="Data Retention">
          <p>We retain account data for as long as your account is active. Affiliate click logs are retained for up to 24 months for attribution purposes. You may request deletion of your data at any time.</p>
        </Section>

        <Section title="Your Rights">
          <p>You have the right to: access your data, correct inaccurate data, request deletion of your data, opt out of non-essential communications, and request a copy of your data in a portable format.</p>
          <p>To exercise any of these rights, contact us at <span className="text-purple-300">privacy@thepolesplatform.com</span>.</p>
        </Section>

        <Section title="Children's Privacy">
          <p>Our platform is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us information, please contact us immediately.</p>
          <p>For youth sports leagues (South Pole team campaigns), parental consent is required for participants under 18.</p>
        </Section>

        <Section title="Security">
          <p>We use industry-standard security measures including encrypted data transmission (HTTPS), access controls, and regular security audits. However, no system is 100% secure, and we encourage you to use a strong, unique password.</p>
        </Section>

        <Section title="Changes to This Policy">
          <p>We may update this Privacy Policy periodically. We will notify you of significant changes via email or in-app notification. Continued use of the platform after changes constitutes acceptance of the updated policy.</p>
        </Section>

        <div className="pt-4 border-t border-purple-700/20">
          <p className="text-purple-400/60 text-sm">Questions? <Link to="/Contact" className="text-purple-300 hover:underline">Contact us</Link> or email privacy@thepolesplatform.com</p>
        </div>

      </div>
    </div>
  );
}