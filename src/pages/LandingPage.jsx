import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Gift, Mountain, ShieldCheck, UserPlus, LogIn } from 'lucide-react';
import PublicBetaLayout, { BetaDisclosurePanel, PublicBetaBadge } from '@/components/public/PublicBetaLayout';
import heroImage from '@/assets/public-beta-hero.png';

export default function LandingPage() {
  return (
    <PublicBetaLayout maxWidth="max-w-6xl">
      <section className="relative -mx-4 -mt-12 min-h-[78vh] overflow-hidden px-4 py-16 md:py-24">
        <img
          src={heroImage}
          alt="Skill competition prize platform preview"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/72 to-black/15" />
        <div className="relative z-10 flex min-h-[58vh] max-w-2xl flex-col justify-center gap-6">
          <PublicBetaBadge className="w-fit" />
          <div className="space-y-4">
            <h1 className="text-5xl font-black leading-tight text-white md:text-7xl">The Poles</h1>
            <p className="max-w-xl text-lg leading-relaxed text-purple-50/85">
              A public beta for skill-based digital matches, real-world challenges, and prize discovery.
              Built for testing the experience before live payments or fulfillment are enabled.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/SignIn">
              <Button className="bg-white text-black hover:bg-purple-100">
                <LogIn className="mr-2 h-4 w-4" /> Sign in
              </Button>
            </Link>
            <Link to="/CreateAccount">
              <Button variant="outline" className="border-white/40 bg-black/30 text-white hover:bg-white/10">
                <UserPlus className="mr-2 h-4 w-4" /> Create account
              </Button>
            </Link>
            <Link to="/NorthPole">
              <Button variant="outline" className="border-cyan-300/40 bg-cyan-500/10 text-cyan-100 hover:bg-cyan-500/20">
                <Gift className="mr-2 h-4 w-4" /> View The North Pole
              </Button>
            </Link>
            <Link to="/SouthPole">
              <Button variant="outline" className="border-green-300/40 bg-green-500/10 text-green-100 hover:bg-green-500/20">
                <Mountain className="mr-2 h-4 w-4" /> View The South Pole
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 py-10 md:grid-cols-3">
        {[
          ['North Pole', 'Create or join digital skill matches with simulated buy-ins and simulated prize fulfillment.', Gift],
          ['South Pole', 'Coordinate real-world challenges and community competitions without enabling live collection.', Mountain],
          ['Beta Guardrails', 'Agreements, RBAC, provider fallbacks, and admin review remain visible while production legal and payment work continues.', ShieldCheck],
        ].map(([title, body, Icon]) => (
          <Card key={title} className="border-white/10 bg-white/[0.04] text-white">
            <CardContent className="space-y-3 p-5">
              <Icon className="h-6 w-6 text-cyan-200" />
              <h2 className="text-lg font-bold">{title}</h2>
              <p className="text-sm leading-relaxed text-purple-100/70">{body}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-5 pb-8 md:grid-cols-[1.4fr_0.9fr]">
        <BetaDisclosurePanel />
        <Link to="/About" className="group rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm text-purple-100/75 hover:bg-white/[0.07]">
          <span className="font-semibold text-white">Learn how beta works</span>
          <span className="mt-2 flex items-center gap-2 text-cyan-100">
            About The Poles <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      </section>
    </PublicBetaLayout>
  );
}
