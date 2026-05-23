import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Wifi, 
  WifiOff, 
  Lock, 
  Unlock, 
  Shield,
  Settings,
  MapPin,
  Activity,
  AlertTriangle 
} from "lucide-react";

const statusColors = {
  "online": "bg-green-100 text-green-800 border-green-200",
  "offline": "bg-red-100 text-red-800 border-red-200", 
  "locked": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "unlocked": "bg-blue-100 text-blue-800 border-blue-200",
  "maintenance": "bg-purple-100 text-purple-800 border-purple-200"
};

const statusIcons = {
  "online": Wifi,
  "offline": WifiOff,
  "locked": Lock,
  "unlocked": Unlock,
  "maintenance": Shield
};

export default function HingeCard({ hinge, onAction, onSelect }) {
  const StatusIcon = statusIcons[hinge.status];

  return (
    <Card className="bg-white border-2 hover:border-blue-300 transition-all duration-300 cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
              {hinge.name}
            </CardTitle>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="w-4 h-4" />
              {hinge.location}
            </div>
          </div>
          <Badge className={`${statusColors[hinge.status]} border text-xs`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {hinge.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-2 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">{hinge.total_uses}</div>
              <div className="text-xs text-gray-500">Total Uses</div>
            </div>
            <div className="p-2 bg-yellow-50 rounded-lg">
              <div className="text-lg font-semibold text-yellow-600">+{hinge.karma_reward}</div>
              <div className="text-xs text-gray-500">Karma/Use</div>
            </div>
          </div>

          {/* Device Info */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">Device ID</div>
            <div className="font-mono text-sm text-gray-800">{hinge.device_id}</div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {hinge.status === 'online' && (
              <>
                <Button
                  size="sm"
                  variant={hinge.status === 'locked' ? 'outline' : 'default'}
                  className="flex-1"
                  onClick={() => onAction(hinge.id, 'lock')}
                >
                  <Lock className="w-4 h-4 mr-1" />
                  Lock
                </Button>
                <Button
                  size="sm"
                  variant={hinge.status === 'unlocked' ? 'outline' : 'default'}
                  className="flex-1"
                  onClick={() => onAction(hinge.id, 'unlock')}
                >
                  <Unlock className="w-4 h-4 mr-1" />
                  Unlock
                </Button>
              </>
            )}
            {hinge.status === 'offline' && (
              <Button size="sm" variant="outline" className="flex-1" disabled>
                <WifiOff className="w-4 h-4 mr-1" />
                Offline
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onSelect(hinge)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>

          {/* Last Activity */}
          {hinge.last_used && (
            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
              <span>Last used</span>
              <span>{new Date(hinge.last_used).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}