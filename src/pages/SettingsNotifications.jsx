
import React, { useState, useEffect, useCallback } from 'react';
import SettingsLayout from '@/components/settings/SettingsLayout';
import SettingsHeader from '@/components/settings/SettingsHeader';
import SettingsSection from '@/components/settings/SettingsSection';
import SettingsItem from '@/components/settings/SettingsItem';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from '@/entities/User';
import { NotificationSettings } from '@/entities/NotificationSettings';
import { Moon, Sun } from 'lucide-react';

export default function SettingsNotifications() {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({
    dnd_enabled: false,
    dnd_start: '22:00',
    dnd_end: '07:00',
    push: true,
    email: true,
    inapp: true,
    vision_activity: true,
    support_pledges: true,
    community: true,
    identity_payments: true,
    security: true
  });
  const [isLoading, setIsLoading] = useState(true);

  // loadSettings is wrapped in useCallback to stabilize it and prevent unnecessary re-creations
  // It doesn't depend on `settings` state directly for updates, using functional update,
  // and for creating default settings, it implicitly uses the initial `settings` state,
  // which is fine since this function runs only on mount to initialize.
  const loadSettings = useCallback(async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      // Try to get existing notification settings
      const existingSettings = await NotificationSettings.filter({ user_id: userData.id });
      
      if (existingSettings.length > 0) {
        // Use functional update to avoid 'settings' being a dependency of useCallback
        setSettings(prevSettings => ({ ...prevSettings, ...existingSettings[0] }));
      } else {
        // Create default settings based on the initial state of 'settings'
        const defaultSettings = { user_id: userData.id, ...settings };
        await NotificationSettings.create(defaultSettings);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array as 'settings' for default creation is effectively initial state,
        // and for updates, a functional updater is used.

  // useEffect now depends on loadSettings, which is stable due to useCallback
  useEffect(() => {
    loadSettings();
  }, [loadSettings]); // loadSettings is now a stable dependency

  const updateSetting = async (key, value) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      
      // Update in database
      // Ensure user is loaded before attempting to update settings
      if (!user?.id) {
        console.warn('User not loaded, cannot update settings in DB.');
        return;
      }
      const existingSettings = await NotificationSettings.filter({ user_id: user.id });
      if (existingSettings.length > 0) {
        await NotificationSettings.update(existingSettings[0].id, { [key]: value });
      }
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  };

  const dndPresets = [
    { label: '10:00 PM → 7:00 AM', start: '22:00', end: '07:00' },
    { label: '11:00 PM → 6:00 AM', start: '23:00', end: '06:00' },
    { label: '9:00 PM → 6:00 AM', start: '21:00', end: '06:00' },
    { label: 'Midnight → 8:00 AM', start: '00:00', end: '08:00' }
  ];

  if (isLoading) {
    return (
      <SettingsLayout currentPage="SettingsNotifications">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[rgb(var(--grey-2))] rounded"></div>
          <div className="h-32 bg-[rgb(var(--grey-2))] rounded"></div>
        </div>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout currentPage="SettingsNotifications">
      <SettingsHeader
        title="Notifications"
        description="Choose what updates you want to receive and when."
      />

      <div className="space-y-6">
        {/* Do Not Disturb */}
        <SettingsSection 
          title="Do Not Disturb" 
          description="Quiet hours when notifications are silenced"
        >
          <SettingsItem
            label="Enable Do Not Disturb"
            description={settings.dnd_enabled ? `Active ${settings.dnd_start} → ${settings.dnd_end}` : 'Currently disabled'}
            control="switch"
            action={{ value: settings.dnd_enabled }}
            onAction={(value) => updateSetting('dnd_enabled', value)}
          />
          
          {settings.dnd_enabled && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[rgb(var(--accent-soft-white))]">Quiet Hours Start</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Moon className="w-4 h-4 text-[rgb(var(--grey-3))]" />
                    <Input
                      type="time"
                      value={settings.dnd_start}
                      onChange={(e) => updateSetting('dnd_start', e.target.value)}
                      className="bg-[rgb(var(--dark-base))] border-[rgb(var(--grey-2))] text-white"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-[rgb(var(--accent-soft-white))]">Quiet Hours End</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Sun className="w-4 h-4 text-[rgb(var(--grey-3))]" />
                    <Input
                      type="time"
                      value={settings.dnd_end}
                      onChange={(e) => updateSetting('dnd_end', e.target.value)}
                      className="bg-[rgb(var(--dark-base))] border-[rgb(var(--grey-2))] text-white"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-[rgb(var(--accent-soft-white))] text-sm">Quick Presets</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {dndPresets.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => {
                        updateSetting('dnd_start', preset.start);
                        updateSetting('dnd_end', preset.end);
                      }}
                      className="px-3 py-2 text-xs bg-[rgb(var(--grey-2))] hover:bg-[rgb(var(--grey-2))]/80 text-[rgb(var(--accent-soft-white))] rounded-lg transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </SettingsSection>

        {/* Delivery Methods */}
        <SettingsSection 
          title="Delivery Methods" 
          description="How you'd like to receive notifications"
        >
          <SettingsItem
            label="Push Notifications"
            description="Notifications sent to your device"
            control="switch"
            action={{ value: settings.push }}
            onAction={(value) => updateSetting('push', value)}
          />
          <SettingsItem
            label="Email Notifications"
            description="Important updates sent to your email"
            control="switch"
            action={{ value: settings.email }}
            onAction={(value) => updateSetting('email', value)}
          />
          <SettingsItem
            label="In-App Notifications"
            description="Notifications shown while using HeavenOS"
            control="switch"
            action={{ value: settings.inapp }}
            onAction={(value) => updateSetting('inapp', value)}
          />
        </SettingsSection>

        {/* Notification Categories */}
        <SettingsSection 
          title="What to Notify About" 
          description="Choose which activities trigger notifications"
        >
          <SettingsItem
            label="Vision Activity"
            description="Task completions, proof submissions, milestones"
            control="switch"
            action={{ value: settings.vision_activity }}
            onAction={(value) => updateSetting('vision_activity', value)}
          />
          <SettingsItem
            label="Support & Pledges"
            description="When someone supports your visions or you receive pledges"
            control="switch"
            action={{ value: settings.support_pledges }}
            onAction={(value) => updateSetting('support_pledges', value)}
          />
          <SettingsItem
            label="Community"
            description="Posts, comments, mentions, and community updates"
            control="switch"
            action={{ value: settings.community }}
            onAction={(value) => updateSetting('community', value)}
          />
          <SettingsItem
            label="Identity & Payments"
            description="KYC updates, payment confirmations, payout notifications"
            control="switch"
            action={{ value: settings.identity_payments }}
            onAction={(value) => updateSetting('identity_payments', value)}
          />
          <SettingsItem
            label="Security"
            description="Login alerts, device changes, security events"
            control="switch"
            action={{ value: settings.security }}
            onAction={(value) => updateSetting('security', value)}
          />
        </SettingsSection>
      </div>
    </SettingsLayout>
  );
}
