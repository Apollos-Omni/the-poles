import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Check, X, ToggleLeft, ToggleRight } from "lucide-react";

const CATEGORIES = [
  "Electronics & Gaming", "Sports & Outdoor", "Vacations & Travel",
  "Event Tickets", "Cruises", "Concerts", "Experiences & Adventures",
  "Retail & General Prizes", "Kids & Gifts"
];

const BLANK = { title: "", merchant: "", category: "Retail & General Prizes", description: "", image_url: "", price_display: "", affiliate_url: "", disclosure_text: "", active: true, featured: false };

export default function AffiliateAdminOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [filterCat, setFilterCat] = useState("All");

  const load = () => {
    base44.entities.AffiliateOffer.list("-created_date", 200)
      .then(d => setOffers(d || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (editingId) {
      await base44.entities.AffiliateOffer.update(editingId, form);
    } else {
      await base44.entities.AffiliateOffer.create({ ...form, price_last_checked: new Date().toISOString() });
    }
    setAdding(false);
    setEditingId(null);
    setForm(BLANK);
    load();
  };

  const startEdit = (o) => {
    setEditingId(o.id);
    setForm({ title: o.title, merchant: o.merchant, category: o.category, description: o.description || "", image_url: o.image_url || "", price_display: o.price_display || "", affiliate_url: o.affiliate_url, disclosure_text: o.disclosure_text || "", active: o.active !== false, featured: !!o.featured });
    setAdding(true);
  };

  const toggle = async (o) => {
    await base44.entities.AffiliateOffer.update(o.id, { active: !o.active });
    load();
  };

  const displayed = filterCat === "All" ? offers : offers.filter(o => o.category === filterCat);

  return (
    <div className="space-y-4 mt-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="flex gap-2 flex-wrap">
          {["All", ...CATEGORIES].map(c => (
            <button key={c} onClick={() => setFilterCat(c)} className={`px-2 py-1 rounded-full text-xs transition-colors ${filterCat === c ? "bg-purple-700 text-white" : "bg-black/40 border border-purple-700/20 text-purple-300/60"}`}>{c}</button>
          ))}
        </div>
        <Button size="sm" className="bg-purple-700 hover:bg-purple-600" onClick={() => { setAdding(true); setEditingId(null); setForm(BLANK); }}>
          <Plus className="w-4 h-4 mr-1" /> Add Offer
        </Button>
      </div>

      {adding && (
        <div className="bg-black/40 border border-purple-700/30 rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-white">{editingId ? "Edit" : "New"} Offer</h3>
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="bg-black/40 border-purple-700/30 text-white col-span-2" />
            <Input placeholder="Merchant (e.g. Amazon)" value={form.merchant} onChange={e => setForm({ ...form, merchant: e.target.value })} className="bg-black/40 border-purple-700/30 text-white" />
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="bg-black/60 border border-purple-700/30 rounded-md px-3 py-2 text-white text-sm">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <Input placeholder="Affiliate URL (tracking link)" value={form.affiliate_url} onChange={e => setForm({ ...form, affiliate_url: e.target.value })} className="bg-black/40 border-purple-700/30 text-white col-span-2" />
            <Input placeholder="Image URL" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} className="bg-black/40 border-purple-700/30 text-white" />
            <Input placeholder="Price display (e.g. $49.99)" value={form.price_display} onChange={e => setForm({ ...form, price_display: e.target.value })} className="bg-black/40 border-purple-700/30 text-white" />
            <Input placeholder="Description (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="bg-black/40 border-purple-700/30 text-white col-span-2" />
            <Input placeholder="Custom disclosure text (optional)" value={form.disclosure_text} onChange={e => setForm({ ...form, disclosure_text: e.target.value })} className="bg-black/40 border-purple-700/30 text-white col-span-2" />
            <label className="flex items-center gap-2 text-sm text-purple-300 cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} /> Active
            </label>
            <label className="flex items-center gap-2 text-sm text-purple-300 cursor-pointer">
              <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} /> Featured
            </label>
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
          {displayed.map(o => (
            <div key={o.id} className={`bg-black/40 border rounded-xl p-3 flex items-center justify-between gap-3 ${o.active ? "border-purple-700/20" : "border-gray-700/20 opacity-50"}`}>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {o.image_url && <img src={o.image_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-white text-sm truncate">{o.title}</span>
                    {o.featured && <Badge className="bg-yellow-700/40 text-yellow-300 text-xs">Featured</Badge>}
                  </div>
                  <div className="text-xs text-purple-300/50">{o.merchant} · {o.category} {o.price_display && `· ${o.price_display}`}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggle(o)} className="text-purple-400 hover:text-white">
                  {o.active ? <ToggleRight className="w-5 h-5 text-green-400" /> : <ToggleLeft className="w-5 h-5 text-gray-500" />}
                </button>
                <Button size="icon" variant="ghost" className="text-purple-400 hover:text-white" onClick={() => startEdit(o)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {displayed.length === 0 && <p className="text-purple-400/60 text-sm text-center py-8">No offers in this category yet.</p>}
        </div>
      )}
    </div>
  );
}