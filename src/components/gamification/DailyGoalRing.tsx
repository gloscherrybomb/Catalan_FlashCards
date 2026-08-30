import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Target, Check } from 'lucide-react';
import { useUserStore } from '../../stores/userStore';
import { todayKey } from '../../utils/dateKeys';

/**
 * Progress toward today's card goal.
 *
 * `dailyGoal` was set in the Settings page, asked for during onboarding, and
 * stored in every profile - and nothing in the app ever displayed progress
 * against it. A goal you cannot see is not a goal, so the number the learner
 * chose had no effect on anything.
 *
 * Reads dailyActivity, which recordStudySession already writes per local day.
 */
export function DailyGoalRing({ compact = false }: { compact?: boolean }) {
  const progress = useUserStore((state) => state.progress);
  const goal = useUserStore((state) => state.profile?.settings.dailyGoal ?? 20);

  const reviewedToday = useMemo(
    () => progress.dailyActivity?.[todayKey()]?.cards ?? 0,
    [progress.dailyActivity]
  );

  const pct = goal > 0 ? Math.min(100, Math.round((reviewedToday / goal) * 100)) : 0;
  const met = reviewedToday >= goal && goal > 0;

  // Circumference of an r=26 circle, for the stroke-dash trick.
  const radius = 26;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      className={`flex items-center gap-3 ${compact ? '' : 'p-4'}`}
      role="img"
      aria-label={`Daily goal: ${reviewedToday} of ${goal} cards reviewed today${met ? ', goal met' : ''}`}
    >
      <div className="relative w-16 h-16 flex-shrink-0">
        <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90" aria-hidden="true">
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            strokeWidth="6"
            className="stroke-miro-blue/10 dark:stroke-ink-light/10"
          />
          <motion.circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
            className={met ? 'stroke-miro-green' : 'stroke-miro-red'}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - pct / 100) }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center">
          {met ? (
            <Check className="w-6 h-6 text-miro-green" aria-hidden="true" />
          ) : (
            <span className="text-sm font-bold text-miro-blue dark:text-ink-light tabular-nums">
              {reviewedToday}
            </span>
          )}
        </span>
      </div>

      <div className="min-w-0">
        <p className="font-semibold text-miro-blue dark:text-ink-light flex items-center gap-1.5">
          <Target className="w-4 h-4" aria-hidden="true" />
          Today&rsquo;s goal
        </p>
        <p className="text-sm text-miro-blue/60 dark:text-ink-light/60">
          {met
            ? `Done — ${reviewedToday} cards reviewed`
            : `${reviewedToday} of ${goal} cards`}
        </p>
      </div>
    </div>
  );
}
