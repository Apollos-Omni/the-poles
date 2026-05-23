import React from 'react';
import SettingsLayout from '@/components/settings/SettingsLayout';
import SettingsHeader from '@/components/settings/SettingsHeader';
import SettingsSection from '@/components/settings/SettingsSection';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function SettingsProfile() {
  return (
    <SettingsLayout currentPage="SettingsProfile">
      <SettingsHeader
        title="Profile"
        description="This is how others will see you on the site."
      />
      <div className="space-y-6">
        <SettingsSection
          title="Public Profile"
          description="Update your photo and personal details."
        >
            <div className="space-y-4">
                <Input placeholder="Display Name" className="bg-[rgb(var(--dark-base))] border-[rgb(var(--grey-2))] text-white" />
                <Textarea placeholder="Bio" className="bg-[rgb(var(--dark-base))] border-[rgb(var(--grey-2))] text-white" />
            </div>
        </SettingsSection>
        <div className="flex justify-end">
            <Button className="bg-purple-600 hover:bg-purple-700">Save Changes</Button>
        </div>
      </div>
    </SettingsLayout>
  );
}