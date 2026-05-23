import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Crown, TrendingUp, Zap, Star, Sparkles } from "lucide-react";

const karmaLevelThresholds = {
  "Seeker": { min: 0, max: 100, next: "Guardian" },
  "Guardian": { min: 100, max: 500, next: "Mystic" },
  "Mystic": { min: 500, max: 2000, next: "Divine" },
  "Divine": { min: 2000, max: Infinity, next: null }
};

const celestialColors = {
  "Seeker": "from-gray-400 to-gray-600",
  "Guardian": "from-blue-400 via-blue-500 to-blue-600", 
  "Mystic": "from-purple-400 via-purple-500 to-purple-600",
  "Divine": "from-yellow-300 via-yellow-400 to-yellow-500"
};

const auraGlow = {
  "Seeker": "shadow-gray-400/30",
  "Guardian": "shadow-blue-500/50",
  "Mystic": "shadow-purple-500/70", 
  "Divine": "shadow-yellow-400/80"
};

export default function KarmaOverview({ user }) {
  // Safeguard against missing user data
  if (!user || !user.karma_level || !karmaLevelThresholds[user.karma_level]) {
    return (
      <Card className="relative overflow-hidden bg-black/40 backdrop-blur-md border border-purple-700/30">
        <CardContent className="p-6">
          <div className="h-32 bg-purple-900/20 rounded-lg animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  const currentLevel = karmaLevelThresholds[user.karma_level];
  const progressPercent = currentLevel.next 
    ? ((user.karma_points - currentLevel.min) / (currentLevel.max - currentLevel.min)) * 100
    : 100;

  return (
    <Card className="relative overflow-hidden bg-black/40 backdrop-blur-md border border-purple-700/30 hover:border-purple-500/50 transition-all duration-500">
      {/* Celestial Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-violet-600/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/15 to-purple-500/15 rounded-full blur-xl"></div>
      </div>
      
      <CardHeader className="relative pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-300 via-white to-purple-300 bg-clip-text text-transparent">
            Divine Karma Resonance
          </CardTitle>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 font-semibold text-sm">+12 today</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative">
        <div className="flex items-center justify-center mb-6">
          {/* Reflective Karma Meter - Circular */}
          <div className="relative">
            <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${celestialColors[user.karma_level]} flex items-center justify-center ${auraGlow[user.karma_level]} animate-pulse`}>
              <div className="w-24 h-24 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
                <Crown className="w-8 h-8 text-white" />
              </div>
            </div>
            {/* Karma Rings */}
            <div className="absolute inset-0 rounded-full border-2 border-purple-400/30 animate-spin" style={{animationDuration: '8s'}}></div>
            <div className="absolute inset-2 rounded-full border border-violet-400/20 animate-spin" style={{animationDuration: '12s', animationDirection: 'reverse'}}></div>
            
            {/* Floating Karma Points */}
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full w-8 h-8 flex items-center justify-center text-black font-bold text-xs animate-bounce">
              {Math.floor(user.karma_points / 100)}K
            </div>
          </div>
        </div>

        <div className="text-center mb-4">
          <Badge className={`bg-gradient-to-r ${celestialColors[user.karma_level]} text-white border-0 px-4 py-1 text-sm ${auraGlow[user.karma_level]}`}>
            <Star className="w-3 h-3 mr-1" />
            {user.karma_level} Tier
          </Badge>
        </div>

        {/* Karma Points Display */}
        <div className="text-center mb-6">
          <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-white to-purple-400 bg-clip-text text-transparent mb-1">
            {user.karma_points}
          </div>
          <p className="text-purple-200/80 text-sm">Karma Essence</p>
          <div className="flex items-center justify-center gap-1 mt-2">
            <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
            <span className="text-yellow-400 text-xs font-medium">+{Math.floor(Math.random() * 20) + 5} this week</span>
          </div>
        </div>

        {/* Progress to Next Level */}
        {currentLevel.next ? (
          <div className="space-y-3">
            <div className="flex justify-between text-xs text-purple-300">
              <span>Ascension Progress</span>
              <span>{Math.round(progressPercent)}% to {currentLevel.next}</span>
            </div>
            <div className="relative">
              <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${celestialColors[user.karma_level]} rounded-full transition-all duration-1000 ${auraGlow[user.karma_level]}`}
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full animate-pulse"></div>
            </div>
            <div className="text-center text-purple-300 text-xs">
              {currentLevel.max - user.karma_points} karma to next ascension
            </div>
          </div>
        ) : (
          <div className="text-center p-4 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-lg border border-yellow-500/30">
            <Crown className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <div className="text-yellow-300 font-semibold">Divine Mastery Achieved</div>
            <p className="text-yellow-200/70 text-xs mt-1">You have transcended all levels</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}