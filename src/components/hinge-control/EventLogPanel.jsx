import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Activity, 
  Lock, 
  Unlock, 
  Camera, 
  AlertTriangle, 
  Wifi,
  Heart,
  User,
  Settings
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

const eventIcons = {
  STATE: Activity,
  MOTION: Wifi,
  TAMPER: AlertTriangle,
  SNAPSHOT_OK: Camera,
  ERROR: AlertTriangle,
  COMMAND_ACK: Settings,
  HEARTBEAT: Heart
};

const eventColors = {
  STATE: 'text-blue-400',
  MOTION: 'text-green-400',
  TAMPER: 'text-red-400',
  SNAPSHOT_OK: 'text-purple-400',
  ERROR: 'text-red-400',
  COMMAND_ACK: 'text-yellow-400',
  HEARTBEAT: 'text-gray-400'
};

const severityColors = {
  info: 'bg-blue-600/20 text-blue-300',
  warning: 'bg-yellow-600/20 text-yellow-300',
  error: 'bg-red-600/20 text-red-300',
  critical: 'bg-red-600/30 text-red-200'
};

export default function EventLogPanel({ events, devices }) {
  const getDeviceName = (deviceId) => {
    const device = devices.find(d => d.id === deviceId || d.device_id === deviceId);
    return device ? device.name : deviceId;
  };

  const formatEventData = (event) => {
    switch (event.event_type) {
      case 'STATE':
        return `${event.data?.lock_state || 'unknown'} • ${event.data?.door_state || 'unknown'}`;
      case 'MOTION':
        return event.data?.motion_detected ? 'Motion detected' : 'Motion cleared';
      case 'TAMPER':
        return `Tamper ${event.data?.tamper_active ? 'detected' : 'cleared'}`;
      case 'SNAPSHOT_OK':
        return `Image captured (${event.data?.file_size ? (event.data.file_size / 1024).toFixed(1) + 'KB' : 'unknown size'})`;
      case 'ERROR':
        return event.data?.message || 'Unknown error';
      case 'COMMAND_ACK':
        return `Command acknowledged: ${event.data?.command || 'unknown'}`;
      case 'HEARTBEAT':
        return `Status update`;
      default:
        return 'Unknown event';
    }
  };

  if (!events || events.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-blue-900/40 to-black/40 backdrop-blur-sm border border-blue-700/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-100">
            <Activity className="w-5 h-5" />
            Event Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-blue-300/60">
            <Activity className="w-12 h-12 mx-auto mb-3 text-blue-400/30" />
            <p className="text-sm">No recent events</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-900/40 to-black/40 backdrop-blur-sm border border-blue-700/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-100">
          <Activity className="w-5 h-5" />
          Event Log
          <Badge className="bg-blue-600/20 text-blue-300 ml-auto">
            {events.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-80 px-6">
          <div className="space-y-3 pb-6">
            {events.map((event) => {
              const EventIcon = eventIcons[event.event_type] || Activity;
              const iconColor = eventColors[event.event_type] || 'text-gray-400';
              
              return (
                <div 
                  key={event.id} 
                  className="flex items-start gap-3 p-3 bg-black/20 rounded-lg hover:bg-black/30 transition-colors"
                >
                  <div className={`mt-1 ${iconColor}`}>
                    <EventIcon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-blue-100 text-sm font-medium">
                        {getDeviceName(event.device_id)}
                      </span>
                      <Badge className={`${severityColors[event.severity]} text-xs`}>
                        {event.severity}
                      </Badge>
                    </div>
                    
                    <p className="text-blue-200 text-sm">
                      {formatEventData(event)}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-blue-300/60 text-xs">
                        {event.actor && event.actor !== 'system' && (
                          <>
                            <User className="w-3 h-3 inline mr-1" />
                            {event.actor} •{' '}
                          </>
                        )}
                        {formatDistanceToNow(new Date(event.timestamp))} ago
                      </span>
                      {event.request_id && (
                        <span className="text-blue-400/40 text-xs font-mono">
                          {event.request_id.slice(-8)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}