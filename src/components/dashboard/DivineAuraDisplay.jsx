import React from 'react';
import { Crown, Sparkles, Zap, Star } from "lucide-react";

const celestialAuras = {
  "purple": "from-purple-400 via-purple-500 to-purple-600",
  "gold": "from-yellow-300 via-yellow-400 to-yellow-500", 
  "silver": "from-gray-300 via-gray-400 to-gray-500",
  "blue": "from-blue-400 via-blue-500 to-blue-600",
  "green": "from-emerald-400 via-emerald-500 to-emerald-600",
  "white": "from-gray-200 via-white to-gray-200",
  "rainbow": "from-purple-400 via-blue-400 via-green-400 via-yellow-400 to-red-400"
};

const auraGlow = {
  "purple": "shadow-purple-500/60",
  "gold": "shadow-yellow-400/70", 
  "silver": "shadow-gray-300/50",
  "blue": "shadow-blue-500/60",
  "green": "shadow-emerald-500/60",
  "white": "shadow-white/50",
  "rainbow": "shadow-purple-500/60"
};

export default function DivineAuraDisplay({ user }) {
  const auraColor = user.aura_color || 'purple';
  const auraLevel = user.divine_aura_level || 0;
  const karmaLevel = user.karma_level || 'Seeker';
  
  return (
    <div className="relative">
      {/* Multi-Layer Aura System */}
      <div className="relative">
        {/* Outer Aura Ring */}
        <div className={`absolute -inset-3 rounded-full bg-gradient-to-br ${celestialAuras[auraColor]} opacity-20 animate-pulse blur-sm`}></div>
        
        {/* Middle Karma Ring */}
        <div className={`absolute -inset-2 rounded-full border-2 border-gradient-to-r ${celestialAuras[auraColor]} opacity-40 animate-spin`} style={{animationDuration: '8s'}}></div>
        
        {/* Inner Aura Container */}
        <div className={`relative w-16 h-16 rounded-full bg-gradient-to-br ${celestialAuras[auraColor]} p-1 ${auraGlow[auraColor]} animate-pulse`}>
          {/* Avatar Background */}
          <div className="relative w-full h-full rounded-full bg-black/80 overflow-hidden border-2 border-white/20">
            {user.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-black">
                <Crown className="w-6 h-6 text-purple-300" />
              </div>
            )}
            
            {/* Celestial Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-purple-500/10 to-transparent"></div>
          </div>
          
          {/* Divine Level Indicator */}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-xs border-2 border-yellow-300 animate-bounce">
            {Math.floor(auraLevel / 10) || 1}
          </div>
        </div>
        
        {/* Karma Tier Badge */}
        <div className="absolute -top-2 -left-2 bg-black/80 backdrop-blur-sm border border-purple-500/30 rounded-full px-2 py-1">
          <span className="text-purple-300 text-xs font-medium">{karmaLevel}</span>
        </div>
      </div>
      
      {/* Floating Aura Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <Sparkles className={`absolute -top-1 -right-1 w-3 h-3 text-${auraColor === 'gold' ? 'yellow' : 'purple'}-400 animate-pulse`} />
        <Zap className={`absolute -bottom-1 -left-1 w-3 h-3 text-${auraColor === 'gold' ? 'yellow' : 'purple'}-400 animate-bounce`} style={{animationDelay: '0.5s'}} />
        <Star className={`absolute top-1 left-8 w-2 h-2 text-${auraColor === 'gold' ? 'yellow' : 'purple'}-300 animate-ping`} style={{animationDelay: '1s'}} />
      </div>
      
      {/* Aura Energy Trails */}
      <div className="absolute inset-0 opacity-30">
        <div className={`absolute top-0 left-1/2 w-px h-8 bg-gradient-to-t ${celestialAuras[auraColor]} animate-pulse`}></div>
        <div className={`absolute bottom-0 right-1/2 w-px h-6 bg-gradient-to-b ${celestialAuras[auraColor]} animate-pulse`} style={{animationDelay: '0.7s'}}></div>
      </div>
    </div>
  );
}