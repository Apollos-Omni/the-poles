import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Sparkles } from 'lucide-react';

const auraColors = {
  purple: {
    gradient: 'from-purple-500 via-purple-400 to-purple-600',
    glow: 'shadow-purple-500/50',
    ring: 'border-purple-400'
  },
  gold: {
    gradient: 'from-yellow-400 via-yellow-300 to-yellow-500', 
    glow: 'shadow-yellow-500/60',
    ring: 'border-yellow-400'
  },
  blue: {
    gradient: 'from-blue-500 via-blue-400 to-blue-600',
    glow: 'shadow-blue-500/50', 
    ring: 'border-blue-400'
  },
  green: {
    gradient: 'from-emerald-500 via-emerald-400 to-emerald-600',
    glow: 'shadow-emerald-500/50',
    ring: 'border-emerald-400'
  }
};

export default function AuraDisplay({ 
  user, 
  size = 'md', 
  showLevel = true, 
  animated = true 
}) {
  const auraColor = user?.aura_color || 'purple';
  const colors = auraColors[auraColor];
  
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  return (
    <div className="relative">
      {/* Outer aura rings */}
      {animated && (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className={`absolute -inset-2 rounded-full border-2 ${colors.ring} opacity-30`}
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className={`absolute -inset-1 rounded-full border ${colors.ring} opacity-20`}
          />
        </>
      )}
      
      {/* Main avatar */}
      <div className={`relative ${sizes[size]} rounded-full bg-gradient-to-br ${colors.gradient} p-0.5 ${colors.glow} ${animated ? 'animate-pulse' : ''}`}>
        <div className="w-full h-full rounded-full bg-black/80 flex items-center justify-center relative overflow-hidden">
          {user?.avatar_url ? (
            <img 
              src={user.avatar_url}
              alt={user.full_name}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <Crown className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-8 h-8'} text-white`} />
          )}
          
          {/* Aura overlay */}
          <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-20 rounded-full`}></div>
        </div>
      </div>

      {/* Level badge */}
      {showLevel && user?.karma_level && (
        <div className="absolute -bottom-1 -right-1 bg-black/80 border border-purple-500/50 rounded-full px-2 py-0.5">
          <span className="text-xs font-medium text-purple-200">{user.karma_level}</span>
        </div>
      )}
      
      {/* Floating particles */}
      {animated && Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -20, 0],
            x: [0, Math.sin(i) * 10, 0],
            opacity: [0.3, 1, 0.3]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.7,
            ease: "easeInOut"
          }}
          className={`absolute ${
            i === 0 ? '-top-2 -right-1' : 
            i === 1 ? '-bottom-1 -left-2' : 
            '-top-1 left-1/2'
          }`}
        >
          <Sparkles className={`w-2 h-2 ${colors.ring.replace('border-', 'text-')}`} />
        </motion.div>
      ))}
    </div>
  );
}