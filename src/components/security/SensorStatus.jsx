import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Battery, Wifi, WifiOff, AlertTriangle } from 'lucide-react';

export default function SensorStatus({ sensors }) {
  const onlineSensors = sensors.filter(s => s.is_online).length;
  const lowBatterySensors = sensors.filter(s => s.battery_level < 20).length;

  return (
    <Card className="bg-gradient-to-br from-black/60 to-gray-900/60 backdrop-blur-md border border-red-700/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-100">
          <Shield className="w-5 h-5" />
          Sensor Network
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* Network Overview */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-3 bg-black/40 rounded-lg">
            <div className="text-2xl font-bold text-green-400">{onlineSensors}</div>
            <div className="text-xs text-red-300">Online</div>
          </div>
          <div className="text-center p-3 bg-black/40 rounded-lg">
            <div className="text-2xl font-bold text-red-400">{sensors.length - onlineSensors}</div>
            <div className="text-xs text-red-300">Offline</div>
          </div>
        </div>

        {/* Low Battery Warning */}
        {lowBatterySensors > 0 && (
          <div className="mb-4 p-3 bg-yellow-600/20 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-300 text-sm font-medium">
                {lowBatterySensors} sensor{lowBatterySensors > 1 ? 's' : ''} need battery replacement
              </span>
            </div>
          </div>
        )}

        {/* Individual Sensors */}
        <div className="space-y-3">
          {sensors.map((sensor) => (
            <div key={sensor.id} className="p-3 bg-black/40 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${sensor.is_online ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
                  <span className="text-red-200 text-sm font-medium">{sensor.sensor_model}</span>
                </div>
                <Badge className={`text-xs ${sensor.is_online ? 'bg-green-600/20 text-green-300 border-green-500/30' : 'bg-red-600/20 text-red-300 border-red-500/30'}`}>
                  {sensor.is_online ? 'Online' : 'Offline'}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-1 text-red-200/80">
                  <Battery className={`w-3 h-3 ${sensor.battery_level < 20 ? 'text-red-400' : 'text-green-400'}`} />
                  <span>{sensor.battery_level}%</span>
                </div>
                <div className="flex items-center gap-1 text-red-200/80">
                  {sensor.signal_strength > -50 ? <Wifi className="w-3 h-3 text-green-400" /> : <WifiOff className="w-3 h-3 text-red-400" />}
                  <span>{sensor.signal_strength}dBm</span>
                </div>
                <div className="text-red-200/80">
                  {sensor.trigger_count} triggers
                </div>
              </div>

              {sensor.last_triggered && (
                <div className="mt-2 text-xs text-red-300/70">
                  Last: {new Date(sensor.last_triggered).toLocaleDateString()} {new Date(sensor.last_triggered).toLocaleTimeString()}
                </div>
              )}
            </div>
          ))}
        </div>

        {sensors.length === 0 && (
          <div className="text-center py-8 text-red-400/50">
            <Shield className="w-12 h-12 mx-auto mb-3" />
            <p className="text-sm">No sensors configured</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}