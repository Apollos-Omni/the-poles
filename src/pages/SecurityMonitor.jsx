import React, { useState, useEffect, useCallback } from 'react';
import { User } from '@/entities/User';
import { Hinge } from '@/entities/Hinge';
import { HingeSensor } from '@/entities/HingeSensor';
import { HingeCamera } from '@/entities/HingeCamera';
import { SecurityEvent } from '@/entities/SecurityEvent';
import { CommandTicket } from '@/entities/CommandTicket';
import { AuditLog } from '@/entities/AuditLog';
import { Shield, Camera, Wifi, WifiOff, Battery, AlertTriangle, Eye, Activity } from 'lucide-react';

import SecurityGrid from '../components/security/SecurityGrid';
import LiveFeedPanel from '../components/security/LiveFeedPanel';
import AlertsPanel from '../components/security/AlertsPanel';
import SensorStatus from '../components/security/SensorStatus';

export default function SecurityMonitor() {
  const [user, setUser] = useState(null);
  const [hinges, setHinges] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [events, setEvents] = useState([]);
  const [commandTickets, setCommandTickets] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedHinge, setSelectedHinge] = useState(null);

  const createSampleSecurityHardware = useCallback(async (hingesData) => {
    try {
      // Create sample sensors for each hinge
      const sampleSensors = hingesData.slice(0, 3).map(hinge => ({
        hinge_id: hinge.id,
        sensor_type: 'zigbee',
        sensor_model: 'Aqara Door Sensor',
        battery_level: Math.floor(Math.random() * 40) + 60,
        signal_strength: -45,
        trigger_count: Math.floor(Math.random() * 100),
        is_online: Math.random() > 0.1,
        last_triggered: new Date(Date.now() - Math.random() * 86400000).toISOString()
      }));

      await HingeSensor.bulkCreate(sampleSensors);

      // Create sample cameras
      const sampleCameras = hingesData.slice(0, 2).map(hinge => ({
        hinge_id: hinge.id,
        camera_model: 'reolink_e1_pro',
        stream_url: 'rtsp://example.stream.url',
        recording_enabled: true,
        motion_detection: true,
        night_vision: true,
        resolution: '1080p',
        is_recording: Math.random() > 0.7,
        storage_location: 'both',
        last_recording: new Date(Date.now() - Math.random() * 3600000).toISOString()
      }));

      await HingeCamera.bulkCreate(sampleCameras);

      // Create sample security events
      const sampleEvents = [
        {
          hinge_id: hingesData[0]?.id,
          event_type: 'door_opened',
          severity: 'info',
          triggered_by: 'sensor',
          notification_sent: true,
          response_time: 245
        },
        {
          hinge_id: hingesData[1]?.id,
          event_type: 'motion_detected',
          severity: 'warning',
          triggered_by: 'camera',
          notification_sent: true,
          response_time: 156
        }
      ];

      await SecurityEvent.bulkCreate(sampleEvents);

      // Create sample audit logs
      const sampleAuditLogs = [
        {
          actor: `user:${hingesData[0]?.owner_id}`,
          action: 'DOOR_UNLOCK_REQUESTED',
          object: `hinge:${hingesData[0]?.id}`,
          details: { method: 'mobile_app', mfa_used: true },
          hash: 'sample_hash_123',
          severity: 'info',
          ip_address: '192.168.1.100'
        }
      ];

      await AuditLog.bulkCreate(sampleAuditLogs);
    } catch (error) {
      console.error('Error creating sample security hardware:', error);
    }
  }, []);

  const loadSecurityData = useCallback(async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);

      const [hingesData, sensorsData, camerasData, eventsData, ticketsData, auditData] = await Promise.all([
        Hinge.filter({ owner_id: userData.id }, '-updated_date'),
        HingeSensor.list('-last_triggered'),
        HingeCamera.list('-last_recording'),
        SecurityEvent.list('-created_date', 20),
        CommandTicket.filter({ user_id: userData.id }, '-created_date', 10),
        AuditLog.list('-created_date', 50)
      ]);

      setHinges(hingesData);
      setSensors(sensorsData);
      setCameras(camerasData);
      setEvents(eventsData);
      setCommandTickets(ticketsData);
      setAuditLogs(auditData);

      // Create sample sensors/cameras if none exist
      if (sensorsData.length === 0 && hingesData.length > 0) {
        await createSampleSecurityHardware(hingesData);
      }
    } catch (error) {
      console.error('Error loading security data:', error);
    }
    setIsLoading(false);
  }, [createSampleSecurityHardware]);

  const loadRecentEvents = useCallback(async () => {
    try {
      const recentEvents = await SecurityEvent.list('-created_date', 10);
      setEvents(recentEvents);
    } catch (error) {
      console.error('Error loading recent events:', error);
    }
  }, []);

  useEffect(() => {
    loadSecurityData();
    
    // Set up real-time event listening (would integrate with actual IoT webhooks)
    const eventInterval = setInterval(() => {
      loadRecentEvents();
    }, 5000);

    return () => clearInterval(eventInterval);
  }, [loadSecurityData, loadRecentEvents]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-black/40 backdrop-blur-md rounded-2xl p-6 animate-pulse border border-red-700/30">
                <div className="h-32 bg-red-900/20 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-300 via-white to-red-300 bg-clip-text text-transparent">
                Divine Guardian
              </h1>
              <p className="text-red-200/80">HeavenOS Security Command Center</p>
            </div>
          </div>
          
          {/* Live Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-600/20 rounded-full border border-green-500/30">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-300 text-sm font-medium">LIVE MONITORING</span>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Security Grid - Main View */}
          <div className="lg:col-span-8 space-y-8">
            <SecurityGrid 
              hinges={hinges}
              sensors={sensors}
              cameras={cameras}
              onSelectHinge={setSelectedHinge}
            />
            
            {selectedHinge && (
              <LiveFeedPanel 
                hinge={selectedHinge}
                camera={cameras.find(c => c.hinge_id === selectedHinge.id)}
              />
            )}
          </div>

          {/* Right Panel - Status & Alerts */}
          <div className="lg:col-span-4 space-y-8">
            <SensorStatus sensors={sensors} />
            <AlertsPanel events={events} hinges={hinges} />
          </div>
        </div>
      </div>
    </div>
  );
}