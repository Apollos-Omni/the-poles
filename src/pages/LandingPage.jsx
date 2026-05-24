import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  ClipboardCheck,
  Gamepad2,
  Gift,
  HandHeart,
  HeartHandshake,
  Map,
  Medal,
  ShieldCheck,
  Star,
  Trophy,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import heroImage from '@/assets/public-beta-hero.png';

const navItems = [
  ['North Pole', '/NorthPole'],
  ['South Pole', '/SouthPole'],
  ['League Hub', '/Leagues'],
  ['Championships', '#championships'],
  ['About', '/About'],
  ['Partners', '/Contact'],
];

const worlds = [
  {
    title: 'The North Pole',
    body: 'The heart of The Poles. A children\'s gift mission layer that connects competition, prizes, transparency, and community impact.',
    icon: Gift,
    accent: 'text-cyan-200',
    labels: ['Children First', 'Transparent', 'Mission Driven'],
  },
  {
    title: 'The South Pole',
    body: 'For athletes, teams, and leagues. Track stats, manage seasons, create sports cards, verify winners, and compete for more.',
    icon: Trophy,
    accent: 'text-red-200',
    labels: ['Leagues', 'Standings', 'Sports Cards'],
  },
  {
    title: 'North Pole',
    body: 'For gamers, clans, esports players, and competitive communities. Join verified challenges, build rankings, and follow a prize path.',
    icon: Gamepad2,
    accent: 'text-purple-200',
    labels: ['Tournaments', 'Rankings', 'Prize Rewards'],
  },
];

const steps = [
  ['Join or Create a League', 'Start with a team, league, gaming group, club, or custom competition.'],
  ['Play & Compete', 'Schedule games, compete, submit scores, and build records.'],
  ['Track & Verify', 'Stats, scores, standings, evidence, and results are reviewed for fairness.'],
  ['Win & Earn', 'Winners can earn prizes, sports cards, rankings, and recognition.'],
  ['Qualify', 'Top players and teams may qualify for bigger regional opportunities.'],
  ['National Championships', 'Local champions can rise to a national stage.'],
];

const features = [
  ['League Management', 'Create leagues, teams, schedules, seasons, and standings.', Users],
  ['Stats & Standings', 'Track wins, losses, player stats, team records, and performance history.', BarChart3],
  ['Sports Cards', 'Turn verified player stats into digital and physical sports cards.', Medal],
  ['Prize & Reward Tracking', 'Track verified winners, prize status, fulfillment notes, and reward records.', ClipboardCheck],
  ['Karma / Nice List', 'Track sportsmanship, donations, volunteer hours, and community impact. Private by default with optional public sharing.', HandHeart],
  ['Secure & Transparent', 'Evidence, score records, dispute notes, audit logs, and transparent review history.', ShieldCheck],
];

const footerColumns = [
  {
    title: 'Platform',
    links: [
      ['North Pole', '/NorthPole'],
      ['South Pole', '/SouthPole'],
      ['North Pole', '/NorthPole'],
      ['League Hub', '/Leagues'],
      ['Championships', '#championships'],
    ],
  },
  {
    title: 'Company',
    links: [
      ['About Us', '/About'],
      ['Our Mission', '#mission'],
      ['Partners', '/Contact'],
      ['News', '/About'],
    ],
  },
  {
    title: 'Support',
    links: [
      ['Help Center', '/Contact'],
      ['Contact Us', '/Contact'],
      ['Privacy Policy', '/PrivacyPolicy'],
      ['Terms of Use', '/TermsOfUse'],
      ['Rules', '/OfficialSkillCompetitionRules'],
      ['Affiliate Disclosure', '/AffiliateDisclosure'],
    ],
  },
];

