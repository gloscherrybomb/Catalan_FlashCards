import { motion } from 'framer-motion';
import { Check, Lock, Clock, Star, ChevronRight } from 'lucide-react';
import type { CurriculumLesson } from '../../data/curriculum';
import type { LessonProgress } from '../../stores/curriculumStore';

interface LessonCardProps {
  lesson: CurriculumLesson;
  progress?: LessonProgress;
  isLocked: boolean;
  index: number;
  onClick: () => void;
}

export function LessonCard({
  lesson,
  progress,
  isLocked,
  index,
  onClick,
}: LessonCardProps) {
  const isCompleted = progress?.completed;
  const hasStarted = (progress?.attempts || 0) > 0;

  const getTypeColor = () => {
    switch (lesson.content.type) {
      case 'vocabulary':
        return 'from-emerald-500 to-teal-600';
      case 'grammar':
        return 'from-violet-500 to-purple-600';
      case 'conversation':
        return 'from-amber-500 to-orange-600';
      case 'culture':
        return 'from-rose-500 to-pink-600';
      default:
        return 'from-blue-500 to-indigo-600';
    }
  };

  const getTypeBadge = () => {
    switch (lesson.content.type) {
      case 'vocabulary':
        return { label: 'Vocab', bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' };
      case 'grammar':
        return { label: 'Grammar', bg: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' };
      case 'conversation':
        return { label: 'Speak', bg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' };
      case 'culture':
        return { label: 'Culture', bg: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' };
      default:
        return { label: 'Lesson', bg: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' };
    }
  };

  const typeBadge = getTypeBadge();

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      disabled={isLocked}
      className={`
        w-full flex items-center gap-4 p-4 rounded-2xl
        border-2 transition-all duration-200
        ${isLocked
          ? 'bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60 cursor-not-allowed'
          : isCompleted
            ? 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-300 dark:border-emerald-700'
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-miro-blue dark:hover:border-miro-blue hover:shadow-lg'
        }
      `}
    >
      {/* Lesson Icon */}
      <div className={`
        relative w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0
        ${isLocked
          ? 'bg-gray-200 dark:bg-gray-700'
          : isCompleted
            ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
            : `bg-gradient-to-br ${getTypeColor()}`
        }
      `}>
        {isLocked ? (
          <Lock className="w-6 h-6 text-gray-400 dark:text-gray-500" />
        ) : isCompleted ? (
          <Check className="w-7 h-7 text-white" strokeWidth={3} />
        ) : (
          <span className="text-2xl">{lesson.icon}</span>
        )}

        {/* Score badge */}
        {isCompleted && progress?.score !== undefined && progress.score > 0 && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-miro-yellow rounded-full flex items-center justify-center">
            <Star className="w-3.5 h-3.5 text-miro-blue fill-miro-blue" />
          </div>
        )}
      </div>

      {/* Lesson Info */}
      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeBadge.bg}`}>
            {typeBadge.label}
          </span>
          {hasStarted && !isCompleted && (
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              In Progress
            </span>
          )}
        </div>

        <h4 className={`font-semibold truncate ${
          isLocked
            ? 'text-gray-400 dark:text-gray-500'
            : 'text-gray-900 dark:text-white'
        }`}>
          {lesson.title}
        </h4>

        <p className={`text-sm truncate ${
          isLocked
            ? 'text-gray-400 dark:text-gray-600'
            : 'text-gray-500 dark:text-gray-400'
        }`}>
          {lesson.titleCatalan}
        </p>

        {/* Meta info */}
        <div className="flex items-center gap-3 mt-1.5">
          <div className={`flex items-center gap-1 text-xs ${
            isLocked ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{lesson.estimatedMinutes} min</span>
          </div>
          <div className={`flex items-center gap-1 text-xs ${
            isLocked ? 'text-gray-400' : 'text-miro-blue dark:text-miro-yellow'
          }`}>
            <span className="font-medium">+{lesson.xpReward} XP</span>
          </div>
        </div>
      </div>

      {/* Arrow */}
      {!isLocked && (
        <ChevronRight className={`w-5 h-5 flex-shrink-0 ${
          isCompleted
            ? 'text-emerald-500'
            : 'text-gray-400 dark:text-gray-500'
        }`} />
      )}
    </motion.button>
  );
}
