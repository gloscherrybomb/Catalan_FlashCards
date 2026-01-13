/**
 * DailyRecommendations - Miró-inspired hero section for study recommendations
 *
 * Features:
 * - Bold hero layout with organic shapes
 * - Prioritized study suggestions
 * - Estimated time per recommendation
 * - "Start" action buttons
 * - Optimal time slots display
 */

import { motion } from 'framer-motion';
import {
  Sparkles,
  Play,
  Clock,
  Target,
  BookOpen,
  Zap,
  Star,
  ArrowRight,
  Sun,
  Sunset,
  Moon,
  Coffee,
} from 'lucide-react';
import { Button } from '../ui/Button';
import type {
  DailyRecommendation,
  StudyRecommendation,
  RecommendationPriority,
  TimeOfDay,
} from '../../types/adaptiveLearning';

interface DailyRecommendationsProps {
  recommendations: DailyRecommendation | null;
  onStartRecommendation?: (recommendation: StudyRecommendation) => void;
  onStartSession?: () => void;
}

const priorityConfig: Record<RecommendationPriority, { icon: React.ReactNode; color: string; bgColor: string }> = {
  category_focus: {
    icon: <BookOpen className="w-4 h-4" />,
    color: 'text-miro-blue',
    bgColor: 'bg-miro-blue/10',
  },
  weakness_drill: {
    icon: <Target className="w-4 h-4" />,
    color: 'text-miro-red',
    bgColor: 'bg-miro-red/10',
  },
  review_due: {
    icon: <Clock className="w-4 h-4" />,
    color: 'text-miro-orange',
    bgColor: 'bg-miro-orange/10',
  },
  new_cards: {
    icon: <Sparkles className="w-4 h-4" />,
    color: 'text-miro-green',
    bgColor: 'bg-miro-green/10',
  },
  mode_practice: {
    icon: <Zap className="w-4 h-4" />,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
};

const timeSlotConfig: Record<TimeOfDay, { icon: React.ReactNode; label: string; color: string }> = {
  morning: {
    icon: <Coffee className="w-4 h-4" />,
    label: 'Morning',
    color: 'text-miro-orange',
  },
  afternoon: {
    icon: <Sun className="w-4 h-4" />,
    label: 'Afternoon',
    color: 'text-miro-yellow',
  },
  evening: {
    icon: <Sunset className="w-4 h-4" />,
    label: 'Evening',
    color: 'text-miro-red',
  },
  night: {
    icon: <Moon className="w-4 h-4" />,
    label: 'Night',
    color: 'text-miro-blue',
  },
};

function RecommendationCard({
  recommendation,
  onStart,
  index,
}: {
  recommendation: StudyRecommendation;
  onStart?: () => void;
  index: number;
}) {
  const config = priorityConfig[recommendation.type];
  const isPriority = recommendation.priority === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative rounded-2xl border-3 ${
        isPriority
          ? 'border-miro-yellow bg-gradient-to-br from-miro-yellow/10 to-miro-orange/5'
          : 'border-miro-blue/20 dark:border-ink-light/20 bg-white dark:bg-ink-dark'
      } p-4 overflow-hidden`}
    >
      {/* Priority star */}
      {isPriority && (
        <motion.div
          className="absolute top-2 right-2"
          animate={{
            rotate: [0, 15, -15, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Star className="w-5 h-5 text-miro-yellow fill-miro-yellow" />
        </motion.div>
      )}

      {/* Miró blob decoration */}
      <motion.div
        className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full opacity-5"
        style={{ backgroundColor: 'currentColor' }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <div className="relative">
        {/* Type badge and priority */}
        <div className="flex items-center gap-2 mb-2">
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${config.bgColor}`}>
            <span className={config.color}>{config.icon}</span>
            <span className={`text-xs font-medium ${config.color}`}>
              {recommendation.type.replace(/_/g, ' ')}
            </span>
          </div>
          <span className="text-xs text-miro-blue/40 dark:text-ink-light/40">
            #{recommendation.priority}
          </span>
        </div>

        {/* Title */}
        <h4 className="font-bold text-miro-blue dark:text-ink-light mb-1">
          {recommendation.title}
        </h4>

        {/* Description */}
        <p className="text-sm text-miro-blue/70 dark:text-ink-light/70 mb-3">
          {recommendation.description}
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-4 mb-3 text-xs text-miro-blue/50 dark:text-ink-light/50">
          <div className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            <span>{recommendation.suggestedCardCount} cards</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>~{recommendation.estimatedTimeMinutes} min</span>
          </div>
        </div>

        {/* Expected benefit */}
        <div className="flex items-start gap-2 p-2 rounded-xl bg-miro-green/5 border border-miro-green/20 mb-3">
          <Sparkles className="w-4 h-4 text-miro-green mt-0.5 flex-shrink-0" />
          <p className="text-xs text-miro-green font-medium">
            {recommendation.expectedBenefit}
          </p>
        </div>

        {/* Action button */}
        {onStart && (
          <Button
            variant={isPriority ? 'accent' : 'secondary'}
            size="sm"
            className="w-full"
            onClick={onStart}
            leftIcon={<Play className="w-4 h-4" />}
          >
            Start Practice
          </Button>
        )}
      </div>
    </motion.div>
  );
}

