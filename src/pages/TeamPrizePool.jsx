import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Trophy, Plus, Users, Shield, ChevronRight, Gift, Loader2, AlertTriangle, Heart } from "lucide-react";
import CreateCampaignForm from "@/components/team-prize/CreateCampaignForm";
import PlayerPrizeSelector from "@/components/team-prize/PlayerPrizeSelector";
import CampaignFinancials from "@/components/team-prize/CampaignFinancials";
import ContributionLedger from "@/components/team-prize/ContributionLedger";
import ResultVerification from "@/components/team-prize/ResultVerification";
import CampaignAdminPanel from "@/components/team-prize/CampaignAdminPanel";
import CampaignStatusBadge from "@/components/team-prize/CampaignStatusBadge";
import { calcCampaignFinancials, formatCents } from "@/components/team-prize/prizes";

const WINNING_CONDITION_LABELS = {
  championship_winner: "Championship Winner",
  best_record: "Best Record",
  tournament_winner: "Tournament Winner",
  playoff_winner: "Playoff Winner",
  verified_standings: "Verified Final Standings",
  admin_approved_outcome: "Admin-Approved Outcome",
};

function CampaignCard({ campaign, onSelect }) {
  return (
    <button onClick={() => onSelect(campaign)}
      className="w-full text-left bg-black/30 border border-purple-700/30 rounded-xl p-4 hover:border-purple-500/50 hover:bg-purple-900/20 transition-all space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-bold text-white truncate">{campaign.team_name}</h3>
          <p className="text-sm text-purple-400/70">{campaign.league_or_sport}</p>
        </div>
        <CampaignStatusBadge status={campaign.status} />
      </div>
      <div className="flex items-center gap-4 text-xs text-purple-400/60">
        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{campaign.num_players} players</span>
        <span>{WINNING_CONDITION_LABELS[campaign.winning_condition] || campaign.winning_condition}</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-purple-400/50">{campaign.season_start_date} → {campaign.season_end_date}</span>
        <ChevronRight className="w-4 h-4 text-purple-500" />
      </div>
    </button>
  );
}

