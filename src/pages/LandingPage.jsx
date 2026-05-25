import React, { useState } from 'react';
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
  Play,
  ShieldCheck,
  Star,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { partnerMailto } from '@/config/contact';
import heroImage from '@/assets/public-beta-hero.png';
import santasWorkshopImage from '@/assets/santas-workshop-fund.png';

const navItems = [
  ['Platform', '#platform'],
  ['North Pole', '/NorthPole'],
  ['South Pole', '/SouthPole'],
  ['The Poles Fund', '#mission'],
  ['Mission Ledger', '#mission-ledger'],
  ['Partners', '/Contact'],
];

const worlds = [
  {
    title: 'The Poles',
    body: 'The full platform connecting digital competition, sports leagues, prize rooms, creators, sponsors, records, and mission impact.',
    icon: Star,
    accent: 'text-blue-200',
    labels: ['Full Platform', 'Prize Rooms', 'Verified Records'],
    imagePosition: 'center',
  },
  {
    title: 'North Pole',
    body: 'Gaming, digital skill competitions, prize rooms, creators, streamers, esports, and online challenges.',
    icon: Gamepad2,
    accent: 'text-purple-200',
    labels: ['Gaming', 'Creators', 'Esports'],
    imagePosition: 'right',
  },
  {
    title: 'South Pole',
    body: 'Sports, leagues, local competitions, teams, championships, and physical-world competition.',
    icon: Trophy,
    accent: 'text-red-200',
    labels: ['Sports', 'Leagues', 'Championships'],
    imagePosition: 'left',
  },
  {
    title: 'The Poles Fund',
    body: 'The global gift-giving mission fund that supports approved gifts, growth opportunities, and mission requests.',
    icon: Gift,
    accent: 'text-cyan-200',
    labels: ['Mission Player', 'Gift Tiers', 'Global Traditions'],
    imagePosition: 'center',
  },
];

const steps = [
  ['Search for a Prize', 'Start by searching for an item you want to compete for. The platform calculates the estimated total prize path, including item price, taxes, shipping, and fulfillment.'],
  ['Choose the Player Slots', 'The creator chooses how many players will enter the room for that prize. The prize cost is divided across those player slots to determine the entry amount.'],
  ['Become the Mission Player', 'The creator joins as the extra player in the room. If the creator chooses 10 player slots, the creator becomes the 11th mission player. Their creator contribution supports The Poles Fund.'],
  ['Create or Join a Prize Room', 'Users can create a new prize room or join one that already exists. Creators, influencers, streamers, leagues, and sponsors can promote rooms to their communities.'],
  ['Compete Through Skill', 'Players compete in the selected game, sport, league, or challenge. Scores, results, and evidence are submitted and verified through the platform.'],
  ['Winner Gets the Prize. The Mission Moves Forward.', 'The verified winner receives the prize path, while creator contributions and mission funds help support approved gifts, growth opportunities, and mission requests through The Poles Fund.'],
];

const ledgerFields = [
  'Date',
  'Prize Room',
  'Creator display name or Private Contributor',
  'Game played',
  'Prize',
  'Player slots',
  'Winner display name if public',
  'Creator contribution amount',
  'Fund status',
  'Gift mission supported',
];

const niceListSignals = [
  'Kindness Credits',
  'Impact Points',
  'Gift Tiers',
  'Verified effort',
  'Consistent growth',
  'Community impact',
];

const features = [
  ['League Management', 'Teams, schedules, seasons, and standings.', Users],
  ['Stats & Standings', 'Records, player stats, and performance history.', BarChart3],
  ['Sports Cards', 'Digital and physical recognition from verified results.', Medal],
  ['Prize Path Tracking', 'Winner status, fulfillment notes, and reward records.', ClipboardCheck],
  ['The Poles Fund', 'Mission impact powered by creator contributions.', HandHeart],
  ['Secure & Transparent', 'Evidence, score records, disputes, and reviews.', ShieldCheck],
];

