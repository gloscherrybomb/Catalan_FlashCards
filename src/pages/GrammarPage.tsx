import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookText,
  ArrowLeft,
  Clock,
  Trophy,
  Lightbulb,
  Volume2,
  Play,
  Sparkles,
  Check,
  Filter,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { GrammarCard } from '../components/grammar/GrammarCard';
import { GrammarExercises } from '../components/grammar/GrammarExercise';
import { ConjugationTable } from '../components/grammar/ConjugationTable';
import {
  GRAMMAR_LESSONS,
  type GrammarLesson,
  type GrammarExample,
} from '../data/grammarLessons';
import { useGrammarStore } from '../stores/grammarStore';
import { audioService } from '../services/audioService';

type DifficultyFilter = 'all' | 'beginner' | 'intermediate' | 'advanced';
type CategoryFilter = string | 'all';

// Helper to highlight words in example sentences
function HighlightedExample({ example }: { example: GrammarExample }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayAudio = async () => {
    setIsPlaying(true);
    try {
      await audioService.speakCatalan(example.catalan);
    } finally {
      setIsPlaying(false);
    }
  };

  const highlightedCatalan = example.highlight
    ? example.catalan.replace(
        new RegExp(`(${example.highlight})`, 'gi'),
        '<mark>$1</mark>'
      )
    : example.catalan;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-3 p-3 bg-miro-blue/5 dark:bg-miro-blue/10 rounded-xl group"
    >
      <button
        onClick={handlePlayAudio}
        disabled={isPlaying}
        className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
          isPlaying
            ? 'bg-miro-green text-white'
            : 'bg-miro-blue/10 dark:bg-miro-blue/20 text-miro-blue dark:text-ink-light hover:bg-miro-yellow/20'
        }`}
      >
        <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-pulse' : ''}`} />
      </button>
      <div className="flex-1 min-w-0">
        <p
          className="font-medium text-miro-blue dark:text-ink-light [&_mark]:bg-miro-yellow/40 [&_mark]:px-1 [&_mark]:rounded [&_mark]:text-miro-blue dark:[&_mark]:text-ink-light"
          dangerouslySetInnerHTML={{ __html: highlightedCatalan }}
        />
        <p className="text-sm text-miro-blue/60 dark:text-ink-light/60 mt-0.5">
          {example.english}
        </p>
      </div>
    </motion.div>
  );
}

