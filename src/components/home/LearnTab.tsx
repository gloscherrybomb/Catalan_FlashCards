import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Zap, BookOpen, ArrowRight, Upload, GraduationCap } from 'lucide-react';
import { Card, CardTitle, DecorativeCard } from '../ui/Card';
import { WordOfTheDay } from '../gamification/WordOfTheDay';
import { DailyRecommendations } from '../adaptive';
import type { DailyRecommendation } from '../../types/adaptiveLearning';

interface LearnTabProps {
  hasCards: boolean;
  uniqueCardsDue: number;
  dueCount: number;
  totalCards: number;
  recommendations: DailyRecommendation | null;
  onStartSession: () => void;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 12 },
  },
};

export function LearnTab({
  hasCards,
  uniqueCardsDue,
  dueCount,
  totalCards,
  recommendations,
  onStartSession,
}: LearnTabProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
    >
      {/* Quick Actions Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
      >
        {/* Primary Study Action */}
        {hasCards ? (
          <Link to="/study" className="block md:col-span-2 lg:col-span-1">
            <DecorativeCard colors={{ topLeft: 'bg-miro-yellow', bottomRight: 'bg-miro-blue' }}>
              <Card variant="playful" hover className="h-full">
                <div className="flex items-center gap-4">
                  <motion.div
                    className="w-14 h-14 bg-miro-red blob flex items-center justify-center"
                    whileHover={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Play size={24} className="text-white ml-0.5" />
                  </motion.div>
                  <div className="flex-1">
                    <CardTitle className="text-xl">Start Studying</CardTitle>
                    <p className="text-miro-blue/60 dark:text-ink-light/60 mt-0.5 text-sm font-medium">
                      {uniqueCardsDue} cards due ({dueCount} reviews)
                    </p>
                  </div>
                  <ArrowRight className="text-miro-blue/40" />
                </div>
              </Card>
            </DecorativeCard>
          </Link>
        ) : (
          <Link to="/import" className="block md:col-span-2 lg:col-span-1">
            <DecorativeCard colors={{ topLeft: 'bg-miro-red', bottomRight: 'bg-miro-yellow' }}>
              <Card variant="playful" hover className="h-full">
                <div className="flex items-center gap-4">
                  <motion.div
                    className="w-14 h-14 bg-miro-green blob-2 flex items-center justify-center"
                    whileHover={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Upload size={24} className="text-white" />
                  </motion.div>
                  <div className="flex-1">
                    <CardTitle className="text-xl">Import Cards</CardTitle>
                    <p className="text-miro-blue/60 dark:text-ink-light/60 mt-0.5 text-sm font-medium">
                      Upload your CSV flashcard file
                    </p>
                  </div>
                  <ArrowRight className="text-miro-blue/40" />
                </div>
              </Card>
            </DecorativeCard>
          </Link>
        )}

        {/* Sprint Mode */}
        {hasCards && (
          <Link to="/study?mode=sprint" className="block">
            <Card variant="playful" hover className="h-full bg-gradient-to-br from-miro-orange/10 to-miro-yellow/10">
              <div className="flex items-center gap-4">
                <motion.div
                  className="w-12 h-12 bg-miro-orange blob-2 flex items-center justify-center"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Zap size={22} className="text-white" />
                </motion.div>
                <div>
                  <CardTitle>Sprint Mode</CardTitle>
                  <p className="text-miro-blue/60 dark:text-ink-light/60 mt-0.5 text-sm">
                    Fast-paced timed review
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        )}

        {/* Browse Cards */}
        <Link to="/browse" className="block">
          <Card variant="playful" hover className="h-full">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-miro-yellow blob flex items-center justify-center">
                <BookOpen size={22} className="text-miro-blue" />
              </div>
              <div>
                <CardTitle>Browse Cards</CardTitle>
                <p className="text-miro-blue/60 dark:text-ink-light/60 mt-0.5 text-sm">
                  {totalCards / 2} cards in collection
                </p>
              </div>
            </div>
          </Card>
        </Link>

        {/* Learning Path */}
        <Link to="/learn" className="block">
          <Card variant="playful" hover className="h-full bg-gradient-to-br from-purple-500/10 to-indigo-500/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500 blob-2 flex items-center justify-center">
                <GraduationCap size={22} className="text-white" />
              </div>
              <div>
                <CardTitle>Learning Path</CardTitle>
                <p className="text-miro-blue/60 dark:text-ink-light/60 mt-0.5 text-sm">
                  Structured A1-B2 curriculum
                </p>
              </div>
            </div>
          </Card>
        </Link>
      </motion.div>

      {/* Word of the Day */}
      {hasCards && (
        <motion.div variants={itemVariants} className="mb-8">
          <WordOfTheDay />
        </motion.div>
      )}

      {/* Daily Recommendations */}
      {hasCards && (
        <motion.div variants={itemVariants}>
          <DailyRecommendations
            recommendations={recommendations}
            onStartSession={onStartSession}
          />
        </motion.div>
      )}
    </motion.div>
  );
}
