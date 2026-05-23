import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

import ProfileHeader from '@/components/profile/ProfileHeader';
import AccountSetupModal from '@/components/profile/AccountSetupModal';
import WallTab from '@/components/profile/WallTab';
import FriendsTab from './FriendsTab';
import FavoritesTab from '@/components/profile/FavoritesTab';
import HistoryTab from '@/components/profile/HistoryTab';
import PrizesTab from '@/components/profile/PrizesTab';
import AccountInfoTab from '@/components/profile/AccountInfoTab';

const PROFILE_TABS = [
  { id: 'wall',    label: '📝 Wall' },
  { id: 'friends', label: '👥 Friends' },
  { id: 'favorites', label: '❤️ Favorites' },
  { id: 'history', label: '📋 History' },
  { id: 'prizes',  label: '🏆 Prizes' },
  { id: 'account', label: '⚙️ Account' },
];

function loadSavedProfile() {
  try {
    const raw = localStorage.getItem('poles_profile');
    if (raw) return JSON.parse(raw);
  } catch (_) {
    return null;
  }
  return null;
}

export default function UserProfileTab() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(loadSavedProfile());
  const [activeTab, setActiveTab] = useState('wall');
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      // If logged in but no profile set up yet, prompt setup
      if (u && !loadSavedProfile()) {
        setShowSetup(true);
      }
    }).catch(() => {
      setUser(null);
    });
  }, []);

  const handleSetupComplete = (newProfile) => {
    setProfile(newProfile);
    setShowSetup(false);
  };

  const handleUpdateProfile = async (updates) => {
    const updated = { ...(profile || {}), ...updates };
    localStorage.setItem('poles_profile', JSON.stringify(updated));
    setProfile(updated);

    const authUpdates = {};
    if (updates.displayName !== undefined) {
      authUpdates.full_name = updates.displayName;
      authUpdates.name = updates.displayName;
    }
    if (updates.full_name !== undefined) {
      authUpdates.full_name = updates.full_name;
      authUpdates.name = updates.full_name;
    }
    if (updates.name !== undefined) authUpdates.name = updates.name;
    if (updates.email !== undefined) authUpdates.email = updates.email;
    if (updates.bio !== undefined) authUpdates.bio = updates.bio;
    if (updates.region !== undefined) authUpdates.region = updates.region;
    if (updates.location !== undefined) authUpdates.location = updates.location;
    if (updates.avatar_url !== undefined) authUpdates.avatar_url = updates.avatar_url;

    if (Object.keys(authUpdates).length) {
      const nextUser = await base44.auth.updateMyUserData(authUpdates);
      setUser(nextUser);
    }
  };

  const authorName = profile?.displayName || user?.full_name || "Poles Player";
  const authorInitials = authorName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-0">
      {/* Account setup modal */}
      {showSetup && (
        <AccountSetupModal
          user={user}
          onComplete={handleSetupComplete}
        />
      )}

      {/* Profile header */}
      <ProfileHeader
        user={user}
        profile={profile}
        onEdit={() => setShowSetup(true)}
      />

      {/* Profile tabs — horizontal scrollable */}
      <div className="sticky top-14 z-20 bg-black/80 backdrop-blur-md border-b border-purple-700/20 -mx-4 px-4 mt-0">
        <div className="flex overflow-x-auto scrollbar-hide gap-0 -mb-px pt-2">
          {PROFILE_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-purple-400 text-purple-300'
                  : 'border-transparent text-purple-500 hover:text-purple-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="pt-5">
        {activeTab === 'wall' && (
          <WallTab authorName={authorName} authorInitials={authorInitials} />
        )}
        {activeTab === 'friends' && <FriendsTab />}
        {activeTab === 'favorites' && <FavoritesTab />}
        {activeTab === 'history' && <HistoryTab />}
        {activeTab === 'prizes' && <PrizesTab />}
        {activeTab === 'account' && (
          <AccountInfoTab
            user={user}
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
          />
        )}
      </div>
    </div>
  );
}
