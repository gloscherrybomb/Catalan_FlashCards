/**
 * DifficultyIndicator - Miró-inspired difficulty level display
 *
 * Shows the user's adaptive difficulty level (1-10) with:
 * - Gradient pill visualization
 * - Trend arrow (up/down/stable)
 * - Tooltip with explanation
 * - Playful organic blob decorations
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';
import type { DifficultyProfile } from '../../types/adaptiveLearning';

interface DifficultyIndicatorProps {
  profile: DifficultyProfile;
  size?: 'sm' | 'md' | 'lg';
  showTrend?: boolean;
  showTooltip?: boolean;
}

// Miró-inspired color stops for difficulty gradient
const getDifficultyColors = (level: number): string => {
  if (level <= 3) return 'from-miro-green via-emerald-400 to-miro-green';
  if (level <= 5) return 'from-miro-yellow via-amber-400 to-miro-orange';
  if (level <= 7) return 'from-miro-orange via-orange-500 to-miro-red';
  return 'from-miro-red via-red-600 to-rose-700';
};

const getDifficultyLabel = (level: number): string => {
  if (level <= 2) return 'Beginner';
  if (level <= 4) return 'Easy';
  if (level <= 6) return 'Medium';
  if (level <= 8) return 'Hard';
  return 'Expert';
};

const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
  switch (trend) {
    case 'up':
      return <TrendingUp className="w-4 h-4 text-miro-green" />;
    case 'down':
      return <TrendingDown className="w-4 h-4 text-miro-red" />;
    default:
      return <Minus className="w-4 h-4 text-miro-blue/50" />;
  }
};

export function DifficultyIndicator({
  profile,
  size = 'md',
  showTrend = true,
  showTooltip = true,
}: DifficultyIndicatorProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { globalLevel, recentTrend } = profile;

  const sizeClasses = {
    sm: 'h-6 text-xs',
    md: 'h-8 text-sm',
    lg: 'h-10 text-base',
  };

  const pillWidth = {
    sm: 'w-24',
    md: 'w-32',
    lg: 'w-40',
  };

  return (
    <div className="relative inline-flex items-center gap-2">
      {/* Main difficulty pill */}
      <motion.div
        className={`relative ${pillWidth[size]} ${sizeClasses[size]} rounded-full overflow-hidden cursor-pointer`}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Background track */}
        <div className="absolute inset-0 bg-miro-blue/10 dark:bg-ink-light/10 rounded-full" />

        {/* Filled portion with gradient */}
        <motion.div
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getDifficultyColors(globalLevel)} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${(globalLevel / 10) * 100}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        />

        {/* Organic blob decoration */}
        <motion.div
          className="absolute -right-1 top-1/2 -translate-y-1/2 w-6 h-6 opacity-20"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          <svg viewBox="0 0 24 24" className="w-full h-full fill-current text-miro-blue dark:text-ink-light">
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z" />
          </svg>
        </motion.div>

        {/* Level number and label */}
        <div className="relative z-10 flex items-center justify-between h-full px-3">
          <span className="font-bold text-white drop-shadow-sm">
            Lv. {globalLevel}
          </span>
          <span className="font-medium text-white/90 drop-shadow-sm text-xs">
            {getDifficultyLabel(globalLevel)}
          </span>
        </div>

        {/* Sparkle decoration on high levels */}
        {globalLevel >= 8 && (
          <motion.div
            className="absolute top-0 right-2"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 15, -15, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-3 h-3 text-miro-yellow" />
          </motion.div>
        )}
      </motion.div>

      {/* Trend indicator */}
      {showTrend && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-ink-dark shadow-sm border-2 border-miro-blue/10 dark:border-ink-light/10"
        >
          {getTrendIcon(recentTrend)}
        </motion.div>
      )}

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute top-full left-0 mt-2 z-50"
          >
            <div className="bg-white dark:bg-ink-dark rounded-xl shadow-playful border-3 border-miro-blue dark:border-ink-light p-3 min-w-48">
              {/* Miró-style decorative dots */}
              <div className="absolute -top-1 left-4 w-2 h-2 rounded-full bg-miro-red" />
              <div className="absolute -top-1 left-8 w-1.5 h-1.5 rounded-full bg-miro-yellow" />

              <h4 className="font-bold text-miro-blue dark:text-ink-light text-sm mb-1">
                Adaptive Difficulty
              </h4>
              <p className="text-xs text-miro-blue/70 dark:text-ink-light/70 mb-2">
                Adjusts based on your performance
              </p>

              {/* Mini level dots */}
              <div className="flex gap-1 mb-2">
                {[...Array(10)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full border-2 ${
                      i < globalLevel
                        ? 'bg-gradient-to-br from-miro-yellow to-miro-orange border-miro-orange'
                        : 'bg-transparent border-miro-blue/20 dark:border-ink-light/20'
                    }`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                  />
                ))}
              </div>

              {/* Trend explanation */}
              <div className="flex items-center gap-2 text-xs">
                {getTrendIcon(recentTrend)}
                <span className="text-miro-blue/70 dark:text-ink-light/70">
                  {recentTrend === 'up' && 'Difficulty increasing!'}
                  {recentTrend === 'down' && 'Difficulty decreasing'}
                  {recentTrend === 'stable' && 'Difficulty stable'}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
