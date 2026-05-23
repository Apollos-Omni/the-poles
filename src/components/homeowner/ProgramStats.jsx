import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Home, 
  Hammer, 
  DollarSign,
  TrendingUp,
  Award,
  CheckCircle,
  Clock
} from "lucide-react";

export default function ProgramStats({ participants, properties, workOrders, donations, grants }) {
  const stats = React.useMemo(() => {
    const activeParticipants = participants.filter(p => p.program_status === 'active').length;
    const graduatedParticipants = participants.filter(p => p.program_status === 'graduated').length;
    
    const propertiesInRenovation = properties.filter(p => p.property_status === 'in_renovation').length;
    const completedProperties = properties.filter(p => p.property_status === 'completed').length;
    
    const totalWagesEarned = participants.reduce((sum, p) => sum + (p.wages_earned || 0), 0);
    const totalHomeownershipFunds = participants.reduce((sum, p) => sum + (p.homeownership_fund || 0), 0);
    
    const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
    const awardedGrants = grants.filter(g => g.application_status === 'awarded');
    const totalGrantFunding = awardedGrants.reduce((sum, g) => sum + g.amount_awarded, 0);
    
    const activeWorkOrders = workOrders.filter(w => w.status === 'in_progress').length;
    const completedWorkOrders = workOrders.filter(w => w.status === 'completed').length;

    return {
      activeParticipants,
      graduatedParticipants,
      propertiesInRenovation,
      completedProperties,
      totalWagesEarned,
      totalHomeownershipFunds,
      totalDonations,
      totalGrantFunding,
      activeWorkOrders,
      completedWorkOrders
    };
  }, [participants, properties, workOrders, donations, grants]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <Card className="bg-gradient-to-br from-green-900/40 to-black/40 backdrop-blur-sm border border-green-700/30 text-center">
        <CardContent className="p-4">
          <div className="flex items-center justify-center mb-2">
            <Users className="w-8 h-8 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.activeParticipants}</div>
          <div className="text-xs text-green-300">Active Participants</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-900/40 to-black/40 backdrop-blur-sm border border-blue-700/30 text-center">
        <CardContent className="p-4">
          <div className="flex items-center justify-center mb-2">
            <Home className="w-8 h-8 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.propertiesInRenovation}</div>
          <div className="text-xs text-blue-300">In Renovation</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-900/40 to-black/40 backdrop-blur-sm border border-purple-700/30 text-center">
        <CardContent className="p-4">
          <div className="flex items-center justify-center mb-2">
            <Hammer className="w-8 h-8 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.activeWorkOrders}</div>
          <div className="text-xs text-purple-300">Active Work Orders</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-yellow-900/40 to-black/40 backdrop-blur-sm border border-yellow-700/30 text-center">
        <CardContent className="p-4">
          <div className="flex items-center justify-center mb-2">
            <DollarSign className="w-8 h-8 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-white">${stats.totalWagesEarned.toLocaleString()}</div>
          <div className="text-xs text-yellow-300">Wages Earned</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-emerald-900/40 to-black/40 backdrop-blur-sm border border-emerald-700/30 text-center">
        <CardContent className="p-4">
          <div className="flex items-center justify-center mb-2">
            <Award className="w-8 h-8 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.graduatedParticipants}</div>
          <div className="text-xs text-emerald-300">Graduated</div>
        </CardContent>
      </Card>
    </div>
  );
}