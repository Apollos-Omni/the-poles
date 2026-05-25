import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Building2, Heart, ReceiptText, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { callBackendFunction } from "@/api/apiClient";
import { MediaHero, MissionMediaCard, PrizeMediaCard, VideoBackgroundCard, mediaImages } from "@/components/media/MediaPrimitives";
import { MISSION_CATEGORIES, MISSION_SUPPORT_AMOUNTS, SPONSOR_PACKAGES, formatMoney } from "@/lib/missionSupport";

const DEFAULT_LABEL = "Mission Supporter";

function DisclosurePanel() {
  return (
    <div className="rounded-2xl border border-yellow-300/20 bg-yellow-950/20 p-4 text-sm leading-relaxed text-yellow-50/78">
      <p className="font-bold text-yellow-100">Mission support disclosure</p>
      <p className="mt-2">
        Mission support contributions are not currently represented as tax-deductible charitable donations unless processed through an approved qualified nonprofit or fiscal sponsor.
      </p>
      <p className="mt-2">
        Affiliate links and sponsored relationships may support The Poles Fund. Sponsored/affiliate relationships must be disclosed clearly.
      </p>
    </div>
  );
}

function SafetyPanel() {
  return (
    <div className="rounded-2xl border border-cyan-200/15 bg-cyan-950/20 p-4 text-sm leading-relaxed text-cyan-50/75">
      <p className="font-bold text-cyan-100">Public safety rules</p>
      <p className="mt-2">No child private information is shown publicly. No private letters, addresses, direct contact info, or private media are shown.</p>
      <p className="mt-2">The Mission Ledger uses public labels and approved mission categories.</p>
    </div>
  );
}

function CheckoutCard({ mode = "support" }) {
  const isSponsor = mode === "sponsor";
  const presets = isSponsor ? SPONSOR_PACKAGES : MISSION_SUPPORT_AMOUNTS;
  const [selectedId, setSelectedId] = useState(presets[0]?.id || "custom");
  const [customAmount, setCustomAmount] = useState("");
  const [publicLabel, setPublicLabel] = useState(DEFAULT_LABEL);
  const [email, setEmail] = useState("");
  const [missionCategory, setMissionCategory] = useState(MISSION_CATEGORIES[0]);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const selected = useMemo(() => presets.find((item) => item.id === selectedId), [presets, selectedId]);
  const amountCents = selectedId === "custom"
    ? Math.max(0, Math.round(Number(customAmount || 0) * 100))
    : selected?.amountCents || 0;

  const startCheckout = async () => {
    if (!amountCents || amountCents < 100) {
      setStatus("Enter an amount of at least $1.");
      return;
    }

    setIsLoading(true);
    setStatus("");
    try {
      const payload = {
        amount_cents: amountCents,
        currency: "USD",
        contribution_type: selected?.contributionType || (isSponsor ? "custom_partnership" : "mission_support"),
        public_label: publicLabel || DEFAULT_LABEL,
        contributor_display_name: publicLabel || DEFAULT_LABEL,
        email,
        mission_category: selected?.missionCategory || missionCategory,
        package_id: selected?.id || "custom",
        package_label: selected?.label || (isSponsor ? "Custom Partnership" : "Custom Amount"),
      };
      const response = await callBackendFunction(
        isSponsor ? "createSponsorCheckoutSession" : "createMissionCheckoutSession",
        { method: "POST", body: payload }
      );
      const url = response?.data?.url;
      if (url) {
        window.location.href = url;
        return;
      }
      setStatus(response?.data?.message || "Checkout is not configured yet. Add Stripe test keys on the backend to enable this flow.");
    } catch (error) {
      setStatus(error.message || "Checkout could not be started.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/12 bg-black/35 p-4 shadow-xl shadow-black/25">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/20 text-purple-100 ring-1 ring-white/10">
          {isSponsor ? <Building2 className="h-5 w-5" /> : <Heart className="h-5 w-5" />}
        </div>
        <div>
          <h2 className="text-lg font-black text-white">{isSponsor ? "Sponsor / Partner Packages" : "Mission Support Checkout"}</h2>
          <p className="text-xs text-purple-100/60">Stripe checkout is test-mode first. Prize-room entry payments remain sandboxed.</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {presets.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelectedId(item.id)}
            className={`rounded-xl border p-4 text-left transition-all ${selectedId === item.id ? "border-cyan-300/70 bg-cyan-400/10" : "border-white/10 bg-white/[0.04] hover:border-white/25"}`}
          >
            <p className="font-bold text-white">{item.label}</p>
            <p className="mt-1 text-sm text-cyan-100">{formatMoney(item.amountCents)}</p>
          </button>
        ))}
        <button
          type="button"
          onClick={() => setSelectedId("custom")}
          className={`rounded-xl border p-4 text-left transition-all ${selectedId === "custom" ? "border-cyan-300/70 bg-cyan-400/10" : "border-white/10 bg-white/[0.04] hover:border-white/25"}`}
        >
          <p className="font-bold text-white">{isSponsor ? "Custom Partnership" : "Custom Amount"}</p>
          <p className="mt-1 text-sm text-cyan-100">Choose amount</p>
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {selectedId === "custom" && (
          <Input type="number" min="1" step="1" value={customAmount} onChange={(event) => setCustomAmount(event.target.value)} placeholder="Custom amount in USD" className="border-purple-500/30 bg-black/45 text-white placeholder:text-purple-100/45" />
        )}
        <Input value={publicLabel} onChange={(event) => setPublicLabel(event.target.value)} placeholder="Public contributor label" className="border-purple-500/30 bg-black/45 text-white placeholder:text-purple-100/45" />
        <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email for receipt, kept private" className="border-purple-500/30 bg-black/45 text-white placeholder:text-purple-100/45" />
        <Select value={missionCategory} onValueChange={setMissionCategory}>
          <SelectTrigger className="border-purple-500/30 bg-black/45 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-purple-700/40 bg-gray-950 text-white">
            {MISSION_CATEGORIES.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Button onClick={startCheckout} disabled={isLoading} className="mt-4 min-h-12 w-full bg-white font-black text-slate-950 hover:bg-cyan-100">
        {isLoading ? "Starting checkout..." : `${isSponsor ? "Sponsor the Mission" : "Support The Poles Fund"} ${amountCents ? `- ${formatMoney(amountCents)}` : ""}`}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
      {status && <p className="mt-3 rounded-xl border border-purple-500/25 bg-purple-950/30 p-3 text-sm text-purple-100/75">{status}</p>}
    </div>
  );
}

