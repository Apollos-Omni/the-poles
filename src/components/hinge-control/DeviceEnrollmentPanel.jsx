import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Wifi, 
  Shield, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";

export default function DeviceEnrollmentPanel({ user, onDeviceEnrolled }) {
  const [enrollmentCodes, setEnrollmentCodes] = useState([]);
  const [newDeviceId, setNewDeviceId] = useState('');
  const [newDeviceName, setNewDeviceName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadEnrollmentCodes = useCallback(async () => {
    try {
      // In demo mode, create sample enrollment codes
      const sampleCodes = [
        {
          id: 'enroll-1',
          enrollment_code: 'DH-ENROLL-ABC123',
          device_id: 'DH-DEMO-001',
          expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
          status: 'pending',
          created_date: new Date().toISOString()
        }
      ];
      setEnrollmentCodes(sampleCodes);
    } catch (error) {
      console.error('Error loading enrollment codes:', error);
      setEnrollmentCodes([]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadEnrollmentCodes();
  }, [loadEnrollmentCodes]);

  const generateEnrollmentCode = async () => {
    if (!newDeviceId.trim() || !newDeviceName.trim()) {
      alert('Please provide both device ID and name');
      return;
    }

    setIsGenerating(true);
    try {
      // Generate a random enrollment code
      const enrollmentCode = `DH-ENROLL-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      
      const newCode = {
        id: Math.random().toString(36).substring(2),
        enrollment_code: enrollmentCode,
        device_id: newDeviceId,
        device_name: newDeviceName,
        expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour
        status: 'pending',
        created_date: new Date().toISOString()
      };

      setEnrollmentCodes(prev => [newCode, ...prev]);
      setNewDeviceId('');
      setNewDeviceName('');
      
      // In production, this would call the backend API
      console.log('Generated enrollment code:', enrollmentCode);
      
    } catch (error) {
      console.error('Error generating enrollment code:', error);
      alert('Failed to generate enrollment code');
    }
    setIsGenerating(false);
  };

  const revokeCode = async (codeId) => {
    setEnrollmentCodes(prev => 
      prev.map(code => 
        code.id === codeId 
          ? { ...code, status: 'revoked' }
          : code
      )
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'used': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'expired': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'revoked': return <AlertCircle className="w-4 h-4 text-gray-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'used': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'expired': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'revoked': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-blue-900/20 rounded mb-4"></div>
        <div className="space-y-3">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-16 bg-blue-900/20 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Generate New Code */}
      <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-6">
        <h3 className="text-blue-100 font-semibold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Generate Enrollment Code
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="text-blue-200">Device ID</Label>
            <Input
              value={newDeviceId}
              onChange={(e) => setNewDeviceId(e.target.value)}
              placeholder="DH-001-ABC123"
              className="bg-blue-900/30 border-blue-700/50 text-white"
            />
          </div>
          <div>
            <Label className="text-blue-200">Device Name</Label>
            <Input
              value={newDeviceName}
              onChange={(e) => setNewDeviceName(e.target.value)}
              placeholder="Front Door Hinge"
              className="bg-blue-900/30 border-blue-700/50 text-white"
            />
          </div>
        </div>
        
        <Button 
          onClick={generateEnrollmentCode}
          disabled={isGenerating || !newDeviceId.trim() || !newDeviceName.trim()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isGenerating ? 'Generating...' : 'Generate Code'}
        </Button>
      </div>

      {/* Active Codes */}
      <div>
        <h3 className="text-blue-100 font-semibold mb-4">Enrollment Codes</h3>
        
        {enrollmentCodes.length === 0 ? (
          <div className="text-center py-8 text-blue-300/60">
            <Shield className="w-12 h-12 mx-auto mb-3 text-blue-400/30" />
            <p>No enrollment codes generated yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {enrollmentCodes.map((code) => (
              <Card key={code.id} className="bg-blue-900/20 border border-blue-700/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(code.status)}
                        <span className="font-mono text-blue-100 text-lg">
                          {code.enrollment_code}
                        </span>
                        <Badge className={getStatusColor(code.status)}>
                          {code.status}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-blue-300/80 space-y-1">
                        <div>Device: {code.device_id}</div>
                        {code.device_name && <div>Name: {code.device_name}</div>}
                        <div>
                          Expires: {new Date(code.expires_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    {code.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => revokeCode(code.id)}
                        className="border-red-500/30 text-red-300 hover:bg-red-500/10"
                      >
                        Revoke
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-6">
        <h4 className="text-green-200 font-medium mb-2">📱 Device Setup Instructions</h4>
        <div className="text-green-300 text-sm space-y-2">
          <p><strong>1.</strong> Flash your Raspberry Pi with the Divine Hinge edge agent</p>
          <p><strong>2.</strong> Connect the Pi to WiFi during first boot</p>
          <p><strong>3.</strong> The device will prompt for an enrollment code</p>
          <p><strong>4.</strong> Enter the generated code above</p>
          <p><strong>5.</strong> Device will auto-configure and appear in your dashboard</p>
        </div>
      </div>
    </div>
  );
}