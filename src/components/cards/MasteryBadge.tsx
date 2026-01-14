/**
 * MasteryBadge Component
 * Shows the mastery level of a card with visual indicator
 */

import { motion } from 'framer-motion';
import { Star, Sparkles, Zap, Target, Award } from 'lucide-react';
import type { MasteryLevel } from '../../types/flashcard';
import { LEVEL_NAMES, LEVEL_COLORS } from '../../utils/progressiveDifficulty';

interface MasteryBadgeProps {
  level: MasteryLevel;
  consecutiveCorrect: number;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const LEVEL_ICONS: Record<MasteryLevel, typeof Star> = {
  0: Target,
  1: Zap,
  2: Star,
  3: Sparkles,
  4: Award,
};

export function MasteryBadge({
  level,
  consecutiveCorrect,
  showProgress = true,
  size = 'sm',
}: MasteryBadgeProps) {
  // Handle undefined or invalid levels (from old data)
  const safeLevel = (level !== undefined && level >= 0 && level <= 4 ? level : 0) as MasteryLevel;
  const safeConsecutive = consecutiveCorrect ?? 0;

  const Icon = LEVEL_ICONS[safeLevel];
  const colorClass = LEVEL_COLORS[safeLevel];

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses[size]} ${colorClass}`}
    >
      <Icon className={iconSizes[size]} />
      <span>{LEVEL_NAMES[safeLevel]}</span>

      {/* Progress indicator for levels 0-3 */}
      {showProgress && safeLevel < 4 && (
        <div className="ml-1 flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${
                i < safeConsecutive
                  ? 'bg-current opacity-100'
                  : 'bg-current opacity-30'
              }`}
            />
          ))}
        </div>
      )}

      {/* Show star for max level */}
      {safeLevel === 4 && (
        <motion.span
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ⭐
        </motion.span>
      )}
    </motion.div>
  );
}

/**
 * Shows which modes are available at current level
 */
interface ModeUnlockIndicatorProps {
  level: MasteryLevel;
  className?: string;
}

export function ModeUnlockIndicator({ level, className = '' }: ModeUnlockIndicatorProps) {
  const modeDescriptions: Record<MasteryLevel, string[]> = {
    0: ['Multiple Choice'],
    1: ['Multiple Choice', 'Type Answer (with hints)'],
    2: ['Multiple Choice', 'Type Answer', 'Flashcards'],
    3: ['Multiple Choice', 'Type Answer', 'Flashcards', 'Listening', 'Speaking'],
    4: ['All modes unlocked!'],
  };

  return (
    <div className={`text-xs text-miro-blue/60 dark:text-ink-light/60 ${className}`}>
      <span className="font-medium">Available modes:</span>{' '}
      {modeDescriptions[level].join(' • ')}
    </div>
  );
}
