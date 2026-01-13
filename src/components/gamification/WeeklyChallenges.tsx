import { motion } from 'framer-motion';
import { Calendar, Trophy, Clock, CheckCircle, Star } from 'lucide-react';
import { Card, CardTitle } from '../ui/Card';
import {
  WeeklyChallenge,
  getWeeklyChallengeProgress,
  isWeeklyChallengeComplete,
  getWeekEnd,
} from '../../types/weeklyChallenges';
import { differenceInDays, differenceInHours } from 'date-fns';

interface WeeklyChallengesProps {
  challenges: WeeklyChallenge[];
}

function getDifficultyColor(difficulty: 'easy' | 'medium' | 'hard'): string {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'hard':
      return 'bg-red-500';
  }
}

function getDifficultyGradient(difficulty: 'easy' | 'medium' | 'hard'): string {
  switch (difficulty) {
    case 'easy':
      return 'from-green-400 to-emerald-500';
    case 'medium':
      return 'from-yellow-400 to-orange-500';
    case 'hard':
      return 'from-red-400 to-rose-600';
  }
}

export function WeeklyChallenges({ challenges }: WeeklyChallengesProps) {
  const weekEnd = getWeekEnd();
  const now = new Date();
  const daysLeft = differenceInDays(weekEnd, now);
  const hoursLeft = differenceInHours(weekEnd, now) % 24;

  const completedCount = challenges.filter(isWeeklyChallengeComplete).length;
  const allCompleted = completedCount === challenges.length && challenges.length > 0;

  if (challenges.length === 0) return null;

  return (
    <Card variant="bordered" className="overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-miro-blue dark:text-ink-light" />
          <CardTitle className="mb-0">Weekly Challenges</CardTitle>
        </div>
        <div className="flex items-center gap-2 text-sm text-miro-blue/60 dark:text-ink-light/60">
          <Clock className="w-4 h-4" />
          <span>
            {daysLeft > 0 ? `${daysLeft}d ${hoursLeft}h left` : `${hoursLeft}h left`}
          </span>
        </div>
      </div>

      {/* Progress summary */}
      <div className="flex items-center gap-2 mb-4 p-3 bg-miro-blue/5 dark:bg-ink-light/5 rounded-xl">
        <Trophy className={`w-5 h-5 ${allCompleted ? 'text-miro-yellow' : 'text-miro-blue/40'}`} />
        <span className="text-sm font-medium text-miro-blue dark:text-ink-light">
          {completedCount}/{challenges.length} completed
        </span>
        {allCompleted && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="ml-auto text-xs bg-miro-yellow text-miro-blue px-2 py-0.5 rounded-full font-semibold"
          >
            Week Complete!
          </motion.span>
        )}
      </div>

      <div className="space-y-4">
        {challenges.map((challenge, index) => {
          const progress = getWeeklyChallengeProgress(challenge);
          const isComplete = isWeeklyChallengeComplete(challenge);

          return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-4 rounded-xl border-2 transition-all ${
                isComplete
                  ? 'border-miro-green/30 bg-miro-green/5'
                  : 'border-miro-blue/10 dark:border-ink-light/10 bg-white dark:bg-ink-dark/50'
              }`}
            >
              {/* Difficulty badge */}
              <div className="absolute top-2 right-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full text-white font-medium ${getDifficultyColor(
                    challenge.difficulty
                  )}`}
                >
                  {challenge.difficulty}
                </span>
              </div>

              <div className="flex items-start gap-3">
                <motion.div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                    isComplete
                      ? 'bg-miro-green/20'
                      : 'bg-gradient-to-br ' + getDifficultyGradient(challenge.difficulty) + '/10'
                  }`}
                  animate={isComplete ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {isComplete ? (
                    <CheckCircle className="w-6 h-6 text-miro-green" />
                  ) : (
                    challenge.icon
                  )}
                </motion.div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-miro-blue dark:text-ink-light">
                      {challenge.title}
                    </h4>
                    {isComplete && (
                      <Star className="w-4 h-4 text-miro-yellow fill-miro-yellow" />
                    )}
                  </div>
                  <p className="text-sm text-miro-blue/60 dark:text-ink-light/60 mt-0.5">
                    {challenge.description}
                  </p>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-miro-blue/60 dark:text-ink-light/60">
                        {challenge.current} / {challenge.target}
                      </span>
                      <span className="font-medium text-miro-blue dark:text-ink-light">
                        +{challenge.xpReward} XP
                      </span>
                    </div>
                    <div className="h-2 bg-miro-blue/10 dark:bg-ink-light/10 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${getDifficultyGradient(
                          challenge.difficulty
                        )}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      />
                    </div>
                  </div>

                  {/* Bonus multiplier */}
                  <div className="mt-2 flex items-center gap-1 text-xs text-miro-blue/50 dark:text-ink-light/50">
                    <span>Bonus: {challenge.bonusMultiplier}x XP</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* All complete bonus */}
      {allCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-gradient-to-r from-miro-yellow/20 to-miro-orange/20 rounded-xl border-2 border-miro-yellow/30"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Trophy className="w-8 h-8 text-miro-yellow" />
            </motion.div>
            <div>
              <p className="font-bold text-miro-blue dark:text-ink-light">
                Weekly Champion!
              </p>
              <p className="text-sm text-miro-blue/60 dark:text-ink-light/60">
                You completed all weekly challenges! +500 bonus XP
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </Card>
  );
}
