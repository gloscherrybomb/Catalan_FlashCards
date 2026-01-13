import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Upload, Flame, Zap } from 'lucide-react';
import { Button } from '../ui/Button';
import { useUserStore } from '../../stores/userStore';
import { getLevelForXP } from '../../types/gamification';

interface HeroSectionProps {
  cardsDue: number;
  hasCards: boolean;
}

export function HeroSection({ cardsDue, hasCards }: HeroSectionProps) {
  const progress = useUserStore((state) => state.progress);
  const level = getLevelForXP(progress.xp);
  const streak = progress.currentStreak;

  // Flame color based on streak
  let flameColor = 'text-miro-blue/40';
  if (streak >= 30) flameColor = 'text-miro-red';
  else if (streak >= 7) flameColor = 'text-miro-orange';
  else if (streak >= 1) flameColor = 'text-miro-yellow';

  return (
    <motion.div
      className="relative mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 12 }}
    >
      {/* Decorative background blob */}
      <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-miro-yellow/10 blob animate-pulse-blob" />

      {/* Header row: Greeting + Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        {/* Greeting */}
        <div className="flex items-center gap-3">
          <motion.span
            className="text-2xl text-miro-yellow"
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            ✦
          </motion.span>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-miro-blue dark:text-ink-light">
            Hola!
          </h1>
        </div>

        {/* Compact Stats Row */}
        <div className="flex items-center gap-3">
          {/* Streak */}
          <motion.div
            className="flex items-center gap-1.5 px-3 py-1.5 bg-miro-orange/10 dark:bg-miro-orange/20 rounded-full border-2 border-miro-orange/30"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              animate={streak > 0 ? { scale: [1, 1.2, 1], rotate: [-5, 5, -5] } : {}}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            >
              <Flame
                size={18}
                className={`${flameColor} ${streak > 0 ? 'fill-current' : ''}`}
              />
            </motion.div>
            <span className={`font-bold text-sm ${streak > 0 ? 'text-miro-orange' : 'text-miro-blue/40 dark:text-ink-light/40'}`}>
              {streak}
            </span>
          </motion.div>

          {/* XP & Level */}
          <motion.div
            className="flex items-center gap-2 px-3 py-1.5 bg-miro-yellow/10 dark:bg-miro-yellow/20 rounded-full border-2 border-miro-yellow/30"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs"
              style={{ backgroundColor: level.color }}
            >
              {level.level}
            </motion.div>
            <Zap size={14} className="text-miro-yellow fill-miro-yellow" />
            <span className="font-bold text-sm text-miro-blue dark:text-ink-light">
              {progress.xp.toLocaleString()}
            </span>
          </motion.div>
        </div>
      </div>

      {/* Subtitle */}
      <p className="text-lg text-miro-blue/70 dark:text-ink-light/70 font-medium mb-6">
        {hasCards
          ? cardsDue > 0
            ? `You have ${cardsDue} cards waiting for review`
            : `All caught up! Great work!`
          : 'Ready to start your Catalan journey?'}
      </p>

      {/* Primary CTA */}
      {hasCards ? (
        <Link to="/study" className="block">
          <Button
            size="xl"
            className="w-full sm:w-auto"
            leftIcon={<Play size={24} className="ml-0.5" />}
          >
            Start Studying
            {cardsDue > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-sm">
                {cardsDue} due
              </span>
            )}
          </Button>
        </Link>
      ) : (
        <Link to="/import" className="block">
          <Button
            size="xl"
            className="w-full sm:w-auto"
            leftIcon={<Upload size={24} />}
          >
            Import Your First Cards
          </Button>
        </Link>
      )}
    </motion.div>
  );
}
