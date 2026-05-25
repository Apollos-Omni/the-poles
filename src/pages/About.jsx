import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Gift, Heart, Mountain, ShieldCheck } from 'lucide-react';
import PublicBetaLayout, { BetaDisclosurePanel, PublicBetaBadge } from '@/components/public/PublicBetaLayout';

export default function About() {
  return (
    <PublicBetaLayout>
      <div className="space-y-8">
        <div className="space-y-4">
          <PublicBetaBadge />
          <h1 className="text-4xl font-black">About The Poles</h1>
          <p className="text-lg leading-relaxed text-purple-100/75">
            The Poles is a skill competition and prize discovery platform in public beta. The current release is meant
            to test account flows, match creation, challenge organization, provider search, and admin review before
            live payments or real prize fulfillment are enabled.
          </p>
        </div>

        <BetaDisclosurePanel />

        <section className="grid gap-4 md:grid-cols-2">
          <Card className="border-purple-500/20 bg-purple-500/10 text-white">
            <CardContent className="space-y-3 p-5">
              <Gift className="h-6 w-6 text-purple-200" />
              <h2 className="text-xl font-bold">The North Pole</h2>
              <p className="text-sm leading-relaxed text-purple-100/75">
                Digital skill matches where users can choose a prize concept, choose a game, and join persisted beta
                rooms. During beta, entries, payments, retailer ordering, and fulfillment are simulated.
              </p>
            </CardContent>
          </Card>
          <Card className="border-cyan-500/20 bg-cyan-500/10 text-white">
            <CardContent className="space-y-3 p-5">
              <Mountain className="h-6 w-6 text-cyan-200" />
              <h2 className="text-xl font-bold">The South Pole</h2>
              <p className="text-sm leading-relaxed text-cyan-100/75">
                Real-world challenge and event coordination for leagues, groups, and community competitions. Public
                beta tools are for planning and testing, not collecting live entry fees.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">What beta does and does not mean</h2>
          <div className="space-y-3 text-sm leading-relaxed text-purple-100/75">
            <p>
              The beta can use provider APIs such as product or game search when keys are configured. If a provider is
              unavailable, sample fallback catalogs may be shown so the user experience remains testable.
            </p>
            <p>
              The platform includes agreement screens, admin review areas, RBAC-protected dashboards, and simulated
              fulfillment records. These features support readiness testing but are not a statement that legal review,
              regulatory review, payment approval, or fulfillment operations are complete.
            </p>
          </div>
        </section>

        <section className="rounded-lg border border-pink-500/25 bg-pink-500/10 p-5">
          <div className="flex items-start gap-3">
            <Heart className="mt-1 h-5 w-5 text-pink-200" />
            <div>
              <h2 className="text-xl font-bold">The Poles Fund</h2>
              <p className="mt-2 text-sm leading-relaxed text-pink-100/75">
                The public beta displays the intended The Poles Fund model, but actual fund collection and prize
                fulfillment remain simulated until live operations are explicitly enabled after review.
              </p>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link to="/OfficialSkillCompetitionRules">
            <Button className="bg-white text-black hover:bg-purple-100">
              <ShieldCheck className="mr-2 h-4 w-4" /> Read beta rules placeholder
            </Button>
          </Link>
          <Link to="/Contact">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">Contact support</Button>
          </Link>
        </div>
      </div>
    </PublicBetaLayout>
  );
}
