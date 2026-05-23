import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Globe, Zap, Mountain, Heart, ShieldCheck, ExternalLink } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/20 to-black text-white">
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-14">

        {/* Header */}
        <div className="space-y-4 text-center">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-purple-500 via-cyan-500 to-teal-500 flex items-center justify-center shadow-xl">
            <Globe className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-black text-white">The Poles</h1>
          <p className="text-purple-300/70 text-lg max-w-xl mx-auto">
            A skill-based competition and prize discovery platform where winning means something — and every match helps a child.
          </p>
        </div>

        {/* Mission Statement */}
        <section className="space-y-5">
          <h2 className="text-2xl font-bold text-white">Our Mission</h2>
          <div className="bg-purple-900/20 border border-purple-700/30 rounded-2xl p-6 space-y-3">
            <p className="text-purple-200/80 leading-relaxed">
              We believe the time, effort, discipline, and sacrifice a person puts into mastering a skill should be valued just as much as the time they spend working for someone else.
            </p>
            <p className="text-purple-200/80 leading-relaxed">
              <strong>The Poles was created for people who have spent countless hours developing their abilities and are confident enough to put those abilities to the test.</strong>
            </p>
            <p className="text-purple-200/80 leading-relaxed">
              This platform allows skilled individuals to challenge others who have also put in the work, compete in skill-based matches or events, and play for a prize of their choice.
            </p>
            <p className="text-purple-200/80 leading-relaxed">
              Every match is built on <strong>confidence, preparation, and performance — not chance.</strong>
            </p>
            <p className="text-purple-200/80 leading-relaxed">
              If you have invested the time, developed the skill, and believe in your ability to win, The Poles gives you a place to prove it.
            </p>
          </div>
        </section>

        {/* What We Do */}
        <section className="space-y-5">
          <h2 className="text-2xl font-bold text-white">How We Work</h2>
          <p className="text-purple-200/70 leading-relaxed">
            The Poles connects skilled people through verifiable skill-based competitions with real prizes. We are not a gambling platform — 
            all outcomes are determined by verifiable skill, score, time, or performance. Think of it as a combination of 
            a competitive arcade, a sports league organizer, and a prize discovery service.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-purple-900/20 border border-purple-700/20 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-3xl">🎅</span>
                <h3 className="font-bold text-white">The North Pole</h3>
              </div>
              <p className="text-purple-200/60 text-sm">Digital skill matches. Choose a prize from our catalog, compete against other players, and the highest scorer wins. Prizes include electronics, gaming gear, gift cards, and more.</p>
            </div>
            <div className="bg-cyan-900/20 border border-cyan-700/20 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-3xl">🧊</span>
                <h3 className="font-bold text-white">The South Pole</h3>
              </div>
              <p className="text-cyan-200/60 text-sm">Real-world competitive events. Races, bowling tournaments, escape rooms, cooking battles, trivia nights, and more. Compete for vacations, concert tickets, cruises, and experiences.</p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="space-y-5">
          <h2 className="text-2xl font-bold text-white">How It Works</h2>
          <div className="space-y-4">
            {[
              { step: "1", icon: <ShieldCheck className="w-5 h-5 text-purple-400" />, title: "Browse Prizes", desc: "Explore our prize catalog — products sourced from trusted retailers. Filter by category, price, or type." },
              { step: "2", icon: <Zap className="w-5 h-5 text-yellow-400" />, title: "Join or Create a Match", desc: "Find an open match or create your own. Set the prize, the game, and invite competitors." },
              { step: "3", icon: <Mountain className="w-5 h-5 text-cyan-400" />, title: "Compete by Skill", desc: "Play the digital game or participate in the real-world event. All results are verified — no luck involved." },
              { step: "4", icon: <Heart className="w-5 h-5 text-pink-400" />, title: "Winner Gets the Prize", desc: "The verified top performer wins the prize. 10% of the prize value goes to The North Pole Fund." },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-black/40 border border-purple-700/20 flex items-center justify-center shrink-0 font-black text-purple-300 text-lg">
                  {step}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">{icon}<h3 className="font-semibold text-white text-sm">{title}</h3></div>
                  <p className="text-purple-200/60 text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* The North Pole Fund */}
        <section className="bg-gradient-to-r from-pink-900/20 to-rose-900/20 border border-pink-700/30 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-3">
            <Heart className="w-7 h-7 text-pink-400" />
            <h2 className="text-2xl font-bold text-white">The North Pole Fund</h2>
          </div>
          <p className="text-pink-200/70 leading-relaxed">
            Every competition on The Poles contributes 10% of its prize value to The North Pole Fund. 
            This fund is dedicated to providing gifts for children in need — turning competitive play into 
            real charitable impact.
          </p>
          <p className="text-pink-200/70 text-sm">
            Additionally, a portion of affiliate commissions earned through product referrals is allocated to the fund.
          </p>
        </section>

        {/* Affiliate & Transparency */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Transparency & Affiliates</h2>
          <p className="text-purple-200/70 leading-relaxed">
            Some product links on our platform are affiliate links. When you click through and buy a product at a retailer, 
            we may earn a small commission — at no extra cost to you. This revenue helps fund platform operations and 
            The North Pole Fund.
          </p>
          <p className="text-purple-200/70 leading-relaxed">
            We always disclose affiliate relationships clearly. Retailers are not sponsors of our competitions 
            unless a formal partnership is disclosed on the relevant page.
          </p>
          <Link to="/AffiliateDisclosure">
            <Button variant="outline" className="border-purple-700/40 text-purple-300 text-sm">
              <ExternalLink className="w-4 h-4 mr-2" /> Read Full Affiliate Disclosure
            </Button>
          </Link>
        </section>

        {/* Legal footer */}
        <div className="pt-6 border-t border-purple-700/20 flex flex-wrap gap-4 text-xs text-purple-400/60">
          <Link to="/PrivacyPolicy" className="hover:text-purple-300">Privacy Policy</Link>
          <Link to="/TermsOfUse" className="hover:text-purple-300">Terms of Use</Link>
          <Link to="/AffiliateDisclosure" className="hover:text-purple-300">Affiliate Disclosure</Link>
          <Link to="/Contact" className="hover:text-purple-300">Contact</Link>
        </div>

      </div>
    </div>
  );
}