import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gamepad2, Dumbbell, ArrowRight } from 'lucide-react';
import { Card, CardTitle } from '../ui/Card';
import { WeakSpotAlerts } from '../adaptive';
import type { WeakSpot } from '../../types/adaptiveLearning';

interface PracticeTabProps {
  weakSpots: WeakSpot[];
  onPracticeWeakSpot: (weakSpot: WeakSpot) => void;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 12 },
  },
};

export function PracticeTab({ weakSpots, onPracticeWeakSpot }: PracticeTabProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
    >
      {/* Games & Drills Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
      >
        {/* Mini Games */}
        <Link to="/games" className="block">
          <Card variant="playful" hover className="h-full bg-gradient-to-br from-miro-yellow/10 to-miro-orange/10">
            <div className="flex items-center gap-4">
              <motion.div
                className="w-14 h-14 bg-gradient-to-br from-miro-yellow to-miro-orange blob flex items-center justify-center"
                whileHover={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.5 }}
              >
                <Gamepad2 size={26} className="text-white" />
              </motion.div>
              <div className="flex-1">
                <CardTitle className="text-xl">Mini Games</CardTitle>
                <p className="text-miro-blue/60 dark:text-ink-light/60 mt-1 text-sm">
                  Word scramble, memory match & hangman
                </p>
              </div>
              <ArrowRight className="text-miro-blue/40" />
            </div>
          </Card>
        </Link>

        {/* Practice Drills */}
        <Link to="/drills" className="block">
          <Card variant="playful" hover className="h-full bg-gradient-to-br from-miro-red/10 to-miro-orange/10">
            <div className="flex items-center gap-4">
              <motion.div
                className="w-14 h-14 bg-gradient-to-br from-miro-red to-miro-orange blob-2 flex items-center justify-center"
                whileHover={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.3 }}
              >
                <Dumbbell size={26} className="text-white" />
              </motion.div>
              <div className="flex-1">
                <CardTitle className="text-xl">Practice Drills</CardTitle>
                <p className="text-miro-blue/60 dark:text-ink-light/60 mt-1 text-sm">
                  Category boot camps & weakness training
                </p>
              </div>
              <ArrowRight className="text-miro-blue/40" />
            </div>
          </Card>
        </Link>
      </motion.div>

      {/* Weak Spot Alerts */}
      {weakSpots.length > 0 && (
        <motion.div variants={itemVariants}>
          <WeakSpotAlerts
            weakSpots={weakSpots}
            onPractice={onPracticeWeakSpot}
            maxDisplay={5}
          />
        </motion.div>
      )}

      {/* Empty state when no weak spots */}
      {weakSpots.length === 0 && (
        <motion.div
          variants={itemVariants}
          className="text-center py-12"
        >
          <motion.div
            className="w-20 h-20 mx-auto mb-4 bg-miro-green/10 blob flex items-center justify-center"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Dumbbell size={36} className="text-miro-green" />
          </motion.div>
          <h3 className="text-xl font-display font-bold text-miro-blue dark:text-ink-light mb-2">
            No Weak Spots Detected
          </h3>
          <p className="text-miro-blue/60 dark:text-ink-light/60 max-w-sm mx-auto">
            Keep studying and we'll identify areas where you need extra practice.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
