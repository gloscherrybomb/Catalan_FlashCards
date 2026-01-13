/**
 * AdaptiveInsightsCard - Miró-inspired insights display
 *
 * Shows learning insights with:
 * - Severity-coded styling
 * - Dismissible cards with animation
 * - Action buttons
 * - Playful organic decorations
 */

import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Lightbulb,
  AlertCircle,
  AlertTriangle,
  Info,
  ArrowRight,
  Check,
  Clock,
  TrendingUp,
  Target,
  Zap,
  Calendar,
} from 'lucide-react';
import { Button } from '../ui/Button';
import type { LearningInsight, RecommendationType, InsightSeverity } from '../../types/adaptiveLearning';

interface AdaptiveInsightsCardProps {
  insights: LearningInsight[];
  onDismiss: (insightId: string) => void;
  onAction?: (insight: LearningInsight) => void;
  maxDisplay?: number;
}

const severityStyles: Record<InsightSeverity, { icon: React.ReactNode; border: string; bg: string; accent: string }> = {
  critical: {
    icon: <AlertCircle className="w-5 h-5" />,
    border: 'border-miro-red',
    bg: 'bg-miro-red/5',
    accent: 'text-miro-red',
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5" />,
    border: 'border-miro-orange',
    bg: 'bg-miro-orange/5',
    accent: 'text-miro-orange',
  },
  info: {
    icon: <Info className="w-5 h-5" />,
    border: 'border-miro-blue/30',
    bg: 'bg-miro-blue/5',
    accent: 'text-miro-blue',
  },
};

const typeIcons: Record<RecommendationType, React.ReactNode> = {
  focus_category: <Target className="w-4 h-4" />,
  focus_error_type: <AlertCircle className="w-4 h-4" />,
  change_mode: <Zap className="w-4 h-4" />,
  increase_difficulty: <TrendingUp className="w-4 h-4" />,
  reduce_load: <Clock className="w-4 h-4" />,
  optimal_time: <Calendar className="w-4 h-4" />,
  streak_at_risk: <AlertTriangle className="w-4 h-4" />,
};

function InsightCard({
  insight,
  onDismiss,
  onAction,
  index,
}: {
  insight: LearningInsight;
  onDismiss: () => void;
  onAction?: () => void;
  index: number;
}) {
  const style = severityStyles[insight.severity];
  const typeIcon = typeIcons[insight.type];

  const getTimeRemaining = () => {
    const now = new Date();
    const expires = new Date(insight.expiresAt);
    const hoursLeft = Math.max(0, Math.round((expires.getTime() - now.getTime()) / (1000 * 60 * 60)));
    if (hoursLeft < 1) return 'Expiring soon';
    if (hoursLeft < 24) return `${hoursLeft}h remaining`;
    return `${Math.round(hoursLeft / 24)}d remaining`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -100, scale: 0.9 }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 20,
        delay: index * 0.05,
      }}
      className={`relative rounded-2xl border-3 ${style.border} ${style.bg} p-4 overflow-hidden`}
    >
      {/* Miró-style decorative elements */}
      <motion.div
        className="absolute -top-6 -right-6 w-16 h-16 opacity-10"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        <svg viewBox="0 0 64 64" className="w-full h-full">
          <circle cx="32" cy="32" r="28" fill="currentColor" className={style.accent} />
          <circle cx="32" cy="32" r="16" fill="currentColor" className="text-white dark:text-ink-dark" />
        </svg>
      </motion.div>

      {/* Floating star for critical insights */}
      {insight.severity === 'critical' && (
        <motion.div
          className="absolute top-3 right-10"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-miro-red">
            <path
              d="M12 2L14 8L20 8L15 12L17 18L12 14L7 18L9 12L4 8L10 8L12 2Z"
              fill="currentColor"
            />
          </svg>
        </motion.div>
      )}

      <div className="relative">
        {/* Dismiss button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onDismiss}
          className="absolute top-0 right-0 p-1 rounded-full hover:bg-miro-blue/10 dark:hover:bg-ink-light/10 transition-colors"
        >
          <X className="w-4 h-4 text-miro-blue/40 dark:text-ink-light/40" />
        </motion.button>

        {/* Header */}
        <div className="flex items-start gap-3 mb-3 pr-6">
          <div className={`w-10 h-10 rounded-xl ${style.bg} border-2 ${style.border} flex items-center justify-center flex-shrink-0`}>
            <span className={style.accent}>{style.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`${style.accent}`}>{typeIcon}</span>
              <span className="text-xs font-medium text-miro-blue/50 dark:text-ink-light/50 uppercase tracking-wide">
                {insight.type.replace(/_/g, ' ')}
              </span>
            </div>
            <h4 className="font-bold text-miro-blue dark:text-ink-light leading-tight">
              {insight.title}
            </h4>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-miro-blue/70 dark:text-ink-light/70 mb-3 leading-relaxed">
          {insight.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-miro-blue/40 dark:text-ink-light/40">
            <Clock className="w-3 h-3" />
            <span>{getTimeRemaining()}</span>
          </div>

          {onAction && !insight.actionTaken && (
            <Button
              variant={insight.severity === 'critical' ? 'primary' : 'secondary'}
              size="sm"
              onClick={onAction}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Take Action
            </Button>
          )}

          {insight.actionTaken && (
            <div className="flex items-center gap-1 text-sm text-miro-green font-medium">
              <Check className="w-4 h-4" />
              Done
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function AdaptiveInsightsCard({
  insights,
  onDismiss,
  onAction,
  maxDisplay = 3,
}: AdaptiveInsightsCardProps) {
  // Filter active insights and sort by severity
  const activeInsights = insights
    .filter(i => !i.dismissed && new Date(i.expiresAt) > new Date())
    .sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    })
    .slice(0, maxDisplay);

  if (activeInsights.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <motion.div
          className="w-10 h-10 rounded-xl bg-miro-yellow flex items-center justify-center"
          whileHover={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.5 }}
        >
          <Lightbulb className="w-5 h-5 text-miro-blue" />
        </motion.div>
        <div>
          <h3 className="font-bold text-miro-blue dark:text-ink-light">
            Learning Insights
          </h3>
          <p className="text-xs text-miro-blue/60 dark:text-ink-light/60">
            Personalized tips based on your progress
          </p>
        </div>
      </div>

      {/* Insight cards */}
      <AnimatePresence mode="popLayout">
        <div className="space-y-3">
          {activeInsights.map((insight, index) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onDismiss={() => onDismiss(insight.id)}
              onAction={onAction ? () => onAction(insight) : undefined}
              index={index}
            />
          ))}
        </div>
      </AnimatePresence>

      {/* Show more indicator */}
      {insights.filter(i => !i.dismissed).length > maxDisplay && (
        <motion.button
          whileHover={{ x: 5 }}
          className="flex items-center gap-1 text-sm text-miro-blue/60 hover:text-miro-blue dark:text-ink-light/60 dark:hover:text-ink-light transition-colors"
        >
          {insights.filter(i => !i.dismissed).length - maxDisplay} more insights
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      )}
    </div>
  );
}