function CampaignDetail({ campaign, onBack, onRefresh }) {
  const [players, setPlayers] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("players");

  const loadData = async () => {
    const [ps, cs] = await Promise.all([
      base44.entities.CampaignPlayer.filter({ campaign_id: campaign.id }),
      base44.entities.CampaignContribution.filter({ campaign_id: campaign.id }),
    ]);
    setPlayers(ps);
    setContributions(cs);
  };

  useEffect(() => { loadData(); }, [campaign.id]);

  const handleAddPlayer = async (playerData) => {
    setActionLoading(true);
    await base44.entities.CampaignPlayer.create({ ...playerData, campaign_id: campaign.id });
    await base44.entities.CampaignEvent.create({
      campaign_id: campaign.id, event_type: "player_added",
      note: `${playerData.player_name} added${playerData.selected_prize_snapshot ? ` with prize: ${playerData.selected_prize_snapshot.title}` : ""}`
    });
    await loadData();
    // Recalculate financials
    const allPlayers = [...players, playerData];
    const fin = calcCampaignFinancials(allPlayers);
    const contrib = campaign.num_players > 0 ? Math.ceil(fin.total / campaign.num_players) : 0;
    await base44.entities.TeamPrizeCampaign.update(campaign.id, {
      total_prize_cost_cents: fin.totalPrizeCents,
      total_tax_cents: fin.totalTax,
      total_shipping_cents: fin.totalShipping,
      north_pole_donation_cents: fin.donation,
      total_funding_required_cents: fin.total,
      contribution_per_participant_cents: contrib,
    });
    setActionLoading(false);
  };

  const handleAddContribution = async (data) => {
    setActionLoading(true);
    await base44.entities.CampaignContribution.create(data);
    await base44.entities.CampaignEvent.create({
      campaign_id: campaign.id, event_type: "contribution_received",
      note: `${data.contributor_name} contributed ${formatCents(data.amount_cents)}`
    });
    // Update funded amount
    const newTotal = contributions
      .filter(c => c.status === "confirmed")
      .reduce((s, c) => s + c.amount_cents, 0) + (data.status === "confirmed" ? data.amount_cents : 0);
    const isFullyFunded = newTotal >= (campaign.total_funding_required_cents || Infinity);
    await base44.entities.TeamPrizeCampaign.update(campaign.id, {
      total_funded_cents: newTotal,
      ...(isFullyFunded && campaign.status === "funding_open" ? { status: "fully_funded" } : {})
    });
    if (isFullyFunded && campaign.status === "funding_open") {
      await base44.entities.CampaignEvent.create({ campaign_id: campaign.id, event_type: "fully_funded", note: "Campaign fully funded!" });
    }
    await loadData();
    onRefresh();
    setActionLoading(false);
  };

  const handleOpenFunding = async () => {
    setActionLoading(true);
    await base44.entities.TeamPrizeCampaign.update(campaign.id, { status: "funding_open" });
    await base44.entities.CampaignEvent.create({ campaign_id: campaign.id, event_type: "campaign_created", note: "Funding opened by organizer" });
    onRefresh();
    setActionLoading(false);
  };

  const handleSubmitResult = async ({ winner_team_name, result_notes }) => {
    setActionLoading(true);
    await base44.entities.TeamPrizeCampaign.update(campaign.id, {
      status: "awaiting_result_verification", winner_team_name, result_notes
    });
    await base44.entities.CampaignEvent.create({ campaign_id: campaign.id, event_type: "result_submitted", note: `Result submitted: ${winner_team_name}` });
    onRefresh();
    setActionLoading(false);
  };

  const fin = calcCampaignFinancials(players);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-purple-400">← Back</Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-white truncate">{campaign.team_name}</h2>
          <p className="text-sm text-purple-400/70">{campaign.league_or_sport} · {campaign.campaign_id}</p>
        </div>
        <CampaignStatusBadge status={campaign.status} />
      </div>

      {/* Financials summary */}
      <CampaignFinancials players={players} numPlayers={campaign.num_players} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-black/40 border border-purple-700/30 w-full grid grid-cols-3">
          <TabsTrigger value="players" className="data-[state=active]:bg-purple-700 text-purple-200 text-xs">Players & Prizes</TabsTrigger>
          <TabsTrigger value="funding" className="data-[state=active]:bg-purple-700 text-purple-200 text-xs">Funding</TabsTrigger>
          <TabsTrigger value="results" className="data-[state=active]:bg-purple-700 text-purple-200 text-xs">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="players">
          <div className="bg-black/20 border border-purple-700/20 rounded-xl p-4">
            <PlayerPrizeSelector
              campaign={campaign}
              players={players}
              onAddPlayer={handleAddPlayer}
              onUpdatePrize={() => {}}
              isLoading={actionLoading}
            />
          </div>
        </TabsContent>

        <TabsContent value="funding">
          <div className="bg-black/20 border border-purple-700/20 rounded-xl p-4 space-y-4">
            {campaign.status === "draft" && (
              <div className="text-center py-4">
                <p className="text-sm text-purple-300/70 mb-3">Campaign is in draft. Open funding when ready.</p>
                <Button onClick={handleOpenFunding} disabled={actionLoading || players.length === 0}
                  className="bg-blue-700 hover:bg-blue-600 text-white">
                  Open Funding
                </Button>
                {players.length === 0 && <p className="text-xs text-orange-400 mt-2">Add at least one player first.</p>}
              </div>
            )}
            <ContributionLedger
              campaign={campaign}
              contributions={contributions}
              onAddContribution={handleAddContribution}
              isLoading={actionLoading}
            />
          </div>
        </TabsContent>

        <TabsContent value="results">
          <div className="bg-black/20 border border-purple-700/20 rounded-xl p-4">
            {["funding_open","draft","fully_funded"].includes(campaign.status) ? (
              <div className="text-center py-8">
                <Trophy className="w-10 h-10 text-purple-500/40 mx-auto mb-2" />
                <p className="text-sm text-purple-400/60">Result verification will be available once the season is active.</p>
              </div>
            ) : (
              <ResultVerification
                campaign={campaign}
                players={players}
                onSubmitResult={handleSubmitResult}
                isLoading={actionLoading}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function TeamPrizePool() {
  const [tab, setTab] = useState("campaigns");
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  const loadCampaigns = async () => {
    setLoading(true);
    const all = await base44.entities.TeamPrizeCampaign.list("-created_date", 50);
    setCampaigns(all);
    setLoading(false);
  };

  useEffect(() => { loadCampaigns(); }, []);

  const handleCreate = async (formData) => {
    setCreateLoading(true);
    const count = campaigns.length + 1;
    const campaign_id = `TPC-${String(count).padStart(4, "0")}`;
    const created = await base44.entities.TeamPrizeCampaign.create({ ...formData, campaign_id, status: "draft", sandbox_mode: true });
    await base44.entities.CampaignEvent.create({ campaign_id: created.id, event_type: "campaign_created", note: `Campaign created by organizer` });
    await loadCampaigns();
    setCreating(false);
    setSelected(created);
    setCreateLoading(false);
  };

  const handleRefresh = async () => {
    const all = await base44.entities.TeamPrizeCampaign.list("-created_date", 50);
    setCampaigns(all);
    if (selected) {
      const updated = all.find(c => c.id === selected.id);
      if (updated) setSelected(updated);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Team Prize Pool</h1>
              <p className="text-sm text-purple-300/70">Season Prize Campaigns · Skill-Based · Verified Outcomes</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-pink-400 bg-pink-900/20 border border-pink-700/30 rounded-lg px-3 py-2">
            <Heart className="w-3 h-3" />
            <span>10% goes to North Pole Fund</span>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-black/40 border border-purple-700/30 mb-6">
            <TabsTrigger value="campaigns" className="data-[state=active]:bg-purple-700 text-purple-200">
              <Trophy className="w-4 h-4 mr-2" />My Campaigns
            </TabsTrigger>
            <TabsTrigger value="admin" className="data-[state=active]:bg-purple-700 text-purple-200">
              <Shield className="w-4 h-4 mr-2" />Admin Dashboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns">
            {selected ? (
              <CampaignDetail
                campaign={selected}
                onBack={() => { setSelected(null); loadCampaigns(); }}
                onRefresh={handleRefresh}
              />
            ) : creating ? (
              <div className="bg-black/30 border border-purple-700/30 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-purple-400" /> New Team Prize Campaign
                </h2>
                <CreateCampaignForm
                  onSubmit={handleCreate}
                  onCancel={() => setCreating(false)}
                  isLoading={createLoading}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-purple-400/70">{campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""}</p>
                  <Button onClick={() => setCreating(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Plus className="w-4 h-4 mr-2" /> New Campaign
                  </Button>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
                  </div>
                ) : campaigns.length === 0 ? (
                  <div className="text-center py-16 space-y-4">
                    <Trophy className="w-16 h-16 text-purple-700/40 mx-auto" />
                    <p className="text-purple-300/70">No campaigns yet. Create your first season prize campaign!</p>
                    <Button onClick={() => setCreating(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
                      <Plus className="w-4 h-4 mr-2" /> Create Campaign
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {campaigns.map(c => <CampaignCard key={c.id} campaign={c} onSelect={setSelected} />)}
                  </div>
                )}

                {/* Disclaimer footer */}
                <div className="bg-gray-900/40 border border-gray-700/40 rounded-xl p-4 mt-6">
                  <div className="flex gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-gray-400 space-y-1">
                      <p className="font-semibold text-gray-300">Platform Disclaimer</p>
                      <p>Team Prize Pool campaigns are <strong>skill and performance-based only</strong>. No random winner selection occurs. All outcomes must be verified by league officials, verified standings, or admin review before prizes are released.</p>
                      <p>Campaigns are subject to all applicable local laws, league regulations, parental consent requirements, and charitable compliance rules. The 10% North Pole Fund donation supports child gifting programs. Organizers are solely responsible for obtaining all required permissions, consents, and regulatory approvals before launching a campaign.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="admin">
            <CampaignAdminPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}