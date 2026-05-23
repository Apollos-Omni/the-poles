import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Eye, 
  EyeOff, 
  Heart, 
  MessageCircle, 
  Calendar,
  Users,
  Lock,
  Globe,
  UserCheck
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const visibilityIcons = {
  private: Lock,
  mutuals: UserCheck,
  public: Globe
};

const visibilityColors = {
  private: "bg-red-500/20 text-red-300 border-red-500/30",
  mutuals: "bg-blue-500/20 text-blue-300 border-blue-500/30", 
  public: "bg-green-500/20 text-green-300 border-green-500/30"
};

export default function BoardView({ board, posts }) {
  const VisibilityIcon = visibilityIcons[board.visibility];
  
  return (
    <Card className="bg-black/40 backdrop-blur-sm border border-purple-700/30 hover:border-purple-500/50 transition-all duration-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-purple-100">{board.title}</CardTitle>
            <p className="text-purple-300/70 text-sm mt-1">{board.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={visibilityColors[board.visibility]}>
              <VisibilityIcon className="w-3 h-3 mr-1" />
              {board.visibility}
            </Badge>
            <Badge className="bg-purple-600/20 text-purple-300">
              {posts.length} posts
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {posts.length > 0 ? (
          <div className="space-y-4">
            {posts.slice(0, 3).map((post) => (
              <div key={post.id} className="p-4 bg-purple-900/20 rounded-lg border border-purple-700/30">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {post.intent && (
                      <Badge className="text-xs bg-purple-700/40 text-purple-200 border-purple-600/40">
                        {post.intent}
                      </Badge>
                    )}
                    {post.visibility === 'anonymous' && (
                      <Badge className="text-xs bg-gray-700/40 text-gray-300 border-gray-600/40">
                        anonymous
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-purple-400">
                    {formatDistanceToNow(new Date(post.created_date), { addSuffix: true })}
                  </span>
                </div>
                
                <p className="text-purple-200/90 text-sm line-clamp-3">{post.body}</p>
                
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-purple-700/30">
                  <div className="flex items-center gap-1 text-purple-300">
                    <Heart className="w-3 h-3" />
                    <span className="text-xs">{post.engagement_stats?.likes || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 text-purple-300">
                    <MessageCircle className="w-3 h-3" />
                    <span className="text-xs">{post.engagement_stats?.replies || 0}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {posts.length > 3 && (
              <Button variant="ghost" className="w-full text-purple-300 hover:text-white hover:bg-purple-800/30">
                View all {posts.length} posts
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Eye className="w-12 h-12 mx-auto mb-3 text-purple-400/50" />
            <h4 className="text-lg font-semibold text-purple-200 mb-2">No Posts Yet</h4>
            <p className="text-purple-300/70">This board is waiting for its first post</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}