import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Settings, 
  Server, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Copy,
  Eye,
  EyeOff
} from "lucide-react";

export default function ProductionModeToggle({ 
  isProductionMode, 
  onToggle, 
  mqttConfig, 
  onConfigUpdate 
}) {
  const [showSecrets, setShowSecrets] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState(null);

  const handleConfigChange = (field, value) => {
    onConfigUpdate({
      ...mqttConfig,
      [field]: value
    });
  };

  const generateSecret = () => {
    const secret = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    handleConfigChange('webhookSecret', secret);
  };

  const testConnection = async () => {
    setTestingConnection(true);
    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock result - in production this would actually test MQTT connection
      const success = Math.random() > 0.3; // 70% success rate for demo
      setConnectionResult({
        success,
        message: success 
          ? 'Successfully connected to MQTT broker'
          : 'Connection failed: Check credentials and network'
      });
    } catch (error) {
      setConnectionResult({
        success: false,
        message: error.message
      });
    }
    setTestingConnection(false);
  };

  const copyEnvVars = () => {
    const envText = `MQTT_HOST=${mqttConfig.host}
MQTT_PORT=${mqttConfig.port}
MQTT_USERNAME=${mqttConfig.username}
MQTT_PASSWORD=${mqttConfig.password}
WEBHOOK_SECRET=${mqttConfig.webhookSecret}`;
    
    navigator.clipboard.writeText(envText);
    alert('Environment variables copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      {/* Production Mode Toggle */}
      <Card className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-200">
            <Settings className="w-5 h-5" />
            Production Mode Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-medium text-purple-100">Enable Production MQTT</div>
              <div className="text-sm text-purple-300">
                Connect to real MQTT broker for live device communication
              </div>
            </div>
            <Button
              onClick={() => onToggle(!isProductionMode)}
              variant={isProductionMode ? "default" : "outline"}
              className={isProductionMode 
                ? "bg-green-600 hover:bg-green-700" 
                : "border-purple-500/50 text-purple-300"
              }
            >
              {isProductionMode ? 'Enabled' : 'Enable'}
            </Button>
          </div>

          {!isProductionMode && (
            <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-300 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">Demo Mode Active</span>
              </div>
              <p className="text-yellow-300/80 text-sm">
                Currently using simulated devices. Enable production mode to connect real hardware.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MQTT Configuration */}
      {isProductionMode && (
        <Card className="bg-blue-900/20 border border-blue-700/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-200">
              <Server className="w-5 h-5" />
              MQTT Broker Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-blue-200">MQTT Host</Label>
                <Input
                  value={mqttConfig.host}
                  onChange={(e) => handleConfigChange('host', e.target.value)}
                  placeholder="broker.hivemq.cloud"
                  className="bg-blue-900/30 border-blue-700/50 text-white"
                />
              </div>
              <div>
                <Label className="text-blue-200">Port</Label>
                <Input
                  value={mqttConfig.port}
                  onChange={(e) => handleConfigChange('port', e.target.value)}
                  placeholder="8883"
                  className="bg-blue-900/30 border-blue-700/50 text-white"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-blue-200">Username</Label>
                <Input
                  value={mqttConfig.username}
                  onChange={(e) => handleConfigChange('username', e.target.value)}
                  placeholder="your_mqtt_username"
                  className="bg-blue-900/30 border-blue-700/50 text-white"
                />
              </div>
              <div>
                <Label className="text-blue-200">Password</Label>
                <div className="relative">
                  <Input
                    type={showSecrets ? "text" : "password"}
                    value={mqttConfig.password}
                    onChange={(e) => handleConfigChange('password', e.target.value)}
                    placeholder="your_mqtt_password"
                    className="bg-blue-900/30 border-blue-700/50 text-white pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
                    onClick={() => setShowSecrets(!showSecrets)}
                  >
                    {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-blue-200">Webhook Secret</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateSecret}
                  className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                >
                  Generate
                </Button>
              </div>
              <Input
                type={showSecrets ? "text" : "password"}
                value={mqttConfig.webhookSecret}
                onChange={(e) => handleConfigChange('webhookSecret', e.target.value)}
                placeholder="32-character webhook secret"
                className="bg-blue-900/30 border-blue-700/50 text-white"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={testConnection}
                disabled={testingConnection}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {testingConnection ? 'Testing...' : 'Test Connection'}
              </Button>
              <Button
                variant="outline"
                onClick={copyEnvVars}
                className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Env Vars
              </Button>
            </div>

            {connectionResult && (
              <div className={`p-4 rounded-lg border ${
                connectionResult.success 
                  ? 'bg-green-900/20 border-green-700/30' 
                  : 'bg-red-900/20 border-red-700/30'
              }`}>
                <div className="flex items-center gap-2">
                  {connectionResult.success ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  )}
                  <span className={connectionResult.success ? 'text-green-300' : 'text-red-300'}>
                    {connectionResult.message}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Backend Functions Required */}
      {isProductionMode && (
        <Card className="bg-orange-900/20 border border-orange-700/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-200">
              <Shield className="w-5 h-5" />
              Required Backend Functions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-300 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-medium">Action Required</span>
                </div>
                <p className="text-yellow-300/80 text-sm mb-3">
                  Production mode requires these backend functions to be deployed:
                </p>
                <ul className="text-yellow-300/80 text-sm space-y-1">
                  <li>• <code>/api/v1/hinges/:id/commands</code> - MQTT command publisher</li>
                  <li>• <code>/api/v1/hinges/events/webhook</code> - Device event receiver</li>
                  <li>• <code>/api/v1/devices/enroll</code> - Device enrollment</li>
                </ul>
              </div>
              
              <Textarea
                className="h-32 bg-orange-900/30 border-orange-700/50 text-white font-mono text-xs"
                readOnly
                value={`# Environment variables for backend functions:
MQTT_HOST=${mqttConfig.host}
MQTT_PORT=${mqttConfig.port}
MQTT_USERNAME=${mqttConfig.username}
MQTT_PASSWORD=${mqttConfig.password}
WEBHOOK_SECRET=${mqttConfig.webhookSecret}

# Deploy these to your serverless platform (Vercel, Netlify, AWS Lambda)`}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}