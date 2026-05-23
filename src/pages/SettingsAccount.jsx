import React, { useState, useEffect } from 'react';
import SettingsLayout from '@/components/settings/SettingsLayout';
import SettingsHeader from '@/components/settings/SettingsHeader';
import SettingsSection from '@/components/settings/SettingsSection';
import SettingsItem from '@/components/settings/SettingsItem';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User } from '@/entities/User';
import { Shield, Mail, Phone, Key, Smartphone } from 'lucide-react';

export default function SettingsAccount() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeEmail = () => {
    alert('Email change flow would be initiated here. This would send a confirmation email to verify the new address.');
  };

  const handleAddPhone = () => {
    alert('Phone number addition flow would be initiated here. This would send an SMS verification code.');
  };

  const handleToggle2FA = (enabled) => {
    if (enabled) {
      alert('2FA setup flow would be initiated here. This would show QR codes for authenticator apps and backup codes.');
    } else {
      alert('2FA would be disabled after confirming with current 2FA code.');
    }
  };

  const handleSignOutAll = () => {
    alert('This would sign out all other sessions and require re-authentication on other devices.');
  };

  if (isLoading) {
    return (
      <SettingsLayout currentPage="SettingsAccount">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[rgb(var(--grey-2))] rounded"></div>
          <div className="h-32 bg-[rgb(var(--grey-2))] rounded"></div>
        </div>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout currentPage="SettingsAccount">
      <SettingsHeader
        title="Account"
        description="Manage your account settings and sign-in preferences."
      />

      <div className="space-y-6">
        {/* Account Overview */}
        <SettingsSection title="Account Information">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-white font-semibold text-lg">
                      {user?.full_name?.charAt(0) || user?.email?.charAt(0) || '?'}
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-semibold text-[rgb(var(--accent-soft-white))]">
                    {user?.full_name || 'Anonymous User'}
                  </div>
                  <div className="text-sm text-[rgb(var(--grey-3))]">
                    {user?.email}
                  </div>
                </div>
              </div>
              <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
                Active
              </Badge>
            </div>
          </div>
        </SettingsSection>

        {/* Sign-in & Security */}
        <SettingsSection 
          title="Sign-in & Security" 
          description="Manage how you access your account"
        >
          <SettingsItem
            label="Email Address"
            description={user?.email}
            control="button"
            action={{ label: "Change" }}
            onAction={handleChangeEmail}
          />
          
          <SettingsItem
            label="Phone Number"
            description="Add a phone number for account recovery"
            control="button"
            action={{ label: "Add Phone" }}
            onAction={handleAddPhone}
          />

          <SettingsItem
            label="Two-Factor Authentication"
            description="Add an extra layer of security to your account"
            control="switch"
            action={{ value: user?.twofa_enabled || false }}
            onAction={handleToggle2FA}
          />

          <SettingsItem
            label="Password"
            description="Change your account password"
            control="button"
            action={{ label: "Change" }}
            onAction={() => alert('Password change flow would be initiated here')}
          />
        </SettingsSection>

        {/* Session Management */}
        <SettingsSection 
          title="Session Management" 
          description="Manage your active sessions across devices"
        >
          <div className="space-y-4">
            <div className="p-4 bg-[rgb(var(--grey-2))]/30 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-[rgb(var(--grey-3))]" />
                  <div>
                    <div className="font-medium text-[rgb(var(--accent-soft-white))]">Current Session</div>
                    <div className="text-sm text-[rgb(var(--grey-3))]">This device • Active now</div>
                  </div>
                </div>
                <Badge className="bg-green-600/20 text-green-300 border-green-500/30">Current</Badge>
              </div>
            </div>
            
            <SettingsItem
              label="Sign out all other sessions"
              description="This will sign you out on all other devices"
              control="button"
              action={{ label: "Sign Out All" }}
              onAction={handleSignOutAll}
            />
          </div>
        </SettingsSection>

        {/* Account Status */}
        <SettingsSection 
          title="Account Status" 
          description="Your account verification and access level"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="font-medium text-[rgb(var(--accent-soft-white))]">Access Level</div>
                  <div className="text-sm text-[rgb(var(--grey-3))] capitalize">{user?.access_role || 'resident'}</div>
                </div>
              </div>
              <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/30">
                {user?.access_role || 'Resident'}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="font-medium text-[rgb(var(--accent-soft-white))]">Email Verified</div>
                  <div className="text-sm text-[rgb(var(--grey-3))]">Your email address is verified</div>
                </div>
              </div>
              <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
                Verified
              </Badge>
            </div>
          </div>
        </SettingsSection>
      </div>
    </SettingsLayout>
  );
}