import React from "react";
import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG = {
  draft:                       { label: "Draft",                      className: "bg-gray-700 text-gray-200" },
  funding_open:                { label: "Funding Open",               className: "bg-blue-700 text-blue-100" },
  fully_funded:                { label: "Fully Funded",               className: "bg-green-700 text-green-100" },
  season_active:               { label: "Season Active",              className: "bg-yellow-600 text-yellow-100" },
  awaiting_result_verification:{ label: "Awaiting Verification",      className: "bg-orange-600 text-orange-100" },
  winner_confirmed:            { label: "Winner Confirmed",           className: "bg-purple-600 text-purple-100" },
  prize_fulfillment_pending:   { label: "Fulfillment Pending",        className: "bg-pink-700 text-pink-100" },
  prize_shipped:               { label: "Prize Shipped",              className: "bg-indigo-600 text-indigo-100" },
  donation_recorded:           { label: "Donation Recorded",          className: "bg-teal-600 text-teal-100" },
  completed:                   { label: "Completed",                  className: "bg-emerald-700 text-emerald-100" },
  cancelled:                   { label: "Cancelled",                  className: "bg-red-800 text-red-200" },
};

export default function CampaignStatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, className: "bg-gray-700 text-gray-200" };
  return <Badge className={`${cfg.className} text-xs font-semibold px-2 py-0.5`}>{cfg.label}</Badge>;
}