const demos = [
  {
    title: 'What Is The Poles?',
    description: 'A fast walkthrough of skill-based competition, prize paths, leagues, and mission impact.',
    videoSrc: '/videos/the-poles-overview.mp4',
    posterSrc: '/videos/posters/overview.jpg',
    cta: 'Enter The Platform',
    route: '/CreateAccount',
    accent: 'from-cyan-400/25 via-purple-500/20 to-fuchsia-500/25',
    steps: ['Choose a skill path', 'Join a verified challenge', 'Track verified results', 'Follow the prize path'],
  },
  {
    title: 'North Pole Demo',
    description: 'Watch a player choose a gaming skill path, enter a verified challenge, and follow a prize path.',
    videoSrc: '/videos/north-pole-demo.mp4',
    posterSrc: '/videos/posters/north-pole.jpg',
    cta: 'Enter The North Pole',
    route: '/NorthPole',
    accent: 'from-cyan-400/30 via-blue-500/20 to-purple-500/25',
    steps: ['Pick a gaming path', 'Set the entry contribution', 'Compete through skill', 'Move through fulfillment'],
  },
  {
    title: 'South Pole Demo',
    description: 'See how leagues, teams, standings, and verified results work for real-world competition.',
    videoSrc: '/videos/south-pole-demo.mp4',
    posterSrc: '/videos/posters/south-pole.jpg',
    cta: 'Explore The South Pole',
    route: '/SouthPole',
    accent: 'from-red-500/25 via-fuchsia-500/20 to-purple-500/25',
    steps: ['Create teams', 'Run league play', 'Review standings', 'Verify results'],
  },
  {
    title: 'Partner Demo',
    description: 'See how leagues, sponsors, schools, charities, affiliates, and retailers can work with The Poles.',
    videoSrc: '/videos/partner-demo.mp4',
    posterSrc: '/videos/posters/partner.jpg',
    cta: 'Partner With Us',
    mailto: partnerMailto({ subject: 'Partnership inquiry for The Poles' }),
    accent: 'from-purple-500/25 via-cyan-500/15 to-red-500/20',
    steps: ['Connect a community', 'Sponsor verified challenges', 'Support prize paths', 'Grow mission impact'],
  },
];

const footerColumns = [
  {
    title: 'Platform',
    links: [
      ['The Poles', '#platform'],
      ['North Pole', '/NorthPole'],
      ['South Pole', '/SouthPole'],
      ['The Poles Fund', '#mission'],
      ['Mission Ledger', '#mission-ledger'],
      ['League Hub', '/Leagues'],
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

function DemoStepList({ steps }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-black">
            {index + 1}
          </span>
          <span className="text-sm font-semibold text-white/82">{step}</span>
        </div>
      ))}
    </div>
  );
}

function DemoFallback({ title }) {
  return (
    <div className="flex aspect-video flex-col items-center justify-center rounded-2xl border border-cyan-300/20 bg-gradient-to-br from-black via-purple-950/45 to-cyan-950/35 p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-white/10 shadow-2xl shadow-cyan-500/25">
        <Play className="h-7 w-7 fill-white text-white" />
      </div>
      <h3 className="mt-5 text-2xl font-black text-white">{title}</h3>
      <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-100/75">
        Demo coming soon
      </p>
    </div>
  );
}

function DemoCta({ demo, className = '' }) {
  if (demo.mailto) {
    return (
      <a href={demo.mailto} className={className}>
        <Button className="w-full bg-white text-black hover:bg-purple-100">
          {demo.cta}
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </a>
    );
  }

  return (
    <Link to={demo.route} className={className}>
      <Button className="w-full bg-white text-black hover:bg-purple-100">
        {demo.cta}
        <ArrowRight className="ml-1 h-4 w-4" />
      </Button>
    </Link>
  );
}

