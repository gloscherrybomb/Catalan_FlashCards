import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Check, ChevronRight, Star, Lock } from 'lucide-react';
import { Card } from '../ui/Card';
import type { GrammarLesson } from '../../data/grammarLessons';
import { useGrammarStore } from '../../stores/grammarStore';

interface GrammarCardProps {
  lesson: GrammarLesson;
  index?: number;
  locked?: boolean;
}

const difficultyColors = {
  beginner: {
    bg: 'bg-miro-green/10 dark:bg-miro-green/20',
    text: 'text-miro-green',
    border: 'border-miro-green/30',
  },
  intermediate: {
    bg: 'bg-miro-yellow/10 dark:bg-miro-yellow/20',
    text: 'text-miro-yellow',
    border: 'border-miro-yellow/30',
  },
  advanced: {
    bg: 'bg-miro-red/10 dark:bg-miro-red/20',
    text: 'text-miro-red',
    border: 'border-miro-red/30',
  },
};

const categoryIcons: Record<string, string> = {
  articles: '📰',
  verbs: '⚡',
  pronouns: '👥',
  adjectives: '🎨',
  prepositions: '🔗',
  basics: '📚',
};

export function GrammarCard({ lesson, index = 0, locked = false }: GrammarCardProps) {
  const navigate = useNavigate();
  const getLessonProgress = useGrammarStore((state) => state.getLessonProgress);
  const progress = getLessonProgress(lesson.id);

  const isCompleted = progress?.completed ?? false;
  const bestScore = progress?.bestScore ?? 0;
  const hasStarted = (progress?.attempts ?? 0) > 0;

  const difficultyStyle = difficultyColors[lesson.difficulty];

  const handleClick = () => {
    if (!locked) {
      navigate(`/grammar/${lesson.id}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        hover={!locked}
        onClick={handleClick}
        className={`relative overflow-visible ${
          locked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
        } ${isCompleted ? 'ring-2 ring-miro-green/30' : ''}`}
      >
        {/* Completion checkmark */}
        {isCompleted && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 w-8 h-8 bg-miro-green rounded-full flex items-center justify-center shadow-lg z-10"
          >
            <Check className="w-5 h-5 text-white" />
          </motion.div>
        )}

        {/* Locked overlay */}
        {locked && (
          <div className="absolute inset-0 bg-gray-100/50 dark:bg-gray-900/50 rounded-2xl flex items-center justify-center z-10">
            <div className="p-3 bg-gray-200 dark:bg-gray-700 rounded-full">
              <Lock className="w-6 h-6 text-gray-400" />
            </div>
          </div>
        )}

        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className={`w-14 h-14 flex-shrink-0 rounded-xl flex items-center justify-center text-2xl ${
              isCompleted
                ? 'bg-miro-green/10 dark:bg-miro-green/20'
                : 'bg-miro-blue/10 dark:bg-miro-blue/20'
            }`}
          >
            {lesson.icon || categoryIcons[lesson.category] || '📖'}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title row */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-bold text-miro-blue dark:text-ink-light truncate">
                  {lesson.title}
                </h3>
                <p className="text-sm text-miro-blue/50 dark:text-ink-light/50 italic truncate">
                  {lesson.titleCatalan}
                </p>
              </div>
              {!locked && (
                <ChevronRight className="w-5 h-5 text-miro-blue/30 dark:text-ink-light/30 flex-shrink-0" />
              )}
            </div>

            {/* Metadata row */}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {/* Difficulty badge */}
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${difficultyStyle.bg} ${difficultyStyle.text}`}
              >
                {lesson.difficulty}
              </span>

              {/* Time estimate */}
              <span className="flex items-center gap-1 text-xs text-miro-blue/50 dark:text-ink-light/50">
                <Clock className="w-3 h-3" />
                {lesson.estimatedMinutes} min
              </span>

              {/* Score if completed */}
              {hasStarted && bestScore > 0 && (
                <span className="flex items-center gap-1 text-xs text-miro-yellow">
                  <Star className="w-3 h-3 fill-current" />
                  {bestScore}%
                </span>
              )}
            </div>

            {/* Progress bar (if started but not completed) */}
            {hasStarted && !isCompleted && (
              <div className="mt-3">
                <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${bestScore}%` }}
                    className="h-full bg-gradient-to-r from-miro-yellow to-miro-orange"
                  />
                </div>
              </div>
            )}

            {/* Exercise count */}
            <p className="text-xs text-miro-blue/40 dark:text-ink-light/40 mt-2">
              {lesson.exercises.length} exercise{lesson.exercises.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Decorative corner element */}
        <div
          className={`absolute bottom-0 right-0 w-16 h-16 rounded-tl-3xl -z-10 opacity-50 ${difficultyStyle.bg}`}
        />
      </Card>
    </motion.div>
  );
}

// Grid component for displaying multiple cards
interface GrammarCardGridProps {
  lessons: GrammarLesson[];
  title?: string;
}

export function GrammarCardGrid({ lessons, title }: GrammarCardGridProps) {
  if (lessons.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {title && (
        <h3 className="text-lg font-bold text-miro-blue dark:text-ink-light flex items-center gap-2">
          {title}
          <span className="px-2 py-0.5 bg-miro-blue/10 dark:bg-miro-blue/20 rounded-full text-sm font-normal">
            {lessons.length}
          </span>
        </h3>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {lessons.map((lesson, index) => (
          <GrammarCard key={lesson.id} lesson={lesson} index={index} />
        ))}
      </div>
    </div>
  );
}