// Lesson Detail Component
function LessonDetail({ lesson }: { lesson: GrammarLesson }) {
  const navigate = useNavigate();
  const [showExercises, setShowExercises] = useState(false);
  const { startLesson, completeExercise, completeLesson, getLessonProgress } =
    useGrammarStore();

  const progress = getLessonProgress(lesson.id);
  const isCompleted = progress?.completed ?? false;

  const handleStartExercises = () => {
    startLesson(lesson.id);
    setShowExercises(true);
  };

  const handleExerciseComplete = (exerciseId: string, correct: boolean) => {
    completeExercise(lesson.id, exerciseId, correct);
  };

  const handleAllExercisesComplete = (_score: number) => {
    completeLesson(lesson.id);
    // Stay on exercises to show completion screen
  };

  if (showExercises) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setShowExercises(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-miro-blue dark:text-ink-light" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-miro-blue dark:text-ink-light">
                {lesson.title} - Exercises
              </h1>
              <p className="text-sm text-miro-blue/60 dark:text-ink-light/60">
                Test your knowledge
              </p>
            </div>
          </div>

          <GrammarExercises
            exercises={lesson.exercises}
            onComplete={handleAllExercisesComplete}
            onExerciseComplete={handleExerciseComplete}
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Back button and header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/grammar')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-miro-blue dark:text-ink-light" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-miro-blue dark:text-ink-light">
                {lesson.title}
              </h1>
              {isCompleted && (
                <span className="px-2 py-0.5 bg-miro-green/10 text-miro-green rounded-full text-xs font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" /> Completed
                </span>
              )}
            </div>
            <p className="text-miro-blue/60 dark:text-ink-light/60 italic">
              {lesson.titleCatalan}
            </p>
          </div>
        </div>

        {/* Metadata badges */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              lesson.difficulty === 'beginner'
                ? 'bg-miro-green/10 text-miro-green'
                : lesson.difficulty === 'intermediate'
                ? 'bg-miro-yellow/10 text-miro-yellow'
                : 'bg-miro-red/10 text-miro-red'
            }`}
          >
            {lesson.difficulty}
          </span>
          <span className="flex items-center gap-1 text-sm text-miro-blue/60 dark:text-ink-light/60">
            <Clock className="w-4 h-4" />
            {lesson.estimatedMinutes} min
          </span>
          <span className="flex items-center gap-1 text-sm text-miro-blue/60 dark:text-ink-light/60">
            <Lightbulb className="w-4 h-4" />
            {lesson.exercises.length} exercises
          </span>
        </div>

        {/* Introduction */}
        <Card className="mb-6 bg-gradient-to-br from-miro-yellow/5 to-miro-orange/5 dark:from-miro-yellow/10 dark:to-miro-orange/5 border border-miro-yellow/20">
          <p className="text-lg text-miro-blue dark:text-ink-light leading-relaxed">
            {lesson.content.introduction}
          </p>
        </Card>

        {/* Sections */}
        <div className="space-y-8">
          {lesson.content.sections.map((section, sectionIndex) => (
            <motion.div
              key={sectionIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
            >
              <Card>
                {/* Section title */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-miro-red rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {sectionIndex + 1}
                  </div>
                  <h2 className="text-xl font-bold text-miro-blue dark:text-ink-light">
                    {section.title}
                  </h2>
                </div>

                {/* Explanation */}
                <p className="text-miro-blue/80 dark:text-ink-light/80 mb-6 leading-relaxed">
                  {section.explanation}
                </p>

                {/* Examples */}
                {section.examples.length > 0 && (
                  <div className="space-y-2 mb-6">
                    <h4 className="text-sm font-bold text-miro-blue/60 dark:text-ink-light/60 uppercase tracking-wider mb-3">
                      Examples
                    </h4>
                    {section.examples.map((example, exIndex) => (
                      <HighlightedExample key={exIndex} example={example} />
                    ))}
                  </div>
                )}

                {/* Conjugation Table */}
                {section.table && (
                  <div className="mb-6">
                    <ConjugationTable table={section.table} />
                  </div>
                )}

                {/* Tips */}
                {section.tips && section.tips.length > 0 && (
                  <div className="p-4 bg-miro-green/5 dark:bg-miro-green/10 rounded-xl border border-miro-green/20">
                    <h4 className="text-sm font-bold text-miro-green mb-3 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Tips to Remember
                    </h4>
                    <ul className="space-y-2">
                      {section.tips.map((tip, tipIndex) => (
                        <li
                          key={tipIndex}
                          className="flex items-start gap-2 text-sm text-miro-blue/70 dark:text-ink-light/70"
                        >
                          <span className="text-miro-green mt-0.5">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Start Exercises Button */}
        {lesson.exercises.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Button
              fullWidth
              size="lg"
              onClick={handleStartExercises}
              leftIcon={<Play className="w-5 h-5" />}
              variant={isCompleted ? 'secondary' : 'primary'}
            >
              {isCompleted ? 'Practice Again' : 'Start Exercises'}
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

// Main Grammar Page Component
export function GrammarPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  const { getCompletedLessonCount, getTotalScore } = useGrammarStore();

  const completedCount = getCompletedLessonCount();
  const averageScore = getTotalScore();

  // If we have a lessonId, show the lesson detail
  const currentLesson = lessonId
    ? GRAMMAR_LESSONS.find((l) => l.id === lessonId)
    : null;

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(GRAMMAR_LESSONS.map((l) => l.category));
    return Array.from(cats);
  }, []);

  // Filter lessons
  const filteredLessons = useMemo(() => {
    return GRAMMAR_LESSONS.filter((lesson) => {
      const matchesDifficulty =
        difficultyFilter === 'all' || lesson.difficulty === difficultyFilter;
      const matchesCategory =
        categoryFilter === 'all' || lesson.category === categoryFilter;
      return matchesDifficulty && matchesCategory;
    });
  }, [difficultyFilter, categoryFilter]);

  // Show lesson detail if we have a lesson
  if (currentLesson) {
    return <LessonDetail lesson={currentLesson} />;
  }

  // Show 404 if lessonId is invalid
  if (lessonId && !currentLesson) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-miro-blue dark:text-ink-light mb-4">
          Lesson not found
        </h1>
        <Button onClick={() => navigate('/grammar')}>Back to Grammar</Button>
      </div>
    );
  }

  // Lesson List View
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-miro-red/10 dark:bg-miro-red/20 rounded-xl flex items-center justify-center">
            <BookText className="w-6 h-6 text-miro-red" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-miro-blue dark:text-ink-light">
              Grammar Lessons
            </h1>
            <p className="text-miro-blue/60 dark:text-ink-light/60 italic">
              Gramàtica
            </p>
          </div>
        </div>

        {/* Progress Summary */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-miro-green/5 to-miro-green/10 dark:from-miro-green/10 dark:to-miro-green/5 border border-miro-green/20">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-miro-green/10 dark:bg-miro-green/20 rounded-xl">
                <Trophy className="w-6 h-6 text-miro-green" />
              </div>
              <div>
                <p className="text-2xl font-bold text-miro-green">
                  {completedCount}/{GRAMMAR_LESSONS.length}
                </p>
                <p className="text-sm text-miro-blue/60 dark:text-ink-light/60">
                  Lessons Completed
                </p>
              </div>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-miro-yellow/5 to-miro-yellow/10 dark:from-miro-yellow/10 dark:to-miro-yellow/5 border border-miro-yellow/20">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-miro-yellow/10 dark:bg-miro-yellow/20 rounded-xl">
                <Sparkles className="w-6 h-6 text-miro-yellow" />
              </div>
              <div>
                <p className="text-2xl font-bold text-miro-yellow">
                  {averageScore || 0}%
                </p>
                <p className="text-sm text-miro-blue/60 dark:text-ink-light/60">
                  Average Score
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="space-y-4 mb-8">
          {/* Difficulty filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-miro-blue/60 dark:text-ink-light/60 mr-2">
              Level:
            </span>
            {(['all', 'beginner', 'intermediate', 'advanced'] as DifficultyFilter[]).map(
              (diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficultyFilter(diff)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    difficultyFilter === diff
                      ? diff === 'beginner'
                        ? 'bg-miro-green text-white shadow-playful-sm'
                        : diff === 'intermediate'
                        ? 'bg-miro-yellow text-miro-blue shadow-playful-sm'
                        : diff === 'advanced'
                        ? 'bg-miro-red text-white shadow-playful-sm'
                        : 'bg-miro-blue text-white shadow-playful-sm dark:bg-ink-light dark:text-miro-blue'
                      : 'bg-gray-100 dark:bg-gray-800 text-miro-blue/70 dark:text-ink-light/70 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {diff === 'all' ? 'All Levels' : diff}
                </button>
              )
            )}
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-miro-blue/60 dark:text-ink-light/60 mr-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Category:
            </span>
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                categoryFilter === 'all'
                  ? 'bg-miro-blue text-white shadow-playful-sm dark:bg-ink-light dark:text-miro-blue'
                  : 'bg-gray-100 dark:bg-gray-800 text-miro-blue/70 dark:text-ink-light/70 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${
                  categoryFilter === cat
                    ? 'bg-miro-orange text-white shadow-playful-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-miro-blue/70 dark:text-ink-light/70 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Lessons Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${difficultyFilter}-${categoryFilter}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-4 sm:grid-cols-2"
          >
            {filteredLessons.map((lesson, index) => (
              <GrammarCard key={lesson.id} lesson={lesson} index={index} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Empty state */}
        {filteredLessons.length === 0 && (
          <div className="text-center py-12">
            <p className="text-miro-blue/50 dark:text-ink-light/50">
              No lessons match your filters.
            </p>
            <Button
              variant="ghost"
              onClick={() => {
                setDifficultyFilter('all');
                setCategoryFilter('all');
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