function DemoVideoCard({ demo, onOpen }) {
  const [posterMissing, setPosterMissing] = useState(false);
  const openDemo = () => onOpen(demo);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openDemo}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openDemo();
        }
      }}
      className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.055] text-left shadow-2xl shadow-purple-950/20 transition hover:-translate-y-1 hover:border-cyan-200/30 hover:shadow-cyan-500/15"
    >
      <div className="relative aspect-video overflow-hidden bg-black">
        {!posterMissing && (
          <img
            src={demo.posterSrc}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-75 transition duration-500 group-hover:scale-105"
            onError={() => setPosterMissing(true)}
          />
        )}
        <div className={`absolute inset-0 bg-gradient-to-br ${demo.accent}`} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.18),transparent_28%)]" />
        <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/55 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-white/82">
          Demo
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/25 bg-black/55 shadow-2xl shadow-cyan-500/25 backdrop-blur transition group-hover:scale-110">
            <Play className="h-7 w-7 fill-white text-white" />
          </span>
        </div>
        {posterMissing && (
          <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/10 bg-black/55 p-3 text-sm font-semibold text-white/78 backdrop-blur">
            Demo coming soon
          </div>
        )}
      </div>
      <div className="space-y-4 p-5">
        <div>
          <h3 className="text-xl font-black text-white">{demo.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-white/66">{demo.description}</p>
        </div>
        <div className="flex items-center justify-between gap-3 text-sm font-semibold text-cyan-100">
          <span>Watch walkthrough</span>
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </div>
        <div onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
          <DemoCta demo={demo} />
        </div>
      </div>
    </div>
  );
}

