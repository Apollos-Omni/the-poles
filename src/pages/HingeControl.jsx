import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Lock, 
  Plus,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";

import HingeControlCard from "@/components/hinge-control/HingeControlCard";
import DeviceStatusPanel from "@/components/hinge-control/DeviceStatusPanel";
import EventLogPanel from "@/components/hinge-control/EventLogPanel";
import MediaGallery from "@/components/hinge-control/MediaGallery";
import AddDeviceDialog from "@/components/hinge-control/AddDeviceDialog";
import DeploymentGuide from "@/components/hinge-control/DeploymentGuide";
import HingeControlEmbed from "@/components/dashboard/HingeControlEmbed";

export default function HingeControl() {
  const [devices, setDevices] = useState([]);
  const [deviceStates, setDeviceStates] = useState({});
  const [recentEvents, setRecentEvents] = useState([]);
  const [mediaAssets, setMediaAssets] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [error, setError] = useState(null);
  const [expandedDevices, setExpandedDevices] = useState({});

  const loadHingeData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      
      const [devicesData, eventsData, mediaData] = await Promise.all([
        base44.entities.HingeDevice.filter({ owner_id: userData.id }),
        base44.entities.HingeEvent.list('-timestamp', 20),
        base44.entities.MediaAsset.list('-captured_at', 10)
      ]);

      setDevices(devicesData);
      setRecentEvents(eventsData);
      setMediaAssets(mediaData);
      
      const states = {};
      for (const device of devicesData) {
        const stateData = await base44.entities.HingeState.filter({ device_id: device.device_id });
        if (stateData.length > 0) {
          states[device.id] = stateData[0];
        }
      }
      setDeviceStates(states);

      // Auto-select first device if none selected
      if (!selectedDevice && devicesData.length > 0) {
        setSelectedDevice(devicesData[0]);
        // Auto-expand first device
        setExpandedDevices({ [devicesData[0].id]: true });
      }

    } catch (err) {
      console.error('Error loading hinge data:', err);
      setError('Could not load device data. Please check your connection.');
      setDevices([]);
      setDeviceStates({});
      setRecentEvents([]);
      setMediaAssets([]);
    }
    setIsLoading(false);
  }, [selectedDevice]);

  useEffect(() => {
    loadHingeData();
  }, []);

  const sendCommand = async (deviceId, commandType, args = {}) => {
    try {
      const response = await base44.functions.invoke('publishHingeCommand', {
        deviceId,
        commandType, 
        args
      });
      
      if (response.data.success) {
        console.log(`Command ${commandType} sent successfully:`, response.data.requestId);
        
        setTimeout(() => {
          loadHingeData();
        }, 1500);
        
        return response.data;
      } else {
        throw new Error(response.data.error || 'Command failed');
      }
      
    } catch (error) {
      console.error('Error sending command:', error);
      throw error;
    }
  };

  const toggleDevice = (deviceId) => {
    setExpandedDevices(prev => ({
      ...prev,
      [deviceId]: !prev[deviceId]
    }));
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-blue-900 text-white p-3 overflow-hidden">
        <div className="max-w-full mx-auto">
          <div className="space-y-2">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-black/40 backdrop-blur-md rounded-lg p-3 animate-pulse border border-blue-700/30">
                <div className="h-16 bg-blue-900/20 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-blue-900 text-white flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-2 pb-20 md:pb-2">
        <div className="max-w-full mx-auto">
          {/* Error Banner */}
          {error && (
            <div className="bg-red-900/20 border border-red-700/30 p-2 rounded-lg mb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-3 h-3 text-red-400" />
                  <p className="text-red-300 text-xs font-medium">{error}</p>
                </div>
                <Button 
                  onClick={loadHingeData}
                  variant="outline"
                  size="sm"
                  className="text-red-300 border-red-500/50 hover:bg-red-900/30 text-xs h-6 px-2"
                >
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* Compact Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                <Lock className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white">Gateway Control</h1>
                <p className="text-[10px] text-blue-200/80">{devices.length} device{devices.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            
            <Button
              onClick={() => setShowAddDevice(true)}
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-xs h-7 px-2"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          </div>

          {/* Main Content */}
          {devices.length > 0 ? (
            <div className="space-y-2">
              {devices.map((device) => (
                <HingeControlCard
                  key={device.id}
                  device={device}
                  state={deviceStates[device.id]}
                  onSendCommand={sendCommand}
                  onSelect={setSelectedDevice}
                  isSelected={selectedDevice?.id === device.id}
                  isExpanded={expandedDevices[device.id]}
                  onToggle={() => toggleDevice(device.id)}
                />
              ))}
            </div>
          ) : (
            <>
              <Card className="bg-gradient-to-br from-blue-900/40 to-black/40 backdrop-blur-sm border border-blue-700/30 text-center p-4">
                <Lock className="w-8 h-8 mx-auto mb-2 text-blue-400/50" />
                <h3 className="text-sm font-semibold mb-1 text-blue-200">No Devices Connected</h3>
                <p className="text-xs text-blue-300/70 mb-3">Add your first Divine Hinge device.</p>
                <Button 
                  onClick={() => setShowAddDevice(true)}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-xs"
                >
                  Add Your First Device
                </Button>
              </Card>
              <DeploymentGuide />
            </>
          )}

          {/* Live MQTT Control Panel — always shown for direct Raspberry Pi communication */}
          <div className="mt-3 border-t border-blue-700/20 pt-3">
            <p className="text-xs text-blue-400/60 mb-2 font-medium uppercase tracking-wider">Live Hardware Control (MQTT)</p>
            <HingeControlEmbed />
          </div>

          {/* Add Device Dialog */}
          {showAddDevice && (
            <AddDeviceDialog
              user={user}
              onClose={() => setShowAddDevice(false)}
              onDeviceAdded={loadHingeData}
            />
          )}
        </div>
      </div>
    </div>
  );
}