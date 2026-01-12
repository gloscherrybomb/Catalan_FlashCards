import { motion } from 'framer-motion';
import { Check, Lock, ChevronRight, Trophy } from 'lucide-react';
import type { CurriculumUnit, CEFRLevel } from '../../data/curriculum';
import { useCurriculumStore } from '../../stores/curriculumStore';

interface SkillTreeProps {
  units: CurriculumUnit[];
  onSelectUnit: (unit: CurriculumUnit) => void;
  selectedUnitId?: string;
}

export function SkillTree({ units, onSelectUnit, selectedUnitId }: SkillTreeProps) {
  const { isUnitCompleted, isUnitUnlocked, getUnitProgress } = useCurriculumStore();

  const getLevelGradient = (level: CEFRLevel) => {
    switch (level) {
      case 'A1':
        return 'from-emerald-400 to-teal-500';
      case 'A2':
        return 'from-blue-400 to-indigo-500';
      case 'B1':
        return 'from-violet-400 to-purple-500';
      case 'B2':
        return 'from-rose-400 to-red-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const getLevelBg = (level: CEFRLevel) => {
    switch (level) {
      case 'A1':
        return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800';
      case 'A2':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'B1':
        return 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800';
      case 'B2':
        return 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="space-y-3">
      {units.map((unit, index) => {
        const isCompleted = isUnitCompleted(unit.id);
        const isUnlocked = isUnitUnlocked(unit.id);
        const progress = getUnitProgress(unit.id);
        const isSelected = selectedUnitId === unit.id;
        const progressPercent = progress.total > 0
          ? Math.round((progress.completed / progress.total) * 100)
          : 0;

        return (
          <motion.div
            key={unit.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            {/* Connector line from previous unit */}
            {index > 0 && (
              <div className="flex justify-center -mt-3 mb-0">
                <div className={`w-1 h-6 rounded-full ${
                  isUnlocked
                    ? 'bg-gradient-to-b from-transparent via-miro-blue/30 to-miro-blue/30'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`} />
              </div>
            )}

            <button
              onClick={() => isUnlocked && onSelectUnit(unit)}
              disabled={!isUnlocked}
              className={`
                w-full p-4 rounded-2xl border-2 transition-all duration-200
                ${!isUnlocked
                  ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                  : isSelected
                    ? `${getLevelBg(unit.level)} border-miro-blue dark:border-miro-yellow shadow-lg`
                    : isCompleted
                      ? 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-300 dark:border-emerald-700 hover:shadow-md'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-miro-blue dark:hover:border-miro-yellow hover:shadow-md'
                }
              `}
            >
              <div className="flex items-center gap-4">
                {/* Unit Icon */}
                <div className={`
                  relative w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0
                  ${!isUnlocked
                    ? 'bg-gray-200 dark:bg-gray-700'
                    : isCompleted
                      ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
                      : `bg-gradient-to-br ${unit.color}`
                  }
                `}>
                  {!isUnlocked ? (
                    <Lock className="w-7 h-7 text-gray-400 dark:text-gray-500" />
                  ) : isCompleted ? (
                    <Check className="w-8 h-8 text-white" strokeWidth={3} />
                  ) : (
                    <span className="text-3xl">{unit.icon}</span>
                  )}

                  {/* Milestone badge */}
                  {isCompleted && unit.milestoneTitle && (
                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-miro-yellow rounded-full flex items-center justify-center shadow-lg">
                      <Trophy className="w-4 h-4 text-miro-blue" />
                    </div>
                  )}
                </div>

                {/* Unit Info */}
                <div className="flex-1 text-left min-w-0">
                  {/* Level badge */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`
                      text-xs font-bold px-2 py-0.5 rounded-full
                      bg-gradient-to-r ${getLevelGradient(unit.level)} text-white
                    `}>
                      {unit.level}
                    </span>
                    {unit.milestoneTitle && isCompleted && (
                      <span className="text-xs font-medium text-miro-yellow">
                        {unit.milestoneTitle}
                      </span>
                    )}
                  </div>

                  <h3 className={`font-bold text-lg truncate ${
                    !isUnlocked
                      ? 'text-gray-400 dark:text-gray-500'
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {unit.title}
                  </h3>

                  <p className={`text-sm truncate ${
                    !isUnlocked
                      ? 'text-gray-400 dark:text-gray-600'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {unit.titleCatalan}
                  </p>

                  {/* Progress bar */}
                  {isUnlocked && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className={isCompleted ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-gray-500 dark:text-gray-400'}>
                          {progress.completed}/{progress.total} lessons
                        </span>
                        <span className={isCompleted ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-gray-500 dark:text-gray-400'}>
                          {progressPercent}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercent}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className={`h-full rounded-full ${
                            isCompleted
                              ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                              : `bg-gradient-to-r ${unit.color}`
                          }`}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Arrow */}
                {isUnlocked && (
                  <ChevronRight className={`w-6 h-6 flex-shrink-0 transition-transform ${
                    isSelected ? 'rotate-90 text-miro-blue dark:text-miro-yellow' : 'text-gray-400 dark:text-gray-500'
                  }`} />
                )}
              </div>
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}
