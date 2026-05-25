import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Play, ShieldCheck } from "lucide-react";
import publicBetaHero from "@/assets/public-beta-hero.png";
import santasWorkshopFund from "@/assets/santas-workshop-fund.png";

const approvedMediaAssets = import.meta.glob("../../assets/media/**/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
});

const mediaAsset = (path, fallback) => approvedMediaAssets[`../../assets/media/${path}`] || fallback;

// TODO: Replace any remaining remote fallback images with local optimized approved media assets before production launch.
export const mediaImages = {
  northArena: mediaAsset("north-pole/north-gaming-arena.webp", publicBetaHero),
  northPrize: mediaAsset("north-pole/prize-vault.webp", publicBetaHero),
  creatorMatchNight: mediaAsset("north-pole/creator-match-night.webp", publicBetaHero),
  winnerMoment: mediaAsset("north-pole/winner-moment.webp", publicBetaHero),
  controllerCloseup: mediaAsset("north-pole/controller-closeup.webp", publicBetaHero),
  southCourt: mediaAsset("south-pole/basketball-court.webp", "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1400&q=70"),
  southTeam: mediaAsset("south-pole/team-huddle.webp", "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=900&q=70"),
  leagueField: mediaAsset("south-pole/league-field.webp", "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1400&q=70"),
  scoreboard: mediaAsset("south-pole/scoreboard.webp", "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=70"),
  championshipMoment: mediaAsset("south-pole/championship-moment.webp", "https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=1200&q=70"),
  fundGifts: mediaAsset("poles-fund/gift-workshop.webp", santasWorkshopFund),
  fundTools: mediaAsset("poles-fund/books-and-tools.webp", santasWorkshopFund),
  fundSupplies: mediaAsset("poles-fund/sports-art-music-supplies.webp", santasWorkshopFund),
  volunteerHands: mediaAsset("poles-fund/volunteer-hands.webp", santasWorkshopFund),
  missionLedger: mediaAsset("poles-fund/mission-ledger.webp", santasWorkshopFund),
  profileStudio: mediaAsset("profile/creator-studio.webp", "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=70"),
  highlightReel: mediaAsset("profile/highlight-reel.webp", publicBetaHero),
  socialPromotionHub: mediaAsset("profile/social-promotion-hub.webp", publicBetaHero),
  northMatchPoster: mediaAsset("video-posters/north-pole-match-poster.webp", publicBetaHero),
  southSeasonPoster: mediaAsset("video-posters/south-pole-season-poster.webp", "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=70"),
  fundMissionPoster: mediaAsset("video-posters/poles-fund-mission-poster.webp", santasWorkshopFund),
  catalogShelf: "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1400&q=70",
  creatorDesk: mediaAsset("profile/creator-studio.webp", "https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=1200&q=70"),
  sponsorMarket: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1400&q=70",
};

