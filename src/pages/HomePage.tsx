import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Sparkles,
  Gamepad2,
  Trophy,
  BarChart3,
  Download,
  Upload,
} from 'lucide-react';
import { useCardStore } from '../stores/cardStore';
import { STARTER_VOCABULARY_COUNT } from '../data/starterVocabulary';
import { useUserStore } from '../stores/userStore';
import { useAdaptiveLearningStore } from '../stores/adaptiveLearningStore';
import { Button } from '../components/ui/Button';
import { Tabs, type Tab } from '../components/ui/Tabs';
import { StudyReminder, StreakWarning } from '../components/gamification/StudyReminder';
import { AdaptiveInsightsCard } from '../components/adaptive';
import { HeroSection, LearnTab, PracticeTab, ChallengesTab, ProgressTab } from '../components/home';
import { generateDailyChallenges, getDailyChallenges, type DailyChallenge } from '../types/challenges';
import { initializeWeeklyChallenges, getWeeklyChallenges, type WeeklyChallenge } from '../types/weeklyChallenges';
import { format, isSameDay } from 'date-fns';

// Tab configuration
const HOME_TABS: Tab[] = [
  { id: 'learn', label: 'Learn', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'practice', label: 'Practice', icon: <Gamepad2 className="w-4 h-4" /> },
  { id: 'challenges', label: 'Challenges', icon: <Trophy className="w-4 h-4" /> },
  { id: 'progress', label: 'Progress', icon: <BarChart3 className="w-4 h-4" /> },
];

type TabId = 'learn' | 'practice' | 'challenges' | 'progress';

export function HomePage() {
  const navigate = useNavigate();
  const flashcards = useCardStore((state) => state.flashcards);
  const cardProgress = useCardStore((state) => state.cardProgress);
  const mistakeHistory = useCardStore((state) => state.mistakeHistory);
  const progress = useUserStore((state) => state.progress);

  // Tab state
  const [activeTab, setActiveTab] = useState<TabId>('learn');

  // Adaptive learning state
  const currentRecommendations = useAdaptiveLearningStore((state) => state.currentRecommendations);
  const insights = useAdaptiveLearningStore((state) => state.insights);
  const weakSpots = useAdaptiveLearningStore((state) => state.weakSpots);
  const shouldReanalyze = useAdaptiveLearningStore((state) => state.shouldReanalyze);
  const analyzePerformance = useAdaptiveLearningStore((state) => state.analyzePerformance);
  const refreshRecommendations = useAdaptiveLearningStore((state) => state.refreshRecommendations);
  const dismissInsight = useAdaptiveLearningStore((state) => state.dismissInsight);
  const getCriticalWeakSpots = useAdaptiveLearningStore((state) => state.getCriticalWeakSpots);

  // Get store functions (stable references)
  const getCategoryStats = useCardStore((state) => state.getCategoryStats);
  const getDueCount = useCardStore((state) => state.getDueCount);
  const getUniqueCardsDueCount = useCardStore((state) => state.getUniqueCardsDueCount);

  // Use useMemo to compute derived values only when dependencies change
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

  // Run adaptive analysis when needed
  useEffect(() => {
    if (hasCards && shouldReanalyze()) {
      analyzePerformance(flashcards, cardProgress, mistakeHistory, []);
      refreshRecommendations(
        flashcards,
        cardProgress,
        { currentStreak: progress.currentStreak, lastStudyDate: progress.lastStudyDate },
        20 // daily goal
      );
    }
  }, [hasCards, flashcards, cardProgress, mistakeHistory, progress.currentStreak, progress.lastStudyDate, shouldReanalyze, analyzePerformance, refreshRecommendations]);

  const criticalWeakSpots = useMemo(() => getCriticalWeakSpots(), [getCriticalWeakSpots, weakSpots]);

  const handleStartSession = useCallback(() => {
    navigate('/study');
  }, [navigate]);

  const handlePracticeWeakSpot = useCallback((_weakSpot: { affectedCardIds: string[] }) => {
    navigate('/drills');
  }, [navigate]);

  const hasStudiedToday = progress.lastStudyDate
    ? isSameDay(new Date(progress.lastStudyDate), new Date())
    : false;

  return (
    <motion.div
      className="max-w-5xl mx-auto px-4 py-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Study Reminder */}
      <StudyReminder
        lastStudyDate={progress.lastStudyDate}
        currentStreak={progress.currentStreak}
        dueCards={uniqueCardsDue}
      />

      {/* Streak Warning */}
      {hasCards && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <StreakWarning currentStreak={progress.currentStreak} hasStudiedToday={hasStudiedToday} />
        </motion.div>
      )}

      {/* Adaptive Insights - Critical alerts (max 1 to keep compact) */}
      {hasCards && insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <AdaptiveInsightsCard
            insights={insights}
            onDismiss={dismissInsight}
            maxDisplay={1}
          />
        </motion.div>
      )}

      {/* Hero Section - Always visible */}
      <HeroSection
        cardsDue={uniqueCardsDue}
        hasCards={hasCards}
      />

      {/* Tabbed Content - Only show if hasCards */}
      {hasCards && (
        <>
          {/* Tab Navigation */}
          <Tabs
            tabs={HOME_TABS}
            activeTab={activeTab}
            onChange={(tabId) => setActiveTab(tabId as TabId)}
            className="mb-6"
          />

          {/* Tab Content with Animations */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'learn' && (
                <LearnTab
                  hasCards={hasCards}
                  uniqueCardsDue={uniqueCardsDue}
                  dueCount={dueCount}
                  totalCards={totalCards}
                  recommendations={currentRecommendations}
                  onStartSession={handleStartSession}
                />
              )}

              {activeTab === 'practice' && (
                <PracticeTab
                  weakSpots={criticalWeakSpots}
                  onPracticeWeakSpot={handlePracticeWeakSpot}
                />
              )}

              {activeTab === 'challenges' && (
                <ChallengesTab
                  dailyChallenges={dailyChallenges}
                  weeklyChallenges={weeklyChallenges}
                />
              )}

              {activeTab === 'progress' && (
                <ProgressTab
                  masteryProgress={masteryProgress}
                  masteredCards={masteredCards}
                  totalCards={totalCards}
                  categoryStats={categoryStats}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </>
      )}

      {/* Empty State - No cards */}
      {!hasCards && (
        <EmptyStateWithStarter />
      )}
    </motion.div>
  );
}

