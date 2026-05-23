import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  Activity, 
  Heart, 
  MessageSquare,
  Eye,
  EyeOff
} from "lucide-react";

import VisionCard from '../vision/VisionCard';
import ActivityItem from '../vision/ActivityItem';

const TabButton = ({ id, label, icon: Icon, count, isActive, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 ${
      isActive
        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
        : 'bg-[rgb(var(--grey-1))] text-[rgb(var(--grey-3))] hover:bg-[rgb(var(--grey-2))] border border-purple-700/30'
    }`}
  >
    <Icon className="w-4 h-4" />
    {label}
    {count > 0 && (
      <Badge className="bg-purple-400/20 text-purple-200 text-xs">
        {count}
      </Badge>
    )}
  </button>
);

export default function ProfileTabs({ 
  activeTab, 
  onTabChange, 
  visions, 
  activities, 
  supporters, 
  user,
  isOwnProfile 
}) {
  const tabs = [
    { 
      id: 'visions', 
      label: 'Visions', 
      icon: Target, 
      count: visions.length 
    },
    { 
      id: 'activities', 
      label: 'Activities', 
      icon: Activity, 
      count: activities.length 
    },
    { 
      id: 'support', 
      label: 'Support', 
      icon: Heart, 
      count: supporters.length 
    },
    { 
      id: 'debates', 
      label: 'Debates', 
      icon: MessageSquare, 
      count: 0 // TODO: Add debates count
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'visions':
        return (
          <div className="space-y-6">
            {visions.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visions.map((vision) => (
                  <VisionCard key={vision.id} vision={vision} user={user} />
                ))}
              </div>
            ) : (
              <Card className="bg-[rgb(var(--grey-1))] border-[rgb(var(--grey-2))] text-center py-12">
                <Target className="w-16 h-16 mx-auto mb-4 text-purple-400/50" />
                <h3 className="text-lg font-semibold text-purple-200 mb-2">No Visions Yet</h3>
                <p className="text-purple-300/70">
                  {isOwnProfile ? "Start manifesting your dreams!" : "This user hasn't shared any visions yet."}
                </p>
              </Card>
            )}
          </div>
        );
      
      case 'activities':
        return (
          <div className="space-y-4">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  vision={visions.find(v => v.id === activity.vision_id)}
                  showVisionTitle={true}
                />
              ))
            ) : (
              <Card className="bg-[rgb(var(--grey-1))] border-[rgb(var(--grey-2))] text-center py-12">
                <Activity className="w-16 h-16 mx-auto mb-4 text-purple-400/50" />
                <h3 className="text-lg font-semibold text-purple-200 mb-2">No Activities Yet</h3>
                <p className="text-purple-300/70">
                  {isOwnProfile ? "Start working on your visions!" : "This user hasn't logged any activities yet."}
                </p>
              </Card>
            )}
          </div>
        );
      
      case 'support':
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-[rgb(var(--grey-1))] border-[rgb(var(--grey-2))]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-400">
                    <Heart className="w-5 h-5" />
                    Supporting ({supporters.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {supporters.length > 0 ? (
                    <div className="space-y-3">
                      {supporters.slice(0, 5).map((supporter) => {
                        const supportedVision = visions.find(v => v.id === supporter.vision_id);
                        return (
                          <div key={supporter.id} className="flex items-center justify-between p-2 bg-[rgb(var(--grey-2))]/50 rounded-lg">
                            <span className="text-purple-200 text-sm">
                              {supportedVision?.title || 'Unknown Vision'}
                            </span>
                            <Badge className="bg-green-600/20 text-green-300 text-xs">
                              {supporter.support_type}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-purple-300/70 text-sm">
                      {isOwnProfile ? "Start supporting visions that inspire you!" : "Not supporting any visions yet."}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-[rgb(var(--grey-1))] border-[rgb(var(--grey-2))]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-400">
                    <Heart className="w-5 h-5" />
                    Received Support (0)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-purple-300/70 text-sm">
                    {isOwnProfile ? "Create compelling visions to attract supporters!" : "This user hasn't received support yet."}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      
      case 'debates':
        return (
          <Card className="bg-[rgb(var(--grey-1))] border-[rgb(var(--grey-2))] text-center py-12">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-purple-400/50" />
            <h3 className="text-lg font-semibold text-purple-200 mb-2">Debates Coming Soon</h3>
            <p className="text-purple-300/70">
              Structured debates and discussions will be available in a future update.
            </p>
          </Card>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-4">
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            id={tab.id}
            label={tab.label}
            icon={tab.icon}
            count={tab.count}
            isActive={activeTab === tab.id}
            onClick={onTabChange}
          />
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {renderTabContent()}
      </div>
    </div>
  );
}