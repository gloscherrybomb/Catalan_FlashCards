import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useUserStore } from '../../stores/userStore';
import { getLevelForXP, getXPForNextLevel } from '../../types/gamification';
import { Card, CardTitle } from '../ui/Card';

interface XPBarProps {
  compact?: boolean;
}

export function XPBar({ compact = false }: XPBarProps) {
  const progress = useUserStore((state) => state.progress);
  const level = getLevelForXP(progress.xp);
  const xpProgress = getXPForNextLevel(progress.xp);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <motion.div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm blob"
          style={{ backgroundColor: level.color }}
          whileHover={{ scale: 1.1 }}
        >
          {level.level}
        </motion.div>
        <div className="flex-1 h-2.5 bg-miro-blue/10 dark:bg-ink-light/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: level.color }}
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress.progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <span className="text-xs text-miro-blue/60 dark:text-ink-light/60 font-medium">{progress.xp} XP</span>
      </div>
    );
  }

  return (
    <Card variant="bordered" className="relative overflow-hidden">
      {/* Decorative star */}
      <motion.span
        className="absolute -top-1 -right-1 text-2xl text-miro-yellow"
        animate={{ rotate: [0, 15, -15, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
      >
        ✦
      </motion.span>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-12 h-12 blob flex items-center justify-center text-white font-display font-bold text-xl"
            style={{ backgroundColor: level.color }}
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            {level.level}
          </motion.div>
          <div>
            <CardTitle className="text-lg">{level.title}</CardTitle>
            <p className="text-xs text-miro-blue/60 dark:text-ink-light/60 font-medium italic">
              {level.titleCatalan}
            </p>
          </div>
        </div>
        <motion.div
          className="flex items-center gap-1.5 text-miro-yellow font-bold"
          whileHover={{ scale: 1.05 }}
        >
          <Zap size={20} className="fill-miro-yellow text-miro-yellow" />
          <span className="text-miro-blue dark:text-ink-light">{progress.xp} XP</span>
        </motion.div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-xs text-miro-blue/60 dark:text-ink-light/60 mb-2 font-medium">
          <span>Progress to Level {level.level + 1}</span>
          <span>{xpProgress.current} / {xpProgress.required} XP</span>
        </div>
        <div className="h-4 bg-miro-blue/10 dark:bg-ink-light/10 rounded-full overflow-hidden border-2 border-miro-blue/20 dark:border-ink-light/20">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-miro-red via-miro-orange to-miro-yellow"
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress.progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>
    </Card>
  );
}
