import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, Trophy, Zap, TrendingUp, Clock } from "lucide-react";

export default function RaffleStats({ raffles }) {
  const stats = React.useMemo(() => {
    const totalRaffles = raffles.length;
    const openRaffles = raffles.filter(r => r.status === 'OPEN').length;
    const completedRaffles = raffles.filter(r => r.status === 'COMPLETED').length;
    
    const totalEntries = raffles.reduce((sum, r) => sum + r.current_entries, 0);
    const totalValue = raffles.reduce((sum, r) => {
      return sum + (r.entry_price_cents * r.current_entries);
    }, 0) / 100; // Convert to dollars

    const endingSoon = raffles.filter(r => {
      if (!r.deadline || r.status !== 'OPEN') return false;
      const hoursLeft = (new Date(r.deadline) - new Date()) / (1000 * 60 * 60);
      return hoursLeft <= 24;
    }).length;

    return {
      totalRaffles,
      openRaffles,
      completedRaffles,
      totalEntries,
      totalValue,
      endingSoon
    };
  }, [raffles]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      <Card className="bg-gradient-to-br from-purple-900/40 to-black/40 backdrop-blur-sm border border-purple-700/30 text-center">
        <CardContent className="p-4">
          <div className="flex items-center justify-center mb-2">
            <Trophy className="w-8 h-8 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalRaffles}</div>
          <div className="text-xs text-purple-300">Total Raffles</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-900/40 to-black/40 backdrop-blur-sm border border-green-700/30 text-center">
        <CardContent className="p-4">
          <div className="flex items-center justify-center mb-2">
            <Zap className="w-8 h-8 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.openRaffles}</div>
          <div className="text-xs text-green-300">Open Now</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-900/40 to-black/40 backdrop-blur-sm border border-blue-700/30 text-center">
        <CardContent className="p-4">
          <div className="flex items-center justify-center mb-2">
            <Users className="w-8 h-8 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalEntries.toLocaleString()}</div>
          <div className="text-xs text-blue-300">Total Entries</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-yellow-900/40 to-black/40 backdrop-blur-sm border border-yellow-700/30 text-center">
        <CardContent className="p-4">
          <div className="flex items-center justify-center mb-2">
            <DollarSign className="w-8 h-8 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-white">${stats.totalValue.toLocaleString()}</div>
          <div className="text-xs text-yellow-300">Total Volume</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-emerald-900/40 to-black/40 backdrop-blur-sm border border-emerald-700/30 text-center">
        <CardContent className="p-4">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="w-8 h-8 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.completedRaffles}</div>
          <div className="text-xs text-emerald-300">Completed</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-900/40 to-black/40 backdrop-blur-sm border border-red-700/30 text-center">
        <CardContent className="p-4">
          <div className="flex items-center justify-center mb-2">
            <Clock className="w-8 h-8 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.endingSoon}</div>
          <div className="text-xs text-red-300">Ending Soon</div>
        </CardContent>
      </Card>
    </div>
  );
}