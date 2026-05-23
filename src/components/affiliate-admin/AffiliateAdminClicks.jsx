import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function AffiliateAdminClicks() {
  const [clicks, setClicks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.AffiliateClick.list("-created_date", 500)
      .then(d => setClicks(d || []))
      .finally(() => setLoading(false));
  }, []);

  // Aggregate by merchant
  const byMerchant = clicks.reduce((acc, c) => {
    acc[c.merchant] = (acc[c.merchant] || 0) + 1;
    return acc;
  }, {});
  const merchantData = Object.entries(byMerchant)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Aggregate by offer title
  const byOffer = clicks.reduce((acc, c) => {
    const key = c.offer_title || c.offer_id;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const offerData = Object.entries(byOffer)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const COLORS = ["#7c3aed", "#6d28d9", "#5b21b6", "#4c1d95", "#a78bfa", "#8b5cf6"];

  if (loading) return <p className="text-purple-400/60 text-sm mt-4">Loading analytics...</p>;

  return (
    <div className="space-y-6 mt-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-black/40 border border-purple-700/20 rounded-xl p-4 text-center">
          <p className="text-3xl font-black text-white">{clicks.length}</p>
          <p className="text-purple-300/60 text-xs mt-1">Total Clicks</p>
        </div>
        <div className="bg-black/40 border border-purple-700/20 rounded-xl p-4 text-center">
          <p className="text-3xl font-black text-white">{merchantData.length}</p>
          <p className="text-purple-300/60 text-xs mt-1">Merchants Clicked</p>
        </div>
        <div className="bg-black/40 border border-purple-700/20 rounded-xl p-4 text-center">
          <p className="text-3xl font-black text-white">{offerData.length}</p>
          <p className="text-purple-300/60 text-xs mt-1">Unique Offers Clicked</p>
        </div>
      </div>

      {merchantData.length > 0 && (
        <div className="bg-black/40 border border-purple-700/20 rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-white">Clicks by Merchant</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={merchantData}>
              <XAxis dataKey="name" tick={{ fill: "#a78bfa", fontSize: 11 }} />
              <YAxis tick={{ fill: "#a78bfa", fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: "#1a0a2e", border: "1px solid #7c3aed", color: "#fff" }} />
              <Bar dataKey="count">
                {merchantData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {offerData.length > 0 && (
        <div className="bg-black/40 border border-purple-700/20 rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-white">Top Offers (clicks)</h3>
          <div className="space-y-2">
            {offerData.map((o, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-purple-200/80 truncate flex-1 mr-4">{o.name}</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 bg-purple-700 rounded-full" style={{ width: `${Math.max(20, (o.count / offerData[0].count) * 120)}px` }} />
                  <span className="text-white font-semibold w-6 text-right">{o.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-black/40 border border-purple-700/20 rounded-xl p-4 space-y-2">
        <h3 className="font-semibold text-white mb-3">Recent Clicks</h3>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {clicks.slice(0, 50).map(c => (
            <div key={c.id} className="flex items-center justify-between text-xs text-purple-300/60 py-1 border-b border-purple-700/10">
              <span className="truncate flex-1">{c.offer_title || c.offer_id}</span>
              <span className="ml-4 text-purple-400/40 shrink-0">{c.merchant}</span>
              <span className="ml-4 text-purple-400/30 shrink-0">{new Date(c.created_date).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}