export function DailyRecommendations({
  recommendations,
  onStartRecommendation,
  onStartSession,
}: DailyRecommendationsProps) {
  if (!recommendations) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative rounded-3xl bg-gradient-to-br from-miro-blue/5 to-miro-yellow/5 border-3 border-dashed border-miro-blue/20 dark:border-ink-light/20 p-8 text-center overflow-hidden"
      >
        {/* Decorative blobs */}
        <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-miro-yellow/20" />
        <div className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-miro-red/10" />

        <motion.div
          className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-miro-yellow/20 flex items-center justify-center"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Sparkles className="w-8 h-8 text-miro-yellow" />
        </motion.div>
        <h3 className="font-bold text-xl text-miro-blue dark:text-ink-light mb-2">
          Building Your Plan
        </h3>
        <p className="text-miro-blue/60 dark:text-ink-light/60 mb-4">
          Complete a few study sessions to get personalized recommendations
        </p>
        {onStartSession && (
          <Button variant="primary" onClick={onStartSession} leftIcon={<Play className="w-5 h-5" />}>
            Start Studying
          </Button>
        )}
      </motion.div>
    );
  }

  const { recommendations: recs, focusAreas, suggestedDuration, optimalTimeSlots } = recommendations;

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl bg-gradient-to-br from-miro-yellow via-miro-yellow/80 to-miro-orange/60 p-6 overflow-hidden"
      >
        {/* Miró-style decorative elements */}
        <motion.div
          className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-miro-red/30"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-4 right-16 w-6 h-6 rounded-full bg-miro-blue"
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-4 left-8 w-4 h-4 rounded-full bg-white/50"
          animate={{ x: [-3, 3, -3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <svg
          className="absolute bottom-2 right-4 w-16 h-16 opacity-20"
          viewBox="0 0 64 64"
        >
          <path
            d="M32 8 L40 24 L56 28 L44 40 L48 56 L32 48 L16 56 L20 40 L8 28 L24 24 Z"
            fill="currentColor"
            className="text-miro-blue"
          />
        </svg>

        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-white/90 flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-miro-orange" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-miro-blue">
                Today's Study Plan
              </h2>
              <p className="text-sm text-miro-blue/70">
                Personalized just for you
              </p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 text-miro-blue">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">{suggestedDuration} min suggested</span>
            </div>
            {focusAreas.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 text-miro-blue">
                <Target className="w-4 h-4" />
                <span className="text-sm font-medium">Focus: {focusAreas[0]}</span>
              </div>
            )}
          </div>

          {/* Optimal time slots */}
          {optimalTimeSlots.length > 0 && (
            <div className="mt-4 pt-4 border-t border-miro-blue/10">
              <p className="text-xs text-miro-blue/60 mb-2">Best times for you:</p>
              <div className="flex gap-2">
                {optimalTimeSlots.map((slot) => {
                  const config = timeSlotConfig[slot];
                  return (
                    <motion.div
                      key={slot}
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90"
                    >
                      <span className={config.color}>{config.icon}</span>
                      <span className="text-xs font-medium text-miro-blue">
                        {config.label}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Recommendation cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {recs.slice(0, 4).map((rec, index) => (
          <RecommendationCard
            key={rec.id}
            recommendation={rec}
            onStart={onStartRecommendation ? () => onStartRecommendation(rec) : undefined}
            index={index}
          />
        ))}
      </div>

      {/* View all link */}
      {recs.length > 4 && (
        <motion.button
          whileHover={{ x: 5 }}
          className="flex items-center gap-2 text-sm text-miro-blue/60 hover:text-miro-blue dark:text-ink-light/60 dark:hover:text-ink-light transition-colors mx-auto"
        >
          View all {recs.length} recommendations
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      )}
    </div>
  );
}
