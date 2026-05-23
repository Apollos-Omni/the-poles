import React from "react";
import { STATUS_CONFIG } from "./SPConstants";

export default function SPStatusBadge({ status, className = "" }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: "bg-gray-500/20 text-gray-300 border-gray-600/30" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.color} ${className}`}>
      {cfg.label}
    </span>
  );
}