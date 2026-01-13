import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { DailyChallenges } from '../gamification/DailyChallenges';
import { WeeklyChallenges } from '../gamification/WeeklyChallenges';
import type { DailyChallenge } from '../../types/challenges';
import type { WeeklyChallenge } from '../../types/weeklyChallenges';

interface ChallengesTabProps {
  dailyChallenges: DailyChallenge[];
  weeklyChallenges: WeeklyChallenge[];
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 12 },
  },
};

export function ChallengesTab({ dailyChallenges, weeklyChallenges }: ChallengesTabProps) {
  const hasAnyChallenges = dailyChallenges.length > 0 || weeklyChallenges.length > 0;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
    >
      {/* Daily Challenges */}
      <motion.div variants={itemVariants} className="mb-8">
        <DailyChallenges challenges={dailyChallenges} />
      </motion.div>

      {/* Weekly Challenges */}
      {weeklyChallenges.length > 0 && (
        <motion.div variants={itemVariants}>
          <WeeklyChallenges challenges={weeklyChallenges} />
        </motion.div>
      )}

      {/* Empty state */}
      {!hasAnyChallenges && (
        <motion.div
          variants={itemVariants}
          className="text-center py-12"
        >
          <motion.div
            className="w-20 h-20 mx-auto mb-4 bg-miro-yellow/10 blob flex items-center justify-center"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Trophy size={36} className="text-miro-yellow" />
          </motion.div>
          <h3 className="text-xl font-display font-bold text-miro-blue dark:text-ink-light mb-2">
            Challenges Loading...
          </h3>
          <p className="text-miro-blue/60 dark:text-ink-light/60 max-w-sm mx-auto">
            Daily and weekly challenges will appear here. Start studying to unlock them!
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