export default function ThePolesFund() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="overflow-hidden rounded-[2rem] border border-purple-500/30 shadow-2xl shadow-purple-950/40">
          <MediaHero
            eyebrow="The Poles Fund"
            title="Support approved gifts, growth tools, and mission categories"
            subtitle="The Poles Fund supports approved gift and growth categories through creator contributions, partners, sponsors, and mission supporters."
            image={mediaImages.fundMissionPoster}
            tone="rose"
            badges={["Mission support", "Partner contributions", "Sponsor payments", "Public-safe ledger"]}
            primaryAction={{ label: "Support The Poles Fund", href: "#mission-support" }}
            secondaryAction={{ label: "View Mission Ledger", href: "/MissionLedger" }}
          >
            <VideoBackgroundCard
              title="Mission intake, not prize entry"
              subtitle="Live prize-room entry payments remain disabled until processor approval and legal review."
              image={mediaImages.missionLedger}
              tone="gold"
              label="Safety first"
              metric="Test"
            />
          </MediaHero>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Support The Poles Fund", href: "#mission-support", icon: Heart },
            { label: "Become a Partner", href: "#sponsor-packages", icon: Building2 },
            { label: "Sponsor the Mission", href: "#sponsor-packages", icon: Sparkles },
            { label: "View Mission Ledger", href: "/MissionLedger", icon: ReceiptText },
          ].map((item) => {
            const Icon = item.icon;
            const content = (
              <span className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 text-sm font-black text-white shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:border-cyan-200/35">
                <Icon className="h-4 w-4 text-cyan-100" />
                {item.label}
              </span>
            );
            return item.href.startsWith("/") ? <Link key={item.label} to={item.href}>{content}</Link> : <a key={item.label} href={item.href}>{content}</a>;
          })}
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <MissionMediaCard
            title="Approved mission categories"
            description="Fund storytelling stays category-based and public-safe: approved gifts, growth tools, books, sports gear, art supplies, instruments, technology, and community service."
            image={mediaImages.fundSupplies}
            points={MISSION_CATEGORIES}
          />
          <div className="grid gap-4">
            <DisclosurePanel />
            <SafetyPanel />
          </div>
        </div>

        <div id="mission-support" className="mt-8 grid gap-6 lg:grid-cols-2">
          <CheckoutCard mode="support" />
          <div id="sponsor-packages">
            <CheckoutCard mode="sponsor" />
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <PrizeMediaCard title="Gift workshop" description="Warm, approved gift preparation visuals without private letters or private child media." image={mediaImages.fundGifts} meta="Mission" />
          <PrizeMediaCard title="Books and growth tools" description="Public-safe categories for learning, confidence, and practical growth." image={mediaImages.fundTools} meta="Growth" />
          <PrizeMediaCard title="Mission ledger" description="Public labels, approved categories, amount, status, and date only." image={mediaImages.missionLedger} meta="Ledger" />
        </div>
      </div>
    </div>
  );
}
