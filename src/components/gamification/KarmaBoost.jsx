import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Crown, Zap, Star } from 'lucide-react';

export default function KarmaBoost({ amount, trigger, onComplete }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (amount > 0) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete && onComplete();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [amount, onComplete]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.5, y: -50 }}
        className="fixed bottom-20 right-6 z-50 pointer-events-none"
      >
        {/* Main boost notification */}
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-4 shadow-2xl border-2 border-yellow-400 min-w-[200px]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
              <Crown className="w-5 h-5 text-yellow-900" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-yellow-900 text-sm">Karma Boost!</p>
              <p className="text-yellow-800 text-xs">{trigger}</p>
            </div>
            <div className="text-right">
              <p className="font-black text-xl text-yellow-900">+{amount}</p>
            </div>
          </div>
        </div>

        {/* Floating particles */}
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            animate={{ 
              opacity: 0, 
              scale: 0.3, 
              x: (Math.random() - 0.5) * 100,
              y: (Math.random() - 0.5) * 100 
            }}
            transition={{ 
              duration: 2, 
              delay: i * 0.1,
              ease: "easeOut"
            }}
            className="absolute top-4 left-4"
          >
            {i % 3 === 0 ? (
              <Sparkles className="w-4 h-4 text-yellow-400" />
            ) : i % 3 === 1 ? (
              <Star className="w-3 h-3 text-yellow-300" />
            ) : (
              <Zap className="w-3 h-3 text-yellow-500" />
            )}
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}