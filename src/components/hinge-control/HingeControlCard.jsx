import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Lock, 
  Unlock, 
  Camera, 
  Video,
  Wifi, 
  WifiOff, 
  Thermometer,
  Shield,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const statusColors = {
  locked: "bg-red-500/20 text-red-300 border-red-500/30",
  unlocked: "bg-green-500/20 text-green-300 border-green-500/30",
  transitioning: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  error: "bg-red-500/20 text-red-300 border-red-500/30"
};

const doorStateColors = {
  open: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  closed: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  unknown: "bg-gray-500/20 text-gray-400 border-gray-500/30"
};

export default function HingeControlCard({ 
  device, 
  state, 
  onSendCommand, 
  isExpanded,
  onToggle
}) {
  const [isCommandPending, setIsCommandPending] = useState(null);

  const handleCommand = async (commandType, args = {}) => {
    if (isCommandPending) return;
    
    setIsCommandPending(commandType);
    try {
      await onSendCommand(device.id, commandType, args);
    } catch (error) {
      console.error('Command failed:', error);
    } finally {
      setTimeout(() => setIsCommandPending(null), 1500);
    }
  };

  if (!state) {
    return (
      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 opacity-50">
        <CardContent className="p-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold text-white">{device.name}</h3>
              <p className="text-gray-400 text-[10px]">{device.location}</p>
            </div>
            <Badge className="bg-gray-600 text-gray-300 text-[10px]">No Data</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-900/40 to-black/40 backdrop-blur-sm border border-blue-700/30">
      {/* Compact Header - Always Visible */}
      <CardHeader 
        className="pb-0 pt-2 px-2 cursor-pointer hover:bg-blue-900/20 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {device.is_online ? (
              <Wifi className="w-3 h-3 text-green-400 flex-shrink-0" />
            ) : (
              <WifiOff className="w-3 h-3 text-red-400 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xs text-white truncate">{device.name}</CardTitle>
              <p className="text-[10px] text-blue-300/60 truncate">{device.location}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 ml-2">
            <Badge className={`${statusColors[state.lock_state]} border text-[10px] px-1.5 py-0`}>
              {state.lock_state === 'locked' ? 'LOCKED' : 'UNLOCKED'}
            </Badge>
            {state.tamper_detected && (
              <Shield className="w-3 h-3 text-red-400" />
            )}
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-blue-300" />
            ) : (
              <ChevronDown className="w-4 h-4 text-blue-300" />
            )}
          </div>
        </div>
      </CardHeader>

      {/* Lock/Unlock Controls - Always Visible */}
      <CardContent className="px-2 pt-2 pb-2 space-y-2">
        <div className="flex gap-2">
          {state.lock_state === 'locked' ? (
            <Button
              onClick={() => handleCommand('UNLOCK', { ttlSec: state.auto_relock_delay })}
              disabled={!!isCommandPending || !device.is_online}
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-xs h-8"
            >
              <Unlock className="w-3 h-3 mr-1" />
              {isCommandPending === 'UNLOCK' ? 'Unlocking...' : 'Unlock'}
            </Button>
          ) : (
            <Button
              onClick={() => handleCommand('LOCK')}
              disabled={!!isCommandPending || !device.is_online}
              size="sm"
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-xs h-8"
            >
              <Lock className="w-3 h-3 mr-1" />
              {isCommandPending === 'LOCK' ? 'Locking...' : 'Lock'}
            </Button>
          )}

          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleCommand('SNAPSHOT', { upload: true, quality: 85 });
            }}
            disabled={!!isCommandPending || !device.is_online}
            variant="outline"
            size="sm"
            className="border-blue-500/30 text-blue-300 hover:bg-blue-900/30 text-xs h-8 px-2"
          >
            <Camera className="w-3 h-3" />
          </Button>

          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleCommand('VIDEO_CLIP', { durationSec: 6, upload: true, quality: 18 });
            }}
            disabled={!!isCommandPending || !device.is_online}
            variant="outline"
            size="sm"
            className="border-purple-500/30 text-purple-300 hover:bg-purple-900/30 text-xs h-8 px-2"
          >
            <Video className="w-3 h-3" />
          </Button>
        </div>

        {/* Expandable Details */}
        {isExpanded && (
          <div className="space-y-2 pt-2 border-t border-blue-700/20">
            {/* Status Grid */}
            <div className="grid grid-cols-4 gap-1.5">
              <div className="bg-black/30 rounded p-1.5 text-center">
                <div className="text-xs font-semibold text-white">
                  {state.hinge_angle?.toFixed(0) || 0}°
                </div>
                <div className="text-[9px] text-blue-300">Angle</div>
              </div>
              
              <div className="bg-black/30 rounded p-1.5 text-center">
                <div className="flex items-center justify-center gap-0.5 text-xs font-semibold text-white">
                  {state.rssi}
                  <Wifi className="w-2 h-2" />
                </div>
                <div className="text-[9px] text-blue-300">dBm</div>
              </div>
              
              <div className="bg-black/30 rounded p-1.5 text-center">
                <div className="flex items-center justify-center gap-0.5 text-xs font-semibold text-white">
                  {state.temperature?.toFixed(1)}
                  <Thermometer className="w-2 h-2" />
                </div>
                <div className="text-[9px] text-blue-300">°C</div>
              </div>
              
              <div className="bg-black/30 rounded p-1.5 text-center">
                <div className="text-xs font-semibold text-white">
                  {Math.floor((state.uptime_seconds || 0) / 3600)}h
                </div>
                <div className="text-[9px] text-blue-300">Up</div>
              </div>
            </div>

            {/* Door State Badge */}
            <div className="flex items-center justify-center">
              <Badge className={`${doorStateColors[state.door_state]} border text-[10px] px-2 py-0.5`}>
                Door: {state.door_state === 'open' ? 'Open' : state.door_state === 'closed' ? 'Closed' : 'Unknown'}
              </Badge>
            </div>

            {/* Tamper Alert */}
            {state.tamper_detected && (
              <div className="bg-red-900/30 border border-red-700/50 rounded p-1.5 flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3 text-red-400 flex-shrink-0" />
                <div>
                  <div className="text-red-300 font-medium text-[10px]">Tamper Detected</div>
                  <div className="text-red-400 text-[9px]">Security alert - unauthorized access</div>
                </div>
              </div>
            )}

            {/* Device Info */}
            <div className="text-[9px] text-blue-300/60 text-center">
              {device.device_id} • Last seen {formatDistanceToNow(new Date(device.last_seen_at))} ago
            </div>

            {/* Auto-relock info */}
            {state.auto_relock_enabled && state.lock_state === 'unlocked' && (
              <div className="text-[9px] text-blue-300/80 text-center">
                Auto-relock in {state.auto_relock_delay}s when door closes
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}