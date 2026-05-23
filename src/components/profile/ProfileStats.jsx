import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { 
  Target, 
  CheckCircle, 
  Crown, 
  TrendingUp,
  Award,
  Zap
} from "lucide-react";

const StatCard = ({ icon: Icon, label, value, color = "text-purple-400", bgColor = "from-purple-600/20 to-purple-700/20" }) => (
  <Card className={`bg-gradient-to-br ${bgColor} border border-purple-700/30 hover:border-purple-500/50 transition-all duration-300`}>
    <CardContent className="p-6 text-center">
      <div className={`w-12 h-12 mx-auto mb-3 ${color} bg-black/30 rounded-full flex items-center justify-center`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-purple-200/80">{label}</div>
    </CardContent>
  </Card>
);

export default function ProfileStats({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <StatCard
        icon={Target}
        label="Visions"
        value={stats.visionCount}
        color="text-blue-400"
        bgColor="from-blue-600/20 to-blue-700/20"
      />
      
      <StatCard
        icon={CheckCircle}
        label="Verified Proofs"
        value={stats.verifiedProofs}
        color="text-green-400"
        bgColor="from-green-600/20 to-green-700/20"
      />
      
      <StatCard
        icon={Crown}
        label="Karma"
        value={stats.karmaPoints.toLocaleString()}
        color="text-yellow-400"
        bgColor="from-yellow-600/20 to-yellow-700/20"
      />
      
      <StatCard
        icon={TrendingUp}
        label="Current Streak"
        value={stats.currentStreak}
        color="text-orange-400"
        bgColor="from-orange-600/20 to-orange-700/20"
      />
    </div>
  );
}