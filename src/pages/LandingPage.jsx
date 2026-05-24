import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Gamepad2,
  Gift,
  HandHeart,
  HeartHandshake,
  Mail,
  Map,
  Mountain,
  School,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PARTNER_EMAIL, SUPPORT_EMAIL, partnerMailto, supportMailto } from '@/config/contact';
import heroImage from '@/assets/public-beta-hero.png';

const navItems = [
  ['North Pole', '/NorthPole'],
  ['South Pole', '/SouthPole'],
  ['Leagues', '/Leagues'],
  ['Partners', '#partners'],
  ['Safety', '#safety'],
  ['About', '/About'],
];

const howItWorks = [
  ['Choose a skill path', 'Pick gaming, esports, sports, league play, or a community competition format.'],
  ['Join or create a verified challenge', 'Set rules, confidence level, records, and a clear entry contribution path.'],
  ['Compete through skill, not chance', 'Results come from performance, scoring, judging, or verified completion.'],
  ['Winner follows the prize path', 'The platform tracks status, records, and fulfillment context for the selected prize path.'],
  ['Support the North Pole Fund', 'Our mission is to direct platform impact toward helping children.'],
];

const partnerGroups = [
  ['Youth leagues', Users],
  ['Adult leagues', Trophy],
  ['Esports communities', Gamepad2],
  ['Schools and rec centers', School],
  ['Sponsors', Sparkles],
  ['Retail and affiliate partners', Gift],
  ['Charities', HandHeart],
];

const trustItems = [
  ['Skill-based structure', 'Challenge rules are built around measurable performance, scoring, judging, or verified completion.'],
  ['Transparent challenge records', 'Records, status, evidence notes, and fulfillment context can be tracked through the platform.'],
  ['Verified results', 'The product direction emphasizes proof, result review, and clear winner confirmation.'],
  ['Parent and community awareness', 'The Poles is designed to be legible to families, leagues, organizers, and local communities.'],
  ['Support contact', `Support requests should go to ${SUPPORT_EMAIL}. Partnership inquiries go to ${PARTNER_EMAIL}.`],
  ['Future compliance review', 'High-value, youth, charitable, payment, and fulfillment flows are expected to receive additional review.'],
];

function NavLink({ to, children, className = '' }) {
  if (to.startsWith('#')) {
    return <a href={to} className={className}>{children}</a>;
  }

  return <Link to={to} className={className}>{children}</Link>;
}

function GlassCard({ children, className = '' }) {
  return (
    <Card className={`border-white/10 bg-white/[0.055] text-white shadow-2xl shadow-purple-950/25 backdrop-blur-xl ${className}`}>
      <CardContent className="p-5 sm:p-6">{children}</CardContent>
    </Card>
  );
}

function GlowButton({ to, children, variant = 'primary', className = '' }) {
  const styles = {
    primary: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-950/40 hover:from-cyan-400 hover:to-blue-500',
    south: 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg shadow-fuchsia-950/35 hover:from-purple-500 hover:to-fuchsia-500',
    ghost: 'border border-white/15 bg-white/[0.08] text-white hover:bg-white/[0.14]',
  };

  return (
    <Link to={to} className={`block ${className}`}>
      <Button className={`min-h-12 w-full rounded-xl px-5 text-sm font-bold sm:w-auto ${styles[variant]}`}>
        {children}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </Link>
  );
}

function SectionHeader({ eyebrow, title, body, align = 'left' }) {
  return (
    <div className={`mb-9 max-w-3xl ${align === 'center' ? 'mx-auto text-center' : ''}`}>
      <Badge className="border border-cyan-300/20 bg-cyan-400/10 text-cyan-100">{eyebrow}</Badge>
      <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">{title}</h2>
      {body && <p className="mt-4 text-sm leading-relaxed text-purple-100/70 sm:text-base">{body}</p>}
    </div>
  );
}

