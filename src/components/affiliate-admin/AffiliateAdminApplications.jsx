import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Check, X, ExternalLink } from "lucide-react";
import { VideoBackgroundCard, mediaImages } from "@/components/media/MediaPrimitives";

const STATUS_COLORS = {
  not_applied: "bg-gray-700 text-gray-300",
  pending: "bg-yellow-700/40 text-yellow-300",
  applied: "bg-blue-700/40 text-blue-300",
  approved: "bg-green-700/40 text-green-300",
  denied: "bg-red-700/40 text-red-300",
  inactive: "bg-gray-700/40 text-gray-400",
};

const STATUSES = ["not_applied", "pending", "applied", "approved", "denied", "inactive"];

const BLANK = { program_name: "", website_url: "", application_date: "", status: "not_applied", login_url: "", notes: "", denial_reason: "", next_action: "", network: "", commission_estimate: "" };

export default function AffiliateAdminApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(BLANK);

  const load = () => {
    base44.entities.AffiliateApplication.list("-created_date", 100)
      .then(d => setApps(d || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (editingId) {
      await base44.entities.AffiliateApplication.update(editingId, form);
    } else {
      await base44.entities.AffiliateApplication.create(form);
    }
    setAdding(false);
    setEditingId(null);
    setForm(BLANK);
    load();
  };

  const startEdit = (a) => {
    setEditingId(a.id);
    setForm({ program_name: a.program_name, website_url: a.website_url || "", application_date: a.application_date || "", status: a.status || "not_applied", login_url: a.login_url || "", notes: a.notes || "", denial_reason: a.denial_reason || "", next_action: a.next_action || "", network: a.network || "", commission_estimate: a.commission_estimate || "" });
    setAdding(true);
  };

  const field = (key, placeholder, col = 1) => (
    <Input placeholder={placeholder} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
      className={`bg-black/40 border-purple-700/30 text-white ${col === 2 ? "col-span-2" : ""}`} />
  );

  return (
    <div className="space-y-4 mt-4">
      <VideoBackgroundCard
        title="Application pipeline"
        subtitle="Track sponsor applications as a promotion workflow, not a spreadsheet."
        image={mediaImages.catalogShelf}
        tone="purple"
      />

      <div className="flex justify-between items-center">
        <p className="text-purple-300/60 text-sm">{apps.length} applications tracked</p>
        <Button size="sm" className="bg-purple-700 hover:bg-purple-600" onClick={() => { setAdding(true); setEditingId(null); setForm(BLANK); }}>
          <Plus className="w-4 h-4 mr-1" /> Track Application
        </Button>
      </div>

      {adding && (
        <div className="bg-black/40 border border-purple-700/30 rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-white">{editingId ? "Edit" : "New"} Application</h3>
          <div className="grid grid-cols-2 gap-3">
            {field("program_name", "Program name (e.g. Amazon Associates)")}
            {field("website_url", "Website URL submitted")}
            {field("network", "Affiliate network (e.g. CJ, ShareASale)")}
            {field("commission_estimate", "Estimated commission notes")}
            {field("application_date", "Application date (YYYY-MM-DD)")}
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="bg-black/60 border border-purple-700/30 rounded-md px-3 py-2 text-white text-sm">
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {field("login_url", "Affiliate dashboard login URL", 2)}
            {field("next_action", "Next action needed", 2)}
            {field("notes", "Notes", 2)}
            {form.status === "denied" && field("denial_reason", "Reason for denial", 2)}
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
          {apps.map(a => (
            <div key={a.id} className="bg-black/40 border border-purple-700/20 rounded-xl p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white">{a.program_name}</span>
                    <Badge className={`text-xs ${STATUS_COLORS[a.status] || "bg-gray-700"}`}>{a.status}</Badge>
                    {a.network && <span className="text-xs text-purple-400/50">{a.network}</span>}
                  </div>
                  {a.next_action && <p className="text-xs text-yellow-300/70 mt-1">→ {a.next_action}</p>}
                  {a.denial_reason && <p className="text-xs text-red-300/70 mt-1">Denied: {a.denial_reason}</p>}
                  {a.notes && <p className="text-xs text-purple-300/50 mt-1">{a.notes}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {a.login_url && (
                    <a href={a.login_url} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-white">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <Button size="icon" variant="ghost" className="text-purple-400 hover:text-white" onClick={() => startEdit(a)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-4 text-xs text-purple-400/40">
                {a.application_date && <span>Applied: {a.application_date}</span>}
                {a.commission_estimate && <span>Est: {a.commission_estimate}</span>}
                {a.website_url && <span className="truncate">{a.website_url}</span>}
              </div>
            </div>
          ))}
          {apps.length === 0 && <p className="text-purple-400/60 text-sm text-center py-8">No applications tracked yet. Add your first one above.</p>}
        </div>
      )}
    </div>
  );
}
