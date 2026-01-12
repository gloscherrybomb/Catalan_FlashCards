import { motion } from 'framer-motion';
import { Flame, Snowflake } from 'lucide-react';
import { useUserStore } from '../../stores/userStore';

interface StreakCounterProps {
  size?: 'sm' | 'md' | 'lg';
}

export function StreakCounter({ size = 'md' }: StreakCounterProps) {
  const progress = useUserStore((state) => state.progress);
  const streak = progress.currentStreak;

  const sizes = {
    sm: { icon: 16, text: 'text-sm', padding: 'px-2 py-1' },
    md: { icon: 20, text: 'text-base', padding: 'px-3 py-1.5' },
    lg: { icon: 24, text: 'text-lg', padding: 'px-4 py-2' },
  };

  const { icon, text, padding } = sizes[size];

  // Flame color based on streak
  let flameColor = 'text-gray-400';
  if (streak >= 100) flameColor = 'text-purple-500';
  else if (streak >= 30) flameColor = 'text-red-500';
  else if (streak >= 7) flameColor = 'text-orange-500';
  else if (streak >= 1) flameColor = 'text-yellow-500';

  return (
    <div
      className={`inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-50 to-red-50 rounded-full ${padding}`}
    >
      <motion.div
        animate={streak > 0 ? {
          scale: [1, 1.2, 1],
          rotate: [-5, 5, -5],
        } : {}}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatDelay: 2,
        }}
      >
        <Flame size={icon} className={`${flameColor} ${streak > 0 ? 'fill-current' : ''}`} />
      </motion.div>
      <span className={`font-bold ${text} ${streak > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
        {streak}
      </span>
      {progress.streakFreezeAvailable && streak > 0 && (
        <Snowflake size={12} className="text-blue-400" />
      )}
    </div>
  );
}

export function StreakCard() {
  const progress = useUserStore((state) => state.progress);
  const streak = progress.currentStreak;

  // Calculate streak multiplier
  let multiplier = 1;
  let nextMilestone = 7;
  if (streak >= 100) {
    multiplier = 1.5;
    nextMilestone = streak;
  } else if (streak >= 60) {
    multiplier = 1.4;
    nextMilestone = 100;
  } else if (streak >= 30) {
    multiplier = 1.25;
    nextMilestone = 60;
  } else if (streak >= 14) {
    multiplier = 1.15;
    nextMilestone = 30;
  } else if (streak >= 7) {
    multiplier = 1.1;
    nextMilestone = 14;
  }

  return (
    <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-5 text-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg">Daily Streak</h3>
        <StreakCounter size="lg" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/20 rounded-xl p-3">
          <p className="text-white/70 text-xs mb-1">Current</p>
          <p className="text-2xl font-bold">{streak} days</p>
        </div>
        <div className="bg-white/20 rounded-xl p-3">
          <p className="text-white/70 text-xs mb-1">Best</p>
          <p className="text-2xl font-bold">{progress.longestStreak} days</p>
        </div>
      </div>

      {multiplier > 1 && (
        <div className="mt-4 bg-white/20 rounded-xl p-3">
          <p className="text-sm">
            <span className="font-bold">{multiplier}x XP bonus</span> active!
            {nextMilestone > streak && (
              <span className="text-white/70">
                {' '}• {nextMilestone - streak} days to next boost
              </span>
            )}
          </p>
        </div>
      )}

      {progress.streakFreezeAvailable && (
        <div className="mt-4 flex items-center gap-2 text-sm text-white/80">
          <Snowflake size={14} />
          <span>Streak freeze available (protects 1 missed day)</span>
        </div>
      )}
    </div>
  );
}