function NavLink({ to, children, className = '' }) {
  if (to.startsWith('#')) {
    return (
      <a href={to} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  );
}

function GlowCard({ children, className = '' }) {
  return (
    <Card className={`border-white/10 bg-white/[0.055] text-white shadow-2xl shadow-purple-950/20 ${className}`}>
      <CardContent className="p-5 md:p-6">{children}</CardContent>
    </Card>
  );
}

function PoleHeroPanel({ side, title, body, button, to, icon: Icon }) {
  const isSouth = side === 'south';
  return (
    <div className="group relative flex min-h-[430px] overflow-hidden md:min-h-[760px]">
      <img
        src={heroImage}
        alt=""
        className={`absolute inset-0 h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-[1.03] ${isSouth ? 'object-right' : 'object-left'}`}
      />
      <div className={`absolute inset-0 ${isSouth ? 'bg-gradient-to-br from-red-950/88 via-black/67 to-black/95' : 'bg-gradient-to-bl from-blue-950/88 via-purple-950/70 to-black/95'}`} />
      <div className={`absolute ${isSouth ? '-right-20 top-12 bg-red-500/30' : '-left-20 top-12 bg-blue-400/30'} h-80 w-80 rounded-full blur-3xl`} />
      <div className={`absolute bottom-0 h-64 w-full ${isSouth ? 'bg-gradient-to-t from-red-950/35' : 'bg-gradient-to-t from-purple-950/35'} to-transparent`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent_30%)]" />

      <div className={`relative z-10 flex w-full flex-col justify-end p-6 sm:p-8 md:p-12 ${isSouth ? 'md:items-start md:text-left' : 'md:items-end md:text-right'}`}>
        <div className="max-w-sm space-y-5 md:mb-16">
          <Badge className={`border-white/15 bg-black/40 text-white shadow-2xl ${isSouth ? 'shadow-red-500/25' : 'shadow-blue-500/25'}`}>
            {isSouth ? 'Sports & Physical Competition' : 'Gaming & Digital Competition'}
          </Badge>
          <div className={`flex items-center gap-3 ${isSouth ? '' : 'md:justify-end'}`}>
            <div className={`flex h-14 w-14 items-center justify-center rounded-full border border-white/15 ${isSouth ? 'bg-red-500/20' : 'bg-purple-500/25'}`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-4xl font-black uppercase tracking-tight text-white sm:text-5xl">{title}</h2>
          </div>
          <p className="text-xl font-black leading-snug text-white sm:text-2xl">{body}</p>
          <Link to={to} className="block w-full sm:w-fit">
            <Button className={`w-full text-white sm:w-auto ${isSouth ? 'bg-red-600 hover:bg-red-500' : 'bg-purple-700 hover:bg-purple-600'}`}>
              {button}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-sm font-black text-black">TP</span>
              <span className="text-lg font-black tracking-wide text-white">The Poles</span>
            </Link>

            <nav className="hidden items-center gap-5 text-sm font-medium text-white/70 lg:flex">
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
                <Button className="bg-white text-black hover:bg-purple-100">
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
                className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/75"
              >
                {label}
              </NavLink>
            ))}
            <Link to="/SignIn">
              <Button size="sm" variant="outline" className="shrink-0 border-white/10 bg-white/5 text-white">
                Sign In
              </Button>
            </Link>
            <Link to="/CreateAccount">
              <Button size="sm" className="shrink-0 bg-white text-black hover:bg-purple-100">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="grid md:grid-cols-2">
            <PoleHeroPanel
              side="south"
              title="South Pole"
              body="Real sports. Real leagues. Real competition."
              button="Explore South Pole"
              to="/SouthPole"
              icon={Trophy}
            />
            <PoleHeroPanel
              side="gaming"
              title="North Pole"
              body="Compete in gaming. Climb rankings. Follow the prize path."
              button="Explore North Pole"
              to="/NorthPole"
              icon={Gamepad2}
            />
          </div>

          <div className="pointer-events-none absolute inset-x-0 top-[52%] z-20 hidden -translate-y-1/2 px-6 md:block">
            <div className="pointer-events-auto mx-auto max-w-[620px] rounded-[2rem] border border-white/20 bg-black/72 px-8 py-9 text-center shadow-[0_0_90px_rgba(88,28,135,0.55)] backdrop-blur-2xl lg:px-12">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-2xl shadow-blue-500/25">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-7xl font-black leading-[0.86] tracking-tight text-white drop-shadow-2xl lg:text-8xl">
                THE<br />POLES
              </h1>
              <div className="mx-auto my-5 flex max-w-sm items-center gap-4">
                <div className="h-px flex-1 bg-white/40" />
                <HeartHandshake className="h-6 w-6 text-red-400" />
                <div className="h-px flex-1 bg-white/40" />
              </div>
              <p className="text-2xl font-black leading-tight text-white md:text-3xl">
                Compete with skill.<br />Win with integrity.<br />Make a difference.
              </p>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/78">
                A national competition platform for sports, gaming, leagues, and communities.
              </p>
              <p className="mt-3 text-sm font-black uppercase tracking-[0.18em] text-red-300">
                Built around The North Pole children&apos;s gift mission.
              </p>
              <Link to="/NorthPole" className="mt-6 block">
                <Button className="w-full bg-blue-700 text-white hover:bg-blue-600">
                  Our Mission  The North Pole
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="border-t border-white/10 bg-gradient-to-b from-black to-purple-950/25 px-4 py-8 text-center md:hidden">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10">
              <Star className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-6xl font-black leading-[0.88] text-white">THE<br />POLES</h1>
            <p className="mt-4 text-2xl font-black leading-tight text-white">
              Compete with skill. Win with integrity. Make a difference.
            </p>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/75">
              A national competition platform for sports, gaming, leagues, and communities.
            </p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
              Built around The North Pole children&apos;s gift mission.
            </p>
            <Link to="/NorthPole" className="mt-5 block">
              <Button className="w-full bg-blue-700 text-white hover:bg-blue-600">
                Our Mission  The North Pole
              </Button>
            </Link>
          </div>
        </section>

        <section className="border-y border-white/10 bg-gradient-to-r from-purple-950/45 via-black to-blue-950/35 px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Sports', Trophy],
              ['Gaming', Gamepad2],
              ['Leagues', Users],
              ['Children', Gift],
            ].map(([label, Icon]) => (
              <div key={label} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/35 p-4">
                <Icon className="h-5 w-5 text-white" />
                <span className="text-lg font-black text-white">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 max-w-3xl">
              <Badge className="border border-white/10 bg-white/10 text-white">Three Core Worlds</Badge>
              <h2 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl">
                One platform. Three powerful reasons to compete.
              </h2>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              {worlds.map(({ title, body, icon: Icon, accent, labels }) => (
                <GlowCard key={title} className="min-h-full overflow-hidden">
                  <div className="space-y-5">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/10 shadow-2xl shadow-purple-950/30">
                      <Icon className={`h-6 w-6 ${accent}`} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black uppercase tracking-tight text-white">{title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-white/70">{body}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {labels.map((label) => (
                        <span key={label} className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs font-semibold text-white/75">
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                </GlowCard>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white/[0.03] px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center">
              <Badge className="border border-purple-300/20 bg-purple-500/15 text-purple-100">How It Works</Badge>
              <h2 className="mt-4 text-4xl font-black text-white md:text-5xl">How It Works</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
              {steps.map(([title, body], index) => (
                <div key={title} className="relative rounded-xl border border-white/10 bg-black/45 p-5">
                  <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-black text-black">
                    {index + 1}
                  </div>
                  <h3 className="text-base font-black text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/65">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="championships" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-950/45 via-black to-purple-950/50 p-6 md:grid-cols-[1.05fr_0.95fr] md:p-10">
            <div className="flex flex-col justify-center">
              <Badge className="w-fit border border-blue-300/25 bg-blue-500/15 text-blue-100">Championship Path</Badge>
              <h2 className="mt-5 text-4xl font-black leading-tight text-white md:text-5xl">
                From Local Leagues to National Champions
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/72">
                South Pole connects local leagues across the country. Winning teams can advance from local
                competition into regional and national championship opportunities, with The North Pole
                supporting prize rewards for verified winners.
              </p>
              <a href="#championships" className="mt-7 block w-full sm:w-fit">
                <Button className="w-full bg-white text-black hover:bg-purple-100 sm:w-auto">
                  Learn About Championships
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/45 p-6">
                <Trophy className="h-16 w-16 text-yellow-200" />
                <p className="mt-6 text-sm uppercase tracking-[0.2em] text-yellow-100/70">Verified Winners</p>
                <h3 className="mt-2 text-3xl font-black text-white">Championship Ready</h3>
              </div>
              <div className="relative min-h-[260px] rounded-2xl border border-white/10 bg-black/45 p-6">
                <Map className="h-10 w-10 text-blue-200" />
                <div className="absolute left-[18%] top-[32%] h-3 w-3 rounded-full bg-cyan-300 shadow-lg shadow-cyan-300/50" />
                <div className="absolute left-[44%] top-[48%] h-3 w-3 rounded-full bg-purple-300 shadow-lg shadow-purple-300/50" />
                <div className="absolute right-[22%] top-[28%] h-3 w-3 rounded-full bg-red-300 shadow-lg shadow-red-300/50" />
                <div className="absolute bottom-[24%] left-[35%] h-3 w-3 rounded-full bg-blue-300 shadow-lg shadow-blue-300/50" />
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 320 260" aria-hidden="true">
                  <path d="M58 82 C110 120, 118 128, 142 126 S220 72, 248 72" fill="none" stroke="rgba(147,197,253,.45)" strokeWidth="2" />
                  <path d="M142 126 C130 170, 115 185, 100 197" fill="none" stroke="rgba(216,180,254,.45)" strokeWidth="2" />
                  <path d="M142 126 C182 152, 210 165, 248 72" fill="none" stroke="rgba(248,113,113,.35)" strokeWidth="2" />
                </svg>
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-sm uppercase tracking-[0.2em] text-blue-100/70">League Network</p>
                  <h3 className="mt-2 text-2xl font-black text-white">Regional Paths</h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <Badge className="border border-white/10 bg-white/10 text-white">Platform Tools</Badge>
                <h2 className="mt-4 text-4xl font-black text-white md:text-5xl">Powerful Features</h2>
              </div>
              <p className="max-w-xl text-sm leading-relaxed text-white/60">
                Built for the operations behind serious competition: rules, records, evidence, recognition, and community impact.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {features.map(([title, body, Icon]) => (
                <GlowCard key={title}>
                  <Icon className="h-6 w-6 text-purple-200" />
                  <h3 className="mt-4 text-xl font-black text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/68">{body}</p>
                </GlowCard>
              ))}
            </div>
          </div>
        </section>

        <section id="mission" className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-gradient-to-r from-red-950/35 via-purple-950/35 to-blue-950/35" />
          <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-red-400/15 blur-3xl" />
          <div className="relative mx-auto grid max-w-7xl gap-8 rounded-3xl border border-white/10 bg-black/60 p-6 backdrop-blur md:grid-cols-[0.9fr_1.1fr] md:p-10">
            <div className="min-h-[320px] rounded-2xl border border-white/10 bg-gradient-to-br from-red-500/20 via-purple-500/15 to-blue-500/20 p-6">
              <HeartHandshake className="h-14 w-14 text-red-100" />
              <div className="mt-20 max-w-sm">
                <p className="text-sm uppercase tracking-[0.22em] text-red-100/70">Children. Community. Opportunity.</p>
                <h3 className="mt-3 text-4xl font-black text-white">Built for good.</h3>
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <Badge className="w-fit border border-red-300/25 bg-red-500/15 text-red-100">Our Mission</Badge>
              <h2 className="mt-5 text-4xl font-black leading-tight text-white md:text-5xl">
                Help children. Build community. Create opportunity.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-white/72">
                Every competition on The Poles is connected to a bigger purpose. The North Pole mission is
                focused on helping children through gifts, programs, and transparent community support.
                Together, we compete for more than victory. We compete to make a difference.
              </p>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {[
                  ['/NorthPole', 'Support The North Pole'],
                  ['/Leagues/Create', 'Create a League'],
                  ['/Leagues', 'Join a League'],
                  ['/NorthPole', 'Explore North Pole'],
                ].map(([to, label], index) => (
                  <Link key={label} to={to}>
                    <Button
                      className={index === 0 ? 'w-full bg-white text-black hover:bg-purple-100' : 'w-full border border-white/20 bg-white/10 text-white hover:bg-white/15'}
                      variant={index === 0 ? 'default' : 'outline'}
                    >
                      {label}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-black px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.1fr_1.8fr]">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-sm font-black text-black">TP</span>
              <span className="text-xl font-black text-white">The Poles</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
              Built for competition. Built for good.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/90">{column.title}</h3>
                <div className="mt-4 space-y-3">
                  {column.links.map(([label, to]) => (
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
