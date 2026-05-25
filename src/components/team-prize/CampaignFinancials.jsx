import React from "react";
import { calcCampaignFinancials, formatCents } from "./prizes";
import { DollarSign, Heart, Truck, Calculator } from "lucide-react";

export default function CampaignFinancials({ players, numPlayers }) {
  const fin = calcCampaignFinancials(players);
  const contrib = numPlayers > 0 ? Math.ceil(fin.total / numPlayers) : 0;

  const rows = [
    { icon: DollarSign, label: "Total Prize Cost",         value: fin.totalPrizeCents, color: "text-white" },
    { icon: Calculator,  label: "Estimated Tax",            value: fin.totalTax,         color: "text-yellow-300" },
    { icon: Truck,       label: "Estimated Shipping",       value: fin.totalShipping,    color: "text-blue-300" },
    { icon: Heart,       label: "The Poles Fund",value: fin.donation,         color: "text-pink-400" },
  ];

  return (
    <div className="bg-black/30 border border-purple-700/30 rounded-xl p-4 space-y-3">
      <h4 className="text-sm font-semibold text-purple-200 mb-2">Campaign Financials</h4>
      {rows.map(r => (
        <div key={r.label} className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-purple-300/70">
            <r.icon className="w-4 h-4" />
            <span>{r.label}</span>
          </div>
          <span className={r.color}>{formatCents(r.value)}</span>
        </div>
      ))}
      <div className="border-t border-purple-700/30 pt-2 flex justify-between font-bold text-base">
        <span className="text-purple-200">Total Required</span>
        <span className="text-green-400">{formatCents(fin.total)}</span>
      </div>
      {numPlayers > 0 && (
        <div className="bg-purple-900/30 rounded-lg p-3 text-center">
          <p className="text-xs text-purple-300/70">Contribution per participant</p>
          <p className="text-2xl font-bold text-white">{formatCents(contrib)}</p>
          <p className="text-xs text-purple-400/60">split across {numPlayers} participants</p>
        </div>
      )}
    </div>
  );
}
