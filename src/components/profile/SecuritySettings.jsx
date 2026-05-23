import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Shield, 
  Crown,
  CheckCircle,
  AlertTriangle,
  Fingerprint,
  Smartphone,
  Laptop
} from "lucide-react";

const kycTierLabels = {
  0: { label: 'Unverified', color: 'bg-gray-600/20 text-gray-300', icon: AlertTriangle, description: "Basic actions like browsing are enabled." },
  1: { label: 'Basic Verified', color: 'bg-blue-600/20 text-blue-300', icon: CheckCircle, description: "You can pledge small amounts to visions." },
  2: { label: 'Fully Verified', color: 'bg-green-600/20 text-green-300', icon: Crown, description: "You can receive payouts and have higher limits." }
};

const mockDevices = [
    { id: 1, type: 'Laptop', name: 'MacBook Pro 16"', location: 'San Francisco, CA', last_seen: 'Now', is_current: true },
    { id: 2, type: 'Smartphone', name: 'iPhone 15 Pro', location: 'San Francisco, CA', last_seen: '2 hours ago', is_current: false }
];

export default function SecuritySettings({ user, profile, onClose, onUpdated }) {
  const [twoFactor, setTwoFactor] = useState(profile.twofa_enabled || false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  const kycInfo = kycTierLabels[profile.kyc_tier || 0];

  const handleVerifyIdentity = () => {
    setIsVerifying(true);
    // In a real app, this would open a new window/modal with Stripe Identity
    console.log("Starting Stripe Identity verification flow...");
    setTimeout(() => {
      alert("This would open Stripe's secure identity verification. For now, we'll simulate a submitted state.");
      setIsVerifying(false);
      // In reality, a webhook would update the user's kyc_status
    }, 2000);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-[rgb(var(--grey-1))] border-[rgb(var(--grey-2))] text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Security & Identity
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8 py-4">
          {/* Identity Verification */}
          <Card className="bg-gradient-to-br from-blue-600/10 to-black/40 border-blue-700/30">
            <CardHeader>
              <CardTitle className="text-lg text-blue-100 flex items-center gap-2">
                <Fingerprint className="w-5 h-5" />
                Identity Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                    <p className="text-blue-200 mb-2">
                        Your current verification level is: <Badge className={kycInfo.color}>{kycInfo.label}</Badge>
                    </p>
                    <p className="text-sm text-blue-300/70">{kycInfo.description}</p>
                </div>
                {profile.kyc_tier < 2 && (
                    <Button onClick={handleVerifyIdentity} disabled={isVerifying} className="bg-blue-600 hover:bg-blue-700">
                        {isVerifying ? 'Starting...' : 'Verify Identity'}
                    </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Two-Factor Authentication */}
          <Card className="bg-[rgb(var(--grey-2))] border-[rgb(var(--grey-3))]/20">
            <CardHeader>
              <CardTitle className="text-lg text-white">Two-Factor Authentication (2FA)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-300">Keep your account secure with an extra layer of protection.</p>
                        <p className={`text-sm ${twoFactor ? 'text-green-400' : 'text-yellow-400'}`}>
                          Status: {twoFactor ? 'Enabled' : 'Disabled'}
                        </p>
                    </div>
                    <Switch
                        checked={twoFactor}
                        onCheckedChange={setTwoFactor}
                        className="data-[state=checked]:bg-green-500"
                    />
                </div>
            </CardContent>
          </Card>
          
          {/* Device Management */}
          <Card className="bg-[rgb(var(--grey-2))] border-[rgb(var(--grey-3))]/20">
              <CardHeader>
                  <CardTitle className="text-lg text-white">Active Devices</CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-gray-400 text-sm mb-4">These devices are currently logged into your account.</p>
                  <div className="space-y-3">
                      {mockDevices.map(device => (
                          <div key={device.id} className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                              <div className="flex items-center gap-4">
                                  {device.type === 'Laptop' ? <Laptop className="w-6 h-6 text-gray-300" /> : <Smartphone className="w-6 h-6 text-gray-300" />}
                                  <div>
                                      <p className="font-semibold text-white">{device.name} {device.is_current && <span className="text-xs text-green-400">(This device)</span>}</p>
                                      <p className="text-xs text-gray-400">{device.location} • Last seen: {device.last_seen}</p>
                                  </div>
                              </div>
                              {!device.is_current && <Button variant="destructive" size="sm">Revoke</Button>}
                          </div>
                      ))}
                  </div>
              </CardContent>
          </Card>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}