function DemoVideoModal({ demo, onClose }) {
  const [videoMissing, setVideoMissing] = useState(false);

  if (!demo) return null;

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-black/82 px-4 py-5 backdrop-blur-xl sm:py-8" role="dialog" aria-modal="true">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-white/15 bg-black text-white shadow-[0_0_90px_rgba(34,211,238,0.18)]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-100/70">The Poles demo</p>
            <h2 className="mt-1 text-2xl font-black text-white">{demo.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
            aria-label="Close demo"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-6 p-5 lg:grid-cols-[1.35fr_0.65fr] lg:p-6">
          <div>
            {videoMissing ? (
              <DemoFallback title={demo.title} />
            ) : (
              <video
                className="aspect-video w-full rounded-2xl border border-white/10 bg-black object-cover"
                controls
                playsInline
                poster={demo.posterSrc}
                onError={() => setVideoMissing(true)}
              >
                <source src={demo.videoSrc} type="video/mp4" />
              </video>
            )}
            <p className="mt-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-white/48">
              Demo videos are being added as the platform is finalized.
            </p>
          </div>

          <div className="flex flex-col justify-between gap-6">
            <div>
              <p className="text-sm leading-relaxed text-white/70">{demo.description}</p>
              <div className="mt-5">
                <DemoStepList steps={demo.steps} />
              </div>
            </div>
            <DemoCta demo={demo} />
          </div>
        </div>
      </div>
    </div>
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
  const [activeDemo, setActiveDemo] = useState(null);

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
                Built around The Poles Fund global gift-giving mission.
              </p>
              <a href="#mission" className="mt-6 block">
                <Button className="w-full bg-blue-700 text-white hover:bg-blue-600">
                  Explore The Poles Fund
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </a>
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
              Built around The Poles Fund global gift-giving mission.
            </p>
            <a href="#mission" className="mt-5 block">
              <Button className="w-full bg-blue-700 text-white hover:bg-blue-600">
                Explore The Poles Fund
              </Button>
            </a>
          </div>
        </section>

        <section className="relative overflow-hidden border-y border-white/10 bg-gradient-to-br from-black via-purple-950/35 to-cyan-950/20 px-4 py-16 sm:px-6 lg:px-8">
          <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
          <div className="relative mx-auto max-w-7xl">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl">
                <Badge className="border border-cyan-300/25 bg-cyan-500/15 text-cyan-100">See The Poles In Action</Badge>
                <h2 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl">
                  Watch the platform flow.
                </h2>
              </div>
              <p className="max-w-lg text-sm leading-relaxed text-white/64">
                Short demos show skill-based challenges, verified results, prize paths, and partner opportunities.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {demos.map((demo) => (
                <DemoVideoCard key={demo.title} demo={demo} onOpen={setActiveDemo} />
              ))}
            </div>

            <p className="mt-5 text-center text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
              Demo videos are being added as the platform is finalized.
            </p>
          </div>
        </section>

        <section className="border-y border-white/10 bg-gradient-to-r from-purple-950/45 via-black to-blue-950/35 px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Sports', Trophy],
              ['Gaming', Gamepad2],
              ['Leagues', Users],
              ['The Poles Fund', Gift],
            ].map(([label, Icon]) => (
              <div key={label} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/35 p-4">
                <Icon className="h-5 w-5 text-white" />
                <span className="text-lg font-black text-white">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="platform" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 max-w-3xl">
              <Badge className="border border-white/10 bg-white/10 text-white">Brand Architecture</Badge>
              <h2 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl">
                The platform, the competition areas, and the fund.
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {worlds.map(({ title, body, icon: Icon, accent, labels, imagePosition }) => (
                <GlowCard key={title} className="min-h-full overflow-hidden">
                  <div className="relative -m-5 mb-5 h-36 overflow-hidden border-b border-white/10 md:-m-6 md:mb-6">
                    <img
                      src={heroImage}
                      alt=""
                      className="h-full w-full object-cover opacity-65"
                      style={{ objectPosition: imagePosition }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  </div>
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

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {steps.map(([title, body], index) => (
                <div key={title} className="relative rounded-xl border border-white/10 bg-black/45 p-5 shadow-2xl shadow-purple-950/10">
                  <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-black text-black">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-black text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/65">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="mission" className="relative overflow-hidden border-y border-white/10 bg-gradient-to-br from-black via-purple-950/35 to-blue-950/20 px-4 py-20 sm:px-6 lg:px-8">
          <div className="absolute left-0 top-10 h-72 w-72 rounded-full bg-cyan-400/12 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-purple-500/16 blur-3xl" />
          <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="flex flex-col justify-center">
              <Badge className="w-fit border border-cyan-300/25 bg-cyan-500/15 text-cyan-100">The Poles Fund</Badge>
              <h2 className="mt-5 text-4xl font-black leading-tight text-white md:text-5xl">
                The mission system behind the platform.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-white/72">
                The Poles Fund is the mission system behind the platform. Every creator who opens a prize room becomes the mission player. If a creator chooses 10 player slots, those 10 players compete for the prize, and the creator becomes the 11th mission player. The creator contribution supports The Poles Fund.
              </p>
              <p className="mt-4 text-base leading-relaxed text-white/72">
                The fund supports approved gifts, growth opportunities, and mission requests for children and people doing good in the world.
              </p>
            </div>

            <GlowCard className="min-h-full">
              <Gift className="h-9 w-9 text-cyan-100" />
              <h3 className="mt-5 text-2xl font-black text-white">Global gift-giving traditions. One mission.</h3>
              <p className="mt-4 text-sm leading-relaxed text-white/68">
                The Poles Fund honors gift-giving traditions from around the world. Different cultures may recognize different gift bearers, seasons, holidays, and delivery traditions, but the mission remains the same: reward kindness, support children, and turn good actions into real opportunity.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {['Creator contribution', 'Mission player', 'Player slots', 'Gift mission supported'].map((label) => (
                  <div key={label} className="rounded-xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-semibold text-white/78">
                    {label}
                  </div>
                ))}
              </div>
            </GlowCard>
          </div>
        </section>

        <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950/40 via-black to-purple-950/35" />
          <div className="relative mx-auto grid max-w-7xl gap-8 overflow-hidden rounded-3xl border border-white/10 bg-black/55 shadow-[0_0_80px_rgba(88,28,135,0.35)] lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative min-h-[320px] overflow-hidden lg:min-h-[460px]">
              <img
                src={santasWorkshopImage}
                alt="Santa, workshop helpers, and global gift-giving figures preparing gifts together"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-transparent to-black/60 lg:bg-gradient-to-r lg:from-transparent lg:via-black/10 lg:to-black/75" />
            </div>
            <div className="relative flex flex-col justify-center p-6 md:p-10">
              <Badge className="w-fit border border-cyan-300/25 bg-cyan-500/15 text-cyan-100">Santa&apos;s Workshop</Badge>
              <h2 className="mt-5 text-4xl font-black leading-tight text-white md:text-5xl">
                Many gift-giving traditions working toward one fund.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-white/72">
                Santa, workshop helpers, and other gift-giving mythological beings can represent the shared spirit of The Poles Fund: people working together to help children and people who help others receive meaningful gifts and growth opportunities.
              </p>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {['Approved gifts', 'Growth goals', 'Kindness Credits', 'Impact Points'].map((label) => (
                  <div key={label} className="rounded-xl border border-white/10 bg-white/[0.055] px-4 py-3 text-sm font-semibold text-white/78">
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white/[0.03] px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 max-w-3xl">
              <Badge className="border border-purple-300/20 bg-purple-500/15 text-purple-100">The Nice List</Badge>
              <h2 className="mt-4 text-4xl font-black text-white md:text-5xl">A positive kindness profile for children.</h2>
              <p className="mt-5 text-base leading-relaxed text-white/70">
                Children can share approved posts showing good deeds, volunteer work, learning, helping family, helping the community, picking up trash, mentoring others, creating, practicing, and growing.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <GlowCard>
                <HeartHandshake className="h-9 w-9 text-red-100" />
                <h3 className="mt-5 text-2xl font-black text-white">Reward what helps children grow.</h3>
                <p className="mt-4 text-sm leading-relaxed text-white/68">
                  The system should reward kindness, effort, time, impact, consistency, and verification through positive signals.
                </p>
              </GlowCard>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {niceListSignals.map((signal) => (
                  <div key={signal} className="rounded-xl border border-white/10 bg-black/45 p-5 shadow-2xl shadow-purple-950/10">
                    <div className="mb-4 h-2 w-12 rounded-full bg-gradient-to-r from-cyan-300 via-purple-300 to-red-300" />
                    <h3 className="text-base font-black text-white">{signal}</h3>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="mission-ledger" className="relative overflow-hidden border-y border-white/10 bg-gradient-to-br from-black via-blue-950/25 to-purple-950/35 px-4 py-20 sm:px-6 lg:px-8">
          <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-blue-400/12 blur-3xl" />
          <div className="relative mx-auto max-w-7xl">
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl">
                <Badge className="border border-blue-300/25 bg-blue-500/15 text-blue-100">Mission Ledger</Badge>
                <h2 className="mt-4 text-4xl font-black text-white md:text-5xl">Transparent fund activity without exposing private child information.</h2>
              </div>
              <p className="max-w-lg text-sm leading-relaxed text-white/64">
                The Mission Ledger will show public prize room and creator contribution activity while keeping children&apos;s full names, addresses, private letters, and private media out of public view.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/50 shadow-2xl shadow-purple-950/20">
              <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
                {ledgerFields.map((field) => (
                  <div key={field} className="rounded-xl border border-white/10 bg-white/[0.045] p-4">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100/55">Field</p>
                    <h3 className="mt-2 text-sm font-black text-white">{field}</h3>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 bg-white/[0.035] p-4 text-sm leading-relaxed text-white/62">
                Public ledger entries should use creator contribution, mission player, player slots, and The Poles Fund language.
              </div>
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
                South Pole turns league play into verified results, standings, and regional prize paths.
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
                Rules, records, evidence, recognition, and community impact in one visual system.
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

        <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
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
              <Badge className="w-fit border border-red-300/25 bg-red-500/15 text-red-100">The Poles Fund</Badge>
              <h2 className="mt-5 text-4xl font-black leading-tight text-white md:text-5xl">
                Help children. Build community. Create opportunity.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-white/72">
                The Poles Fund supports gifts, programs, and opportunities through mission player activity, creator contributions, and approved gift missions.
              </p>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {[
                  ['#mission', 'Support The Poles Fund'],
                  ['/Leagues/Create', 'Create a League'],
                  ['/Leagues', 'Join a League'],
                  ['/NorthPole', 'Explore North Pole'],
                ].map(([to, label], index) => (
                  <NavLink key={label} to={to}>
                    <Button
                      className={index === 0 ? 'w-full bg-white text-black hover:bg-purple-100' : 'w-full border border-white/20 bg-white/10 text-white hover:bg-white/15'}
                      variant={index === 0 ? 'default' : 'outline'}
                    >
                      {label}
                    </Button>
                  </NavLink>
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

      <DemoVideoModal demo={activeDemo} onClose={() => setActiveDemo(null)} />
    </div>
  );
}
