import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Shield, Lock, Unlock, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

const eventIcons = {
  unlock: Unlock,
  lock: Lock,
  access_granted: Shield,
  access_denied: AlertTriangle,
  maintenance: AlertTriangle
};

const eventColors = {
  unlock: "bg-green-100 text-green-800",
  lock: "bg-blue-100 text-blue-800",
  access_granted: "bg-emerald-100 text-emerald-800",
  access_denied: "bg-red-100 text-red-800",
  maintenance: "bg-yellow-100 text-yellow-800"
};

export default function RecentActivity({ events, hinges }) {
  const getHingeName = (hingeId) => {
    const hinge = hinges.find(h => h.id === hingeId);
    return hinge?.name || 'Unknown Hinge';
  };

  return (
    <Card className="bg-gradient-to-br from-white to-slate-50 border-2 border-slate-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-gray-900">
          <Activity className="w-6 h-6 text-slate-600" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {events.slice(0, 5).map((event) => {
            const EventIcon = eventIcons[event.event_type];
            return (
              <div key={event.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="flex items-center gap-3">
                  <EventIcon className="w-5 h-5 text-slate-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {event.event_type.replace('_', ' ')} - {getHingeName(event.hinge_id)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(event.created_date), 'MMM d, h:mm a')}
                      {event.location && ` • ${event.location}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {event.karma_earned > 0 && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      +{event.karma_earned} karma
                    </Badge>
                  )}
                  <Badge className={`${eventColors[event.event_type]} border text-xs`}>
                    {event.event_type}
                  </Badge>
                </div>
              </div>
            );
          })}
          
          {events.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No recent activity</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}