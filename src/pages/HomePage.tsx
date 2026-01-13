import { useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  BookOpen,
  Sparkles,
  ChevronRight,
  Target,
  Flame,
  ArrowRight,
  Download,
  Upload,
  Zap,
  Brain,
  Headphones,
  PenTool,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useCardStore } from '../stores/cardStore';
import { STARTER_VOCABULARY_COUNT } from '../data/starterVocabulary';
import { useUserStore } from '../stores/userStore';
import { useCurriculumStore } from '../stores/curriculumStore';
import { useGrammarStore } from '../stores/grammarStore';
import { CURRICULUM_UNITS, getTotalLessons } from '../data/curriculum';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { StreakWarning } from '../components/gamification/StudyReminder';
import { isSameDay } from 'date-fns';

export function HomePage() {
  const navigate = useNavigate();
  const flashcards = useCardStore((state) => state.flashcards);
  const cardProgress = useCardStore((state) => state.cardProgress);
  const progress = useUserStore((state) => state.progress);

  // Curriculum state
  const currentLevel = useCurriculumStore((state) => state.currentLevel);
  const getNextLesson = useCurriculumStore((state) => state.getNextLesson);
  const getLevelProgress = useCurriculumStore((state) => state.getLevelProgress);
  const getUnitProgress = useCurriculumStore((state) => state.getUnitProgress);
  const getTotalXPEarned = useCurriculumStore((state) => state.getTotalXPEarned);

  // Grammar review state - get the function, not its result, to avoid infinite re-renders
  const getLessonsNeedingReview = useGrammarStore((state) => state.getLessonsNeedingReview);

  // Memoize the results to avoid recalculating on every render
  const lessonsForReview = useMemo(() => getLessonsNeedingReview(), [getLessonsNeedingReview]);
  const grammarNeedsReview = lessonsForReview.length > 0;

  const hasCards = flashcards.length > 0;
  const nextLesson = getNextLesson();
  const totalXP = getTotalXPEarned();
  const totalLessons = getTotalLessons();

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    const levels = ['A1', 'A2', 'B1', 'B2'] as const;
    let completed = 0;
    let total = 0;
    levels.forEach(level => {
      const p = getLevelProgress(level);
      completed += p.completed;
      total += p.total;
    });
    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [getLevelProgress]);

  // Find current unit info
  const currentUnitInfo = useMemo(() => {
    if (!nextLesson) return null;
    const unit = CURRICULUM_UNITS.find(u => u.id === nextLesson.unitId);
    const unitIndex = CURRICULUM_UNITS.findIndex(u => u.id === nextLesson.unitId);
    return unit ? { unit, index: unitIndex + 1 } : null;
  }, [nextLesson]);

  const hasStudiedToday = progress.lastStudyDate
    ? isSameDay(new Date(progress.lastStudyDate), new Date())
    : false;

  // Calculate cards due
  const getUniqueCardsDueCount = useCardStore((state) => state.getUniqueCardsDueCount);
  const uniqueCardsDue = useMemo(() => getUniqueCardsDueCount(), [flashcards, cardProgress, getUniqueCardsDueCount]);

  const handleStartLearningPath = useCallback(() => {
    navigate('/learning-path');
  }, [navigate]);

  const handleContinueLesson = useCallback(() => {
    if (nextLesson) {
      navigate('/learning-path');
    }
  }, [navigate, nextLesson]);

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-miro-yellow/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-60 h-60 bg-miro-blue/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-miro-red/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-8">
        {/* Streak Warning */}
        {hasCards && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <StreakWarning currentStreak={progress.currentStreak} hasStudiedToday={hasStudiedToday} />
          </motion.div>
        )}

        {/* Main Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-miro-blue via-miro-blue to-indigo-600 p-8 md:p-10 text-white shadow-2xl shadow-miro-blue/25">
            {/* Geometric decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
            <div className="absolute top-1/2 right-1/4 w-4 h-4 bg-miro-yellow rounded-full animate-pulse" />
            <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-miro-green rounded-full animate-ping" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="w-6 h-6 text-miro-yellow" />
                <span className="text-sm font-medium text-white/80 uppercase tracking-wider">
                  Structured Learning
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 leading-tight">
                Learn Catalan<br />
                <span className="text-miro-yellow">Step by Step</span>
              </h1>

              <p className="text-lg text-white/80 mb-8 max-w-lg">
                A complete 20-unit course based on "Colloquial Catalan" — from your first words to confident conversation.
              </p>

              {/* Progress Stats */}
              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
                    <Target className="w-6 h-6 text-miro-yellow" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{currentLevel}</p>
                    <p className="text-sm text-white/60">Current Level</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-miro-green" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{overallProgress.completed}/{totalLessons}</p>
                    <p className="text-sm text-white/60">Lessons Done</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
                    <Flame className="w-6 h-6 text-miro-red" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{progress.currentStreak}</p>
                    <p className="text-sm text-white/60">Day Streak</p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <Button
                size="lg"
                onClick={handleStartLearningPath}
                className="bg-miro-yellow text-miro-blue hover:bg-yellow-400 font-bold text-lg px-8 py-4 shadow-xl shadow-black/20"
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                {overallProgress.completed > 0 ? 'Continue Learning Path' : 'Start Your Journey'}
              </Button>
            </div>
          </div>
        </motion.section>

        {/* Continue Learning Card - Only show if there's a next lesson */}
        {nextLesson && currentUnitInfo && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card className="relative overflow-hidden border-2 border-miro-yellow/30 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/10">
              {/* Accent stripe */}
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-miro-yellow" />

              <div className="p-6 pl-8">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Unit Icon */}
                    <motion.div
                      className={`
                        w-16 h-16 rounded-2xl flex items-center justify-center text-3xl
                        bg-gradient-to-br ${currentUnitInfo.unit.color} shadow-lg
                      `}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {currentUnitInfo.unit.icon}
                    </motion.div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-miro-yellow text-miro-blue">
                          CONTINUE
                        </span>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Unit {currentUnitInfo.index} of 20
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                        {currentUnitInfo.unit.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                        {currentUnitInfo.unit.titleCatalan}
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={handleContinueLesson}
                    className="shrink-0"
                    rightIcon={<Play className="w-4 h-4" />}
                  >
                    Resume
                  </Button>
                </div>

                {/* Unit Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>Unit Progress</span>
                    <span>
                      {getUnitProgress(currentUnitInfo.unit.id).completed}/
                      {getUnitProgress(currentUnitInfo.unit.id).total} lessons
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-miro-yellow rounded-full"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(getUnitProgress(currentUnitInfo.unit.id).completed /
                          getUnitProgress(currentUnitInfo.unit.id).total) * 100}%`
                      }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </motion.section>
        )}

        {/* Quick Practice Section */}
        {hasCards && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-miro-yellow" />
                Quick Practice
              </h2>
              {uniqueCardsDue > 0 && (
                <span className="text-sm font-medium text-miro-red">
                  {uniqueCardsDue} cards due
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <PracticeCard
                icon={<Brain className="w-6 h-6" />}
                title="Flashcards"
                subtitle="Review vocabulary"
                color="from-violet-500 to-purple-600"
                onClick={() => navigate('/study')}
                badge={uniqueCardsDue > 0 ? `${uniqueCardsDue}` : undefined}
              />
              <PracticeCard
                icon={<PenTool className="w-6 h-6" />}
                title="Type Practice"
                subtitle="Spelling drills"
                color="from-emerald-500 to-teal-600"
                onClick={() => navigate('/study?mode=type-answer')}
              />
              <PracticeCard
                icon={<Headphones className="w-6 h-6" />}
                title="Listening"
                subtitle="Audio comprehension"
                color="from-blue-500 to-indigo-600"
                onClick={() => navigate('/study?mode=dictation')}
              />
              <PracticeCard
                icon={grammarNeedsReview ? <RotateCcw className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                title={grammarNeedsReview ? "Grammar Review" : "Grammar"}
                subtitle={grammarNeedsReview ? "Practice weak areas" : "Learn rules"}
                color={grammarNeedsReview ? "from-rose-500 to-pink-600" : "from-amber-500 to-orange-600"}
                onClick={() => navigate(grammarNeedsReview ? `/grammar/${lessonsForReview[0]?.lessonId || ''}` : '/grammar')}
                badge={grammarNeedsReview ? `${lessonsForReview.length}` : undefined}
              />
            </div>
          </motion.section>
        )}

        {/* Course Overview - Condensed Unit Preview */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-miro-blue" />
              Course Structure
            </h2>
            <Link to="/learning-path" className="text-sm font-medium text-miro-blue hover:underline flex items-center gap-1">
              View Full Path <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <Card className="overflow-hidden">
            <div className="p-6">
              {/* Level Progress Bars */}
              <div className="space-y-4">
                {(['A1', 'A2', 'B1', 'B2'] as const).map((level, idx) => {
                  const levelProgress = getLevelProgress(level);
                  const percentage = levelProgress.total > 0
                    ? Math.round((levelProgress.completed / levelProgress.total) * 100)
                    : 0;
                  const isCurrentLevel = level === currentLevel;
                  const levelColors = {
                    A1: 'bg-emerald-500',
                    A2: 'bg-blue-500',
                    B1: 'bg-purple-500',
                    B2: 'bg-amber-500',
                  };
                  const levelLabels = {
                    A1: 'Beginner',
                    A2: 'Elementary',
                    B1: 'Intermediate',
                    B2: 'Upper Intermediate',
                  };

                  return (
                    <motion.div
                      key={level}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * idx }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className={`
                            text-sm font-bold px-2.5 py-1 rounded-lg
                            ${isCurrentLevel
                              ? `${levelColors[level]} text-white`
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}
                          `}>
                            {level}
                          </span>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {levelLabels[level]}
                          </span>
                          {isCurrentLevel && (
                            <span className="text-xs font-medium text-miro-blue dark:text-miro-yellow">
                              ← You are here
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {levelProgress.completed}/{levelProgress.total}
                        </span>
                      </div>
                      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${levelColors[level]} rounded-full`}
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 + 0.1 * idx }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Total Progress Summary */}
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-miro-blue dark:text-miro-yellow">
                        {overallProgress.percentage}%
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Complete</p>
                    </div>
                    <div className="w-px h-10 bg-gray-200 dark:bg-gray-700" />
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {totalXP}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">XP Earned</p>
                    </div>
                  </div>

                  <Button
                    onClick={handleStartLearningPath}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Open Learning Path
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.section>

        {/* Empty State - No cards loaded */}
        {!hasCards && <EmptyStateWithStarter />}
      </div>
    </motion.div>
  );
}

// Practice Card Component
interface PracticeCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: string;
  onClick: () => void;
  badge?: string;
}

function PracticeCard({ icon, title, subtitle, color, onClick, badge }: PracticeCardProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`
        relative p-4 rounded-2xl text-left text-white
        bg-gradient-to-br ${color} shadow-lg
        hover:shadow-xl hover:-translate-y-1
        transition-all duration-200
        group
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {badge && (
        <span className="absolute -top-2 -right-2 w-6 h-6 bg-miro-red text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
          {badge}
        </span>
      )}

      <div className="mb-2 opacity-90 group-hover:opacity-100 transition-opacity">
        {icon}
      </div>
      <h3 className="font-bold text-sm leading-tight">{title}</h3>
      <p className="text-xs opacity-75 mt-0.5">{subtitle}</p>
    </motion.button>
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
        className="text-center py-16"
      >
        <div className="w-20 h-20 mx-auto mb-6 bg-miro-green rounded-full flex items-center justify-center shadow-lg shadow-miro-green/30">
          <Sparkles size={40} className="text-white" />
        </div>
        <h2 className="text-2xl font-display font-bold text-miro-green mb-2">
          {loadedCount} cards loaded!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          You're ready to start learning Catalan.
        </p>
        <Link to="/learning-path">
          <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
            Start Learning Path
          </Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12"
    >
      <Card className="p-8 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-700">
        <motion.div
          className="w-20 h-20 mx-auto mb-6 bg-miro-yellow rounded-2xl flex items-center justify-center shadow-lg"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        >
          <Sparkles size={40} className="text-miro-blue" />
        </motion.div>

        <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-3">
          Ready to Learn Catalan?
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
          Load our starter vocabulary to begin your learning journey through the 20-unit course.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            onClick={handleLoadStarter}
            isLoading={isLoading}
            leftIcon={<Download size={20} />}
          >
            Load {STARTER_VOCABULARY_COUNT} Cards
          </Button>

          <span className="text-gray-400">or</span>

          <Link to="/import">
            <Button size="lg" variant="outline" leftIcon={<Upload size={20} />}>
              Import Your Own
            </Button>
          </Link>
        </div>
      </Card>
    </motion.section>
  );
}
