import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useUserStore } from '../../stores/userStore';
import { getLevelForXP, getXPForNextLevel } from '../../types/gamification';

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
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: level.color }}
        >
          {level.level}
        </div>
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: level.color }}
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress.progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <span className="text-xs text-gray-500">{progress.xp} XP</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-md">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: level.color }}
          >
            {level.level}
          </div>
          <div>
            <p className="font-bold text-gray-800">{level.title}</p>
            <p className="text-xs text-gray-500">{level.titleCatalan}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-primary font-bold">
          <Zap size={18} className="text-yellow-500 fill-yellow-500" />
          <span>{progress.xp} XP</span>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress to Level {level.level + 1}</span>
          <span>{xpProgress.current} / {xpProgress.required} XP</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress.progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  );
}
