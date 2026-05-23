import React, { useState, useEffect, useCallback } from 'react';
import { User } from '@/entities/User';
import { Vision } from '@/entities/Vision';
import { VisionActivity } from '@/entities/VisionActivity';
import { VisionSupporter } from '@/entities/VisionSupporter';
import { useParams, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  User as UserIcon, 
  Edit, 
  MapPin, 
  Link as LinkIcon, 
  Crown, 
  Target, 
  Activity, 
  Heart, 
  MessageSquare,
  Settings,
  Wallet,
  Shield,
  ExternalLink,
  Copy
} from "lucide-react";

import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileStats from '../components/profile/ProfileStats';
import ProfileTabs from '../components/profile/ProfileTabs';
import EditProfileModal from '../components/profile/EditProfileModal';
import PaymentsHub from '../components/profile/PaymentsHub';
import SecuritySettings from '../components/profile/SecuritySettings';

export default function Profile() {
  const { userId } = useParams(); // If viewing another user's profile
  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [visions, setVisions] = useState([]);
  const [activities, setActivities] = useState([]);
  const [supporters, setSupporters] = useState([]);
  const [activeTab, setActiveTab] = useState('visions');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPayments, setShowPayments] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    visionCount: 0,
    verifiedProofs: 0,
    karmaPoints: 0,
    currentStreak: 0,
    followerCount: 0,
    supportingCount: 0
  });

  const isOwnProfile = !userId; // No userId means viewing own profile

  const loadProfileData = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentUserData = await User.me();
      setCurrentUser(currentUserData);
      
      // If viewing own profile or no userId specified
      let targetUser = currentUserData;
      if (userId && userId !== currentUserData.id) {
        targetUser = await User.get(userId);
      }
      setUser(targetUser);

      // Enhanced profile data with defaults
      const enhancedProfile = {
        bio: 'Seeker of divine truth and manifestation',
        region: 'Unknown Realm',
        links: [],
        kyc_status: 'unverified',
        kyc_tier: 0,
        stripe_customer_id: null,
        stripe_connect_id: null,
        twofa_enabled: false,
        ...targetUser
      };
      setProfileData(enhancedProfile);

      // Load user's visions and activities
      const [visionsData, activitiesData, supportersData] = await Promise.all([
        Vision.filter({ created_by: targetUser.email }, '-updated_date', 20),
        VisionActivity.filter({ user_id: targetUser.id }, '-created_date', 50),
        VisionSupporter.filter({ user_id: targetUser.id }, '-created_date')
      ]);

      setVisions(visionsData);
      setActivities(activitiesData);
      setSupporters(supportersData);

      // Calculate stats
      const verifiedProofs = activitiesData.filter(a => 
        a.activity_type === 'proof_submitted' && a.verification_status === 'verified'
      ).length;
      
      const currentStreak = Math.max(...activitiesData.map(a => a.streak_count || 0));
      
      setStats({
        visionCount: visionsData.length,
        verifiedProofs,
        karmaPoints: targetUser.karma_points || 0,
        currentStreak,
        followerCount: Math.floor(Math.random() * 100) + 10, // Mock data
        supportingCount: supportersData.length
      });

    } catch (error) {
      console.error('Error loading profile data:', error);
    }
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const handleCopyLink = (link) => {
    navigator.clipboard?.writeText(link);
    // Show toast notification
  };

  const handleCopyHandle = () => {
    navigator.clipboard?.writeText(`@${user.full_name?.replace(' ', '').toLowerCase() || 'user'}`);
  };

  if (isLoading || !user || !profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[rgb(var(--dark-base))] via-[rgb(var(--grey-1))] to-[rgb(var(--dark-base))] text-[rgb(var(--accent-soft-white))] p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[rgb(var(--grey-1))] rounded-2xl p-8 animate-pulse">
            <div className="flex items-start gap-6 mb-8">
              <div className="w-20 h-20 bg-[rgb(var(--grey-2))] rounded-full"></div>
              <div className="space-y-3 flex-1">
                <div className="h-6 bg-[rgb(var(--grey-2))] rounded w-48"></div>
                <div className="h-4 bg-[rgb(var(--grey-2))] rounded w-32"></div>
                <div className="h-12 bg-[rgb(var(--grey-2))] rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[rgb(var(--dark-base))] via-[rgb(var(--grey-1))] to-[rgb(var(--dark-base))] text-[rgb(var(--accent-soft-white))] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <ProfileHeader 
          user={user}
          profile={profileData}
          stats={stats}
          isOwnProfile={isOwnProfile}
          onEdit={() => setShowEditModal(true)}
          onCopyHandle={handleCopyHandle}
        />

        {/* Owner-Only Actions */}
        {isOwnProfile && (
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-600/20 to-purple-700/20 hover:from-purple-600/30 hover:to-purple-700/30 border border-purple-500/30 rounded-xl transition-all duration-300"
            >
              <Edit className="w-5 h-5 text-purple-400" />
              <div className="text-left">
                <div className="font-semibold text-purple-100">Edit Profile</div>
                <div className="text-xs text-purple-300">Update your info</div>
              </div>
            </button>

            <button
              onClick={() => setShowPayments(true)}
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-600/20 to-emerald-700/20 hover:from-green-600/30 hover:to-emerald-700/30 border border-green-500/30 rounded-xl transition-all duration-300"
            >
              <Wallet className="w-5 h-5 text-green-400" />
              <div className="text-left">
                <div className="font-semibold text-green-100">Wallet & Payments</div>
                <div className="text-xs text-green-300">
                  {profileData.stripe_customer_id ? 'Configured' : 'Setup required'}
                </div>
              </div>
            </button>

            <button
              onClick={() => setShowSecurity(true)}
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-600/20 to-cyan-700/20 hover:from-blue-600/30 hover:to-cyan-700/30 border border-blue-500/30 rounded-xl transition-all duration-300"
            >
              <Shield className="w-5 h-5 text-blue-400" />
              <div className="text-left">
                <div className="font-semibold text-blue-100">Security</div>
                <div className="text-xs text-blue-300">
                  {profileData.twofa_enabled ? '2FA Enabled' : '2FA Required'}
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Profile Stats */}
        <ProfileStats stats={stats} />

        {/* Profile Tabs */}
        <ProfileTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          visions={visions}
          activities={activities}
          supporters={supporters}
          user={user}
          isOwnProfile={isOwnProfile}
        />

        {/* Modals */}
        {showEditModal && (
          <EditProfileModal
            user={user}
            profile={profileData}
            onClose={() => setShowEditModal(false)}
            onUpdated={loadProfileData}
          />
        )}

        {showPayments && (
          <PaymentsHub
            user={user}
            profile={profileData}
            onClose={() => setShowPayments(false)}
            onUpdated={loadProfileData}
          />
        )}

        {showSecurity && (
          <SecuritySettings
            user={user}
            profile={profileData}
            onClose={() => setShowSecurity(false)}
            onUpdated={loadProfileData}
          />
        )}
      </div>
    </div>
  );
}