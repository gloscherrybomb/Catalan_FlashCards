import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, subDays, startOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';

interface DayActivity {
  date: Date;
  cardsReviewed: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface ActivityHeatmapProps {
  activityData: Record<string, number>; // date string -> cards reviewed
  weeks?: number;
}

const LEVEL_COLORS = {
  0: 'bg-gray-100 dark:bg-gray-700',
  1: 'bg-emerald-200 dark:bg-emerald-800',
  2: 'bg-emerald-400 dark:bg-emerald-600',
  3: 'bg-emerald-500 dark:bg-emerald-500',
  4: 'bg-emerald-600 dark:bg-emerald-400',
};

const LEVEL_THRESHOLDS = [0, 5, 15, 25, 40];

function getActivityLevel(cardsReviewed: number): 0 | 1 | 2 | 3 | 4 {
  if (cardsReviewed >= LEVEL_THRESHOLDS[4]) return 4;
  if (cardsReviewed >= LEVEL_THRESHOLDS[3]) return 3;
  if (cardsReviewed >= LEVEL_THRESHOLDS[2]) return 2;
  if (cardsReviewed >= LEVEL_THRESHOLDS[1]) return 1;
  return 0;
}

export function ActivityHeatmap({ activityData, weeks = 12 }: ActivityHeatmapProps) {
  const days = useMemo(() => {
    const today = new Date();
    const startDate = startOfWeek(subDays(today, weeks * 7 - 1));
    const endDate = today;

    const allDays = eachDayOfInterval({ start: startDate, end: endDate });

    return allDays.map((date): DayActivity => {
      const dateKey = format(date, 'yyyy-MM-dd');
      const cardsReviewed = activityData[dateKey] || 0;
      return {
        date,
        cardsReviewed,
        level: getActivityLevel(cardsReviewed),
      };
    });
  }, [activityData, weeks]);

  // Group days by week
  const weekGroups = useMemo(() => {
    const groups: DayActivity[][] = [];
    let currentWeek: DayActivity[] = [];

    days.forEach((day, index) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || index === days.length - 1) {
        groups.push(currentWeek);
        currentWeek = [];
      }
    });

    return groups;
  }, [days]);

  const today = new Date();
  const monthLabels = useMemo(() => {
    const labels: { month: string; index: number }[] = [];
    let lastMonth = -1;

    weekGroups.forEach((week, weekIndex) => {
      const firstDayOfWeek = week[0];
      const month = firstDayOfWeek.date.getMonth();
      if (month !== lastMonth) {
        labels.push({
          month: format(firstDayOfWeek.date, 'MMM'),
          index: weekIndex,
        });
        lastMonth = month;
      }
    });

    return labels;
  }, [weekGroups]);

  const totalCards = Object.values(activityData).reduce((sum, count) => sum + count, 0);
  const activeDays = Object.values(activityData).filter(count => count > 0).length;

  return (
    <div className="space-y-4">
      {/* Stats summary */}
      <div className="flex justify-between text-sm">
        <span className="text-gray-500 dark:text-gray-400">
          {totalCards.toLocaleString()} cards reviewed in the last {weeks} weeks
        </span>
        <span className="text-gray-500 dark:text-gray-400">
          {activeDays} active days
        </span>
      </div>

      {/* Month labels */}
      <div className="flex gap-1 ml-8 text-xs text-gray-400 dark:text-gray-500">
        {monthLabels.map(({ month, index }) => (
          <span
            key={`${month}-${index}`}
            className="absolute"
            style={{ marginLeft: `${index * 14}px` }}
          >
            {month}
          </span>
        ))}
      </div>

      {/* Heatmap grid */}
      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 text-xs text-gray-400 dark:text-gray-500 pr-2">
          <span className="h-3"></span>
          <span className="h-3">Mon</span>
          <span className="h-3"></span>
          <span className="h-3">Wed</span>
          <span className="h-3"></span>
          <span className="h-3">Fri</span>
          <span className="h-3"></span>
        </div>

        {/* Grid */}
        <div className="flex gap-1 overflow-x-auto">
          {weekGroups.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => (
                <motion.div
                  key={`${weekIndex}-${dayIndex}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: (weekIndex * 7 + dayIndex) * 0.002 }}
                  className={`w-3 h-3 rounded-sm ${LEVEL_COLORS[day.level]}
                    ${isSameDay(day.date, today) ? 'ring-2 ring-primary ring-offset-1' : ''}
                    cursor-pointer hover:ring-2 hover:ring-gray-400 transition-all`}
                  title={`${format(day.date, 'MMM d, yyyy')}: ${day.cardsReviewed} cards`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 text-xs text-gray-500 dark:text-gray-400">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`w-3 h-3 rounded-sm ${LEVEL_COLORS[level as 0 | 1 | 2 | 3 | 4]}`}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

// Compact version for homepage
export function ActivityHeatmapCompact({ activityData }: { activityData: Record<string, number> }) {
  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 30 }, (_, i) => {
      const date = subDays(today, 29 - i);
      const dateKey = format(date, 'yyyy-MM-dd');
      const cardsReviewed = activityData[dateKey] || 0;
      return {
        date,
        cardsReviewed,
        level: getActivityLevel(cardsReviewed),
      };
    });
  }, [activityData]);

  return (
    <div className="space-y-2">
      <div className="flex gap-0.5 justify-center">
        {days.map((day, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.01 }}
            className={`w-2.5 h-2.5 rounded-sm ${LEVEL_COLORS[day.level]}`}
            title={`${format(day.date, 'MMM d')}: ${day.cardsReviewed} cards`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-400 text-center">Last 30 days</p>
    </div>
  );
}
