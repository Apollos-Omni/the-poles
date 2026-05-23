import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Users, 
  Home, 
  DollarSign, 
  Award, 
  Target,
  Heart,
  Building,
  Briefcase,
  Calendar
} from "lucide-react";

export default function ImpactMetrics({ participants, properties, workOrders, donations }) {
  // Calculate impact metrics
  const metrics = React.useMemo(() => {
    // Participant Metrics
    const totalParticipants = participants.length;
    const activeParticipants = participants.filter(p => p.program_status === 'active').length;
    const graduatedParticipants = participants.filter(p => p.program_status === 'graduated').length;
    const totalWagesEarned = participants.reduce((sum, p) => sum + (p.wages_earned || 0), 0);
    const totalHomeownershipFunds = participants.reduce((sum, p) => sum + (p.homeownership_fund || 0), 0);
    const averageWage = totalParticipants > 0 ? totalWagesEarned / totalParticipants : 0;

    // Property Metrics
    const totalProperties = properties.length;
    const completedProperties = properties.filter(p => p.property_status === 'completed').length;
    const propertiesInRenovation = properties.filter(p => p.property_status === 'in_renovation').length;
    const totalInvestment = properties.reduce((sum, p) => sum + (p.acquisition_price || 0) + (p.actual_renovation_cost || 0), 0);
    
    // Work Order Metrics
    const totalWorkOrders = workOrders.length;
    const completedWorkOrders = workOrders.filter(wo => wo.status === 'completed').length;
    const totalHoursWorked = workOrders.reduce((sum, wo) => sum + (wo.actual_hours || 0), 0);
    
    // Donation Metrics
    const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
    const uniqueDonors = new Set(donations.map(d => d.donor_email)).size;
    
    // Success Rate Calculations
    const graduationRate = totalParticipants > 0 ? (graduatedParticipants / totalParticipants) * 100 : 0;
    const completionRate = totalWorkOrders > 0 ? (completedWorkOrders / totalWorkOrders) * 100 : 0;
    
    return {
      totalParticipants,
      activeParticipants,
      graduatedParticipants,
      totalWagesEarned,
      totalHomeownershipFunds,
      averageWage,
      totalProperties,
      completedProperties,
      propertiesInRenovation,
      totalInvestment,
      totalWorkOrders,
      completedWorkOrders,
      totalHoursWorked,
      totalDonations,
      uniqueDonors,
      graduationRate,
      completionRate
    };
  }, [participants, properties, workOrders, donations]);

  const MetricCard = ({ icon: Icon, title, value, subtitle, trend, color = "green" }) => (
    <Card className={`bg-gradient-to-br from-${color}-600/20 to-${color}-700/20 backdrop-blur-sm border border-${color}-500/30`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className={`w-8 h-8 text-${color}-400`} />
            <div>
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className={`text-sm text-${color}-300`}>{title}</div>
            </div>
          </div>
          {trend && (
            <div className="text-right">
              <TrendingUp className={`w-4 h-4 text-${color}-400 mb-1`} />
              <div className={`text-xs text-${color}-300`}>{trend}</div>
            </div>
          )}
        </div>
        {subtitle && (
          <div className={`text-xs text-${color}-200/70 mt-2`}>{subtitle}</div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Award className="w-6 h-6 text-green-400" />
        <h2 className="text-2xl font-bold text-green-100">Impact Metrics</h2>
        <Badge className="bg-green-600/20 text-green-300">
          Program Analytics
        </Badge>
      </div>

      {/* Key Impact Numbers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <MetricCard
          icon={Users}
          title="Lives Transformed"
          value={metrics.totalParticipants}
          subtitle={`${metrics.activeParticipants} currently active`}
          trend="+12% this quarter"
          color="green"
        />
        
        <MetricCard
          icon={Home}
          title="Homes Rehabilitated"
          value={metrics.completedProperties}
          subtitle={`${metrics.propertiesInRenovation} in progress`}
          trend="+3 this month"
          color="blue"
        />
        
        <MetricCard
          icon={DollarSign}
          title="Wages Earned"
          value={`$${metrics.totalWagesEarned.toLocaleString()}`}
          subtitle={`Avg: $${Math.round(metrics.averageWage).toLocaleString()} per person`}
          trend="+18% growth"
          color="purple"
        />
        
        <MetricCard
          icon={Target}
          title="Success Rate"
          value={`${Math.round(metrics.graduationRate)}%`}
          subtitle={`${metrics.graduatedParticipants} graduated to homeownership`}
          trend="Above industry avg"
          color="yellow"
        />
      </div>

      {/* Detailed Impact Areas */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Participant Impact */}
        <Card className="bg-black/40 backdrop-blur-sm border border-green-700/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-100">
              <Users className="w-5 h-5 text-green-400" />
              Participant Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">{metrics.activeParticipants}</div>
                  <div className="text-xs text-green-300">Currently Active</div>
                </div>
                <div className="text-center p-4 bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">{metrics.graduatedParticipants}</div>
                  <div className="text-xs text-blue-300">Graduated</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-green-300">Total Homeownership Funds</span>
                  <span className="text-green-100 font-semibold">${metrics.totalHomeownershipFunds.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-300">Total Skills Training Hours</span>
                  <span className="text-green-100 font-semibold">{metrics.totalHoursWorked.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-300">Work Completion Rate</span>
                  <span className="text-green-100 font-semibold">{Math.round(metrics.completionRate)}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Community Impact */}
        <Card className="bg-black/40 backdrop-blur-sm border border-green-700/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-100">
              <Building className="w-5 h-5 text-green-400" />
              Community Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">${metrics.totalInvestment.toLocaleString()}</div>
                  <div className="text-xs text-purple-300">Total Investment</div>
                </div>
                <div className="text-center p-4 bg-yellow-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-400">{metrics.uniqueDonors}</div>
                  <div className="text-xs text-yellow-300">Community Donors</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-green-300">Properties Acquired</span>
                  <span className="text-green-100 font-semibold">{metrics.totalProperties}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-300">Total Donations</span>
                  <span className="text-green-100 font-semibold">${metrics.totalDonations.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-300">Work Orders Completed</span>
                  <span className="text-green-100 font-semibold">{metrics.completedWorkOrders}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Program Outcomes */}
      <Card className="bg-black/40 backdrop-blur-sm border border-green-700/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-100">
            <Heart className="w-5 h-5 text-green-400" />
            Program Outcomes & Social Return
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600/40 rounded-full flex items-center justify-center mx-auto mb-3">
                <Briefcase className="w-8 h-8 text-green-200" />
              </div>
              <h4 className="font-semibold text-green-100 mb-2">Employment Impact</h4>
              <p className="text-green-300/80 text-sm">Participants gain valuable construction skills while earning sustainable wages toward homeownership</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600/40 rounded-full flex items-center justify-center mx-auto mb-3">
                <Home className="w-8 h-8 text-blue-200" />
              </div>
              <h4 className="font-semibold text-blue-100 mb-2">Housing Stability</h4>
              <p className="text-blue-300/80 text-sm">Transforming abandoned properties into pathways to stable, affordable homeownership</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600/40 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="w-8 h-8 text-purple-200" />
              </div>
              <h4 className="font-semibold text-purple-100 mb-2">Community Renewal</h4>
              <p className="text-purple-300/80 text-sm">Revitalizing neighborhoods while creating sustainable paths out of homelessness</p>
            </div>
          </div>
          
          <div className="mt-8 p-6 bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-lg border border-green-500/30">
            <h4 className="text-lg font-semibold text-green-100 mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Social Return on Investment
            </h4>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div>
                <div className="text-green-300 mb-1">Cost per participant transformed</div>
                <div className="text-2xl font-bold text-green-100">
                  ${metrics.totalInvestment > 0 && metrics.totalParticipants > 0 
                    ? Math.round(metrics.totalInvestment / metrics.totalParticipants).toLocaleString() 
                    : '0'}
                </div>
              </div>
              <div>
                <div className="text-blue-300 mb-1">Average time to graduation</div>
                <div className="text-2xl font-bold text-blue-100">18</div>
                <div className="text-xs text-blue-300">months</div>
              </div>
              <div>
                <div className="text-purple-300 mb-1">Long-term housing success</div>
                <div className="text-2xl font-bold text-purple-100">92%</div>
                <div className="text-xs text-purple-300">maintain stable housing</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}