/**
 * SessionCompositionPreview - Miró-inspired session composition display
 *
 * Features:
 * - Animated pie chart of categories
 * - New/review/weakness ratio bar
 * - Duration estimate
 * - Difficulty distribution
 * - Playful organic styling
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
} from 'lucide-react';
import type { SessionComposition } from '../../types/adaptiveLearning';

interface SessionCompositionPreviewProps {
  composition: SessionComposition | null;
  onStartSession?: () => void;
  compact?: boolean;
}

// Miró-inspired color palette for categories
const categoryColors = [
  '#E63946', // miro-red
  '#1D3557', // miro-blue
  '#F4A261', // miro-orange
  '#2A9D8F', // miro-green
  '#FFBE0B', // miro-yellow
  '#8338EC', // purple
  '#FF006E', // pink
  '#3A86FF', // blue
];

function MiroPieChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Calculate pie segments
  const segments = useMemo(() => {
    let currentAngle = -90; // Start from top
    return data.map((item) => {
      const percentage = (item.value / total) * 100;
      const angle = (item.value / total) * 360;
      const startAngle = currentAngle;
      currentAngle += angle;

      // Calculate path for pie segment
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = ((startAngle + angle) * Math.PI) / 180;

      const x1 = 50 + 40 * Math.cos(startRad);
      const y1 = 50 + 40 * Math.sin(startRad);
      const x2 = 50 + 40 * Math.cos(endRad);
      const y2 = 50 + 40 * Math.sin(endRad);

      const largeArcFlag = angle > 180 ? 1 : 0;

      const pathD = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

      return {
        ...item,
        percentage,
        path: pathD,
        startAngle,
        angle,
      };
    });
  }, [data, total]);

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-miro-blue/10 dark:text-ink-light/10"
        />

        {/* Pie segments */}
        {segments.map((segment, index) => (
          <motion.path
            key={segment.name}
            d={segment.path}
            fill={segment.color}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, type: 'spring' }}
            className="drop-shadow-sm"
          />
        ))}

        {/* Center circle (hole) */}
        <circle
          cx="50"
          cy="50"
          r="20"
          fill="currentColor"
          className="text-white dark:text-ink-dark"
        />

        {/* Center decoration */}
        <motion.circle
          cx="50"
          cy="50"
          r="8"
          fill="currentColor"
          className="text-miro-yellow"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </svg>

      {/* Miró-style floating dot */}
      <motion.div
        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-miro-red"
        animate={{ y: [-2, 2, -2] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </div>
  );
}

function RatioBar({
  newCards,
  reviewCards,
  weaknessCards,
  total,
}: {
  newCards: number;
  reviewCards: number;
  weaknessCards: number;
  total: number;
}) {
  const newPct = (newCards / total) * 100;
  const reviewPct = (reviewCards / total) * 100;
  const weaknessPct = (weaknessCards / total) * 100;

  return (
    <div className="space-y-2">
      {/* Bar */}
      <div className="h-4 rounded-full overflow-hidden flex bg-miro-blue/10 dark:bg-ink-light/10">
        <motion.div
          className="bg-miro-green"
          initial={{ width: 0 }}
          animate={{ width: `${newPct}%` }}
          transition={{ type: 'spring', delay: 0.1 }}
        />
        <motion.div
          className="bg-miro-blue"
          initial={{ width: 0 }}
          animate={{ width: `${reviewPct}%` }}
          transition={{ type: 'spring', delay: 0.2 }}
        />
        <motion.div
          className="bg-miro-red"
          initial={{ width: 0 }}
          animate={{ width: `${weaknessPct}%` }}
          transition={{ type: 'spring', delay: 0.3 }}
        />
      </div>

      {/* Legend */}
      <div className="flex justify-between text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-miro-green" />
          <span className="text-miro-blue/60 dark:text-ink-light/60">
            New ({newCards})
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-miro-blue" />
          <span className="text-miro-blue/60 dark:text-ink-light/60">
            Review ({reviewCards})
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-miro-red" />
          <span className="text-miro-blue/60 dark:text-ink-light/60">
            Weak ({weaknessCards})
          </span>
        </div>
      </div>
    </div>
  );
}

