
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Eye, Star, Sparkles, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const categoryColors = {
  personal: "from-purple-500 to-purple-600",
  community: "from-green-500 to-green-600",
  spiritual: "from-yellow-500 to-yellow-600",
  professional: "from-blue-500 to-blue-600",
  health: "from-red-500 to-red-600",
  relationships: "from-pink-500 to-pink-600"
};

export default function VisionBoard({ visions }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <Target className="w-7 h-7 text-purple-400" />
          Vision Board
          <span className="text-sm font-normal text-purple-300">({visions.length} active)</span>
        </h2>
        <Link to={createPageUrl("VisionTracker")}>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg hover:from-purple-500 hover:to-purple-600 transition-all duration-300">
            <Plus className="w-4 h-4" />
            New Vision
          </button>
        </Link>
      </div>

      {visions.length === 0 ? (
        <Card className="bg-gradient-to-br from-purple-900/40 to-black/40 backdrop-blur-sm border border-purple-700/30 p-8 text-center">
          <Star className="w-12 h-12 mx-auto mb-4 text-purple-400/50" />
          <h3 className="text-lg font-semibold mb-2 text-purple-200">No Active Visions</h3>
          <p className="text-purple-300/70 mb-4">Share your dreams and aspirations with the universe.</p>
          <Link to={createPageUrl("VisionTracker")}>
            <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg hover:from-purple-500 hover:to-purple-600 transition-all duration-300">
              Create Your First Vision
            </button>
          </Link>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {visions.map((vision) => (
            <Card key={vision.id} className="bg-gradient-to-br from-purple-900/40 to-black/40 backdrop-blur-sm border border-purple-700/30 hover:border-purple-500/50 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="text-lg font-semibold text-purple-100 leading-tight">{vision.title}</h4>
                  <Badge className={`bg-gradient-to-r ${categoryColors[vision.category]} text-white border-0 text-xs`}>
                    {vision.category}
                  </Badge>
                </div>
                
                <p className="text-purple-200/80 text-sm mb-4 line-clamp-2">
                  {vision.description}
                </p>
                
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-purple-300">Progress</span>
                    <span className="text-purple-300">{vision.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`bg-gradient-to-r ${categoryColors[vision.category]} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${vision.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Karma Reward */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-purple-700/30">
                  <div className="flex items-center gap-2 text-yellow-400 text-sm">
                    <Sparkles className="w-4 h-4" />
                    +{vision.karma_reward} karma reward
                  </div>
                  {vision.target_date && (
                    <div className="text-xs text-purple-300">
                      Target: {new Date(vision.target_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
