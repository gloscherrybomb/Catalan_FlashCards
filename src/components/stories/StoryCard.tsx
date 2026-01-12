import { motion } from 'framer-motion';
import { Clock, BookOpen, Star, Check, ChevronRight } from 'lucide-react';
import type { Story } from '../../data/stories';
import type { StoryProgress } from '../../stores/storyStore';

interface StoryCardProps {
  story: Story;
  progress?: StoryProgress;
  index: number;
  onClick: () => void;
}

export function StoryCard({ story, progress, index, onClick }: StoryCardProps) {
  const isCompleted = progress?.completed;
  const hasStarted = (progress?.readCount || 0) > 0;
  const bestScore = progress?.bestQuizScore || 0;

  const getLevelColor = () => {
    switch (story.level) {
      case 'A1': return 'from-emerald-400 to-teal-500';
      case 'A2': return 'from-blue-400 to-indigo-500';
      case 'B1': return 'from-violet-400 to-purple-500';
      case 'B2': return 'from-rose-400 to-red-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getLevelBadgeColor = () => {
    switch (story.level) {
      case 'A1': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'A2': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'B1': return 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400';
      case 'B2': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryLabel = () => {
    switch (story.category) {
      case 'daily-life': return 'Daily Life';
      case 'travel': return 'Travel';
      case 'culture': return 'Culture';
      case 'history': return 'History';
      case 'fiction': return 'Fiction';
      default: return story.category;
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className={`
        w-full p-4 rounded-2xl border-2 text-left transition-all duration-200
        ${isCompleted
          ? 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-300 dark:border-emerald-700'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-miro-blue dark:hover:border-miro-yellow hover:shadow-lg'
        }
      `}
    >
      <div className="flex items-start gap-4">
        {/* Story Icon */}
        <div className={`
          relative w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0
          ${isCompleted
            ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
            : `bg-gradient-to-br ${getLevelColor()}`
          }
        `}>
          {isCompleted ? (
            <Check className="w-8 h-8 text-white" strokeWidth={3} />
          ) : (
            <span className="text-3xl">{story.icon}</span>
          )}

          {/* Score badge for completed stories */}
          {isCompleted && bestScore > 0 && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-miro-yellow rounded-full flex items-center justify-center">
              <Star className="w-3.5 h-3.5 text-miro-blue fill-miro-blue" />
            </div>
          )}
        </div>

        {/* Story Info */}
        <div className="flex-1 min-w-0">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getLevelBadgeColor()}`}>
              {story.level}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {getCategoryLabel()}
            </span>
            {hasStarted && !isCompleted && (
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                In Progress
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-bold text-gray-900 dark:text-white truncate">
            {story.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {story.titleCatalan}
          </p>

          {/* Meta info */}
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{story.estimatedMinutes} min</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{story.paragraphs.length} paragraphs</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-miro-blue dark:text-miro-yellow font-medium">
              <span>+{story.xpReward} XP</span>
            </div>
          </div>

          {/* Quiz score for completed stories */}
          {isCompleted && bestScore > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                  style={{ width: `${bestScore}%` }}
                />
              </div>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                {bestScore}%
              </span>
            </div>
          )}
        </div>

        {/* Arrow */}
        <ChevronRight className={`w-5 h-5 flex-shrink-0 mt-5 ${
          isCompleted ? 'text-emerald-500' : 'text-gray-400 dark:text-gray-500'
        }`} />
      </div>
    </motion.button>
  );
}
