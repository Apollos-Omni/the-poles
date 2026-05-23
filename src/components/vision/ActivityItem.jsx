import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  Camera, 
  Trophy, 
  Heart, 
  Activity, 
  MessageCircle,
  TrendingUp,
  Zap,
  Shield,
  AlertTriangle,
  ExternalLink
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

const verificationBadges = {
  unverified: { label: 'Unverified', color: 'bg-gray-600/20 text-gray-300', icon: null },
  pending: { label: 'Pending', color: 'bg-yellow-600/20 text-yellow-300', icon: Activity },
  verified: { label: 'Verified', color: 'bg-green-600/20 text-green-300', icon: Shield },
  disputed: { label: 'Disputed', color: 'bg-red-600/20 text-red-300', icon: AlertTriangle }
};

export default function ActivityItem({ 
  activity, 
  vision, 
  showVisionTitle = false,
  onVerify,
  onDispute,
  canVerify = false 
}) {
  const Icon = activityIcons[activity.activity_type] || Activity;
  const colorClass = activityColors[activity.activity_type] || "text-purple-400 bg-purple-600/20";
  const verification = verificationBadges[activity.verification_status] || verificationBadges.unverified;

  return (
    <Card className="bg-gradient-to-br from-purple-600/10 to-black/40 backdrop-blur-sm border border-purple-700/30 hover:border-purple-500/50 transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${colorClass.split(' ')[1]} flex-shrink-0`}>
            <Icon className={`w-4 h-4 ${colorClass.split(' ')[0]}`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-purple-100">{activity.title}</h4>
                {showVisionTitle && vision && (
                  <p className="text-sm text-purple-300/80 mt-1">
                    on <span className="font-medium">{vision.title}</span>
                  </p>
                )}
              </div>
              <div className="text-right text-xs text-purple-400 ml-4">
                {formatDistanceToNow(new Date(activity.created_date), { addSuffix: true })}
              </div>
            </div>
            
            {activity.description && (
              <p className="text-sm text-purple-200/90 mb-3">
                {activity.description}
              </p>
            )}
            
            {/* Proof Media Preview */}
            {activity.activity_type === 'proof_submitted' && activity.metadata?.media_url && (
              <div className="mb-3">
                <img 
                  src={activity.metadata.media_url} 
                  alt="Proof"
                  className="w-full max-w-xs h-32 object-cover rounded-lg border border-purple-700/30"
                />
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className="text-xs capitalize bg-gray-700/40 text-gray-300">
                  {activity.activity_type.replace('_', ' ')}
                </Badge>
                
                {/* Verification Status */}
                <div className="flex items-center gap-1">
                  {verification.icon && <verification.icon className="w-3 h-3" />}
                  <Badge className={`text-xs ${verification.color}`}>
                    {verification.label}
                  </Badge>
                </div>
                
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
              
              {/* Action Buttons */}
              {canVerify && activity.verification_status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onVerify?.(activity.id, true)}
                    className="text-green-400 border-green-500/50 hover:bg-green-600/20"
                  >
                    Verify
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onVerify?.(activity.id, false)}
                    className="text-red-400 border-red-500/50 hover:bg-red-600/20"
                  >
                    Reject
                  </Button>
                </div>
              )}
              
              {activity.verification_status === 'verified' && !canVerify && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDispute?.(activity.id)}
                  className="text-amber-400 hover:text-amber-300"
                >
                  Dispute
                </Button>
              )}
            </div>
            
            {/* Extended Metadata */}
            {activity.metadata && Object.keys(activity.metadata).length > 0 && (
              <div className="mt-3 p-2 bg-purple-900/20 rounded-lg border border-purple-700/30">
                <div className="text-xs text-purple-300">
                  {Object.entries(activity.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="capitalize">{key.replace('_', ' ')}:</span>
                      <span className="text-purple-200">
                        {key === 'location' && value ? (
                          <span className="flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" />
                            {value}
                          </span>
                        ) : (
                          String(value)
                        )}
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
}