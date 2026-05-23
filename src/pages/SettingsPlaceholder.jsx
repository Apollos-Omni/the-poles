import React from 'react';
import SettingsLayout from '@/components/settings/SettingsLayout';
import SettingsHeader from '@/components/settings/SettingsHeader';

const PlaceholderPage = ({ pageName }) => {
  return (
    <SettingsLayout currentPage={pageName}>
      <SettingsHeader
        title={pageName.replace('Settings', '')}
        description={`Manage your ${pageName.replace('Settings', '').toLowerCase()} settings. This page is under construction.`}
      />
      <div className="flex items-center justify-center h-48 bg-black/20 rounded-lg">
        <p className="text-[rgb(var(--grey-3))]">Content for this section will be available soon.</p>
      </div>
    </SettingsLayout>
  );
}

export default PlaceholderPage;