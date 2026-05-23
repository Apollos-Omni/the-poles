import React, { useState, useEffect, useCallback } from 'react';
import { User } from '@/entities/User';
import { Participant } from '@/entities/Participant';
import { Property } from '@/entities/Property';
import { WorkOrder } from '@/entities/WorkOrder';
import { Donation } from '@/entities/Donation';
import { Grant } from '@/entities/Grant';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Users, 
  Hammer, 
  Heart,
  DollarSign,
  TrendingUp,
  Award,
  Building,
  Plus,
  FileText,
  Target
} from "lucide-react";

import ProgramStats from '../components/homeowner/ProgramStats';
import ParticipantOverview from '../components/homeowner/ParticipantOverview';
import PropertyPortfolio from '../components/homeowner/PropertyPortfolio';
import FundingTracker from '../components/homeowner/FundingTracker';
import ImpactMetrics from '../components/homeowner/ImpactMetrics';

export default function HomelessToHomeowner() {
  const [user, setUser] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [properties, setProperties] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [donations, setDonations] = useState([]);
  const [grants, setGrants] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  const loadProgramData = useCallback(async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);

      // Check if sample data exists, create if not
      const existingParticipants = await Participant.list();
      if (existingParticipants.length === 0) {
        console.log('Creating sample program data...');
      }

      const [
        participantData,
        propertyData, 
        workOrderData,
        donationData,
        grantData
      ] = await Promise.all([
        Participant.list('-created_date'),
        Property.list('-created_date'),
        WorkOrder.list('-created_date'),
        Donation.list('-created_date'),
        Grant.list('-created_date')
      ]);

      setParticipants(participantData);
      setProperties(propertyData);
      setWorkOrders(workOrderData);
      setDonations(donationData);
      setGrants(grantData);
    } catch (error) {
      console.error('Error loading program data:', error);
      // Set empty arrays to prevent UI breaks
      setParticipants([]);
      setProperties([]);
      setWorkOrders([]);
      setDonations([]);
      setGrants([]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadProgramData();
  }, [loadProgramData]);

  const TabButton = ({ id, label, icon: Icon, count = 0 }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 ${
        activeTab === id
          ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg'
          : 'bg-black/40 text-green-300 hover:bg-green-800/40 border border-green-700/30'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
      {count > 0 && (
        <Badge className="bg-green-500/20 text-green-300 text-xs">
          {count}
        </Badge>
      )}
    </button>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-emerald-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-black/40 backdrop-blur-md rounded-2xl p-6 animate-pulse border border-green-700/30">
                <div className="h-32 bg-green-900/20 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-emerald-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Home className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-300 via-white to-emerald-300 bg-clip-text text-transparent">
                Homeless to Homeowner
              </h1>
              <p className="text-green-200/80">Transforming lives through dignified work and sustainable housing</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-sm border border-green-500/30 rounded-xl p-4">
            <p className="text-green-100 text-sm">
              🏠 <strong>Mission:</strong> Creating pathways from homelessness to homeownership through construction training, 
              property rehabilitation, and rent-to-own programs in Galveston, Texas.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-4 mb-8">
          <TabButton 
            id="overview" 
            label="Program Overview" 
            icon={Target} 
          />
          <TabButton 
            id="participants" 
            label="Participants" 
            icon={Users} 
            count={participants.length}
          />
          <TabButton 
            id="properties" 
            label="Properties" 
            icon={Building} 
            count={properties.length}
          />
          <TabButton 
            id="workorders" 
            label="Work Orders" 
            icon={Hammer} 
            count={workOrders.filter(w => w.status !== 'completed').length}
          />
          <TabButton 
            id="funding" 
            label="Funding & Grants" 
            icon={DollarSign} 
            count={grants.filter(g => g.application_status === 'submitted').length}
          />
          <TabButton 
            id="impact" 
            label="Impact Metrics" 
            icon={Award} 
          />
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <ProgramStats 
                participants={participants}
                properties={properties}
                workOrders={workOrders}
                donations={donations}
                grants={grants}
              />
              
              {/* Quick Actions */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-sm border border-green-500/30 hover:border-green-400/50 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <Users className="w-12 h-12 mx-auto mb-4 text-green-400" />
                    <h3 className="text-lg font-semibold text-green-100 mb-2">Add Participant</h3>
                    <p className="text-green-300/70 text-sm mb-4">Enroll new program participant</p>
                    <Button className="bg-green-600 hover:bg-green-700 w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Enroll
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-sm border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <Building className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                    <h3 className="text-lg font-semibold text-blue-100 mb-2">Acquire Property</h3>
                    <p className="text-blue-300/70 text-sm mb-4">Add new rehabilitation property</p>
                    <Button className="bg-blue-600 hover:bg-blue-700 w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Property
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-600/20 to-violet-600/20 backdrop-blur-sm border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <DollarSign className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                    <h3 className="text-lg font-semibold text-purple-100 mb-2">Apply for Grant</h3>
                    <p className="text-purple-300/70 text-sm mb-4">Submit new funding application</p>
                    <Button className="bg-purple-600 hover:bg-purple-700 w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Apply
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-600/20 to-red-600/20 backdrop-blur-sm border border-orange-500/30 hover:border-orange-400/50 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-orange-400" />
                    <h3 className="text-lg font-semibold text-orange-100 mb-2">Generate Report</h3>
                    <p className="text-orange-300/70 text-sm mb-4">Create impact assessment</p>
                    <Button className="bg-orange-600 hover:bg-orange-700 w-full">
                      <FileText className="w-4 h-4 mr-2" />
                      Generate
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'participants' && (
            <ParticipantOverview participants={participants} workOrders={workOrders} />
          )}

          {activeTab === 'properties' && (
            <PropertyPortfolio properties={properties} workOrders={workOrders} />
          )}

          {activeTab === 'workorders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-green-100">Work Orders Management</h2>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Work Order
                </Button>
              </div>
              
              <div className="grid gap-6">
                {workOrders.map((workOrder) => (
                  <Card key={workOrder.id} className="bg-black/40 backdrop-blur-sm border border-green-700/30">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-green-100">{workOrder.title}</h3>
                          <p className="text-green-300/80 mt-1">{workOrder.description}</p>
                        </div>
                        <Badge className={
                          workOrder.status === 'completed' ? 'bg-green-600/20 text-green-300' :
                          workOrder.status === 'in_progress' ? 'bg-blue-600/20 text-blue-300' :
                          'bg-yellow-600/20 text-yellow-300'
                        }>
                          {workOrder.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'funding' && (
            <FundingTracker grants={grants} donations={donations} />
          )}

          {activeTab === 'impact' && (
            <ImpactMetrics 
              participants={participants}
              properties={properties}
              workOrders={workOrders}
              donations={donations}
            />
          )}
        </div>
      </div>
    </div>
  );
}