function PoleBadge({ children, tone = 'north' }) {
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] ${
      tone === 'north'
        ? 'border-cyan-300/25 bg-cyan-400/10 text-cyan-100'
        : 'border-fuchsia-300/25 bg-fuchsia-500/10 text-fuchsia-100'
    }`}>
      {children}
    </span>
  );
}

function HeroVisual() {
  return (
    <div className="relative min-h-[480px] overflow-hidden rounded-[2rem] border border-white/10 bg-black/55 shadow-[0_0_90px_rgba(34,211,238,0.12)] sm:min-h-[560px]">
      <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-58" />
      <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-950/55 to-black" />
      <div className="absolute left-0 top-0 h-full w-1/2 bg-gradient-to-br from-cyan-500/18 via-blue-900/20 to-transparent" />
      <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-bl from-fuchsia-500/22 via-purple-900/24 to-transparent" />
      <div className="absolute left-1/2 top-0 h-full w-px bg-gradient-to-b from-transparent via-white/35 to-transparent" />
      <div className="absolute -left-16 top-20 h-52 w-52 rounded-full bg-cyan-400/18 blur-3xl" />
      <div className="absolute -right-12 bottom-16 h-60 w-60 rounded-full bg-fuchsia-500/18 blur-3xl" />

      <div className="relative z-10 grid min-h-[480px] grid-cols-1 sm:min-h-[560px] md:grid-cols-2">
        <div className="flex flex-col justify-end gap-4 p-5 sm:p-7">
          <PoleBadge tone="north">North Pole</PoleBadge>
          <div>
            <Gamepad2 className="mb-4 h-10 w-10 text-cyan-100" />
            <h3 className="text-3xl font-black text-white">Gaming skill paths</h3>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-cyan-50/72">
              Digital challenges, esports communities, verified results, prize paths, and the North Pole Fund mission.
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-end gap-4 border-t border-white/10 p-5 sm:p-7 md:border-l md:border-t-0">
          <PoleBadge tone="south">South Pole</PoleBadge>
          <div>
            <Mountain className="mb-4 h-10 w-10 text-fuchsia-100" />
            <h3 className="text-3xl font-black text-white">Sports and leagues</h3>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-fuchsia-50/72">
              Local leagues, teams, standings, real-world competition, and community growth for organizers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_top_right,rgba(217,70,239,0.16),transparent_28%),linear-gradient(135deg,#020617,#12051f_48%,#020617)]" />

      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/78 backdrop-blur-2xl">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <Link to="/" className="flex min-w-0 items-center gap-2">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-200/25 bg-gradient-to-br from-cyan-400/25 to-fuchsia-500/20 text-sm font-black text-white shadow-lg shadow-cyan-950/30">TP</span>
              <span className="truncate text-lg font-black tracking-wide text-white">The Poles</span>
            </Link>

            <nav className="hidden items-center gap-5 text-sm font-medium text-white/68 lg:flex">
              {navItems.map(([label, to]) => (
                <NavLink key={label} to={to} className="transition hover:text-white">
                  {label}
                </NavLink>
              ))}
            </nav>

            <div className="hidden items-center gap-2 sm:flex">
              <Link to="/SignIn">
                <Button variant="ghost" className="text-white/80 hover:bg-white/10 hover:text-white">
                  Sign In
                </Button>
              </Link>
              <Link to="/CreateAccount">
                <Button className="bg-white text-black hover:bg-cyan-100">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {navItems.map(([label, to]) => (
              <NavLink
                key={label}
                to={to}
                className="min-h-10 shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/75"
              >
                {label}
              </NavLink>
            ))}
            <Link to="/SignIn">
              <Button size="sm" variant="outline" className="min-h-10 shrink-0 border-white/10 bg-white/5 text-white">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="px-4 pb-14 pt-10 sm:px-6 sm:pb-20 sm:pt-16 lg:px-8">
          <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="max-w-3xl">
              <div className="mb-5 flex flex-wrap gap-2">
                <PoleBadge tone="north">Gaming</PoleBadge>
                <PoleBadge tone="south">Sports</PoleBadge>
                <PoleBadge tone="north">Skill-based</PoleBadge>
              </div>
              <h1 className="text-4xl font-black leading-[0.96] tracking-tight text-white sm:text-6xl lg:text-7xl">
                Skill-based competition. Prize paths. Leagues with purpose.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-purple-100/76 sm:text-lg">
                The Poles is a dark, cinematic competition platform connecting video gaming, real-world sports, verified challenges, prize paths, and league communities with a mission to support children through the North Pole Fund.
              </p>

              <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
                <GlowButton to="/NorthPole">Enter The North Pole</GlowButton>
                <GlowButton to="/SouthPole" variant="south">Explore The South Pole</GlowButton>
                <a href="#partners" className="block">
                  <Button variant="outline" className="min-h-12 w-full rounded-xl border-white/15 bg-white/[0.08] px-5 text-sm font-bold text-white hover:bg-white/[0.14] sm:w-auto">
                    Partner With Us
                    <Mail className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  ['Skill matches', Gamepad2],
                  ['League growth', Users],
                  ['Prize paths', Gift],
                ].map(([label, Icon]) => (
                  <div key={label} className="flex min-h-16 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] px-4 backdrop-blur">
                    <Icon className="h-5 w-5 text-cyan-100" />
                    <span className="text-sm font-bold text-white">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <HeroVisual />
          </div>
        </section>

        <section className="border-y border-white/10 bg-black/45 px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Video gaming', Gamepad2],
              ['Real-world sports', Trophy],
              ['League operations', BarChart3],
              ['North Pole Fund', HeartHandshake],
            ].map(([label, Icon]) => (
              <div key={label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.075] to-white/[0.025] p-4">
                <Icon className="h-6 w-6 text-cyan-100" />
                <span className="text-base font-black text-white">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeader
              eyebrow="Split Identity"
              title="Two poles. One competition engine."
              body="The public brand is intentionally split: one side for gaming and digital skill paths, the other for real-world sports, leagues, teams, and standings."
            />

            <div className="grid gap-5 lg:grid-cols-2">
              <GlassCard className="relative overflow-hidden">
                <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-400/12 blur-3xl" />
                <div className="relative">
                  <PoleBadge tone="north">North Pole</PoleBadge>
                  <Gamepad2 className="mt-7 h-12 w-12 text-cyan-100" />
                  <h3 className="mt-5 text-3xl font-black text-white">Gaming, digital skill challenges, prize paths, and mission impact.</h3>
                  <p className="mt-4 text-sm leading-relaxed text-cyan-50/72">
                    The North Pole is the digital competition side: gaming communities, skill matches, confidence levels, transparent records, and prize paths. It also carries the North Pole Fund mission, designed to support gifts and opportunities for children.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {['Esports', 'Digital challenges', 'Prize path', 'North Pole Fund'].map((label) => (
                      <span key={label} className="rounded-full border border-cyan-300/15 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-100">{label}</span>
                    ))}
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="relative overflow-hidden">
                <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-fuchsia-400/12 blur-3xl" />
                <div className="relative">
                  <PoleBadge tone="south">South Pole</PoleBadge>
                  <Trophy className="mt-7 h-12 w-12 text-fuchsia-100" />
                  <h3 className="mt-5 text-3xl font-black text-white">Sports, local leagues, teams, standings, and real-world competition.</h3>
                  <p className="mt-4 text-sm leading-relaxed text-fuchsia-50/72">
                    The South Pole is built for organizers: youth leagues, adult leagues, clubs, schools, rec centers, teams, standings, events, verified outcomes, and community growth.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {['Teams', 'Standings', 'Local leagues', 'Verified results'].map((label) => (
                      <span key={label} className="rounded-full border border-fuchsia-300/15 bg-fuchsia-500/10 px-3 py-1 text-xs font-semibold text-fuchsia-100">{label}</span>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </section>

        <section className="bg-white/[0.03] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeader
              eyebrow="How It Works"
              title="Simple enough for players. Structured enough for partners."
              body="The Poles avoids chance-based language and focuses every experience around skill, transparent rules, and accountable challenge records."
              align="center"
            />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {howItWorks.map(([title, body], index) => (
                <div key={title} className="relative rounded-2xl border border-white/10 bg-black/52 p-5 shadow-xl shadow-purple-950/12">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-400/10 text-sm font-black text-cyan-100">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-black text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-purple-100/65">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-7 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="flex flex-col justify-center">
              <SectionHeader
                eyebrow="League Growth"
                title="Built for communities that need structure and momentum."
                body="The South Pole can grow from a local league dashboard into schedules, standings, verified stats, digital recognition, sponsor visibility, and future championship paths."
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <GlowButton to="/Leagues" variant="south">Open League Hub</GlowButton>
                <GlowButton to="/SouthPole" variant="ghost">Explore South Pole</GlowButton>
              </div>
            </div>

            <div className="relative min-h-[360px] overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-950/40 via-black to-fuchsia-950/35 p-6">
              <Map className="h-10 w-10 text-cyan-100" />
              <div className="absolute left-[15%] top-[33%] h-3 w-3 rounded-full bg-cyan-300 shadow-lg shadow-cyan-300/60" />
              <div className="absolute left-[44%] top-[49%] h-3 w-3 rounded-full bg-purple-300 shadow-lg shadow-purple-300/60" />
              <div className="absolute right-[18%] top-[29%] h-3 w-3 rounded-full bg-fuchsia-300 shadow-lg shadow-fuchsia-300/60" />
              <div className="absolute bottom-[22%] left-[34%] h-3 w-3 rounded-full bg-blue-300 shadow-lg shadow-blue-300/60" />
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 420 360" aria-hidden="true">
                <path d="M72 118 C150 170, 164 178, 190 176 S295 102, 338 104" fill="none" stroke="rgba(103,232,249,.45)" strokeWidth="2" />
                <path d="M190 176 C178 238, 147 256, 120 280" fill="none" stroke="rgba(216,180,254,.48)" strokeWidth="2" />
                <path d="M190 176 C245 213, 292 230, 338 104" fill="none" stroke="rgba(232,121,249,.36)" strokeWidth="2" />
              </svg>
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-100/70">Community Network</p>
                <h3 className="mt-2 text-3xl font-black text-white">Local to regional to national.</h3>
              </div>
            </div>
          </div>
        </section>

        <section id="partners" className="bg-gradient-to-br from-purple-950/35 via-black to-cyan-950/25 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeader
              eyebrow="Partners"
              title="A platform for leagues, sponsors, schools, communities, and commerce."
              body="The Poles is meant to be credible for partners who care about skill, accountability, youth/community awareness, and measurable platform impact."
              align="center"
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {partnerGroups.map(([label, Icon]) => (
                <GlassCard key={label}>
                  <Icon className="h-7 w-7 text-cyan-100" />
                  <h3 className="mt-4 text-lg font-black text-white">{label}</h3>
                </GlassCard>
              ))}
            </div>

            <div className="mt-8 rounded-3xl border border-cyan-300/20 bg-cyan-400/10 p-5 text-center shadow-2xl shadow-cyan-950/20 sm:p-7">
              <p className="text-sm font-semibold text-cyan-50/75">Partnership inquiries</p>
              <a href={partnerMailto({ subject: 'Partnership inquiry for The Poles' })} className="mt-2 inline-flex break-all text-2xl font-black text-white hover:text-cyan-100">
                {PARTNER_EMAIL}
              </a>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-purple-100/65">
                Use <a href={supportMailto({ subject: 'Support request for The Poles' })} className="text-cyan-100 hover:underline">{SUPPORT_EMAIL}</a> for account help, support requests, or issue reports.
              </p>
            </div>
          </div>
        </section>

        <section id="safety" className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeader
              eyebrow="Trust And Safety"
              title="Competition needs rules, records, verification, and review."
              body="The Poles presents itself as a skill-based competition platform. The product direction is deliberately structured around transparency, not chance."
            />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {trustItems.map(([title, body]) => (
                <GlassCard key={title}>
                  <ShieldCheck className="h-7 w-7 text-cyan-100" />
                  <h3 className="mt-4 text-lg font-black text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-purple-100/64">{body}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6 sm:pb-24 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-6 overflow-hidden rounded-[2rem] border border-white/10 bg-black/62 p-6 shadow-[0_0_100px_rgba(88,28,135,0.25)] backdrop-blur-xl md:grid-cols-[0.95fr_1.05fr] md:p-10">
            <div className="relative min-h-[280px] rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/18 via-purple-600/16 to-fuchsia-500/18 p-6">
              <HeartHandshake className="h-14 w-14 text-cyan-100" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-100/65">Mission Goal</p>
                <h3 className="mt-3 text-4xl font-black text-white">Competition with purpose.</h3>
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <Badge className="w-fit border border-fuchsia-300/20 bg-fuchsia-500/10 text-fuchsia-100">North Pole Fund</Badge>
              <h2 className="mt-5 text-3xl font-black leading-tight text-white sm:text-5xl">
                Designed to support gifts and opportunities for children.
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-purple-100/72 sm:text-base">
                The North Pole Fund is the public mission layer of The Poles. As the platform matures, our mission is to direct platform impact toward helping children through gifts, opportunities, and community-supported programs.
              </p>
              <div className="mt-7 grid gap-3 sm:flex sm:flex-wrap">
                <GlowButton to="/NorthPole">Enter The North Pole</GlowButton>
                <GlowButton to="/OfficialSkillCompetitionRules" variant="ghost">Read Skill Rules</GlowButton>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 bg-black px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.1fr_1.8fr]">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-200/25 bg-gradient-to-br from-cyan-400/25 to-fuchsia-500/20 text-sm font-black text-white">TP</span>
              <span className="text-xl font-black text-white">The Poles</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/58">
              Skill-based competition. Prize paths. Leagues with purpose.
            </p>
            <div className="mt-4 space-y-1 text-sm text-purple-100/60">
              <a href={supportMailto({ subject: 'Support request for The Poles' })} className="block break-all hover:text-white">Support: {SUPPORT_EMAIL}</a>
              <a href={partnerMailto({ subject: 'Partnership inquiry for The Poles' })} className="block break-all hover:text-white">Partners: {PARTNER_EMAIL}</a>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {[
              ['Platform', [['North Pole', '/NorthPole'], ['South Pole', '/SouthPole'], ['Leagues', '/Leagues'], ['Dashboard', '/Dashboard']]],
              ['Company', [['About', '/About'], ['Partners', '#partners'], ['Safety', '#safety'], ['Contact', '/Contact']]],
              ['Support', [['Support', '/Contact'], ['Rules', '/OfficialSkillCompetitionRules'], ['Privacy', '/PrivacyPolicy'], ['Terms', '/TermsOfUse']]],
            ].map(([title, links]) => (
              <div key={title}>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/90">{title}</h3>
                <div className="mt-4 space-y-3">
                  {links.map(([label, to]) => (
                    <NavLink key={label} to={to} className="block text-sm text-white/58 transition hover:text-white">
                      {label}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
