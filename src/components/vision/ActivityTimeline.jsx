
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Activity, 
  CheckCircle, 
  Camera, 
  Trophy, 
  Heart, 
  MessageCircle,
  TrendingUp,
  Clock,
  Filter,
  Zap
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

const activityIcons = {
  task_completed: CheckCircle,
  proof_submitted: Camera,
  milestone_reached: Trophy,
  pledge_made: Heart,
  check_in: Activity,
  comment: MessageCircle,
  like: Heart,
  support: TrendingUp
};

const activityColors = {
  task_completed: "text-green-400 bg-green-600/20",
  proof_submitted: "text-blue-400 bg-blue-600/20",
  milestone_reached: "text-yellow-400 bg-yellow-600/20",
  pledge_made: "text-pink-400 bg-pink-600/20",
  check_in: "text-purple-400 bg-purple-600/20",
  comment: "text-indigo-400 bg-indigo-600/20",
  like: "text-red-400 bg-red-600/20",
  support: "text-emerald-400 bg-emerald-600/20"
};

export default function ActivityTimeline({ activities = [], visions = [], user }) {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    return activity.activity_type === filter;
  });

  const sortedActivities = [...filteredActivities].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.created_date) - new Date(a.created_date);
      case 'karma':
        return b.karma_delta - a.karma_delta;
      case 'streak':
        return b.streak_count - a.streak_count;
      default:
        return 0;
    }
  });

  const getVisionTitle = (visionId) => {
    const vision = visions.find(v => v.id === visionId);
    return vision ? vision.title : 'Unknown Vision';
  };

  if (activities.length === 0) {
    return (
      <Card className="bg-black/40 backdrop-blur-sm border border-purple-700/30 text-center p-12">
        <Activity className="w-16 h-16 mx-auto mb-4 text-purple-400/50" />
        <h3 className="text-xl font-semibold text-purple-200 mb-2">No Activities Yet</h3>
        <p className="text-purple-300/70">Start working on your visions to see your activity timeline</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 items-start justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl sm:text-2xl font-bold text-purple-100">Activity Timeline</h2>
          <Badge className="bg-purple-600/20 text-purple-300 text-xs">
            {sortedActivities.length} activities
          </Badge>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-40 bg-black/40 border-purple-700/50 text-white">
              <SelectValue placeholder="Filter activities" />
            </SelectTrigger>
            <SelectContent 
              className="bg-purple-900 border-purple-700 max-h-60 overflow-auto w-full"
              position="popper"
              sideOffset={5}
            >
              <SelectItem value="all" className="text-white hover:bg-purple-800 focus:bg-purple-800">All Activities</SelectItem>
              <SelectItem value="task_completed" className="text-white hover:bg-purple-800 focus:bg-purple-800">Task Completed</SelectItem>
              <SelectItem value="proof_submitted" className="text-white hover:bg-purple-800 focus:bg-purple-800">Proof Submitted</SelectItem>
              <SelectItem value="milestone_reached" className="text-white hover:bg-purple-800 focus:bg-purple-800">Milestone Reached</SelectItem>
              <SelectItem value="check_in" className="text-white hover:bg-purple-800 focus:bg-purple-800">Check-ins</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-32 bg-black/40 border-purple-700/50 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent 
              className="bg-purple-900 border-purple-700 max-h-60 overflow-auto w-full"
              position="popper"
              sideOffset={5}
            >
              <SelectItem value="recent" className="text-white hover:bg-purple-800 focus:bg-purple-800">Most Recent</SelectItem>
              <SelectItem value="karma" className="text-white hover:bg-purple-800 focus:bg-purple-800">Highest Karma</SelectItem>
              <SelectItem value="streak" className="text-white hover:bg-purple-800 focus:bg-purple-800">Best Streak</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {sortedActivities.map((activity, index) => {
          const Icon = activityIcons[activity.activity_type] || Activity;
          const colorClass = activityColors[activity.activity_type] || "text-purple-400 bg-purple-600/20";
          
          return (
            <Card key={activity.id} className="bg-gradient-to-br from-purple-600/10 to-black/40 backdrop-blur-sm border border-purple-700/30 hover:border-purple-500/50 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full ${colorClass.split(' ')[1]} flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${colorClass.split(' ')[0]}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-purple-100">{activity.title}</h3>
                        <p className="text-sm text-purple-300/80 mt-1">
                          on <span className="font-medium">{getVisionTitle(activity.vision_id)}</span>
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <div className="text-xs text-purple-400">
                          {formatDistanceToNow(new Date(activity.created_date), { addSuffix: true })}
                        </div>
                        <div className="text-xs text-purple-500 mt-1">
                          {format(new Date(activity.created_date), 'MMM d, h:mm a')}
                        </div>
                      </div>
                    </div>
                    
                    {activity.description && (
                      <p className="text-purple-200/90 text-sm mb-3">
                        {activity.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Badge className="text-xs capitalize bg-gray-700/40 text-gray-300">
                          {activity.activity_type.replace('_', ' ')}
                        </Badge>
                        
                        {activity.karma_delta > 0 && (
                          <div className="flex items-center gap-1 text-yellow-400">
                            <Zap className="w-3 h-3" />
                            <span className="text-xs font-medium">+{activity.karma_delta}</span>
                          </div>
                        )}
                        
                        {activity.streak_count > 0 && (
                          <div className="flex items-center gap-1 text-orange-400">
                            <Trophy className="w-3 h-3" />
                            <span className="text-xs font-medium">{activity.streak_count} streak</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Metadata Display */}
                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                      <div className="mt-3 p-3 bg-purple-900/20 rounded-lg border border-purple-700/30">
                        <div className="text-xs text-purple-300 space-y-1">
                          {Object.entries(activity.metadata).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="capitalize">{key.replace('_', ' ')}:</span>
                              <span className="text-purple-200">
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
