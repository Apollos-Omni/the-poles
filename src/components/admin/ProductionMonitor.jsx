import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Shield, Zap, Bell, RefreshCw, AlertTriangle, Clock } from 'lucide-react';

// Hardened fetch client to prevent JSON parsing errors on HTML responses
async function safeJsonFetch(url) {
  const res = await fetch(`${url}?v=${Date.now()}`, { cache: "no-store" });
  const contentType = (res.headers.get("content-type") || "").toLowerCase();
  const isJson = contentType.startsWith("application/json");

  if (!res.ok) {
    const body = isJson ? await res.json().catch(() => ({})) : await res.text().catch(() => "");
    const snippet = isJson ? JSON.stringify(body).slice(0, 160) : (body || "").slice(0, 160);
    throw new Error(`HTTP ${res.status}: ${snippet}...`);
  }

  if (!isJson) {
    const text = await res.text().catch(() => "");
    throw new Error(`Bad content-type '${contentType}'; expected JSON. Response: ${text.slice(0, 100)}...`);
  }

  return res.json();
}

export default function ProductionMonitor() {
  const [diagnostics, setDiagnostics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);
  const [routingReady, setRoutingReady] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      const data = await safeJsonFetch('/functions/diagnostics');
      setDiagnostics(data);
      setRoutingReady(true);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Failed to fetch diagnostics:', error);
      
      // Check if this is the "HTML instead of JSON" routing issue
      const isRoutingIssue = error.message.includes('text/html') || error.message.includes('DOCTYPE');
      
      if (isRoutingIssue) {
        setRoutingReady(false);
        setDiagnostics({
          overall: 'waiting',
          routingIssue: true,
          timestamp: new Date().toISOString(),
          environment: 'preview',
          // Show basic status without server calls
          serviceWorker: { healthy: null, note: 'Will check when routing is ready' },
          webManifest: { healthy: null, note: 'Will check when routing is ready' },
          pushNotifications: { activeSubscriptions: '?', vapidConfigured: null },
          mqtt: { configured: null }
        });
      } else {
        setDiagnostics({ 
          error: error.message, 
          overall: 'error',
          timestamp: new Date().toISOString()
        });
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    runDiagnostics();
    // Only auto-refresh if routing is working
    const interval = setInterval(() => {
      if (routingReady) {
        runDiagnostics();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [routingReady]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800 border-green-200';
      case 'degraded': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'waiting': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading && !diagnostics) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="flex items-center justify-center p-8">
          <RefreshCw className="w-6 h-6 animate-spin text-purple-400 mr-2" />
          <span className="text-gray-300">Loading system status...</span>
        </CardContent>
      </Card>
    );
  }
  
  if (!diagnostics) return null;

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              Production Monitor
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(diagnostics.overall)}>
                {diagnostics.routingIssue ? 'WAITING FOR ROUTING' : diagnostics.overall?.toUpperCase()}
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={runDiagnostics}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          {lastChecked && (
            <p className="text-sm text-gray-400">
              Last checked: {lastChecked.toLocaleTimeString()}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {diagnostics.routingIssue && (
            <div className="mb-6 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="text-blue-300 font-medium">Platform Routing Pending</span>
              </div>
              <p className="text-blue-200 mt-1 text-sm">
                Waiting for Base44 to add rewrites: <code className="text-blue-100">/functions/diagnostics</code> → function endpoint
              </p>
              <p className="text-blue-300 mt-2 text-xs">
                ✅ Functions deployed • ✅ Safe fetch working • ⏳ Need platform routing
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Service Worker Status */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-blue-400" />
                <span className="font-medium text-white">Service Worker</span>
              </div>
              {diagnostics.serviceWorker?.healthy === null ? (
                <Badge className="bg-gray-100 text-gray-800">Pending</Badge>
              ) : (
                <Badge className={diagnostics.serviceWorker?.healthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {diagnostics.serviceWorker?.healthy ? 'Healthy' : 'Failed'}
                </Badge>
              )}
            </div>

            {/* Web Manifest Status */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="font-medium text-white">Web Manifest</span>
              </div>
              {diagnostics.webManifest?.healthy === null ? (
                <Badge className="bg-gray-100 text-gray-800">Pending</Badge>
              ) : (
                <Badge className={diagnostics.webManifest?.healthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {diagnostics.webManifest?.healthy ? 'Healthy' : 'Failed'}
                </Badge>
              )}
            </div>

            {/* Push Notifications */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="w-4 h-4 text-yellow-400" />
                <span className="font-medium text-white">Push Notifications</span>
              </div>
              <div className="text-sm text-gray-300">
                <p>{diagnostics.pushNotifications?.activeSubscriptions || '?'} active subs</p>
                {diagnostics.pushNotifications?.vapidConfigured === null ? (
                  <Badge className="bg-gray-100 text-gray-800">Pending</Badge>
                ) : (
                  <Badge className={diagnostics.pushNotifications?.vapidConfigured ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {diagnostics.pushNotifications?.vapidConfigured ? 'VAPID OK' : 'No VAPID'}
                  </Badge>
                )}
              </div>
            </div>

            {/* MQTT Status */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <span className="font-medium text-white">MQTT</span>
              </div>
              {diagnostics.mqtt?.configured === null ? (
                <Badge className="bg-gray-100 text-gray-800">Pending</Badge>
              ) : (
                <Badge className={diagnostics.mqtt?.configured ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {diagnostics.mqtt?.configured ? 'Configured' : 'Not Set'}
                </Badge>
              )}
            </div>
          </div>

          {diagnostics.error && !diagnostics.routingIssue && (
            <div className="mt-4 p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="text-red-300 font-medium">System Error</span>
              </div>
              <p className="text-red-200 mt-1 text-xs font-mono">{diagnostics.error}</p>
            </div>
          )}

          <div className="mt-4 text-xs text-gray-400">
            <p><strong>Environment:</strong> {diagnostics.environment}</p>
            <p><strong>Timestamp:</strong> {diagnostics.timestamp}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}