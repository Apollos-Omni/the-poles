import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, Camera, Activity, Clock } from 'lucide-react';
import { format } from "date-fns";

const severityColors = {
  info: 'bg-blue-600/20 text-blue-300 border-blue-500/30',
  warning: 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30',
  critical: 'bg-red-600/20 text-red-300 border-red-500/30',
  emergency: 'bg-red-600/40 text-red-200 border-red-400/50'
};

const eventIcons = {
  door_opened: Shield,
  door_closed: Shield,
  motion_detected: Camera,
  camera_activated: Camera,
  sensor_offline: AlertTriangle,
  unauthorized_access: AlertTriangle,
  tamper_detected: AlertTriangle
};

export default function AlertsPanel({ events, hinges }) {
  const getHingeName = (hingeId) => {
    const hinge = hinges.find(h => h.id === hingeId);
    return hinge?.name || 'Unknown Gateway';
  };

  const criticalEvents = events.filter(e => e.severity === 'critical' || e.severity === 'emergency');

  return (
    <Card className="bg-gradient-to-br from-black/60 to-gray-900/60 backdrop-blur-md border border-red-700/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-red-100">
            <Activity className="w-5 h-5" />
            Security Alerts
          </CardTitle>
          {criticalEvents.length > 0 && (
            <Badge className="bg-red-600/20 text-red-300 border border-red-500/30 animate-pulse">
              {criticalEvents.length} Critical
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {events.length > 0 ? (
            events.slice(0, 8).map((event) => {
              const EventIcon = eventIcons[event.event_type] || Activity;
              return (
                <div key={event.id} className="p-3 bg-black/40 rounded-lg border border-red-700/20">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <EventIcon className="w-4 h-4 text-red-400" />
                      <span className="text-red-200 text-sm font-medium">
                        {event.event_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                    <Badge className={`text-xs ${severityColors[event.severity]}`}>
                      {event.severity}
                    </Badge>
                  </div>

                  <div className="text-xs text-red-300/80 mb-1">
                    {getHingeName(event.hinge_id)}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-red-300/70">
                      <Clock className="w-3 h-3" />
                      {format(new Date(event.created_date), 'MMM d, HH:mm:ss')}
                    </div>
                    {event.response_time && (
                      <div className="text-red-400/70">
                        {event.response_time}ms
                      </div>
                    )}
                  </div>

                  {event.camera_recording_url && (
                    <div className="mt-2 pt-2 border-t border-red-700/30">
                      <button className="text-xs text-blue-400 hover:text-blue-300">
                        📹 View Recording
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-red-400/50">
              <Activity className="w-12 h-12 mx-auto mb-3" />
              <p className="text-sm">No security events</p>
              <p className="text-xs mt-1 text-red-500/50">Your realm is peaceful</p>
            </div>
          )}
        </div>

        {events.length > 8 && (
          <div className="mt-4 text-center">
            <button className="text-sm text-red-400 hover:text-red-300">
              View All Events ({events.length})
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}