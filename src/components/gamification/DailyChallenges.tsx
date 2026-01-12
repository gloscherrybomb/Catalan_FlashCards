import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Flame, Trophy } from 'lucide-react';
import { Card, CardTitle } from '../ui/Card';
import type { DailyChallenge } from '../../types/challenges';
import { getChallengeProgress, isChallengeComplete } from '../../types/challenges';

interface DailyChallengesProps {
  challenges: DailyChallenge[];
  onChallengeClick?: (challenge: DailyChallenge) => void;
}

export function DailyChallenges({ challenges, onChallengeClick }: DailyChallengesProps) {
  const completedCount = useMemo(
    () => challenges.filter(c => isChallengeComplete(c)).length,
    [challenges]
  );

  const allComplete = completedCount === challenges.length && challenges.length > 0;

  const timeRemaining = useMemo(() => {
    if (challenges.length === 0) return '';
    const now = new Date();
    const expires = new Date(challenges[0].expiresAt);
    const diff = expires.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  }, [challenges]);

  if (challenges.length === 0) {
    return null;
  }

  return (
    <Card className={allComplete ? 'ring-2 ring-success/50' : ''}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${allComplete ? 'bg-success/20' : 'bg-primary/10'}`}>
            {allComplete ? (
              <Trophy className="w-5 h-5 text-success" />
            ) : (
              <Flame className="w-5 h-5 text-primary" />
            )}
          </div>
          <div>
            <CardTitle className="text-base">Daily Challenges</CardTitle>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeRemaining}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-gray-800 dark:text-white">
            {completedCount}/{challenges.length}
          </span>
          <p className="text-xs text-gray-500 dark:text-gray-400">Complete</p>
        </div>
      </div>

      {/* Challenge list */}
      <div className="space-y-3">
        {challenges.map((challenge, index) => {
          const isComplete = isChallengeComplete(challenge);
          const progress = getChallengeProgress(challenge);

          return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onChallengeClick?.(challenge)}
              className={`relative p-3 rounded-xl border-2 transition-all cursor-pointer
                ${isComplete
                  ? 'border-success/30 bg-success/5 dark:bg-success/10'
                  : 'border-gray-100 dark:border-gray-700 hover:border-primary/30 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`text-2xl flex-shrink-0 ${isComplete ? 'grayscale-0' : ''}`}>
                  {challenge.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-semibold text-sm
                      ${isComplete ? 'text-success line-through' : 'text-gray-800 dark:text-white'}`}
                    >
                      {challenge.title}
                    </h4>
                    {isComplete && (
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {challenge.description}
                  </p>

                  {/* Progress bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${isComplete ? 'bg-success' : 'bg-primary'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {challenge.current}/{challenge.target}
                    </span>
                  </div>
                </div>

                {/* Reward */}
                <div className="text-right flex-shrink-0">
                  <span className={`text-sm font-bold
                    ${isComplete ? 'text-success' : 'text-primary'}`}
                  >
                    +{challenge.xpReward}
                  </span>
                  <p className="text-[10px] text-gray-400">XP</p>
                </div>
              </div>

              {/* Bonus multiplier badge */}
              {challenge.bonusMultiplier > 1 && !isComplete && (
                <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-accent text-xs font-bold
                              text-gray-800 rounded-full shadow-sm">
                  {challenge.bonusMultiplier}x bonus
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* All complete celebration */}
      {allComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 p-3 bg-gradient-to-r from-success/20 to-secondary/20 rounded-xl text-center"
        >
          <p className="text-sm font-semibold text-gray-800 dark:text-white">
            All challenges complete! Come back tomorrow for more.
          </p>
        </motion.div>
      )}
    </Card>
  );
}

// Mini version for header/sidebar
export function DailyChallengesMini({ challenges }: { challenges: DailyChallenge[] }) {
  const completedCount = challenges.filter(c => isChallengeComplete(c)).length;
  const allComplete = completedCount === challenges.length && challenges.length > 0;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full
      ${allComplete
        ? 'bg-success/10 text-success'
        : 'bg-primary/10 text-primary'}`}
    >
      {allComplete ? (
        <Trophy className="w-4 h-4" />
      ) : (
        <Flame className="w-4 h-4" />
      )}
      <span className="text-sm font-semibold">{completedCount}/{challenges.length}</span>
    </div>
  );
}
