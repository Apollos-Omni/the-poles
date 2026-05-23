import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Camera, Wifi, WifiOff, Battery, AlertTriangle, Eye } from 'lucide-react';

const statusColors = {
  online: 'from-green-500 to-green-600',
  offline: 'from-red-500 to-red-600',
  locked: 'from-yellow-500 to-yellow-600',
  unlocked: 'from-blue-500 to-blue-600'
};

export default function SecurityGrid({ hinges, sensors, cameras, onSelectHinge }) {
  const getSensorForHinge = (hingeId) => {
    return sensors.find(s => s.hinge_id === hingeId);
  };

  const getCameraForHinge = (hingeId) => {
    return cameras.find(c => c.hinge_id === hingeId);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <Eye className="w-7 h-7 text-red-400" />
        Security Grid
        <span className="text-sm font-normal text-red-300">({hinges.length} monitored)</span>
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hinges.map((hinge) => {
          const sensor = getSensorForHinge(hinge.id);
          const camera = getCameraForHinge(hinge.id);
          
          return (
            <Card 
              key={hinge.id}
              className="bg-gradient-to-br from-black/60 to-gray-900/60 backdrop-blur-md border border-red-700/30 hover:border-red-500/50 transition-all duration-300 cursor-pointer"
              onClick={() => onSelectHinge(hinge)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-red-100">{hinge.name}</CardTitle>
                    <p className="text-sm text-red-300/70">{hinge.location}</p>
                  </div>
                  <Badge className={`bg-gradient-to-r ${statusColors[hinge.status]} text-white border-0`}>
                    {hinge.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                {/* Hardware Status Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Sensor Status */}
                  <div className="flex items-center gap-2 p-2 bg-black/40 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${sensor?.is_online ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
                    <Shield className="w-4 h-4 text-red-300" />
                    <span className="text-xs text-red-200">
                      {sensor ? (sensor.is_online ? 'Online' : 'Offline') : 'No Sensor'}
                    </span>
                  </div>

                  {/* Camera Status */}
                  <div className="flex items-center gap-2 p-2 bg-black/40 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${camera?.is_recording ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                    <Camera className="w-4 h-4 text-red-300" />
                    <span className="text-xs text-red-200">
                      {camera ? (camera.is_recording ? 'Recording' : 'Standby') : 'No Camera'}
                    </span>
                  </div>
                </div>

                {/* Sensor Details */}
                {sensor && (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-red-200/80">
                      <span>Battery</span>
                      <div className="flex items-center gap-1">
                        <Battery className="w-3 h-3" />
                        <span>{sensor.battery_level}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-red-200/80">
                      <span>Signal</span>
                      <div className="flex items-center gap-1">
                        {sensor.signal_strength > -50 ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                        <span>{sensor.signal_strength} dBm</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-red-200/80">
                      <span>Triggers</span>
                      <span>{sensor.trigger_count}</span>
                    </div>
                  </div>
                )}

                {!sensor && !camera && (
                  <div className="text-center py-4 text-red-400/50">
                    <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-xs">No security hardware</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}