import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Zap, Shield } from 'lucide-react';
import confetti from 'canvas-confetti';

interface StreakMilestoneProps {
  show: boolean;
  streak: number;
  milestone: number;
  multiplier: number;
  onClose: () => void;
}

const MILESTONE_INFO: Record<number, { title: string; emoji: string; color: string }> = {
  7: { title: 'Week Warrior', emoji: '🔥', color: 'from-orange-400 to-orange-600' },
  14: { title: 'Fortnight Fighter', emoji: '💪', color: 'from-orange-500 to-red-500' },
  30: { title: 'Monthly Master', emoji: '💎', color: 'from-red-400 to-pink-500' },
  60: { title: 'Two Month Titan', emoji: '🏆', color: 'from-pink-500 to-purple-500' },
  100: { title: 'Century Champion', emoji: '👑', color: 'from-yellow-400 to-orange-500' },
  365: { title: 'Yearly Legend', emoji: '🌟', color: 'from-yellow-300 to-yellow-500' },
};

export function StreakMilestone({
  show,
  streak,
  milestone,
  multiplier,
  onClose,
}: StreakMilestoneProps) {
  const info = MILESTONE_INFO[milestone] || {
    title: `${milestone} Day Streak`,
    emoji: '🔥',
    color: 'from-orange-400 to-red-500',
  };

  useEffect(() => {
    if (show) {
      // Fire confetti
      const colors = ['#E63946', '#F4A261', '#E9C46A'];

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: colors,
      });

      // Auto-close after 4 seconds
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0, y: 100 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: -100 }}
            transition={{ type: 'spring', damping: 15 }}
            className={`bg-gradient-to-br ${info.color} rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated flames background */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-4xl opacity-20"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.1, 0.3, 0.1],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1.5 + Math.random(),
                  delay: i * 0.2,
                  repeat: Infinity,
                }}
              >
                🔥
              </motion.div>
            ))}

            <div className="relative z-10">
              {/* Emoji */}
              <motion.div
                className="text-7xl text-center mb-4"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
              >
                {info.emoji}
              </motion.div>

              {/* Title */}
              <h2 className="text-3xl font-display font-bold text-center mb-2">
                {info.title}
              </h2>

              {/* Streak count */}
              <motion.div
                className="flex items-center justify-center gap-2 mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Flame className="w-8 h-8 fill-current" />
                <span className="text-5xl font-display font-bold">{streak}</span>
                <span className="text-xl opacity-80">days</span>
              </motion.div>

              {/* Bonus info */}
              <motion.div
                className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Zap className="w-5 h-5" />
                  <span className="font-bold text-xl">{multiplier}x XP Bonus</span>
                </div>
                <p className="text-sm opacity-80">
                  All XP earned now has a {Math.round((multiplier - 1) * 100)}% bonus!
                </p>
              </motion.div>

              {/* Streak freeze reminder */}
              <motion.div
                className="flex items-center justify-center gap-2 mt-4 text-sm opacity-80"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                transition={{ delay: 0.7 }}
              >
                <Shield className="w-4 h-4" />
                <span>Remember: Streak freeze protects against 1 missed day</span>
              </motion.div>
            </div>

            {/* Tap to continue */}
            <motion.p
              className="text-center text-xs opacity-60 mt-6"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Tap anywhere to continue
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Session completion celebration
interface SessionCompleteCelebrationProps {
  show: boolean;
  accuracy: number;
  cardsReviewed: number;
  xpEarned: number;
  perfectStreak: number;
  onClose: () => void;
}

export function SessionCompleteCelebration({
  show,
  accuracy,
  cardsReviewed,
  xpEarned,
  perfectStreak,
  onClose,
}: SessionCompleteCelebrationProps) {
  const isGreatSession = accuracy >= 80;
  const isPerfectSession = accuracy >= 95;

  useEffect(() => {
    if (show && isGreatSession) {
      confetti({
        particleCount: isPerfectSession ? 150 : 50,
        spread: isPerfectSession ? 100 : 60,
        origin: { y: 0.7 },
      });
    }
  }, [show, isGreatSession, isPerfectSession]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            className="bg-white dark:bg-ink-dark rounded-3xl p-8 shadow-2xl max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <motion.div
                className="text-6xl mb-2"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                {isPerfectSession ? '🌟' : isGreatSession ? '🎉' : '👍'}
              </motion.div>
              <h2 className="text-2xl font-display font-bold text-miro-blue dark:text-ink-light">
                {isPerfectSession
                  ? 'Perfect Session!'
                  : isGreatSession
                  ? 'Great Job!'
                  : 'Session Complete'}
              </h2>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-miro-blue/5 dark:bg-ink-light/5 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-miro-blue dark:text-ink-light">
                  {cardsReviewed}
                </p>
                <p className="text-xs text-miro-blue/60 dark:text-ink-light/60">Cards</p>
              </div>
              <div className="bg-miro-blue/5 dark:bg-ink-light/5 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-miro-green">{accuracy}%</p>
                <p className="text-xs text-miro-blue/60 dark:text-ink-light/60">Accuracy</p>
              </div>
              <div className="bg-miro-yellow/10 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-miro-orange">+{xpEarned}</p>
                <p className="text-xs text-miro-blue/60 dark:text-ink-light/60">XP Earned</p>
              </div>
              <div className="bg-miro-blue/5 dark:bg-ink-light/5 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-miro-blue dark:text-ink-light">
                  {perfectStreak}
                </p>
                <p className="text-xs text-miro-blue/60 dark:text-ink-light/60">
                  Best Streak
                </p>
              </div>
            </div>

            {/* Continue button */}
            <motion.button
              className="w-full py-3 bg-miro-blue text-white rounded-xl font-semibold"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
            >
              Continue
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
