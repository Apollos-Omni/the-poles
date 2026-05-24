
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, RefreshCw, Smartphone } from 'lucide-react';
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
    <div className="min-h-screen space-y-6 bg-transparent p-4 text-white md:p-8">
      <Card className="border-cyan-300/20 bg-white/[0.06] text-white backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-cyan-200" /> Security Settings</CardTitle>
          <CardDescription>
            MFA is prepared for future high-risk actions, but it is not required on first login yet.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-purple-100/70">
          <p>Future enforcement targets: admin, payment, fulfillment, shipping address, and prize-related actions.</p>
          <p>TODO: enroll TOTP with <code className="rounded bg-black/40 px-1 text-cyan-100">supabase.auth.mfa.enroll</code>, verify setup with <code className="rounded bg-black/40 px-1 text-cyan-100">supabase.auth.mfa.challengeAndVerify</code>, then gate sensitive routes by AAL level.</p>
        </CardContent>
      </Card>
      
      <Card className="border-purple-300/20 bg-white/[0.06] text-white backdrop-blur-xl">
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
