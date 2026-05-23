import React from 'react';
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, Shield } from "lucide-react";

export default function IntegrityChip({ score }) {
  const getIntegrityStyle = (s) => {
    if (s >= 90) return { label: 'Stellar', grade: 'A+', icon: ShieldCheck, color: "bg-green-500/20 text-green-300 border-green-500/50" };
    if (s >= 75) return { label: 'Verified', grade: 'A', icon: ShieldCheck, color: "bg-teal-500/20 text-teal-300 border-teal-500/50" };
    if (s >= 60) return { label: 'Reliable', grade: 'B', icon: Shield, color: "bg-blue-500/20 text-blue-300 border-blue-500/50" };
    if (s >= 40) return { label: 'Unverified', grade: 'C', icon: Shield, color: "bg-gray-500/20 text-gray-300 border-gray-500/50" };
    if (s >= 25) return { label: 'Disputed', grade: 'D', icon: ShieldAlert, color: "bg-amber-500/20 text-amber-300 border-amber-500/50" };
    return { label: 'Untrusted', grade: 'F', icon: ShieldAlert, color: "bg-red-600/20 text-red-300 border-red-500/50" };
  };

  const { label, grade, icon: Icon, color } = getIntegrityStyle(score);

  return (
    <Badge className={`px-2 py-1 text-xs border ${color}`}>
      <Icon className="w-3 h-3 mr-1.5" />
      Integrity: {grade} ({score})
    </Badge>
  );
}