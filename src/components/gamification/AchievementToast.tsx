import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Achievement } from '../../types/gamification';

interface AchievementToastProps {
  achievement: Achievement;
  onDismiss: () => void;
}

export function AchievementToast({ achievement, onDismiss }: AchievementToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const rarityColors = {
    common: 'from-gray-400 to-gray-500',
    uncommon: 'from-green-400 to-green-500',
    rare: 'from-blue-400 to-blue-500',
    epic: 'from-purple-400 to-purple-500',
    legendary: 'from-yellow-400 to-orange-500',
  };

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className="fixed top-4 right-4 z-50"
    >
      <div className={`bg-gradient-to-r ${rarityColors[achievement.rarity]} rounded-2xl p-1 shadow-2xl`}>
        <div className="bg-white rounded-xl p-4 flex items-center gap-4">
          <div className="text-4xl">{achievement.icon}</div>
          <div className="flex-1">
            <p className="text-xs font-medium text-primary uppercase tracking-wide">
              Achievement Unlocked!
            </p>
            <p className="font-bold text-gray-800">{achievement.name}</p>
            <p className="text-sm text-gray-500">{achievement.description}</p>
            <p className="text-xs text-primary font-medium mt-1">
              +{achievement.xpReward} XP
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={16} className="text-gray-400" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Container to manage multiple toasts
export function AchievementToastContainer() {
  const [toasts, setToasts] = useState<Achievement[]>([]);

  // This would be connected to achievement unlock events
  // For now, it's a placeholder

  return (
    <AnimatePresence>
      {toasts.map((achievement, index) => (
        <motion.div
          key={achievement.id}
          initial={{ y: index * 100 }}
          animate={{ y: index * 100 }}
        >
          <AchievementToast
            achievement={achievement}
            onDismiss={() => setToasts(t => t.filter(a => a.id !== achievement.id))}
          />
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
