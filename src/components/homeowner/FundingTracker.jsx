import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  TrendingUp, 
  FileText, 
  Heart, 
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus
} from "lucide-react";
import { format } from "date-fns";

const grantStatusColors = {
  researching: "bg-gray-600/20 text-gray-300 border-gray-500/30",
  preparing: "bg-blue-600/20 text-blue-300 border-blue-500/30",
  submitted: "bg-yellow-600/20 text-yellow-300 border-yellow-500/30",
  under_review: "bg-purple-600/20 text-purple-300 border-purple-500/30",
  awarded: "bg-green-600/20 text-green-300 border-green-500/30",
  denied: "bg-red-600/20 text-red-300 border-red-500/30"
};

const donationTypeColors = {
  monetary: "bg-green-600/20 text-green-300",
  materials: "bg-blue-600/20 text-blue-300",
  labor: "bg-purple-600/20 text-purple-300",
  professional_services: "bg-yellow-600/20 text-yellow-300"
};

export default function FundingTracker({ grants, donations }) {
  const [activeTab, setActiveTab] = useState('grants');
  
  const totalGrantsRequested = grants.reduce((sum, g) => sum + (g.amount_requested || 0), 0);
  const totalGrantsAwarded = grants.reduce((sum, g) => sum + (g.amount_awarded || 0), 0);
  const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
  const totalFunding = totalGrantsAwarded + totalDonations;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DollarSign className="w-6 h-6 text-green-400" />
          <h2 className="text-2xl font-bold text-green-100">Funding & Grants</h2>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Apply for Grant
        </Button>
      </div>

      {/* Funding Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-sm border border-green-500/30">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-300">${totalFunding.toLocaleString()}</div>
            <div className="text-xs text-green-400">Total Funding</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-sm border border-blue-500/30">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-300">${totalGrantsAwarded.toLocaleString()}</div>
            <div className="text-xs text-blue-400">Grants Awarded</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-600/20 to-violet-600/20 backdrop-blur-sm border border-purple-500/30">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-300">${totalDonations.toLocaleString()}</div>
            <div className="text-xs text-purple-400">Total Donations</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-sm border border-yellow-500/30">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-300">{grants.filter(g => g.application_status === 'submitted').length}</div>
            <div className="text-xs text-yellow-400">Pending Applications</div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4">
        <button
          onClick={() => setActiveTab('grants')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 ${
            activeTab === 'grants'
              ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg'
              : 'bg-black/40 text-green-300 hover:bg-green-800/40 border border-green-700/30'
          }`}
        >
          <FileText className="w-4 h-4" />
          Grants ({grants.length})
        </button>
        <button
          onClick={() => setActiveTab('donations')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 ${
            activeTab === 'donations'
              ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg'
              : 'bg-black/40 text-green-300 hover:bg-green-800/40 border border-green-700/30'
          }`}
        >
          <Heart className="w-4 h-4" />
          Donations ({donations.length})
        </button>
      </div>

      {/* Grants Tab */}
      {activeTab === 'grants' && (
        <div className="space-y-4">
          {grants.map((grant) => (
            <Card key={grant.id} className="bg-black/40 backdrop-blur-sm border border-green-700/30 hover:border-green-500/50 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-green-100">{grant.grant_name}</h3>
                      <Badge className={grantStatusColors[grant.application_status]}>
                        {grant.application_status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-green-300/80 text-sm mb-3">{grant.funding_organization}</p>
                    
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-green-300 mb-1">Grant Type</div>
                        <div className="text-green-100 capitalize">{grant.grant_type.replace('_', ' ')}</div>
                      </div>
                      <div>
                        <div className="text-green-300 mb-1">Amount Requested</div>
                        <div className="text-green-100">${grant.amount_requested?.toLocaleString() || '0'}</div>
                      </div>
                      {grant.application_deadline && (
                        <div>
                          <div className="text-green-300 mb-1">Deadline</div>
                          <div className="text-green-100">{format(new Date(grant.application_deadline), 'MMM d, yyyy')}</div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {grant.amount_awarded > 0 ? (
                      <div className="text-2xl font-bold text-green-400">${grant.amount_awarded.toLocaleString()}</div>
                    ) : (
                      <div className="text-2xl font-bold text-green-600">${grant.total_amount.toLocaleString()}</div>
                    )}
                    <div className="text-xs text-green-300">
                      {grant.amount_awarded > 0 ? 'Awarded' : 'Available'}
                    </div>
                  </div>
                </div>

                {/* Progress for submitted grants */}
                {grant.application_status === 'submitted' && grant.application_deadline && (
                  <div className="mt-4 pt-4 border-t border-green-700/30">
                    <div className="flex items-center gap-2 text-yellow-400 text-sm">
                      <Clock className="w-4 h-4" />
                      Under Review - Decision Expected Soon
                    </div>
                  </div>
                )}

                {/* Requirements for preparing grants */}
                {grant.application_status === 'preparing' && grant.requirements && (
                  <div className="mt-4 pt-4 border-t border-green-700/30">
                    <div className="text-sm">
                      <div className="text-green-300 mb-2">Requirements:</div>
                      <div className="flex flex-wrap gap-2">
                        {grant.requirements.slice(0, 3).map((req, index) => (
                          <Badge key={index} className="bg-blue-600/20 text-blue-300 text-xs">
                            {req}
                          </Badge>
                        ))}
                        {grant.requirements.length > 3 && (
                          <Badge className="bg-gray-600/20 text-gray-300 text-xs">
                            +{grant.requirements.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Donations Tab */}
      {activeTab === 'donations' && (
        <div className="space-y-4">
          {donations.map((donation) => (
            <Card key={donation.id} className="bg-black/40 backdrop-blur-sm border border-green-700/30">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-green-100">{donation.donor_name}</h3>
                      <Badge className={donationTypeColors[donation.donation_type]}>
                        {donation.donation_type.replace('_', ' ')}
                      </Badge>
                      {donation.donation_status === 'received' && (
                        <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Received
                        </Badge>
                      )}
                    </div>
                    
                    {donation.description && (
                      <p className="text-green-300/80 text-sm mb-3">{donation.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-green-300">
                      {donation.received_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Received {format(new Date(donation.received_date), 'MMM d, yyyy')}
                        </div>
                      )}
                      {donation.designated_property && (
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          Designated for specific property
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">${donation.amount.toLocaleString()}</div>
                    <div className="text-xs text-green-300">
                      {donation.tax_deductible ? 'Tax Deductible' : 'Non-deductible'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty States */}
      {activeTab === 'grants' && grants.length === 0 && (
        <Card className="bg-black/40 backdrop-blur-sm border border-green-700/30 text-center p-12">
          <FileText className="w-16 h-16 mx-auto mb-4 text-green-400/50" />
          <h3 className="text-xl font-semibold text-green-200 mb-2">No Grant Applications</h3>
          <p className="text-green-300/70 mb-6">Start applying for grants to fund the program</p>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="w-5 h-5 mr-2" />
            Apply for First Grant
          </Button>
        </Card>
      )}

      {activeTab === 'donations' && donations.length === 0 && (
        <Card className="bg-black/40 backdrop-blur-sm border border-green-700/30 text-center p-12">
          <Heart className="w-16 h-16 mx-auto mb-4 text-green-400/50" />
          <h3 className="text-xl font-semibold text-green-200 mb-2">No Donations Yet</h3>
          <p className="text-green-300/70 mb-6">Donations will appear here as they are received</p>
        </Card>
      )}
    </div>
  );
}