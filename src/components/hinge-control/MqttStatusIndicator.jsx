import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function MqttStatusIndicator({ devices = [] }) {
  const [brokerStatus, setBrokerStatus] = useState('connecting');
  const [connectedDevices, setConnectedDevices] = useState(0);

  useEffect(() => {
    // Simulate broker connection status based on device states
    const onlineDevices = devices.filter(device => device.is_online);
    setConnectedDevices(onlineDevices.length);
    
    if (devices.length === 0) {
      setBrokerStatus('no_devices');
    } else if (onlineDevices.length === devices.length) {
      setBrokerStatus('connected');
    } else if (onlineDevices.length > 0) {
      setBrokerStatus('partial');
    } else {
      setBrokerStatus('disconnected');
    }
  }, [devices]);

  const getStatusConfig = () => {
    switch (brokerStatus) {
      case 'connected':
        return {
          icon: Wifi,
          color: 'bg-green-100 text-green-800',
          label: 'MQTT Connected',
          description: `All ${devices.length} devices online`
        };
      case 'partial':
        return {
          icon: AlertCircle,
          color: 'bg-yellow-100 text-yellow-800',
          label: 'Partial Connection',
          description: `${connectedDevices}/${devices.length} devices online`
        };
      case 'disconnected':
        return {
          icon: WifiOff,
          color: 'bg-red-100 text-red-800',
          label: 'MQTT Disconnected',
          description: 'No devices responding'
        };
      case 'no_devices':
        return {
          icon: CheckCircle,
          color: 'bg-gray-100 text-gray-800',
          label: 'No Devices',
          description: 'Ready for device enrollment'
        };
      default:
        return {
          icon: AlertCircle,
          color: 'bg-blue-100 text-blue-800',
          label: 'Connecting',
          description: 'Establishing MQTT connection...'
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  return (
    <div className="bg-black/30 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <Badge className={`${config.color} flex items-center gap-1`}>
          <StatusIcon className="w-3 h-3" />
          {config.label}
        </Badge>
        <span className="text-xs text-blue-300/60">
          HiveMQ Cloud
        </span>
      </div>
      <p className="text-xs text-blue-300/80">
        {config.description}
      </p>
    </div>
  );
}