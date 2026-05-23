import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  Thermometer, 
  Clock, 
  Shield, 
  Settings,
  Cpu,
  HardDrive
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

export default function DeviceStatusPanel({ device, state }) {
  const getConnectionQuality = (rssi) => {
    if (rssi > -50) return { quality: 'Excellent', color: 'text-green-400' };
    if (rssi > -60) return { quality: 'Good', color: 'text-blue-400' };
    if (rssi > -70) return { quality: 'Fair', color: 'text-yellow-400' };
    return { quality: 'Poor', color: 'text-red-400' };
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const connectionInfo = getConnectionQuality(state.rssi);

  return (
    <Card className="bg-gradient-to-br from-blue-900/40 to-black/40 backdrop-blur-sm border border-blue-700/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-100">
          <Activity className="w-5 h-5" />
          Device Status
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Connection Status */}
        <div className="space-y-3">
          <h4 className="font-medium text-blue-200">Connection</h4>
          <div className="bg-black/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-300 text-sm">Status</span>
              <div className="flex items-center gap-2">
                {device.is_online ? (
                  <Wifi className="w-4 h-4 text-green-400" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-400" />
                )}
                <Badge className={device.is_online ? 'bg-green-600/20 text-green-300' : 'bg-red-600/20 text-red-300'}>
                  {device.is_online ? 'Online' : 'Offline'}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-300 text-sm">Signal Strength</span>
              <span className={`text-sm ${connectionInfo.color}`}>
                {state.rssi} dBm ({connectionInfo.quality})
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-blue-300 text-sm">Last Seen</span>
              <span className="text-blue-100 text-sm">
                {formatDistanceToNow(new Date(device.last_seen_at))} ago
              </span>
            </div>
          </div>
        </div>

        {/* Hardware Info */}
        <div className="space-y-3">
          <h4 className="font-medium text-blue-200">Hardware</h4>
          <div className="bg-black/30 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-blue-300 text-sm">Temperature</span>
              <div className="flex items-center gap-1 text-blue-100 text-sm">
                <Thermometer className="w-3 h-3" />
                {state.temperature?.toFixed(1)}°C
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-blue-300 text-sm">Uptime</span>
              <div className="flex items-center gap-1 text-blue-100 text-sm">
                <Clock className="w-3 h-3" />
                {formatUptime(state.uptime_seconds || 0)}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-blue-300 text-sm">Firmware</span>
              <span className="text-blue-100 text-sm font-mono">
                v{device.firmware_version}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-blue-300 text-sm">Hardware Rev</span>
              <span className="text-blue-100 text-sm">
                {device.hardware_revision}
              </span>
            </div>
          </div>
        </div>

        {/* Device Settings */}
        <div className="space-y-3">
          <h4 className="font-medium text-blue-200">Configuration</h4>
          <div className="bg-black/30 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-blue-300 text-sm">Auto-relock</span>
              <Badge className={state.auto_relock_enabled ? 'bg-green-600/20 text-green-300' : 'bg-gray-600/20 text-gray-300'}>
                {state.auto_relock_enabled ? `${state.auto_relock_delay}s` : 'Disabled'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-blue-300 text-sm">Device ID</span>
              <span className="text-blue-100 text-sm font-mono">
                {device.device_id}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-blue-300 text-sm">Enrolled</span>
              <span className="text-blue-100 text-sm">
                {format(new Date(device.enrollment_date), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        </div>

        {/* Security Status */}
        {state.tamper_detected && (
          <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-red-400" />
              <span className="text-red-300 font-medium">Security Alert</span>
            </div>
            <p className="text-red-400 text-sm">
              Tamper detection is currently active. Check the device physically.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}