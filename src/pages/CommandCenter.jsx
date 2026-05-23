import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { makeHttpTicketIssuer } from "../components/hinge-sdk/adapters/httpTicketIssuer";
import { makeMockCommandSender, makeMockTelemetryStream } from "../components/hinge-sdk/adapters/mockAdapters";
import { makeCatalogApi, makeRaffleApi } from "../components/hinge-sdk/adapters/httpApis";
import { CONFIG } from "../components/hinge-sdk/config";
import { DoorsTable } from "../components/command-center/DoorsTable";
import { RaffleBoard } from "../components/command-center/RaffleBoard";
import { Command, Shield, Zap } from "lucide-react";

export default function CommandCenter() {
  const [user, setUser] = useState(null);
  const [supabaseToken, setSupabaseToken] = useState("mock-token");
  
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };
    loadUser();
  }, []);

  // Initialize SDK adapters
  const issuer = makeHttpTicketIssuer(CONFIG.baseUrl);
  const sender = makeMockCommandSender(); // Replace with real MQTT when ready
  const stream = makeMockTelemetryStream(); // Replace with real MQTT when ready
  const catalog = makeCatalogApi(CONFIG.baseUrl);
  const raffle = makeRaffleApi(CONFIG.baseUrl);

  // Mock geolocation for web (replace with real GPS in React Native)
  const getPhoneLocation = async () => {
    if (!navigator.geolocation) return undefined;
    
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        }),
        () => resolve(undefined),
        { timeout: 5000 }
      );
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-blue-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
              <Command className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-300 via-white to-blue-300 bg-clip-text text-transparent">
                HeavenOS Command Center
              </h1>
              <p className="text-blue-200/80">Real-time IoT device management and control</p>
            </div>
          </div>
          
          {/* Status Indicators */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-600/20 rounded-full border border-green-500/30">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-300 text-sm font-medium">SDK ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Doors Management - Main Panel */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-gradient-to-br from-blue-900/40 to-black/40 backdrop-blur-sm rounded-2xl border border-blue-700/30 p-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-400" />
                Gateway Control Panel
              </h2>
              <DoorsTable 
                api={catalog} 
                stream={stream} 
                sender={sender} 
                issuer={issuer} 
                supabaseToken={supabaseToken} 
                getPhoneLocation={getPhoneLocation}
              />
            </div>
          </div>

          {/* Side Panel - Raffles & Status */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-gradient-to-br from-purple-900/40 to-black/40 backdrop-blur-sm rounded-2xl border border-purple-700/30 p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                Raffle Engine
              </h2>
              <RaffleBoard api={raffle} />
            </div>

            {/* SDK Status */}
            <div className="bg-gradient-to-br from-gray-800/40 to-black/40 backdrop-blur-sm rounded-2xl border border-gray-700/30 p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-200">SDK Status</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Base URL:</span>
                  <span className="text-gray-200">{CONFIG.baseUrl.replace('http://', '').replace('https://', '')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">MQTT:</span>
                  <span className="text-green-400">Mock (Dev Mode)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">User:</span>
                  <span className="text-gray-200">{user?.full_name || 'Loading...'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">GPS:</span>
                  <span className="text-blue-400">Web API</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}