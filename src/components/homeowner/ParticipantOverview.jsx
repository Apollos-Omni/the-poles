
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  Users, // Added Users import
  Phone, 
  Mail, 
  MapPin, 
  Briefcase,
  DollarSign,
  Home,
  Calendar,
  Plus,
  Hammer // Added Hammer import
} from "lucide-react";
import { format } from "date-fns";

const statusColors = {
  applied: "bg-yellow-600/20 text-yellow-300 border-yellow-500/30",
  screening: "bg-blue-600/20 text-blue-300 border-blue-500/30",
  active: "bg-green-600/20 text-green-300 border-green-500/30",
  graduated: "bg-purple-600/20 text-purple-300 border-purple-500/30",
  exited: "bg-red-600/20 text-red-300 border-red-500/30"
};

const housingStatusColors = {
  street: "bg-red-600/20 text-red-300",
  shelter: "bg-orange-600/20 text-orange-300", 
  transitional: "bg-yellow-600/20 text-yellow-300",
  temporary: "bg-blue-600/20 text-blue-300",
  other: "bg-gray-600/20 text-gray-300"
};

export default function ParticipantOverview({ participants, workOrders }) {
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-green-400" />
          <h2 className="text-2xl font-bold text-green-100">Program Participants</h2>
          <Badge className="bg-green-600/20 text-green-300">
            {participants.length} enrolled
          </Badge>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Enroll Participant
        </Button>
      </div>

      <div className="grid gap-6">
        {participants.map((participant) => {
          const participantWorkOrders = workOrders.filter(wo => 
            wo.assigned_participants?.includes(participant.id)
          );
          const homeownershipProgress = Math.min((participant.homeownership_fund / 50000) * 100, 100);

          return (
            <Card key={participant.id} className="bg-gradient-to-br from-green-600/10 to-black/40 backdrop-blur-sm border border-green-700/30 hover:border-green-500/50 transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-600/40 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-green-200" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-green-100">{participant.full_name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={statusColors[participant.program_status]}>
                          {participant.program_status}
                        </Badge>
                        <Badge className={housingStatusColors[participant.current_housing_status]}>
                          {participant.current_housing_status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">
                      ${participant.wages_earned?.toLocaleString() || '0'}
                    </div>
                    <div className="text-xs text-green-300">Wages Earned</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Contact & Status */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-green-200 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Contact Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-green-300">
                        <Phone className="w-3 h-3" />
                        {participant.phone || 'Not provided'}
                      </div>
                      <div className="flex items-center gap-2 text-green-300">
                        <Mail className="w-3 h-3" />
                        {participant.email || 'Not provided'}
                      </div>
                      <div className="flex items-center gap-2 text-green-300">
                        <Calendar className="w-3 h-3" />
                        Started: {participant.start_date ? format(new Date(participant.start_date), 'MMM d, yyyy') : 'Not set'}
                      </div>
                    </div>
                  </div>

                  {/* Skills & Progress */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-green-200 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Skills & Progress
                    </h4>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {participant.skills?.slice(0, 3).map((skill, index) => (
                          <Badge key={index} className="bg-blue-600/20 text-blue-300 text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {participant.skills?.length > 3 && (
                          <Badge className="bg-gray-600/20 text-gray-300 text-xs">
                            +{participant.skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-green-300 mb-1">
                          <span>Homeownership Fund</span>
                          <span>${participant.homeownership_fund?.toLocaleString() || '0'} / $50,000</span>
                        </div>
                        <Progress value={homeownershipProgress} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active Work Orders */}
                {participantWorkOrders.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-green-700/30">
                    <h4 className="font-semibold text-green-200 mb-2 flex items-center gap-2">
                      <Hammer className="w-4 h-4" />
                      Current Work Orders ({participantWorkOrders.length})
                    </h4>
                    <div className="grid md:grid-cols-2 gap-2">
                      {participantWorkOrders.slice(0, 4).map((wo) => (
                        <div key={wo.id} className="p-2 bg-green-900/20 rounded-lg border border-green-700/20">
                          <div className="text-sm text-green-200 font-medium">{wo.title}</div>
                          <div className="text-xs text-green-300/70">{wo.work_category} • {wo.status}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-green-700/30">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="border-green-500/30 text-green-300 hover:bg-green-500/10"
                    onClick={() => setSelectedParticipant(participant)}
                  >
                    View Details
                  </Button>
                  <Button 
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Add Note
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {participants.length === 0 && (
        <Card className="bg-black/40 backdrop-blur-sm border border-green-700/30 text-center p-12">
          <User className="w-16 h-16 mx-auto mb-4 text-green-400/50" />
          <h3 className="text-xl font-semibold text-green-200 mb-2">No Participants Yet</h3>
          <p className="text-green-300/70 mb-6">Start enrolling participants in the program</p>
          <Button 
            onClick={() => setShowAddForm(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Enroll First Participant
          </Button>
        </Card>
      )}
    </div>
  );
}
