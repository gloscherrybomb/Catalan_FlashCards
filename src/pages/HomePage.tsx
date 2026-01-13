import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Play,
  Upload,
  BookOpen,
  Sparkles,
  Zap,
  ArrowRight,
  Gamepad2,
  Dumbbell,
} from 'lucide-react';
import { useCardStore } from '../stores/cardStore';
import { useUserStore } from '../stores/userStore';
import { Button } from '../components/ui/Button';
import { Card, CardTitle, DecorativeCard } from '../components/ui/Card';
import { ProgressRing } from '../components/ui/ProgressRing';
import { XPBar } from '../components/gamification/XPBar';
import { StreakCard } from '../components/gamification/StreakCounter';
import { WordOfTheDay } from '../components/gamification/WordOfTheDay';
import { DailyChallenges } from '../components/gamification/DailyChallenges';
import { StudyReminder, StreakWarning } from '../components/gamification/StudyReminder';
import { generateDailyChallenges, getDailyChallenges, type DailyChallenge } from '../types/challenges';
import { initializeWeeklyChallenges, getWeeklyChallenges, type WeeklyChallenge } from '../types/weeklyChallenges';
import { WeeklyChallenges } from '../components/gamification/WeeklyChallenges';
import { format, isSameDay } from 'date-fns';

// Stagger animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
    },
  },
};

