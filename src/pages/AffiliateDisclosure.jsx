import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ExternalLink, Heart } from "lucide-react";

export default function AffiliateDisclosure() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/20 to-black text-white">
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-10">

        <div className="space-y-2">
          <Link to="/ThePoles" className="text-purple-400 text-sm hover:underline">← Back to The Poles</Link>
          <h1 className="text-4xl font-black text-white">Affiliate Disclosure</h1>
          <p className="text-purple-300/60 text-sm">Last updated: May 2026</p>
        </div>

        <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-2xl p-5 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-yellow-200/80 text-sm">
            <strong className="text-yellow-200">Important:</strong> Some links on this platform are affiliate links. 
            This means we may earn a small commission if you click through and make a purchase — at no additional cost to you.
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">What Are Affiliate Links?</h2>
          <p className="text-purple-200/70 leading-relaxed">
            When you click a "View at Retailer," "Shop Now," or similar button on The Poles platform, you may be 
            directed to a third-party retailer (such as Amazon, Walmart, or eBay) via a special tracking URL. 
            If you purchase a product after clicking that link, the retailer may pay us a small commission.
          </p>
          <p className="text-purple-200/70 leading-relaxed">
            These commissions help support the platform's operations and The North Pole Fund — our initiative 
            to provide gifts for children in need.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">FTC Disclosure</h2>
          <p className="text-purple-200/70 leading-relaxed">
            In accordance with the Federal Trade Commission's guidelines, we disclose that The Poles platform 
            participates in affiliate advertising programs. We are compensated for referring traffic and business 
            to participating companies.
          </p>
          <p className="text-purple-200/70 leading-relaxed">
            All affiliate relationships are disclosed at the point of the link — you will see a "Paid link" or 
            "Affiliate link" notice near any outbound product button.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Amazon Associates</h2>
          <div className="bg-black/40 border border-purple-700/20 rounded-xl p-4">
            <p className="text-purple-200/70 text-sm leading-relaxed">
              The Poles is a participant in the Amazon Services LLC Associates Program, an affiliate advertising 
              program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com.
            </p>
            <p className="text-purple-300 text-sm font-semibold mt-2">
              As an Amazon Associate we earn from qualifying purchases.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">What We Don't Do</h2>
          <ul className="space-y-2 text-purple-200/70 text-sm">
            {[
              "We do not recommend products solely based on commission rates.",
              "We do not hide or cloak affiliate links — you will always see the destination retailer.",
              "We do not purchase winners' prizes through ordinary affiliate links.",
              "Retailers are not sponsors of events unless a written partnership agreement exists.",
              "Prices shown are estimates and may change — always verify at the retailer.",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Prize Fulfillment vs. Affiliate Referrals</h2>
          <p className="text-purple-200/70 leading-relaxed">
            Our platform has two separate flows that should not be confused:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-purple-900/20 border border-purple-700/20 rounded-xl p-4 space-y-2">
              <h3 className="font-semibold text-purple-300">Affiliate Referral</h3>
              <p className="text-xs text-purple-200/60">You browse products → click a link → buy at retailer → we may earn a commission. This is a normal referral.</p>
            </div>
            <div className="bg-cyan-900/20 border border-cyan-700/20 rounded-xl p-4 space-y-2">
              <h3 className="font-semibold text-cyan-300">Prize Fulfillment</h3>
              <p className="text-xs text-cyan-200/60">Match players fund a prize pool → winner is verified by skill → prize is sourced and delivered separately. Affiliate links are not used for fulfillment purchases.</p>
            </div>
          </div>
        </section>

        <div className="bg-gradient-to-r from-pink-900/20 to-rose-900/20 border border-pink-700/30 rounded-2xl p-5 flex gap-4">
          <Heart className="w-6 h-6 text-pink-400 shrink-0" />
          <div>
            <h3 className="font-semibold text-white text-sm mb-1">Supporting The North Pole Fund</h3>
            <p className="text-pink-200/60 text-xs">A portion of affiliate commissions and 10% of every prize pool goes to The North Pole Fund, helping provide gifts to children in need.</p>
          </div>
        </div>

        <div className="pt-4 border-t border-purple-700/20 space-y-2">
          <p className="text-purple-400/60 text-sm">Questions about our affiliate relationships?</p>
          <Link to="/Contact">
            <Button variant="outline" className="border-purple-700/40 text-purple-300">
              <ExternalLink className="w-4 h-4 mr-2" /> Contact Us
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}