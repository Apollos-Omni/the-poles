
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, RefreshCw, Smartphone } from 'lucide-react';
import SecuritySettingsComponent from '@/components/profile/SecuritySettings'; // Changed import
import { tryRegisterNow } from '@/components/pwa/ServiceWorkerManager';

export default function SettingsSecurity() {
  const [pwaStatus, setPwaStatus] = useState('');

  const handleManualPwaRegister = async () => {
    setPwaStatus('Checking...');
    const result = await tryRegisterNow();
    if (result.ok) {
      setPwaStatus('Service Worker registered successfully!');
    } else {
      // Fix: Changed 'setPwaPwaStatus' to 'setPwaStatus'
      setPwaStatus(`Registration failed: ${result.reason}`);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Secure your account with two-factor authentication.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SecuritySettingsComponent />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Progressive Web App (PWA)</CardTitle>
          <CardDescription>
            Manage PWA features like push notifications and offline access.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button onClick={handleManualPwaRegister}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Force PWA Re-registration
            </Button>
            {pwaStatus && <p className="text-sm text-gray-400">{pwaStatus}</p>}
          </div>
          <p className="text-xs text-gray-500">
            If you're having trouble with notifications, you can use this button to manually re-register the app's service worker. This is useful for diagnostics or after platform updates.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
