/**
 * LearningStyleWidget - Miró-inspired learning style display
 *
 * Shows the detected learning style with:
 * - Primary style badge with playful icon
 * - Mode effectiveness bars
 * - Confidence indicator
 * - Organic floating decorations
 */

import { motion } from 'framer-motion';
import {
  Eye,
  Ear,
  Hand,
  BookOpen,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import type { LearningStyleProfile, LearningStyle, ModeEffectiveness } from '../../types/adaptiveLearning';
import type { StudyMode } from '../../types/flashcard';

interface LearningStyleWidgetProps {
  profile: LearningStyleProfile;
  compact?: boolean;
}

const styleConfig: Record<LearningStyle, { icon: React.ReactNode; color: string; bgColor: string; label: string }> = {
  visual: {
    icon: <Eye className="w-5 h-5" />,
    color: 'text-miro-blue',
    bgColor: 'bg-miro-blue/10',
    label: 'Visual Learner',
  },
  auditory: {
    icon: <Ear className="w-5 h-5" />,
    color: 'text-miro-orange',
    bgColor: 'bg-miro-orange/10',
    label: 'Auditory Learner',
  },
  kinesthetic: {
    icon: <Hand className="w-5 h-5" />,
    color: 'text-miro-green',
    bgColor: 'bg-miro-green/10',
    label: 'Kinesthetic Learner',
  },
  reading: {
    icon: <BookOpen className="w-5 h-5" />,
    color: 'text-miro-red',
    bgColor: 'bg-miro-red/10',
    label: 'Reading/Writing Learner',
  },
};

const modeLabels: Record<StudyMode, string> = {
  'flip': 'Flip Cards',
  'type-answer': 'Type Answer',
  'multiple-choice': 'Multiple Choice',
  'listening': 'Listening',
  'dictation': 'Dictation',
  'speak': 'Speaking',
  'sentences': 'Sentences',
  'mixed': 'Mixed Mode',
};

function EffectivenessBar({ mode, effectiveness }: { mode: StudyMode; effectiveness: ModeEffectiveness }) {
  const score = effectiveness.effectivenessScore;

  const getBarColor = (score: number) => {
    if (score >= 80) return 'from-miro-green to-emerald-400';
    if (score >= 60) return 'from-miro-yellow to-amber-400';
    if (score >= 40) return 'from-miro-orange to-orange-400';
    return 'from-miro-red to-rose-400';
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className="text-miro-blue/70 dark:text-ink-light/70 font-medium">
          {modeLabels[mode] || mode}
        </span>
        <span className="font-bold text-miro-blue dark:text-ink-light">
          {Math.round(score)}%
        </span>
      </div>
      <div className="h-2 bg-miro-blue/10 dark:bg-ink-light/10 rounded-full overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${getBarColor(score)} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ type: 'spring', stiffness: 50, damping: 15, delay: 0.1 }}
        />
      </div>
    </div>
  );
}

export function LearningStyleWidget({ profile, compact = false }: LearningStyleWidgetProps) {
  const { primaryStyle, secondaryStyle, styleScores, modeEffectiveness, confidenceLevel } = profile;
  const primaryConfig = styleConfig[primaryStyle];
  const secondaryConfig = secondaryStyle ? styleConfig[secondaryStyle] : null;

  // Get top 4 modes by effectiveness
  const sortedModes = Object.entries(modeEffectiveness)
    .sort(([, a], [, b]) => b.effectivenessScore - a.effectivenessScore)
    .slice(0, 4);

  if (compact) {
    return (
      <motion.div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${primaryConfig.bgColor} border-2 border-current/20`}
        whileHover={{ scale: 1.05 }}
      >
        <span className={primaryConfig.color}>{primaryConfig.icon}</span>
        <span className={`font-semibold text-sm ${primaryConfig.color}`}>
          {primaryStyle.charAt(0).toUpperCase() + primaryStyle.slice(1)}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-white dark:bg-ink-dark rounded-2xl border-3 border-miro-blue dark:border-ink-light shadow-playful p-5 overflow-hidden"
    >
      {/* Miró-style floating decorations */}
      <motion.div
        className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-miro-yellow/20"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.div
        className="absolute top-8 -right-1 w-4 h-4 rounded-full bg-miro-red"
        animate={{ y: [-2, 2, -2] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-4 -left-2 w-6 h-6 rounded-full bg-miro-green/30"
        animate={{ x: [-2, 2, -2] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      />

      {/* Header with icon */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-xl ${primaryConfig.bgColor} flex items-center justify-center`}>
          <span className={primaryConfig.color}>{primaryConfig.icon}</span>
        </div>
        <div>
          <h3 className="font-bold text-miro-blue dark:text-ink-light">
            {primaryConfig.label}
          </h3>
          {secondaryConfig && (
            <p className="text-xs text-miro-blue/60 dark:text-ink-light/60 flex items-center gap-1">
              Secondary:
              <span className={secondaryConfig.color}>{secondaryStyle}</span>
            </p>
          )}
        </div>
      </div>

      {/* Style scores wheel - simplified bars */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-4 h-4 text-miro-blue/50 dark:text-ink-light/50" />
          <span className="text-xs font-medium text-miro-blue/70 dark:text-ink-light/70">
            Learning Style Affinity
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {(Object.entries(styleScores) as [LearningStyle, number][]).map(([style, score]) => {
            const config = styleConfig[style];
            return (
              <motion.div
                key={style}
                className="text-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
              >
                <div className={`w-8 h-8 mx-auto rounded-lg ${config.bgColor} flex items-center justify-center mb-1`}>
                  <span className={`${config.color} scale-75`}>{config.icon}</span>
                </div>
                <div className="text-xs font-bold text-miro-blue dark:text-ink-light">
                  {Math.round(score)}%
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Mode effectiveness */}
      {sortedModes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-miro-orange" />
            <span className="text-xs font-medium text-miro-blue/70 dark:text-ink-light/70">
              Mode Effectiveness
            </span>
          </div>
          {sortedModes.map(([mode, effectiveness]) => (
            <EffectivenessBar
              key={mode}
              mode={mode as StudyMode}
              effectiveness={effectiveness}
            />
          ))}
        </div>
      )}

      {/* Confidence indicator */}
      <div className="mt-4 pt-4 border-t-2 border-dashed border-miro-blue/10 dark:border-ink-light/10">
        <div className="flex items-center justify-between text-xs">
          <span className="text-miro-blue/50 dark:text-ink-light/50">
            Analysis Confidence
          </span>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`w-1.5 h-4 rounded-full ${
                    i < Math.ceil(confidenceLevel / 20)
                      ? 'bg-miro-green'
                      : 'bg-miro-blue/10 dark:bg-ink-light/10'
                  }`}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: i * 0.1 }}
                />
              ))}
            </div>
            <span className="font-medium text-miro-blue dark:text-ink-light">
              {Math.round(confidenceLevel)}%
            </span>
          </div>
        </div>
        {confidenceLevel < 50 && (
          <p className="text-xs text-miro-orange mt-1">
            Keep studying to improve detection accuracy!
          </p>
        )}
      </div>
    </motion.div>
  );
}
