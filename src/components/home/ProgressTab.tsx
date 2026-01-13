import { motion } from 'framer-motion';
import { XPBar } from '../gamification/XPBar';
import { StreakCard } from '../gamification/StreakCounter';
import { Card, CardTitle } from '../ui/Card';
import { ProgressRing } from '../ui/ProgressRing';

interface CategoryStats {
  [key: string]: {
    total: number;
    mastered: number;
    learning: number;
  };
}

interface ProgressTabProps {
  masteryProgress: number;
  masteredCards: number;
  totalCards: number;
  categoryStats: CategoryStats;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 12 },
  },
};

const categoryColors = [
  'from-miro-red to-miro-orange',
  'from-miro-orange to-miro-yellow',
  'from-miro-green to-miro-blue',
  'from-miro-blue to-miro-green',
  'from-miro-yellow to-miro-red',
];

export function ProgressTab({
  masteryProgress,
  masteredCards,
  totalCards,
  categoryStats,
}: ProgressTabProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
    >
      {/* Stats Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
      >
        {/* XP & Level */}
        <XPBar />

        {/* Streak */}
        <StreakCard />

        {/* Mastery Progress */}
        <Card variant="bordered">
          <CardTitle>Overall Progress</CardTitle>
          <div className="flex items-center justify-center mt-4">
            <ProgressRing
              progress={masteryProgress}
              size={120}
              color="#2A9D8F"
            >
              <div className="text-center">
                <p className="text-3xl font-display font-bold text-miro-blue dark:text-ink-light">
                  {masteryProgress}%
                </p>
                <p className="text-xs text-miro-blue/60 dark:text-ink-light/60 font-medium">
                  Mastered
                </p>
              </div>
            </ProgressRing>
          </div>
          <div className="mt-4 flex justify-between text-sm text-miro-blue/60 dark:text-ink-light/60">
            <span>{masteredCards} mastered</span>
            <span>{totalCards} total</span>
          </div>
        </Card>
      </motion.div>

      {/* Categories Breakdown */}
      {Object.keys(categoryStats).length > 0 && (
        <motion.div variants={itemVariants}>
          <Card variant="bordered">
            <CardTitle>Categories</CardTitle>
            <div className="mt-5 space-y-4">
              {Object.entries(categoryStats).map(([category, stats], index) => {
                const categoryProgress = stats.total > 0
                  ? Math.round((stats.mastered / stats.total) * 100)
                  : 0;

                return (
                  <div key={category}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold text-miro-blue dark:text-ink-light">
                        {category}
                      </span>
                      <span className="text-miro-blue/60 dark:text-ink-light/60">
                        {stats.mastered}/{stats.total} mastered
                      </span>
                    </div>
                    <div className="h-3 bg-miro-blue/10 dark:bg-ink-light/10 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full bg-gradient-to-r ${categoryColors[index % categoryColors.length]} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${categoryProgress}%` }}
                        transition={{ duration: 0.8, delay: 0.1 * index, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Empty state when no categories */}
      {Object.keys(categoryStats).length === 0 && (
        <motion.div
          variants={itemVariants}
          className="text-center py-8"
        >
          <p className="text-miro-blue/60 dark:text-ink-light/60">
            Import cards to see your progress by category.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