// Empty state component with starter vocabulary option
function EmptyStateWithStarter() {
  const loadStarterVocabulary = useCardStore((state) => state.loadStarterVocabulary);
  const [isLoading, setIsLoading] = useState(false);
  const [loadedCount, setLoadedCount] = useState<number | null>(null);

  const handleLoadStarter = async () => {
    setIsLoading(true);
    try {
      const count = await loadStarterVocabulary();
      setLoadedCount(count);
    } catch (error) {
      console.error('Failed to load starter vocabulary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loadedCount !== null) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mt-12 text-center py-16"
      >
        <div className="w-20 h-20 mx-auto mb-6 bg-miro-green rounded-full flex items-center justify-center">
          <Sparkles size={40} className="text-white" />
        </div>
        <h2 className="text-2xl font-display font-bold text-miro-green mb-2">
          {loadedCount} cards loaded!
        </h2>
        <p className="text-miro-blue/70 dark:text-ink-light/70 mb-6">
          You're ready to start learning Catalan.
        </p>
        <Link to="/study">
          <Button size="lg" variant="secondary">
            Start Learning
          </Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
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
        Start your Catalan learning journey with our starter vocabulary
        or import your own flashcards.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Button
          size="lg"
          onClick={handleLoadStarter}
          isLoading={isLoading}
          leftIcon={<Download size={22} />}
        >
          Load {STARTER_VOCABULARY_COUNT} Starter Cards
        </Button>

        <span className="text-miro-blue/50 dark:text-ink-light/50">or</span>

        <Link to="/import">
          <Button size="lg" variant="outline" leftIcon={<Upload size={22} />}>
            Import Your Own
          </Button>
        </Link>
      </div>

      <p className="mt-6 text-sm text-miro-blue/50 dark:text-ink-light/50">
        Starter vocabulary includes essential A1 Catalan: greetings, family, numbers, colors, food, and common phrases.
      </p>
    </motion.div>
  );
}
