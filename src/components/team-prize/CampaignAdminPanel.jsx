import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import CampaignStatusBadge from "./CampaignStatusBadge";
import { formatCents } from "./prizes";
import { CheckCircle, XCircle, Package, Truck, Heart, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { VideoBackgroundCard, mediaImages } from "@/components/media/MediaPrimitives";

function Section({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-black/30 border border-purple-700/30 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-purple-900/20 transition-colors">
        <h4 className="text-sm font-semibold text-purple-200">{title}</h4>
        {open ? <ChevronUp className="w-4 h-4 text-purple-400" /> : <ChevronDown className="w-4 h-4 text-purple-400" />}
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
}

export default function CampaignAdminPanel() {
  const [campaigns, setCampaigns] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [players, setPlayers] = useState([]);
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  const load = async () => {
    setLoading(true);
    const all = await base44.entities.TeamPrizeCampaign.list("-created_date", 50);
    setCampaigns(all);
    setLoading(false);
  };

  const loadDetail = async (campaign) => {
    setSelected(campaign);
    const [contribs, ps, evs] = await Promise.all([
      base44.entities.CampaignContribution.filter({ campaign_id: campaign.id }),
      base44.entities.CampaignPlayer.filter({ campaign_id: campaign.id }),
      base44.entities.CampaignEvent.filter({ campaign_id: campaign.id }),
    ]);
    setContributions(contribs);
    setPlayers(ps);
    setEvents(evs.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (status, extra = {}) => {
    setActionLoading(true);
    await base44.entities.TeamPrizeCampaign.update(selected.id, { status, ...extra });
    await base44.entities.CampaignEvent.create({ campaign_id: selected.id, event_type: "admin_approved", actor_user_id: "admin", note: `Status → ${status}` });
    await load();
    await loadDetail({ ...selected, status, ...extra });
    setActionLoading(false);
  };

  const approveWinner = async () => {
    setActionLoading(true);
    await base44.entities.TeamPrizeCampaign.update(selected.id, {
      status: "winner_confirmed", admin_approved: true, admin_notes: adminNotes
    });
    await base44.entities.CampaignEvent.create({ campaign_id: selected.id, event_type: "winner_verified", actor_user_id: "admin", note: adminNotes });
    await load();
    await loadDetail({ ...selected, status: "winner_confirmed" });
    setAdminNotes("");
    setActionLoading(false);
  };

  const recordDonation = async () => {
    if (!selected) return;
    const donAmt = selected.north_pole_donation_cents || 0;
    setActionLoading(true);
    await base44.entities.TeamPrizeCampaign.update(selected.id, {
      status: "donation_recorded", donation_recorded_at: new Date().toISOString(), donation_amount_cents: donAmt
    });
    await base44.entities.CampaignEvent.create({ campaign_id: selected.id, event_type: "donation_recorded", actor_user_id: "admin", note: `Contribution ${formatCents(donAmt)} recorded to The Poles Fund` });
    await load();
    await loadDetail({ ...selected, status: "donation_recorded" });
    setActionLoading(false);
  };

  const shipPrizes = async () => {
    setActionLoading(true);
    // Update all winning players
    for (const p of players) {
      await base44.entities.CampaignPlayer.update(p.id, {
        prize_fulfillment_status: "shipped",
        tracking_number: trackingNumber || `SANDBOX-${Date.now()}`
      });
    }
    await base44.entities.TeamPrizeCampaign.update(selected.id, { status: "prize_shipped" });
    await base44.entities.CampaignEvent.create({ campaign_id: selected.id, event_type: "prize_shipped", actor_user_id: "admin", note: `Prizes shipped. Tracking: ${trackingNumber || "sandbox"}` });
    await load();
    await loadDetail({ ...selected, status: "prize_shipped" });
    setActionLoading(false);
  };

  const metrics = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === "season_active").length,
    pending: campaigns.filter(c => ["awaiting_result_verification","prize_fulfillment_pending"].includes(c.status)).length,
    donations: campaigns.reduce((s, c) => s + (c.donation_amount_cents || 0), 0),
  };

  return (
    <div className="space-y-6">
      <VideoBackgroundCard
        title="Campaign operations"
        subtitle="Review funding, outcomes, fulfillment, and The Poles Fund records from one command view."
        image={mediaImages.sponsorMarket}
        tone="purple"
      />

      {/* Summary metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Campaigns", value: metrics.total, color: "text-white" },
          { label: "Active Seasons", value: metrics.active, color: "text-yellow-300" },
          { label: "Pending Review", value: metrics.pending, color: "text-orange-300" },
          { label: "Fund Contributions", value: formatCents(metrics.donations), color: "text-pink-400" },
        ].map(m => (
          <div key={m.label} className="bg-black/30 border border-purple-700/30 rounded-xl p-3 text-center">
            <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
            <p className="text-xs text-purple-400/70">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Campaign list */}
        <div className="lg:col-span-2 space-y-2">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-semibold text-purple-200">All Campaigns</h4>
            <Button variant="ghost" size="sm" onClick={load} className="text-purple-400 h-7 px-2"><RefreshCw className="w-3 h-3" /></Button>
          </div>
          {loading ? (
            <p className="text-center text-purple-400/50 text-sm py-4">Loading…</p>
          ) : campaigns.length === 0 ? (
            <p className="text-center text-purple-400/50 text-sm py-4">No campaigns yet.</p>
          ) : (
            campaigns.map(c => (
              <button key={c.id} onClick={() => loadDetail(c)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selected?.id === c.id
                    ? "bg-purple-900/40 border-purple-500"
                    : "bg-black/20 border-purple-700/20 hover:border-purple-600/40"
                }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{c.team_name}</p>
                    <p className="text-xs text-purple-400/60">{c.league_or_sport}</p>
                  </div>
                  <CampaignStatusBadge status={c.status} />
                </div>
                <div className="flex gap-2 mt-1 text-xs text-purple-400/50">
                  <span>{c.campaign_id}</span>
                  <span>·</span>
                  <span>{c.num_players} players</span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-3 space-y-4">
          {!selected ? (
            <div className="text-center py-12 text-purple-400/50 text-sm bg-black/20 border border-purple-700/20 rounded-xl">
              Select a campaign to manage
            </div>
          ) : (
            <>
              <div className="bg-black/30 border border-purple-700/30 rounded-xl p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-base font-bold text-white">{selected.team_name}</h3>
                    <p className="text-xs text-purple-400/70">{selected.league_or_sport} · {selected.campaign_id}</p>
                  </div>
                  <CampaignStatusBadge status={selected.status} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-purple-300/70">
                  <span>Players: {selected.num_players}</span>
                  <span>Funded: {formatCents(selected.total_funded_cents || 0)}</span>
                  <span>Required: {formatCents(selected.total_funding_required_cents || 0)}</span>
                  <span>The Poles Fund: {formatCents(selected.north_pole_donation_cents || 0)}</span>
                </div>
              </div>

              {/* Actions */}
              <Section title="Admin Actions">
                <div className="flex flex-wrap gap-2">
                  {selected.status === "draft" && (
                    <Button size="sm" onClick={() => updateStatus("funding_open")} disabled={actionLoading}
                      className="bg-blue-700 hover:bg-blue-600 text-white text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" /> Approve & Open Funding
                    </Button>
                  )}
                  {selected.status === "fully_funded" && (
                    <Button size="sm" onClick={() => updateStatus("season_active")} disabled={actionLoading}
                      className="bg-yellow-700 hover:bg-yellow-600 text-white text-xs">
                      Activate Season
                    </Button>
                  )}
                  {selected.status === "awaiting_result_verification" && (
                    <>
                      <div className="w-full">
                        <Input value={adminNotes} onChange={e => setAdminNotes(e.target.value)}
                          placeholder="Admin notes / evidence…" className="bg-black/40 border-purple-700/40 text-white text-xs mb-2" />
                      </div>
                      <Button size="sm" onClick={approveWinner} disabled={actionLoading}
                        className="bg-green-700 hover:bg-green-600 text-white text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" /> Confirm Winner
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => updateStatus("season_active")} disabled={actionLoading}
                        className="text-xs">
                        <XCircle className="w-3 h-3 mr-1" /> Reject — Return to Active
                      </Button>
                    </>
                  )}
                  {selected.status === "winner_confirmed" && (
                    <Button size="sm" onClick={() => updateStatus("prize_fulfillment_pending")} disabled={actionLoading}
                      className="bg-pink-700 hover:bg-pink-600 text-white text-xs">
                      <Package className="w-3 h-3 mr-1" /> Start Fulfillment
                    </Button>
                  )}
                  {selected.status === "prize_fulfillment_pending" && (
                    <>
                      <Input value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)}
                        placeholder="Tracking number (optional)" className="bg-black/40 border-purple-700/40 text-white text-xs w-full mb-1" />
                      <Button size="sm" onClick={shipPrizes} disabled={actionLoading}
                        className="bg-indigo-700 hover:bg-indigo-600 text-white text-xs">
                        <Truck className="w-3 h-3 mr-1" /> Mark Prizes Shipped
                      </Button>
                    </>
                  )}
                  {selected.status === "prize_shipped" && !selected.donation_recorded_at && (
                    <Button size="sm" onClick={recordDonation} disabled={actionLoading}
                      className="bg-pink-800 hover:bg-pink-700 text-white text-xs">
                      <Heart className="w-3 h-3 mr-1" /> Record The Poles Fund contribution
                    </Button>
                  )}
                  {selected.status === "donation_recorded" && (
                    <Button size="sm" onClick={() => updateStatus("completed")} disabled={actionLoading}
                      className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs">
                      Mark Completed
                    </Button>
                  )}
                </div>
              </Section>

              {/* Players */}
              <Section title={`Players (${players.length})`}>
                {players.length === 0 ? <p className="text-xs text-purple-400/50">No players added yet.</p> :
                  players.map(p => (
                    <div key={p.id} className="flex items-center gap-2 text-sm">
                      <span className="w-6 text-center text-xs text-purple-400">{p.jersey_number || "-"}</span>
                      <span className="flex-1 text-white">{p.player_name}</span>
                      <span className="text-xs text-purple-400/60 capitalize">{p.prize_fulfillment_status}</span>
                      {p.selected_prize_snapshot && (
                        <span className="text-xs text-green-400">{p.selected_prize_snapshot.title}</span>
                      )}
                    </div>
                  ))
                }
              </Section>

              {/* Contributions */}
              <Section title={`Contributions (${contributions.length})`}>
                {contributions.length === 0 ? <p className="text-xs text-purple-400/50">None yet.</p> :
                  contributions.map(c => (
                    <div key={c.id} className="flex justify-between text-sm">
                      <span className="text-white">{c.contributor_name} <span className="text-purple-400/60 text-xs capitalize">({c.contributor_type})</span></span>
                      <span className={c.status === "confirmed" ? "text-green-400" : "text-yellow-400"}>{formatCents(c.amount_cents)}</span>
                    </div>
                  ))
                }
              </Section>

              {/* Audit log */}
              <Section title="Audit Log">
                {events.length === 0 ? <p className="text-xs text-purple-400/50">No events yet.</p> :
                  events.map(e => (
                    <div key={e.id} className="flex items-start gap-2 text-xs">
                      <span className="text-purple-400/50 flex-shrink-0">{new Date(e.created_date).toLocaleString()}</span>
                      <span className="text-purple-300 capitalize">{e.event_type.replace(/_/g, " ")}</span>
                      {e.note && <span className="text-purple-400/60">— {e.note}</span>}
                    </div>
                  ))
                }
              </Section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
