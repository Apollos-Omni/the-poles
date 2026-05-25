import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Check, X } from "lucide-react";
import { VideoBackgroundCard, mediaImages } from "@/components/media/MediaPrimitives";

const STATUS_COLORS = {
  not_applied: "bg-gray-700 text-gray-300",
  applied: "bg-blue-700/40 text-blue-300",
  approved: "bg-green-700/40 text-green-300",
  active: "bg-emerald-700/40 text-emerald-300",
  paused: "bg-yellow-700/40 text-yellow-300",
  denied: "bg-red-700/40 text-red-300",
};

const STATUSES = ["not_applied", "applied", "approved", "active", "paused", "denied"];

export default function AffiliateAdminMerchants() {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", website_url: "", affiliate_network: "", commission_rate: "", program_status: "not_applied" });

  const load = () => {
    base44.entities.AffiliateMerchant.list("-created_date", 100)
      .then(d => setMerchants(d || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (editingId) {
      await base44.entities.AffiliateMerchant.update(editingId, form);
    } else {
      await base44.entities.AffiliateMerchant.create({ ...form, active: true });
    }
    setAdding(false);
    setEditingId(null);
    setForm({ name: "", website_url: "", affiliate_network: "", commission_rate: "", program_status: "not_applied" });
    load();
  };

  const startEdit = (m) => {
    setEditingId(m.id);
    setForm({ name: m.name, website_url: m.website_url || "", affiliate_network: m.affiliate_network || "", commission_rate: m.commission_rate || "", program_status: m.program_status || "not_applied" });
    setAdding(true);
  };

  const changeStatus = async (id, status) => {
    await base44.entities.AffiliateMerchant.update(id, { program_status: status });
    load();
  };

  return (
    <div className="space-y-4 mt-4">
      <VideoBackgroundCard
        title="Merchant relationships"
        subtitle="Keep sponsor-ready programs organized before offers enter prize rooms."
        image={mediaImages.sponsorMarket}
        tone="purple"
      />

      <div className="flex justify-between items-center">
        <p className="text-purple-300/60 text-sm">{merchants.length} merchants</p>
        <Button size="sm" className="bg-purple-700 hover:bg-purple-600" onClick={() => { setAdding(true); setEditingId(null); setForm({ name: "", website_url: "", affiliate_network: "", commission_rate: "", program_status: "not_applied" }); }}>
          <Plus className="w-4 h-4 mr-1" /> Add Merchant
        </Button>
      </div>

      {adding && (
        <div className="bg-black/40 border border-purple-700/30 rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-white">{editingId ? "Edit" : "New"} Merchant</h3>
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Merchant name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-black/40 border-purple-700/30 text-white" />
            <Input placeholder="Website URL" value={form.website_url} onChange={e => setForm({ ...form, website_url: e.target.value })} className="bg-black/40 border-purple-700/30 text-white" />
            <Input placeholder="Affiliate Network (e.g. CJ)" value={form.affiliate_network} onChange={e => setForm({ ...form, affiliate_network: e.target.value })} className="bg-black/40 border-purple-700/30 text-white" />
            <Input placeholder="Commission notes" value={form.commission_rate} onChange={e => setForm({ ...form, commission_rate: e.target.value })} className="bg-black/40 border-purple-700/30 text-white" />
            <select value={form.program_status} onChange={e => setForm({ ...form, program_status: e.target.value })} className="bg-black/60 border border-purple-700/30 rounded-md px-3 py-2 text-white text-sm col-span-2">
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="bg-green-700 hover:bg-green-600" onClick={save}><Check className="w-4 h-4 mr-1" /> Save</Button>
            <Button size="sm" variant="outline" className="border-purple-700/30 text-purple-300" onClick={() => { setAdding(false); setEditingId(null); }}><X className="w-4 h-4 mr-1" /> Cancel</Button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-purple-400/60 text-sm">Loading...</p>
      ) : (
        <div className="space-y-2">
          {merchants.map(m => (
            <div key={m.id} className="bg-black/40 border border-purple-700/20 rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-white">{m.name}</span>
                  <Badge className={`text-xs ${STATUS_COLORS[m.program_status] || "bg-gray-700 text-gray-300"}`}>{m.program_status}</Badge>
                  {m.affiliate_network && <span className="text-xs text-purple-400/60">{m.affiliate_network}</span>}
                </div>
                <div className="text-xs text-purple-300/40 mt-0.5">{m.website_url} {m.commission_rate && `· ${m.commission_rate}`}</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <select
                  value={m.program_status || "not_applied"}
                  onChange={e => changeStatus(m.id, e.target.value)}
                  className="bg-black/60 border border-purple-700/30 rounded-md px-2 py-1 text-white text-xs"
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <Button size="icon" variant="ghost" className="text-purple-400 hover:text-white" onClick={() => startEdit(m)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
