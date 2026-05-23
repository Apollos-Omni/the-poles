
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HingeEvent } from "@/entities/HingeEvent";
import { AuditLog } from "@/entities/AuditLog";
import { 
  X,
  Wifi, 
  WifiOff, 
  Lock, 
  Unlock, 
  Shield,
  MapPin,
  Activity,
  Calendar,
  Users,
  Zap,
  FileText
} from "lucide-react";
import { format } from "date-fns";

const statusIcons = {
  "online": Wifi,
  "offline": WifiOff,
  "locked": Lock,
  "unlocked": Unlock,
  "maintenance": Shield
};

const statusColors = {
  "online": "bg-green-100 text-green-800",
  "offline": "bg-red-100 text-red-800",
  "locked": "bg-yellow-100 text-yellow-800",
  "unlocked": "bg-blue-100 text-blue-800",
  "maintenance": "bg-purple-100 text-purple-800"
};

const severityColors = {
  info: "bg-blue-600/20 text-blue-300",
  warning: "bg-yellow-600/20 text-yellow-300",
  error: "bg-orange-600/20 text-orange-300",
  critical: "bg-red-600/20 text-red-300",
};

export default function HingeDetails({ hinge, onClose }) {
  const [events, setEvents] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadHingeData = useCallback(async () => {
    if (!hinge?.id) return;
    setIsLoading(true);
    try {
      const [hingeEvents, hingeAuditLogs] = await Promise.all([
        HingeEvent.filter({ hinge_id: hinge.id }, '-created_date', 10),
        AuditLog.filter({ object: `hinge:${hinge.id}` }, '-created_date', 10)
      ]);
      setEvents(hingeEvents);
      setAuditLogs(hingeAuditLogs);
    } catch (error) {
      console.error('Error loading hinge details:', error);
    }
    setIsLoading(false);
  }, [hinge?.id]);

  useEffect(() => {
    loadHingeData();
  }, [loadHingeData]);

  const StatusIcon = statusIcons[hinge.status];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{hinge.name}</h2>
                <Badge className={`${statusColors[hinge.status]} border`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {hinge.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                {hinge.location}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Device Info & Stats */}
          <div className="space-y-6">
            {/* Device Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Device Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-gray-500">Device ID</div>
                      <div className="font-mono text-sm text-gray-900">{hinge.device_id}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Access Level</div>
                      <div className="text-sm text-gray-900 capitalize">{hinge.access_level}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Karma Reward</div>
                      <div className="text-sm text-gray-900">+{hinge.karma_reward} per use</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-gray-500">Total Uses</div>
                      <div className="text-2xl font-bold text-blue-600">{hinge.total_uses}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Last Used</div>
                      <div className="text-sm text-gray-900">
                        {hinge.last_used 
                          ? format(new Date(hinge.last_used), 'MMM d, yyyy h:mm a')
                          : 'Never'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {Array(3).fill(0).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-gray-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : events.length > 0 ? (
                  <div className="space-y-3">
                    {events.slice(0, 10).map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Activity className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 capitalize">
                              {event.event_type.replace('_', ' ')}
                            </div>
                            <div className="text-sm text-gray-500">
                              {format(new Date(event.created_date), 'MMM d, h:mm a')}
                            </div>
                          </div>
                        </div>
                        {event.karma_earned > 0 && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                            <Zap className="w-3 h-3 mr-1" />
                            +{event.karma_earned}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No activity recorded yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Immutable Audit Log */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Immutable Audit Trail
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {Array(4).fill(0).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-gray-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : auditLogs.length > 0 ? (
                  <div className="space-y-3">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="p-3 bg-gray-50 rounded-lg border">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-mono text-xs text-gray-700 font-semibold">{log.action}</div>
                            <div className="text-xs text-gray-500">Actor: {log.actor}</div>
                          </div>
                           <Badge className={`${severityColors[log.severity]} text-xs`}>{log.severity}</Badge>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          {format(new Date(log.created_date), 'MMM d, yyyy h:mm:ss a')}
                        </div>
                         <div className="mt-1 font-mono text-[10px] text-gray-400 truncate" title={log.hash}>
                          Hash: {log.hash}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No audit trail entries found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
