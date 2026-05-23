import React, { useState, useEffect, useCallback } from "react";
import { HingeDevice } from "@/entities/HingeDevice";
import { HingeState } from "@/entities/HingeState";
import { HingeEvent } from "@/entities/HingeEvent";
import { HingeCommand } from "@/entities/HingeCommand";
import { DeviceEnrollment } from "@/entities/DeviceEnrollment";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Activity, 
  Command, 
  Users, 
  Settings,
  Database,
  TrendingUp,
  Clock,
  Wifi
} from "lucide-react";

import DeviceEnrollmentPanel from "../components/hinge-control/DeviceEnrollmentPanel";
import MqttStatusIndicator from "../components/hinge-control/MqttStatusIndicator";

export default function HingeAdmin() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalDevices: 0,
    onlineDevices: 0,
    totalCommands: 0,
    totalEvents: 0,
    pendingEnrollments: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mqttStatus, setMqttStatus] = useState('disconnected');

  const loadAdminData = useCallback(async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);

      // Load statistics
      const [devices, events, commands, enrollments] = await Promise.all([
        HingeDevice.list(),
        HingeEvent.list('-created_date', 50),
        HingeCommand.list('-created_date', 50),
        DeviceEnrollment.list('-created_date', 20)
      ]);

      const onlineCount = devices.filter(d => d.is_online).length;
      const pendingCount = enrollments.filter(e => e.status === 'pending').length;

      setStats({
        totalDevices: devices.length,
        onlineDevices: onlineCount,
        totalCommands: commands.length,
        totalEvents: events.length,
        pendingEnrollments: pendingCount
      });

      // Combine recent activity from events and commands
      const combinedActivity = [
        ...events.slice(0, 10).map(e => ({
          ...e,
          type: 'event',
          timestamp: e.timestamp || e.created_date
        })),
        ...commands.slice(0, 10).map(c => ({
          ...c,
          type: 'command',
          timestamp: c.issued_at || c.created_date
        }))
      ]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 20);

      setRecentActivity(combinedActivity);

    } catch (error) {
      console.error('Error loading admin data:', error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadAdminData();
    
    // Simulate MQTT status updates
    const statusInterval = setInterval(() => {
      setMqttStatus(current => {
        const statuses = ['connected', 'connecting', 'disconnected'];
        const weights = [0.7, 0.1, 0.2]; // Mostly connected
        const random = Math.random();
        let sum = 0;
        
        for (let i = 0; i < statuses.length; i++) {
          sum += weights[i];
          if (random <= sum) return statuses[i];
        }
        return 'connected';
      });
    }, 5000);

    return () => clearInterval(statusInterval);
  }, [loadAdminData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-blue-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-black/40 backdrop-blur-md rounded-2xl p-6 animate-pulse border border-blue-700/30">
                <div className="h-32 bg-blue-900/20 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-blue-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 via-white to-purple-300 bg-clip-text text-transparent">
                Divine Hinge Admin
              </h1>
              <p className="text-purple-200/80">System administration and monitoring</p>
            </div>
          </div>
          
          <Button onClick={loadAdminData} className="bg-gradient-to-r from-purple-600 to-purple-700">
            Refresh Data
          </Button>
        </div>

        {/* MQTT Status */}
        <div className="mb-8">
          <MqttStatusIndicator 
            connectionStatus={mqttStatus}
            lastMessageTime={new Date().toISOString()}
            messageCount={stats.totalEvents}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-600/20 to-black/40 backdrop-blur-sm border border-blue-700/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalDevices}</p>
                  <p className="text-blue-300 text-sm">Total Devices</p>
                </div>
                <Database className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-600/20 to-black/40 backdrop-blur-sm border border-green-700/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">{stats.onlineDevices}</p>
                  <p className="text-green-300 text-sm">Online Now</p>
                </div>
                <Wifi className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600/20 to-black/40 backdrop-blur-sm border border-purple-700/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalCommands}</p>
                  <p className="text-purple-300 text-sm">Commands</p>
                </div>
                <Command className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-600/20 to-black/40 backdrop-blur-sm border border-orange-700/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalEvents}</p>
                  <p className="text-orange-300 text-sm">Events</p>
                </div>
                <Activity className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-600/20 to-black/40 backdrop-blur-sm border border-yellow-700/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">{stats.pendingEnrollments}</p>
                  <p className="text-yellow-300 text-sm">Pending</p>
                </div>
                <Users className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="enrollment" className="space-y-6">
          <TabsList className="bg-black/40 border border-blue-700/30">
            <TabsTrigger value="enrollment">Device Enrollment</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="monitoring">System Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="enrollment">
            <DeviceEnrollmentPanel 
              user={user}
              onEnrollmentGenerated={loadAdminData}
            />
          </TabsContent>

          <TabsContent value="activity">
            <Card className="bg-gradient-to-br from-blue-900/40 to-black/40 backdrop-blur-sm border border-blue-700/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-100">
                  <TrendingUp className="w-5 h-5" />
                  Recent System Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recentActivity.map((item, index) => (
                    <div key={`${item.type}-${item.id || index}`} className="flex items-center gap-3 p-3 bg-black/20 rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${
                        item.type === 'command' ? 'bg-purple-400' : 'bg-blue-400'
                      }`}></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${
                            item.type === 'command' 
                              ? 'bg-purple-600/20 text-purple-300' 
                              : 'bg-blue-600/20 text-blue-300'
                          }`}>
                            {item.type}
                          </Badge>
                          <span className="text-blue-200 text-sm">
                            {item.type === 'command' 
                              ? `${item.command_type} command` 
                              : `${item.event_type} event`
                            }
                          </span>
                        </div>
                        <p className="text-blue-300/60 text-xs">
                          Device: {item.device_id}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-blue-300/60 text-xs">
                        <Clock className="w-3 h-3" />
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring">
            <div className="grid gap-6">
              <Card className="bg-gradient-to-br from-blue-900/40 to-black/40 backdrop-blur-sm border border-blue-700/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-100">
                    <Settings className="w-5 h-5" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                      <span className="text-blue-200">MQTT Broker</span>
                      <Badge className="bg-green-600/20 text-green-300">Healthy</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                      <span className="text-blue-200">Database</span>
                      <Badge className="bg-green-600/20 text-green-300">Healthy</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                      <span className="text-blue-200">Webhook Endpoint</span>
                      <Badge className="bg-green-600/20 text-green-300">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                      <span className="text-blue-200">Command API</span>
                      <Badge className="bg-green-600/20 text-green-300">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}