export function MediaHero({
  eyebrow,
  title,
  description,
  image,
  badges = [],
  primaryAction,
  secondaryAction,
  children,
  tone = "purple",
}) {
  const glow = tone === "cyan" ? "from-cyan-500/30 via-black/45 to-emerald-500/20" : tone === "rose" ? "from-rose-500/25 via-black/45 to-amber-500/25" : "from-fuchsia-500/25 via-black/45 to-cyan-500/25";

  return (
    <section className="relative overflow-hidden border-b border-white/10">
      <img
        src={image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
        decoding="async"
      />
      <div className={`absolute inset-0 bg-gradient-to-br ${glow}`} />
      <div className="absolute inset-0 bg-black/35" />
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 md:px-8 md:py-12">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div className="max-w-3xl">
            {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/65">{eyebrow}</p>}
            <h1 className="mt-2 max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl">{title}</h1>
            {description && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/78 sm:text-base">{description}</p>}
            {badges.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {badges.map((badge) => (
                  <span key={badge} className="rounded-full border border-white/20 bg-black/35 px-3 py-1.5 text-xs font-semibold text-white/80 backdrop-blur">
                    {badge}
                  </span>
                ))}
              </div>
            )}
            {(primaryAction || secondaryAction) && (
              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                {primaryAction && (
                  <Link to={primaryAction.href} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950 shadow-xl shadow-black/30 transition-transform hover:-translate-y-0.5">
                    {primaryAction.label}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                )}
                {secondaryAction && (
                  <Link to={secondaryAction.href} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/25 bg-black/35 px-5 py-3 text-sm font-bold text-white backdrop-blur transition-transform hover:-translate-y-0.5 hover:bg-white/10">
                    {secondaryAction.label}
                  </Link>
                )}
              </div>
            )}
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}

export function VideoBackgroundCard({ title, description, image, label, metric, className = "" }) {
  return (
    <div className={`group relative min-h-[220px] overflow-hidden rounded-2xl border border-white/15 bg-black/30 shadow-2xl shadow-black/25 ${className}`}>
      <img src={image} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />
      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/20 bg-black/45 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
        <Play className="h-3.5 w-3.5" />
        {label || "Highlight"}
      </div>
      <div className="relative flex min-h-[220px] flex-col justify-end p-5">
        {metric && <p className="mb-2 text-3xl font-black text-white">{metric}</p>}
        <h3 className="text-lg font-black text-white">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-white/72">{description}</p>
      </div>
    </div>
  );
}

export function PrizeMediaCard({ title, description, image, meta, actionLabel, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-[280px] flex-col overflow-hidden rounded-2xl border border-white/12 bg-white/[0.055] text-left shadow-xl shadow-black/20 transition-all hover:-translate-y-0.5 hover:border-white/25"
    >
      <div className="relative h-40 overflow-hidden">
        <img src={image} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        {meta && <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/45 px-2.5 py-1 text-xs font-bold text-white backdrop-blur">{meta}</span>}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-black text-white">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/65">{description}</p>
        {actionLabel && <span className="mt-auto pt-4 text-sm font-bold text-cyan-200">{actionLabel}</span>}
      </div>
    </button>
  );
}

export function WorldFeatureCard({ icon: Icon, title, description, image, href, accent = "cyan" }) {
  const content = (
    <div className="group relative min-h-[190px] overflow-hidden rounded-2xl border border-white/12 bg-white/[0.055] p-5 shadow-xl shadow-black/20 transition-all hover:-translate-y-0.5 hover:border-white/25">
      <img src={image} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover opacity-35 transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-br from-black/88 via-black/58 to-black/28" />
      <div className="relative">
        <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${accent === "rose" ? "bg-rose-500/20 text-rose-100" : accent === "gold" ? "bg-amber-500/20 text-amber-100" : "bg-cyan-500/20 text-cyan-100"} ring-1 ring-white/10`}>
          <Icon className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-black text-white">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/66">{description}</p>
      </div>
    </div>
  );

  return href ? <Link to={href}>{content}</Link> : content;
}

export function MissionMediaCard({ title, description, image, points = [] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-rose-200/15 bg-rose-950/18 shadow-xl shadow-black/20">
      <div className="grid md:grid-cols-[0.9fr_1.1fr]">
        <img src={image} alt="" loading="lazy" decoding="async" className="h-56 w-full object-cover md:h-full" />
        <div className="p-5">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-rose-200/20 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-100">
            <ShieldCheck className="h-3.5 w-3.5" />
            Public-safe mission visuals
          </div>
          <h3 className="text-xl font-black text-white">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-rose-50/70">{description}</p>
          {points.length > 0 && (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {points.map((point) => (
                <span key={point} className="rounded-xl border border-white/10 bg-black/24 px-3 py-2 text-xs font-semibold text-white/75">
                  {point}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function MobileActionBar({ items, isActive }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex h-[76px] items-center justify-around border-t border-cyan-200/10 bg-black/82 px-1 pb-[env(safe-area-inset-bottom)] shadow-2xl shadow-purple-950/60 backdrop-blur-xl lg:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            to={item.href}
            className={`flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold transition-colors ${isActive(item.href) ? 'bg-cyan-400/10 text-cyan-100' : 'text-purple-100/65 hover:bg-white/5 hover:text-white'}`}
          >
            <Icon className="h-5 w-5" />
            <span className="max-w-full truncate">{item.title}</span>
          </Link>
        );
      })}
    </div>
  );
}
