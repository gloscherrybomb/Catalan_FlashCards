import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Play,
  Upload,
  BookOpen,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useCardStore } from '../stores/cardStore';
import { useUserStore } from '../stores/userStore';
import { Button } from '../components/ui/Button';
import { Card, CardTitle } from '../components/ui/Card';
import { ProgressRing } from '../components/ui/ProgressRing';
import { XPBar } from '../components/gamification/XPBar';
import { StreakCard } from '../components/gamification/StreakCounter';
import { WordOfTheDay } from '../components/gamification/WordOfTheDay';
import { DailyChallenges } from '../components/gamification/DailyChallenges';
import { StudyReminder, StreakWarning } from '../components/gamification/StudyReminder';
import { generateDailyChallenges, type DailyChallenge } from '../types/challenges';
import { format, isSameDay } from 'date-fns';

export function HomePage() {
  const flashcards = useCardStore((state) => state.flashcards);
  const getDueCount = useCardStore((state) => state.getDueCount);
  const getNewCount = useCardStore((state) => state.getNewCount);
  const getCategoryStats = useCardStore((state) => state.getCategoryStats);
  const progress = useUserStore((state) => state.progress);

  const dueCount = getDueCount();
  const newCount = getNewCount();
  const categoryStats = getCategoryStats();

  const hasCards = flashcards.length > 0;
  const totalCards = flashcards.length * 2; // Both directions
  const masteredCards = Object.values(categoryStats).reduce((sum, cat) => sum + cat.mastered, 0) * 2;
  const masteryProgress = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;

  // Daily challenges
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([]);

  useEffect(() => {
    // Load or generate daily challenges
    const storedChallenges = localStorage.getItem('daily-challenges');
    const today = format(new Date(), 'yyyy-MM-dd');

    if (storedChallenges) {
      const parsed = JSON.parse(storedChallenges);
      if (parsed.date === today) {
        setDailyChallenges(parsed.challenges);
        return;
      }
    }

    // Generate new challenges for today
    const newChallenges = generateDailyChallenges();
    setDailyChallenges(newChallenges);
    localStorage.setItem('daily-challenges', JSON.stringify({
      date: today,
      challenges: newChallenges,
    }));
  }, []);

  const hasStudiedToday = progress.lastStudyDate
    ? isSameDay(new Date(progress.lastStudyDate), new Date())
    : false;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Study Reminder */}
      <StudyReminder
        lastStudyDate={progress.lastStudyDate}
        currentStreak={progress.currentStreak}
        dueCards={dueCount}
      />

      {/* Streak Warning */}
      {hasCards && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4"
        >
          <StreakWarning currentStreak={progress.currentStreak} hasStudiedToday={hasStudiedToday} />
        </motion.div>
      )}

      {/* Welcome header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">
          Hola! Ready to learn?
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {hasCards
            ? `You have ${dueCount} cards waiting for review`
            : 'Import your first flashcards to get started'}
        </p>
      </motion.div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
      >
        {hasCards ? (
          <Link to="/study" className="block">
            <Card variant="playful" hover className="h-full">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-600 rounded-2xl flex items-center justify-center">
                  <Play size={32} className="text-white" />
                </div>
                <div>
                  <CardTitle>Start Studying</CardTitle>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    {dueCount} cards due • {newCount} new
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ) : (
          <Link to="/import" className="block">
            <Card variant="playful" hover className="h-full">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary to-secondary-600 rounded-2xl flex items-center justify-center">
                  <Upload size={32} className="text-white" />
                </div>
                <div>
                  <CardTitle>Import Cards</CardTitle>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Upload your CSV flashcard file
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        )}

        {/* Sprint Mode */}
        {hasCards && (
          <Link to="/study?mode=sprint" className="block">
            <Card variant="playful" hover className="h-full bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center">
                  <Zap size={32} className="text-white" />
                </div>
                <div>
                  <CardTitle>Sprint Mode</CardTitle>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Fast-paced timed review
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        )}

        <Link to="/browse" className="block">
          <Card variant="playful" hover className="h-full">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-yellow-500 rounded-2xl flex items-center justify-center">
                <BookOpen size={32} className="text-gray-800" />
              </div>
              <div>
                <CardTitle>Browse Cards</CardTitle>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  {flashcards.length} cards in your collection
                </p>
              </div>
            </div>
          </Card>
        </Link>
      </motion.div>

      {/* Word of the Day & Daily Challenges */}
      {hasCards && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          <WordOfTheDay />
          <DailyChallenges challenges={dailyChallenges} />
        </motion.div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* XP & Level */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <XPBar />
        </motion.div>

        {/* Streak */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StreakCard />
        </motion.div>

        {/* Mastery progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardTitle>Overall Progress</CardTitle>
            <div className="flex items-center justify-center mt-4">
              <ProgressRing
                progress={masteryProgress}
                size={120}
                color="#4ECDC4"
              >
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-800">{masteryProgress}%</p>
                  <p className="text-xs text-gray-500">Mastered</p>
                </div>
              </ProgressRing>
            </div>
            <div className="mt-4 flex justify-between text-sm text-gray-500">
              <span>{masteredCards} mastered</span>
              <span>{totalCards} total</span>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Categories breakdown */}
      {hasCards && Object.keys(categoryStats).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card>
            <CardTitle>Categories</CardTitle>
            <div className="mt-4 space-y-3">
              {Object.entries(categoryStats).map(([category, stats]) => {
                const progress = stats.total > 0
                  ? Math.round((stats.mastered / stats.total) * 100)
                  : 0;

                return (
                  <div key={category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{category}</span>
                      <span className="text-gray-500">
                        {stats.mastered}/{stats.total} mastered
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-secondary to-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Empty state */}
      {!hasCards && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center py-12"
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl flex items-center justify-center">
            <Sparkles size={48} className="text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Welcome to Catalan Cards!
          </h2>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Start your Catalan learning journey by importing flashcards from your
            Gemini AI lessons. We'll help you master them with spaced repetition!
          </p>
          <Link to="/import">
            <Button size="lg" leftIcon={<Upload size={20} />}>
              Import Your First Cards
            </Button>
          </Link>
        </motion.div>
      )}
    </div>
  );
}