export function HomePage() {
  const flashcards = useCardStore((state) => state.flashcards);
  const cardProgress = useCardStore((state) => state.cardProgress);
  const progress = useUserStore((state) => state.progress);

  // Get store functions (stable references)
  const getCategoryStats = useCardStore((state) => state.getCategoryStats);
  const getDueCount = useCardStore((state) => state.getDueCount);
  const getUniqueCardsDueCount = useCardStore((state) => state.getUniqueCardsDueCount);

  // Use useMemo to compute derived values only when dependencies change
  // This prevents infinite re-renders while ensuring updates when card progress changes
  const categoryStats = useMemo(() => getCategoryStats(), [flashcards, cardProgress, getCategoryStats]);
  const dueCount = useMemo(() => getDueCount(), [flashcards, cardProgress, getDueCount]);
  const uniqueCardsDue = useMemo(() => getUniqueCardsDueCount(), [flashcards, cardProgress, getUniqueCardsDueCount]);

  const hasCards = flashcards.length > 0;
  const totalCards = flashcards.length * 2;
  const masteredCards = Object.values(categoryStats).reduce((sum, cat) => sum + cat.mastered, 0) * 2;
  const masteryProgress = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;

  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([]);
  const [weeklyChallenges, setWeeklyChallenges] = useState<WeeklyChallenge[]>([]);

  // Function to load or generate daily challenges
  const loadDailyChallenges = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const existingChallenges = getDailyChallenges();

    if (existingChallenges.length > 0) {
      setDailyChallenges(existingChallenges);
      return;
    }

    // Generate new challenges for today
    const newChallenges = generateDailyChallenges();
    setDailyChallenges(newChallenges);
    localStorage.setItem('daily-challenges', JSON.stringify({
      date: today,
      challenges: newChallenges,
    }));
  };

  useEffect(() => {
    // Load challenges on mount
    loadDailyChallenges();
    setWeeklyChallenges(initializeWeeklyChallenges());

    // Reload challenges when window gains focus (after returning from study session)
    const handleFocus = () => {
      loadDailyChallenges();
      setWeeklyChallenges(getWeeklyChallenges());
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const hasStudiedToday = progress.lastStudyDate
    ? isSameDay(new Date(progress.lastStudyDate), new Date())
    : false;

  return (
    <motion.div
      className="max-w-5xl mx-auto px-4 py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Study Reminder */}
      <StudyReminder
        lastStudyDate={progress.lastStudyDate}
        currentStreak={progress.currentStreak}
        dueCards={uniqueCardsDue}
      />

      {/* Streak Warning */}
      {hasCards && (
        <motion.div variants={itemVariants} className="mb-4">
          <StreakWarning currentStreak={progress.currentStreak} hasStudiedToday={hasStudiedToday} />
        </motion.div>
      )}

      {/* Hero Welcome Section */}
      <motion.div variants={itemVariants} className="text-center mb-12 relative">
        {/* Decorative elements */}
        <motion.span
          className="absolute -top-4 left-1/4 text-4xl text-miro-yellow"
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          ✦
        </motion.span>
        <motion.span
          className="absolute top-8 right-1/4 text-3xl text-miro-red"
          animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        >
          ✦
        </motion.span>

        <motion.h1
          className="text-5xl md:text-7xl font-display font-bold text-miro-blue dark:text-ink-light mb-4"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          Hola!
        </motion.h1>
        <p className="text-xl md:text-2xl text-miro-blue/70 dark:text-ink-light/70 font-medium">
          {hasCards
            ? `You have ${uniqueCardsDue} cards waiting for review`
            : 'Ready to start your Catalan journey?'}
        </p>

        {/* Decorative blob */}
        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-miro-yellow/10 blob animate-pulse-blob" />
      </motion.div>

      {/* Quick Actions - Main CTA cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10"
      >
        {/* Primary Action */}
        {hasCards ? (
          <Link to="/study" className="block md:col-span-2 lg:col-span-1">
            <DecorativeCard colors={{ topLeft: 'bg-miro-yellow', bottomRight: 'bg-miro-blue' }}>
              <Card variant="playful" hover className="h-full">
                <div className="flex items-center gap-5">
                  <motion.div
                    className="w-16 h-16 bg-miro-red blob flex items-center justify-center"
                    whileHover={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Play size={28} className="text-white ml-1" />
                  </motion.div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl">Start Studying</CardTitle>
                    <p className="text-miro-blue/60 dark:text-ink-light/60 mt-1 font-medium">
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
                <div className="flex items-center gap-5">
                  <motion.div
                    className="w-16 h-16 bg-miro-green blob-2 flex items-center justify-center"
                    whileHover={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Upload size={28} className="text-white" />
                  </motion.div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl">Import Cards</CardTitle>
                    <p className="text-miro-blue/60 dark:text-ink-light/60 mt-1 font-medium">
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
                  className="w-14 h-14 bg-miro-orange blob-2 flex items-center justify-center"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Zap size={24} className="text-white" />
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
              <div className="w-14 h-14 bg-miro-yellow blob flex items-center justify-center">
                <BookOpen size={24} className="text-miro-blue" />
              </div>
              <div>
                <CardTitle>Browse Cards</CardTitle>
                <p className="text-miro-blue/60 dark:text-ink-light/60 mt-0.5 text-sm">
                  {flashcards.length} cards in collection
                </p>
              </div>
            </div>
          </Card>
        </Link>
      </motion.div>

      {/* Practice & Games Section */}
      {hasCards && (
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10"
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
                  <Gamepad2 size={24} className="text-white" />
                </motion.div>
                <div className="flex-1">
                  <CardTitle>Mini Games</CardTitle>
                  <p className="text-miro-blue/60 dark:text-ink-light/60 mt-0.5 text-sm">
                    Word scramble, memory match & more
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
                  <Dumbbell size={24} className="text-white" />
                </motion.div>
                <div className="flex-1">
                  <CardTitle>Practice Drills</CardTitle>
                  <p className="text-miro-blue/60 dark:text-ink-light/60 mt-0.5 text-sm">
                    Category boot camps & weakness training
                  </p>
                </div>
                <ArrowRight className="text-miro-blue/40" />
              </div>
            </Card>
          </Link>
        </motion.div>
      )}

      {/* Word of the Day & Daily Challenges */}
      {hasCards && (
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10"
        >
          <WordOfTheDay />
          <DailyChallenges challenges={dailyChallenges} />
        </motion.div>
      )}

      {/* Weekly Challenges */}
      {hasCards && weeklyChallenges.length > 0 && (
        <motion.div variants={itemVariants} className="mb-10">
          <WeeklyChallenges challenges={weeklyChallenges} />
        </motion.div>
      )}

      {/* Stats Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
      {hasCards && Object.keys(categoryStats).length > 0 && (
        <motion.div variants={itemVariants} className="mt-8">
          <Card variant="bordered">
            <CardTitle>Categories</CardTitle>
            <div className="mt-5 space-y-4">
              {Object.entries(categoryStats).map(([category, stats], index) => {
                const categoryProgress = stats.total > 0
                  ? Math.round((stats.mastered / stats.total) * 100)
                  : 0;

                const colors = [
                  'from-miro-red to-miro-orange',
                  'from-miro-orange to-miro-yellow',
                  'from-miro-green to-miro-blue',
                  'from-miro-blue to-miro-green',
                  'from-miro-yellow to-miro-red',
                ];

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
                        className={`h-full bg-gradient-to-r ${colors[index % colors.length]} rounded-full`}
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

      {/* Empty State */}
      {!hasCards && (
        <motion.div
          variants={itemVariants}
          className="mt-12 text-center py-16 relative"
        >
          {/* Decorative background */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-miro-red/10 blob animate-float" />
            <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-miro-yellow/10 blob-2 animate-float-delayed" />
          </div>

          <motion.div
            className="w-28 h-28 mx-auto mb-8 bg-miro-yellow blob flex items-center justify-center"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
          >
            <Sparkles size={48} className="text-miro-blue" />
          </motion.div>

          <h2 className="text-3xl md:text-4xl font-display font-bold text-miro-blue dark:text-ink-light mb-4">
            Welcome to Catalan Cards!
          </h2>
          <p className="text-lg text-miro-blue/70 dark:text-ink-light/70 max-w-lg mx-auto mb-8">
            Start your Catalan learning journey by importing flashcards.
            We'll help you master them with spaced repetition!
          </p>
          <Link to="/import">
            <Button size="lg" leftIcon={<Upload size={22} />}>
              Import Your First Cards
            </Button>
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
}
