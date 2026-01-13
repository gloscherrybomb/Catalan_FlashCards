import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Dumbbell,
  Target,
  Clock,
  Zap,
  AlertCircle,
  BookOpen,
  Flame,
  Play,
  ChevronRight,
} from 'lucide-react';
import { Card, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useCardStore } from '../stores/cardStore';

interface DrillConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  type: 'category' | 'weakness' | 'speed' | 'accuracy';
  cardCount: number;
  timeLimit?: number; // seconds per card
  category?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function PracticeDrillsPage() {
  const navigate = useNavigate();
  const flashcards = useCardStore((state) => state.flashcards);
  const getCategoryStats = useCardStore((state) => state.getCategoryStats);
  const getWeaknessDeck = useCardStore((state) => state.getWeaknessDeck);
  const mistakeHistory = useCardStore((state) => state.mistakeHistory);

  const categoryStats = useMemo(() => getCategoryStats(), [getCategoryStats, flashcards]);
  const weaknessDeck = useMemo(() => getWeaknessDeck(30), [getWeaknessDeck]);

  // Generate category boot camps
  const categoryDrills: DrillConfig[] = useMemo(() => {
    return Object.entries(categoryStats)
      .filter(([_, stats]) => stats.total >= 5)
      .map(([category, stats], index) => {
        const colors = [
          'from-miro-red to-miro-orange',
          'from-miro-orange to-miro-yellow',
          'from-miro-green to-miro-blue',
          'from-miro-blue to-miro-green',
          'from-purple-400 to-pink-500',
        ];
        const icons = ['🏃', '📚', '🎯', '💪', '⚡'];

        return {
          id: `category-${category.toLowerCase().replace(/\s+/g, '-')}`,
          name: `${category} Boot Camp`,
          description: `Master ${category.toLowerCase()} with intensive practice`,
          icon: <span className="text-2xl">{icons[index % icons.length]}</span>,
          color: colors[index % colors.length],
          type: 'category' as const,
          cardCount: Math.min(30, stats.total),
          category,
        };
      });
  }, [categoryStats]);

  const startDrill = (drill: DrillConfig) => {
    // Navigate to study page with drill configuration
    const params = new URLSearchParams();
    params.set('drill', drill.id);
    params.set('type', drill.type);
    if (drill.category) params.set('category', drill.category);
    params.set('limit', String(drill.cardCount));
    if (drill.timeLimit) params.set('timeLimit', String(drill.timeLimit));

    navigate(`/study?${params.toString()}`);
  };

  return (
    <motion.div
      className="max-w-5xl mx-auto px-4 py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center mb-10">
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-miro-red to-miro-orange rounded-2xl flex items-center justify-center">
          <Dumbbell className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-display font-bold text-miro-blue dark:text-ink-light mb-2">
          Practice Drills
        </h1>
        <p className="text-lg text-miro-blue/60 dark:text-ink-light/60">
          Targeted training to strengthen your weak spots
        </p>
      </motion.div>

      {/* Quick Drills Section */}
      <motion.div variants={itemVariants} className="mb-10">
        <h2 className="text-xl font-display font-bold text-miro-blue dark:text-ink-light mb-4">
          Quick Drills
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Weakness Review */}
          <Card
            variant="playful"
            hover
            className="cursor-pointer"
            onClick={() =>
              startDrill({
                id: 'weakness-review',
                name: 'Weakness Review',
                description: 'Focus on your problem cards',
                icon: <AlertCircle className="w-6 h-6" />,
                color: 'from-red-400 to-red-600',
                type: 'weakness',
                cardCount: Math.min(20, weaknessDeck.length),
              })
            }
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">Weakness Review</CardTitle>
                <p className="text-sm text-miro-blue/60 dark:text-ink-light/60 mt-1">
                  Focus on your problem cards
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs">
                  <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">
                    {weaknessDeck.length} cards
                  </span>
                  {mistakeHistory.length > 0 && (
                    <span className="text-miro-blue/40">
                      {mistakeHistory.length} recent mistakes
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-miro-blue/30" />
            </div>
          </Card>

          {/* Speed Drill */}
          <Card
            variant="playful"
            hover
            className="cursor-pointer"
            onClick={() =>
              startDrill({
                id: 'speed-drill',
                name: 'Speed Drill',
                description: '5 seconds per card',
                icon: <Zap className="w-6 h-6" />,
                color: 'from-yellow-400 to-orange-500',
                type: 'speed',
                cardCount: 20,
                timeLimit: 5,
              })
            }
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">Speed Drill</CardTitle>
                <p className="text-sm text-miro-blue/60 dark:text-ink-light/60 mt-1">
                  5 seconds per card - think fast!
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs">
                  <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" /> 5s limit
                  </span>
                  <span className="text-miro-blue/40">20 cards</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-miro-blue/30" />
            </div>
          </Card>

          {/* Accuracy Challenge */}
          <Card
            variant="playful"
            hover
            className="cursor-pointer"
            onClick={() =>
              startDrill({
                id: 'accuracy-challenge',
                name: 'Accuracy Challenge',
                description: 'Aim for 100% accuracy',
                icon: <Target className="w-6 h-6" />,
                color: 'from-green-400 to-emerald-600',
                type: 'accuracy',
                cardCount: 15,
              })
            }
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center">
                <Target className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">Accuracy Challenge</CardTitle>
                <p className="text-sm text-miro-blue/60 dark:text-ink-light/60 mt-1">
                  Aim for 100% accuracy
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs">
                  <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">
                    15 cards
                  </span>
                  <span className="text-miro-blue/40">No time limit</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-miro-blue/30" />
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Category Boot Camps */}
      <motion.div variants={itemVariants}>
        <h2 className="text-xl font-display font-bold text-miro-blue dark:text-ink-light mb-4">
          Category Boot Camps
        </h2>

        {categoryDrills.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryDrills.map((drill, index) => {
              const stats = categoryStats[drill.category!];
              const masteryPercent = Math.round(
                (stats.mastered / stats.total) * 100
              );

              return (
                <motion.div
                  key={drill.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    variant="playful"
                    hover
                    className="cursor-pointer"
                    onClick={() => startDrill(drill)}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-14 h-14 bg-gradient-to-br ${drill.color} rounded-xl flex items-center justify-center`}
                      >
                        {drill.icon}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{drill.name}</CardTitle>
                        <p className="text-sm text-miro-blue/60 dark:text-ink-light/60 mt-1">
                          {drill.description}
                        </p>

                        {/* Progress bar */}
                        <div className="mt-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-miro-blue/60 dark:text-ink-light/60">
                              {stats.mastered}/{stats.total} mastered
                            </span>
                            <span className="font-medium text-miro-blue dark:text-ink-light">
                              {masteryPercent}%
                            </span>
                          </div>
                          <div className="h-2 bg-miro-blue/10 dark:bg-ink-light/10 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full bg-gradient-to-r ${drill.color} rounded-full`}
                              initial={{ width: 0 }}
                              animate={{ width: `${masteryPercent}%` }}
                              transition={{ duration: 0.5, delay: index * 0.1 }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-2 text-xs text-miro-blue/40">
                          <BookOpen className="w-3 h-3" />
                          <span>{drill.cardCount} cards</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-miro-blue/30" />
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <Card variant="bordered" className="text-center py-8">
            <BookOpen className="w-12 h-12 mx-auto text-miro-blue/20 mb-4" />
            <p className="text-miro-blue/60 dark:text-ink-light/60">
              Import more cards to unlock category boot camps
            </p>
          </Card>
        )}
      </motion.div>

      {/* Tips Section */}
      <motion.div variants={itemVariants} className="mt-10">
        <Card variant="bordered" className="bg-miro-yellow/5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-miro-yellow rounded-xl flex items-center justify-center shrink-0">
              <Flame className="w-6 h-6 text-miro-blue" />
            </div>
            <div>
              <CardTitle className="text-lg">Pro Tips</CardTitle>
              <ul className="mt-2 space-y-2 text-sm text-miro-blue/70 dark:text-ink-light/70">
                <li>
                  • <strong>Weakness Review</strong> focuses on cards you've
                  gotten wrong recently
                </li>
                <li>
                  • <strong>Speed Drills</strong> help build automatic recall -
                  perfect for common words
                </li>
                <li>
                  • <strong>Category Boot Camps</strong> let you deeply focus on
                  one topic at a time
                </li>
                <li>
                  • Complete drills daily to maximize retention and build strong
                  neural pathways
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
