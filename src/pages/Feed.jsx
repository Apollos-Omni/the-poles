
import React, { useState, useEffect, useCallback } from 'react';
import { User } from '@/entities/User';
import { Vision } from '@/entities/Vision';
import { HingeEvent } from '@/entities/HingeEvent';
import { CommunityPost } from '@/entities/CommunityPost';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Target, 
  DoorOpen, 
  TrendingUp, 
  Users, 
  Plus,
  Heart,
  MessageCircle,
  Share2,
  Crown,
  Zap
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

const feedCardVariants = {
  vision: {
    gradient: "from-purple-500/20 to-purple-600/20",
    border: "border-purple-500/30",
    icon: Target,
    color: "text-purple-400"
  },
  hinge_event: {
    gradient: "from-blue-500/20 to-blue-600/20", 
    border: "border-blue-500/30",
    icon: DoorOpen,
    color: "text-blue-400"
  },
  karma_boost: {
    gradient: "from-yellow-500/20 to-yellow-600/20",
    border: "border-yellow-500/30", 
    icon: Crown,
    color: "text-yellow-400"
  },
  community: {
    gradient: "from-green-500/20 to-green-600/20",
    border: "border-green-500/30",
    icon: Users,
    color: "text-green-400"
  }
};

function FeedCard({ item, user }) {
  const [liked, setLiked] = useState(false);
  const variant = feedCardVariants[item.type] || feedCardVariants.community;
  const Icon = variant.icon;

  const handleLike = () => {
    setLiked(!liked);
    // TODO: Implement like functionality
  };

  return (
    <Card className={`bg-gradient-to-br ${variant.gradient} backdrop-blur-sm border ${variant.border} hover:border-opacity-60 transition-all duration-300 mb-6`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center ${variant.color}`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{item.title || item.content}</h3>
              <p className="text-sm text-purple-200/80">
                {formatDistanceToNow(new Date(item.created_date), { addSuffix: true })}
              </p>
            </div>
          </div>
          <Badge className={`${variant.color} bg-black/40 border-0`}>
            {item.type.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Content based on type */}
        {item.type === 'vision' && (
          <div className="space-y-4">
            <p className="text-purple-100/90">{item.description}</p>
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex justify-between text-sm text-purple-200">
                  <span>Progress</span>
                  <span>{item.progress || 0}%</span>
                </div>
                <div className="w-full bg-black/40 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${item.progress || 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="ml-4 flex items-center gap-1 text-yellow-400">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm">+{item.karma_reward || 0}</span>
              </div>
            </div>
          </div>
        )}

        {item.type === 'hinge_event' && (
          <div className="space-y-3">
            <p className="text-blue-100/90">
              Gateway "{item.hinge_name}" was {item.event_type} 
            </p>
            <div className="flex items-center justify-between">
              <span className="text-blue-200/80 text-sm">{item.location}</span>
              <div className="flex items-center gap-1 text-yellow-400">
                <Zap className="w-4 h-4" />
                <span className="text-sm">+{item.karma_earned || 0} karma</span>
              </div>
            </div>
          </div>
        )}

        {item.type === 'karma_boost' && (
          <div className="space-y-3">
            <p className="text-yellow-100/90">{item.description}</p>
            <div className="flex items-center justify-center p-4 bg-yellow-500/20 rounded-lg">
              <Crown className="w-6 h-6 text-yellow-400 mr-2" />
              <span className="text-yellow-300 font-semibold">+{item.karma_amount} Karma Boost!</span>
            </div>
          </div>
        )}

        {/* Social Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLike}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                liked 
                  ? 'bg-red-500/20 text-red-400' 
                  : 'hover:bg-white/10 text-purple-200'
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              <span className="text-sm">{(item.likes || 0) + (liked ? 1 : 0)}</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 text-purple-200 transition-all duration-200">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{item.comments || 0}</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 text-purple-200 transition-all duration-200">
              <Share2 className="w-4 h-4" />
              <span className="text-sm">Share</span>
            </button>
          </div>
          {item.karma_impact > 0 && (
            <div className="text-xs text-yellow-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Karma Impact
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Feed() {
  const [user, setUser] = useState(null);
  const [feedItems, setFeedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadFeedData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = await User.me();
      
      // Ensure user has all required fields
      const userWithDefaults = {
        karma_points: 0,
        karma_level: 'Seeker',
        vision_count: 0,
        completed_visions: 0,
        heaven_coin_balance: 0,
        access_role: 'resident',
        aura_color: 'purple',
        divine_aura_level: 0,
        ...userData
      };
      
      setUser(userWithDefaults);

      // Simulate diverse feed content
      const mockFeedItems = [
        {
          id: '1',
          type: 'vision',
          title: 'Complete Morning Meditation Practice',
          description: 'Establishing a consistent daily meditation routine to enhance mindfulness and inner peace.',
          progress: 65,
          karma_reward: 15,
          likes: 12,
          comments: 3,
          created_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2', 
          type: 'hinge_event',
          title: 'Gateway Activity',
          hinge_name: 'Portal of Beginnings',
          event_type: 'unlocked',
          location: 'The Workshop',
          karma_earned: 5,
          likes: 8,
          created_date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          type: 'karma_boost',
          title: 'Level Up Achievement',
          description: 'Congratulations! You have ascended to Guardian level.',
          karma_amount: 100,
          likes: 23,
          comments: 7,
          created_date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
        }
      ];

      setFeedItems(mockFeedItems);
    } catch (error) {
      console.error('Error loading feed:', error);
      setError(error.message);
      // Set default user and empty feed
      setUser({
        id: 'guest',
        full_name: 'Guest User',
        karma_level: 'Seeker',
        karma_points: 0
      });
      setFeedItems([]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadFeedData();
  }, [loadFeedData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent text-white p-6">
        <div className="max-w-2xl mx-auto">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-purple-900/20 rounded-2xl p-6 animate-pulse mb-6">
              <div className="h-20 bg-purple-800/30 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white relative">
      {/* Header */}
      <div className="sticky top-0 bg-black/60 backdrop-blur-lg border-b border-purple-700/30 p-4 z-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-300 via-white to-purple-300 bg-clip-text text-transparent">
            Divine Feed
          </h1>
          <p className="text-purple-200/60 text-sm">Your journey through the heavens</p>
          {error && (
            <div className="bg-red-900/20 border border-red-700/30 rounded p-2 mt-2">
              <p className="text-red-300 text-xs">⚠️ Connection issues detected</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Feed */}
      <div className="max-w-2xl mx-auto p-6">
        {feedItems.length > 0 ? (
          feedItems.map((item) => (
            <FeedCard key={item.id} item={item} user={user} />
          ))
        ) : (
          <Card className="bg-gradient-to-br from-purple-900/40 to-black/40 backdrop-blur-sm border border-purple-700/30 p-12 text-center">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-400/50" />
            <h3 className="text-xl font-semibold mb-2 text-purple-200">Your Journey Awaits</h3>
            <p className="text-purple-300/70">Start manifesting visions and controlling gateways to see your divine feed come alive.</p>
          </Card>
        )}
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 z-20">
        <Plus className="w-6 h-6 text-white" />
      </button>
    </div>
  );
}
