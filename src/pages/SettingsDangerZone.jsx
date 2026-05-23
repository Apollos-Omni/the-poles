import React from 'react';
import SettingsLayout from '@/components/settings/SettingsLayout';
import SettingsHeader from '@/components/settings/SettingsHeader';
import SettingsSection from '@/components/settings/SettingsSection';
import SettingsItem from '@/components/settings/SettingsItem';
import { Button } from '@/components/ui/button';

export default function SettingsDangerZone() {
  return (
    <SettingsLayout currentPage="SettingsDangerZone">
      <SettingsHeader
        title="Danger Zone"
        description="These actions are irreversible. Please proceed with caution."
      />
      <SettingsSection title="Account Actions">
          <SettingsItem 
            label="Deactivate Account"
            description="Your profile and content will be temporarily disabled."
            control="button"
            action={{ label: "Deactivate", variant: "destructive" }}
            onAction={() => alert('Deactivation flow initiated!')}
          />
          <SettingsItem 
            label="Delete Account"
            description="Permanently delete your account and all associated data."
            control="button"
            action={{ label: "Delete", variant: "destructive" }}
            onAction={() => alert('Deletion flow initiated!')}
          />
      </SettingsSection>
    </SettingsLayout>
  );
}