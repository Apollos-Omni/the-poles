import React, { useState, useEffect, useCallback } from 'react';
import { User } from '@/entities/User';
import { Vision } from '@/entities/Vision';
import { VisionActivity } from '@/entities/VisionActivity';
import { VisionSupporter } from '@/entities/VisionSupporter';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Target, 
  Plus, 
  TrendingUp, 
  Users, 
  Eye,
  Filter,
  Search,
  Grid,
  List
} from "lucide-react";

import VisionFeed from '../components/vision/VisionFeed';
import MyVisions from '../components/vision/MyVisions';
import VisionComposer from '../components/vision/VisionComposer';
import ActivityTimeline from '../components/vision/ActivityTimeline';

export default function VisionTracker() {
  const [user, setUser] = useState(null);
  const [visions, setVisions] = useState([]);
  const [activities, setActivities] = useState([]);
  const [supporters, setSupporters] = useState([]);
  const [activeTab, setActiveTab] = useState('feed');
  const [isLoading, setIsLoading] = useState(true);
  const [showComposer, setShowComposer] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    category: 'all',
    region: 'all',
    status: 'all'
  });

  const loadVisionData = useCallback(async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);

      // Load visions, activities, and supporters
      const [visionsData, activitiesData, supportersData] = await Promise.all([
        Vision.list('-updated_date', 50),
        VisionActivity.list('-created_date', 100),
        VisionSupporter.list('-created_date', 50)
      ]);

      setVisions(visionsData);
      setActivities(activitiesData);
      setSupporters(supportersData);
    } catch (error) {
      console.error('Error loading vision data:', error);
      setVisions([]);
      setActivities([]);
      setSupporters([]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadVisionData();
  }, [loadVisionData]);

  const handleVisionCreated = () => {
    setShowComposer(false);
    loadVisionData();
  };

  const TabButton = ({ id, label, icon: Icon, count = 0 }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 ${
        activeTab === id
          ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
          : 'bg-black/40 text-purple-300 hover:bg-purple-800/40 border border-purple-700/30'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
      {count > 0 && (
        <span className="bg-purple-400/20 text-purple-200 text-xs px-2 py-1 rounded-full">
          {count}
        </span>
      )}
    </button>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-indigo-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-black/40 backdrop-blur-md rounded-2xl p-6 animate-pulse border border-purple-700/30">
                <div className="h-32 bg-purple-900/20 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-indigo-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 via-white to-indigo-300 bg-clip-text text-transparent">
                Vision Board
              </h1>
              <p className="text-purple-200/80">Declare → Act → Earn Trust</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-3 bg-black/40 hover:bg-purple-800/40 border border-purple-700/30 rounded-xl transition-all duration-300"
            >
              {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setShowComposer(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
            >
              <Plus className="w-5 h-5" />
              New Vision
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-4 mb-8">
          <TabButton 
            id="feed" 
            label="Vision Feed" 
            icon={TrendingUp} 
            count={visions.filter(v => v.status === 'active').length}
          />
          <TabButton 
            id="my-visions" 
            label="My Visions" 
            icon={Target} 
            count={visions.filter(v => v.created_by === user?.email).length}
          />
          <TabButton 
            id="following" 
            label="Following" 
            icon={Users} 
            count={supporters.filter(s => s.user_id === user?.id).length}
          />
          <TabButton 
            id="activity" 
            label="Activity Log" 
            icon={Eye} 
            count={activities.filter(a => a.user_id === user?.id).length}
          />
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {activeTab === 'feed' && (
            <VisionFeed 
              visions={visions}
              user={user}
              viewMode={viewMode}
              filters={filters}
              onFilterChange={setFilters}
            />
          )}

          {activeTab === 'my-visions' && (
            <MyVisions 
              visions={visions.filter(v => v.created_by === user?.email)}
              user={user}
              onRefresh={loadVisionData}
            />
          )}

          {activeTab === 'following' && (
            <VisionFeed 
              visions={visions.filter(v => 
                supporters.some(s => s.user_id === user?.id && s.vision_id === v.id)
              )}
              user={user}
              viewMode={viewMode}
              title="Visions You Support"
            />
          )}

          {activeTab === 'activity' && (
            <ActivityTimeline 
              activities={activities.filter(a => a.user_id === user?.id)}
              visions={visions}
              user={user}
            />
          )}
        </div>

        {/* Vision Composer Modal */}
        {showComposer && (
          <VisionComposer 
            user={user}
            onClose={() => setShowComposer(false)}
            onCreated={handleVisionCreated}
          />
        )}

        {/* Global FAB for Mobile */}
        <button 
          onClick={() => setShowComposer(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 z-50 lg:hidden"
        >
          <Plus className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
}