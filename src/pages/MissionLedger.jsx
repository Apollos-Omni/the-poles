import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, ShieldCheck } from "lucide-react";
import { callBackendFunction } from "@/api/apiClient";
import { MediaHero, VideoBackgroundCard, mediaImages } from "@/components/media/MediaPrimitives";
import { formatMoney } from "@/lib/missionSupport";

const fallbackRows = [
  {
    id: "sample-1",
    date: new Date().toISOString(),
    public_label: "Mission Supporter",
    contribution_type: "Mission Support",
    amount_cents: 2500,
    currency: "USD",
    status: "pending",
    mission_category: "Approved Gifts",
  },
  {
    id: "sample-2",
    date: new Date().toISOString(),
    public_label: "Community Sponsor",
    contribution_type: "Sponsor",
    amount_cents: 50000,
    currency: "USD",
    status: "sample",
    mission_category: "Community Service",
  },
];

function publicDate(row) {
  const raw = row.date || row.created_at || row.created_date;
  if (!raw) return "Pending";
  return new Date(raw).toLocaleDateString();
}

export default function MissionLedger() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    callBackendFunction("listMissionLedger", { method: "GET" })
      .then((response) => {
        if (!mounted) return;
        const entries = response?.data?.entries;
        setRows(Array.isArray(entries) && entries.length ? entries : fallbackRows);
        if (!entries?.length) setMessage("No public mission ledger entries have been published yet. Showing sample-safe rows.");
      })
      .catch((error) => {
        if (!mounted) return;
        setRows(fallbackRows);
        setMessage(error.message || "Mission ledger is not connected yet. Showing sample-safe rows.");
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-5">
          <Link to="/ThePolesFund" className="inline-flex items-center gap-2 text-sm font-bold text-purple-100/70 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            The Poles Fund
          </Link>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-purple-500/30 shadow-2xl shadow-purple-950/40">
          <MediaHero
            eyebrow="Mission Ledger"
            title="Public contribution records without private information"
            subtitle="The ledger shows date, public contributor label, contribution type, amount, status, and mission category only."
            image={mediaImages.missionLedger}
            tone="rose"
            badges={["No legal names", "No emails", "No child info", "No private notes"]}
            primaryAction={{ label: "Support The Poles Fund", href: "/ThePolesFund" }}
          >
            <VideoBackgroundCard
              title="Public labels only"
              subtitle="Processor IDs, email, legal names, child information, private notes, letters, addresses, and private media stay out of public UI."
              image={mediaImages.volunteerHands}
              tone="pink"
              label="Privacy"
              metric="Safe"
            />
          </MediaHero>
        </div>

        <div className="mt-8 rounded-2xl border border-cyan-200/15 bg-cyan-950/20 p-4 text-sm leading-relaxed text-cyan-50/75">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-cyan-100" />
            <div>
              <p className="font-bold text-cyan-100">Public ledger safety</p>
              <p className="mt-1">No child private information is shown publicly. No private letters, addresses, direct contact info, or private media are shown. The Mission Ledger uses public labels and approved mission categories.</p>
            </div>
          </div>
        </div>

        {message && <p className="mt-4 rounded-xl border border-purple-400/20 bg-purple-950/30 p-3 text-sm text-purple-100/70">{message}</p>}

        <div className="mt-6 overflow-hidden rounded-2xl border border-white/12 bg-black/35 shadow-xl shadow-black/25">
          <div className="grid grid-cols-2 gap-2 border-b border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-bold uppercase tracking-wide text-purple-100/60 md:grid-cols-6">
            <span>Date</span>
            <span>Public Contributor Label</span>
            <span className="hidden md:block">Contribution Type</span>
            <span>Amount</span>
            <span className="hidden md:block">Status</span>
            <span className="hidden md:block">Mission Category</span>
          </div>
          {loading ? (
            <div className="p-8 text-center text-sm text-purple-100/60">Loading mission ledger...</div>
          ) : (
            rows.map((row) => (
              <div key={row.id || `${row.public_label}-${row.amount_cents}`} className="grid grid-cols-2 gap-2 border-b border-white/8 px-4 py-4 text-sm text-white/84 last:border-b-0 md:grid-cols-6">
                <span>{publicDate(row)}</span>
                <span className="font-bold text-white">{row.public_label || row.contributor_display_name || "Mission Supporter"}</span>
                <span className="hidden md:block capitalize">{String(row.contribution_type || "mission_support").replace(/_/g, " ")}</span>
                <span>{formatMoney(row.amount_cents, row.currency || "USD")}</span>
                <span className="hidden md:block capitalize">{row.status || "pending"}</span>
                <span className="hidden md:block">{row.mission_category || "Approved Gifts"}</span>
              </div>
            ))
          )}
        </div>

        <Link to="/ThePolesFund" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950 shadow-xl shadow-black/30 transition-transform hover:-translate-y-0.5">
          Support The Poles Fund
          <ExternalLink className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
