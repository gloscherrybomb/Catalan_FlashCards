/**
 * WeakSpotAlerts - Miró-inspired weak spot display
 *
 * Displays detected weak areas with:
 * - Severity-coded cards (info/warning/critical)
 * - "Practice Now" action button
 * - Animated organic shapes
 * - Playful but informative design
 */

import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  Target,
  Zap,
  ArrowRight,
  BookOpen,
  Clock,
  Type,
  Compass,
} from 'lucide-react';
import { Button } from '../ui/Button';
import type { WeakSpot, WeakSpotType, InsightSeverity } from '../../types/adaptiveLearning';

interface WeakSpotAlertsProps {
  weakSpots: WeakSpot[];
  onPractice?: (weakSpot: WeakSpot) => void;
  maxDisplay?: number;
  showHeader?: boolean;
}

const severityConfig: Record<InsightSeverity, { icon: React.ReactNode; color: string; bgColor: string; borderColor: string; label: string }> = {
  critical: {
    icon: <AlertCircle className="w-5 h-5" />,
    color: 'text-miro-red',
    bgColor: 'bg-miro-red/10',
    borderColor: 'border-miro-red',
    label: 'Needs Attention',
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5" />,
    color: 'text-miro-orange',
    bgColor: 'bg-miro-orange/10',
    borderColor: 'border-miro-orange',
    label: 'Room to Improve',
  },
  info: {
    icon: <Info className="w-5 h-5" />,
    color: 'text-miro-blue',
    bgColor: 'bg-miro-blue/10',
    borderColor: 'border-miro-blue/50',
    label: 'For Your Info',
  },
};

const typeConfig: Record<WeakSpotType, { icon: React.ReactNode; label: string }> = {
  category: {
    icon: <BookOpen className="w-4 h-4" />,
    label: 'Category',
  },
  error_type: {
    icon: <Type className="w-4 h-4" />,
    label: 'Error Type',
  },
  direction: {
    icon: <Compass className="w-4 h-4" />,
    label: 'Direction',
  },
  time_based: {
    icon: <Clock className="w-4 h-4" />,
    label: 'Time-based',
  },
  mode: {
    icon: <Target className="w-4 h-4" />,
    label: 'Study Mode',
  },
};

function WeakSpotCard({
  weakSpot,
  onPractice,
  index,
}: {
  weakSpot: WeakSpot;
  onPractice?: () => void;
  index: number;
}) {
  const severity = severityConfig[weakSpot.severity];
  const type = typeConfig[weakSpot.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.1 }}
      className={`relative rounded-2xl border-3 ${severity.borderColor} ${severity.bgColor} p-4 overflow-hidden`}
    >
      {/* Miró-style blob decoration based on severity */}
      {weakSpot.severity === 'critical' && (
        <motion.div
          className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-miro-red/20"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      {weakSpot.severity === 'warning' && (
        <motion.div
          className="absolute top-2 -right-2 w-8 h-8"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        >
          <svg viewBox="0 0 32 32" className="w-full h-full">
            <path
              d="M16 2 L20 12 L16 10 L12 12 Z"
              fill="currentColor"
              className="text-miro-yellow/40"
            />
          </svg>
        </motion.div>
      )}

      <div className="relative">
        {/* Header row */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={severity.color}>{severity.icon}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${severity.bgColor} ${severity.color}`}>
              {severity.label}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-miro-blue/50 dark:text-ink-light/50">
            {type.icon}
            <span>{type.label}</span>
          </div>
        </div>

        {/* Target name */}
        <h4 className="font-bold text-miro-blue dark:text-ink-light mb-1">
          {weakSpot.target}
        </h4>

        {/* Description */}
        <p className="text-sm text-miro-blue/70 dark:text-ink-light/70 mb-3">
          {weakSpot.description}
        </p>

        {/* Score indicator */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-2 bg-white dark:bg-ink-dark rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${
                weakSpot.score >= 70 ? 'bg-miro-red' :
                weakSpot.score >= 40 ? 'bg-miro-orange' : 'bg-miro-yellow'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${weakSpot.score}%` }}
              transition={{ type: 'spring', stiffness: 50 }}
            />
          </div>
          <span className="text-xs font-bold text-miro-blue dark:text-ink-light">
            {weakSpot.score}%
          </span>
        </div>

        {/* Affected cards count & action */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-miro-blue/50 dark:text-ink-light/50">
            {weakSpot.affectedCardIds.length} cards affected
          </span>

          {onPractice && (
            <Button
              variant="primary"
              size="sm"
              onClick={onPractice}
              rightIcon={<Zap className="w-4 h-4" />}
            >
              Practice Now
            </Button>
          )}
        </div>

        {/* Suggested action */}
        <div className="mt-3 pt-3 border-t-2 border-dashed border-current/10">
          <p className="text-xs text-miro-blue/60 dark:text-ink-light/60 flex items-start gap-1">
            <Target className="w-3 h-3 mt-0.5 flex-shrink-0" />
            {weakSpot.suggestedAction}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function WeakSpotAlerts({
  weakSpots,
  onPractice,
  maxDisplay = 5,
  showHeader = true,
}: WeakSpotAlertsProps) {
  // Sort by severity (critical first) then by score
  const sortedSpots = [...weakSpots]
    .sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return b.score - a.score;
    })
    .slice(0, maxDisplay);

  const criticalCount = weakSpots.filter(w => w.severity === 'critical').length;
  const warningCount = weakSpots.filter(w => w.severity === 'warning').length;

  if (weakSpots.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8 px-4 bg-miro-green/10 rounded-2xl border-3 border-miro-green/30"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 mx-auto mb-3 rounded-full bg-miro-green/20 flex items-center justify-center"
        >
          <Target className="w-8 h-8 text-miro-green" />
        </motion.div>
        <h4 className="font-bold text-miro-green mb-1">Looking Good!</h4>
        <p className="text-sm text-miro-green/70">
          No weak spots detected. Keep up the great work!
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-miro-red/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-miro-red" />
              </div>
              {criticalCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-miro-red text-white text-xs font-bold flex items-center justify-center"
                >
                  {criticalCount}
                </motion.div>
              )}
            </div>
            <div>
              <h3 className="font-bold text-miro-blue dark:text-ink-light">
                Areas to Focus On
              </h3>
              <p className="text-xs text-miro-blue/60 dark:text-ink-light/60">
                {criticalCount > 0 && `${criticalCount} critical`}
                {criticalCount > 0 && warningCount > 0 && ', '}
                {warningCount > 0 && `${warningCount} needs work`}
              </p>
            </div>
          </div>

          {weakSpots.length > maxDisplay && (
            <button className="flex items-center gap-1 text-sm text-miro-blue/60 hover:text-miro-blue dark:text-ink-light/60 dark:hover:text-ink-light transition-colors">
              View all ({weakSpots.length})
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      <AnimatePresence mode="popLayout">
        <div className="space-y-3">
          {sortedSpots.map((spot, index) => (
            <WeakSpotCard
              key={spot.id}
              weakSpot={spot}
              onPractice={onPractice ? () => onPractice(spot) : undefined}
              index={index}
            />
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
}
