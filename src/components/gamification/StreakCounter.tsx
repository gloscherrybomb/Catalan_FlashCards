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
    sm: { icon: 16, text: 'text-sm', padding: 'px-2.5 py-1' },
    md: { icon: 20, text: 'text-base', padding: 'px-3 py-1.5' },
    lg: { icon: 24, text: 'text-lg', padding: 'px-4 py-2' },
  };

  const { icon, text, padding } = sizes[size];

  // Flame color based on streak - using Miró colors
  let flameColor = 'text-miro-blue/40 dark:text-ink-light/40';
  if (streak >= 100) flameColor = 'text-miro-red';
  else if (streak >= 30) flameColor = 'text-miro-red';
  else if (streak >= 7) flameColor = 'text-miro-orange';
  else if (streak >= 1) flameColor = 'text-miro-yellow';

  return (
    <div
      className={`inline-flex items-center gap-1.5 bg-miro-orange/10 dark:bg-miro-orange/20 rounded-full ${padding} border-2 border-miro-orange/30`}
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
      <span className={`font-bold ${text} ${streak > 0 ? 'text-miro-orange' : 'text-miro-blue/40 dark:text-ink-light/40'}`}>
        {streak}
      </span>
      {progress.streakFreezeAvailable && streak > 0 && (
        <Snowflake size={12} className="text-miro-blue dark:text-ink-light" />
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
    <motion.div
      className="bg-gradient-to-br from-miro-orange to-miro-red rounded-2xl p-5 text-white relative overflow-hidden border-3 border-miro-blue/20"
      whileHover={{ y: -2 }}
    >
      {/* Decorative elements */}
      <div className="absolute -top-4 -right-4 w-16 h-16 bg-miro-yellow/20 blob" />
      <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-white/10 blob-2" />
      <motion.span
        className="absolute top-3 right-3 text-xl text-white/30"
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        ✦
      </motion.span>

      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="font-display font-bold text-xl">Daily Streak</h3>
        <StreakCounter size="lg" />
      </div>

      <div className="grid grid-cols-2 gap-3 relative z-10">
        <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 border border-white/20">
          <p className="text-white/70 text-xs mb-1 font-medium">Current</p>
          <p className="text-2xl font-display font-bold">{streak} days</p>
        </div>
        <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 border border-white/20">
          <p className="text-white/70 text-xs mb-1 font-medium">Best</p>
          <p className="text-2xl font-display font-bold">{progress.longestStreak} days</p>
        </div>
      </div>

      {multiplier > 1 && (
        <motion.div
          className="mt-4 bg-miro-yellow/20 backdrop-blur-sm rounded-xl p-3 border border-miro-yellow/30 relative z-10"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
        >
          <p className="text-sm font-medium">
            <span className="font-bold text-miro-yellow">{multiplier}x XP bonus</span> active!
            {nextMilestone > streak && (
              <span className="text-white/80">
                {' '} {nextMilestone - streak} days to next boost
              </span>
            )}
          </p>
        </motion.div>
      )}

      {progress.streakFreezeAvailable && (
        <div className="mt-4 flex items-center gap-2 text-sm text-white/80 relative z-10">
          <Snowflake size={14} className="text-white" />
          <span>Streak freeze available (protects 1 missed day)</span>
        </div>
      )}
    </motion.div>
  );
}