function DifficultyDistribution({
  easy,
  medium,
  hard,
}: {
  easy: number;
  medium: number;
  hard: number;
}) {
  const total = easy + medium + hard;
  if (total === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <Layers className="w-4 h-4 text-miro-blue/40 dark:text-ink-light/40" />
      <div className="flex gap-1 flex-1">
        {[...Array(easy)].map((_, i) => (
          <motion.div
            key={`easy-${i}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.02 }}
            className="w-2 h-4 rounded-sm bg-miro-green"
          />
        ))}
        {[...Array(medium)].map((_, i) => (
          <motion.div
            key={`med-${i}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: (easy + i) * 0.02 }}
            className="w-2 h-4 rounded-sm bg-miro-yellow"
          />
        ))}
        {[...Array(hard)].map((_, i) => (
          <motion.div
            key={`hard-${i}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: (easy + medium + i) * 0.02 }}
            className="w-2 h-4 rounded-sm bg-miro-red"
          />
        ))}
      </div>
    </div>
  );
}

export function SessionCompositionPreview({
  composition,
  onStartSession,
  compact = false,
}: SessionCompositionPreviewProps) {
  if (!composition) {
    return null;
  }

  const {
    totalCards,
    newCards,
    reviewCards,
    weaknessCards,
    categoryBreakdown,
    estimatedDuration,
    difficultyDistribution,
  } = composition;

  // Prepare pie chart data
  const pieData = Object.entries(categoryBreakdown)
    .filter(([, count]) => count > 0)
    .map(([name, value], index) => ({
      name,
      value,
      color: categoryColors[index % categoryColors.length],
    }));

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-4 p-3 rounded-xl bg-miro-blue/5 dark:bg-ink-light/5 border-2 border-miro-blue/10 dark:border-ink-light/10"
      >
        <div className="flex items-center gap-2">
          <PieChart className="w-5 h-5 text-miro-blue dark:text-ink-light" />
          <span className="font-bold text-miro-blue dark:text-ink-light">
            {totalCards} cards
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-miro-blue/60 dark:text-ink-light/60">
          <Clock className="w-4 h-4" />
          <span>~{estimatedDuration} min</span>
        </div>
        {onStartSession && (
          <motion.button
            whileHover={{ x: 3 }}
            onClick={onStartSession}
            className="ml-auto flex items-center gap-1 text-sm font-medium text-miro-blue dark:text-ink-light"
          >
            Start
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl border-3 border-miro-blue dark:border-ink-light bg-white dark:bg-ink-dark shadow-playful p-5 overflow-hidden"
    >
      {/* Miró decorations */}
      <motion.div
        className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-miro-yellow/20"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-2 -right-2 w-8 h-8 rounded-full bg-miro-green/20"
        animate={{ x: [-2, 2, -2] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Header */}
      <div className="relative flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-miro-blue/10 dark:bg-ink-light/10 flex items-center justify-center">
          <PieChart className="w-5 h-5 text-miro-blue dark:text-ink-light" />
        </div>
        <div>
          <h3 className="font-bold text-miro-blue dark:text-ink-light">
            Session Preview
          </h3>
          <p className="text-xs text-miro-blue/60 dark:text-ink-light/60">
            Your upcoming study mix
          </p>
        </div>
      </div>

      {/* Main stats */}
      <div className="relative flex items-center justify-between mb-4 pb-4 border-b-2 border-dashed border-miro-blue/10 dark:border-ink-light/10">
        <div className="text-center">
          <div className="text-3xl font-bold text-miro-blue dark:text-ink-light">
            {totalCards}
          </div>
          <div className="text-xs text-miro-blue/50 dark:text-ink-light/50">
            cards
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-center gap-1 text-2xl font-bold text-miro-blue dark:text-ink-light">
            <Clock className="w-5 h-5" />
            {estimatedDuration}
          </div>
          <div className="text-xs text-miro-blue/50 dark:text-ink-light/50">
            minutes
          </div>
        </div>
      </div>

      {/* Pie chart */}
      {pieData.length > 0 && (
        <div className="mb-4">
          <MiroPieChart data={pieData} />

          {/* Category legend */}
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            {pieData.slice(0, 4).map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-1 text-xs"
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-miro-blue/60 dark:text-ink-light/60 truncate max-w-16">
                  {item.name}
                </span>
              </div>
            ))}
            {pieData.length > 4 && (
              <span className="text-xs text-miro-blue/40 dark:text-ink-light/40">
                +{pieData.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Card type ratio bar */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-miro-blue/60 dark:text-ink-light/60">
            Card Types
          </span>
        </div>
        <RatioBar
          newCards={newCards}
          reviewCards={reviewCards}
          weaknessCards={weaknessCards}
          total={totalCards}
        />
      </div>

      {/* Difficulty distribution */}
      {(difficultyDistribution.easy > 0 || difficultyDistribution.medium > 0 || difficultyDistribution.hard > 0) && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-miro-blue/60 dark:text-ink-light/60">
              Difficulty Mix
            </span>
          </div>
          <DifficultyDistribution
            easy={Math.min(difficultyDistribution.easy, 10)}
            medium={Math.min(difficultyDistribution.medium, 10)}
            hard={Math.min(difficultyDistribution.hard, 10)}
          />
        </div>
      )}

      {/* Action button */}
      {onStartSession && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStartSession}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-miro-yellow to-miro-orange text-miro-blue font-bold flex items-center justify-center gap-2 shadow-playful-sm"
        >
          <Sparkles className="w-5 h-5" />
          Start Session
        </motion.button>
      )}
    </motion.div>
  );
}
