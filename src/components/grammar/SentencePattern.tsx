import { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, ChevronDown, Lightbulb } from 'lucide-react';
import { type SentencePattern as SentencePatternType, PATTERN_COLORS } from '../../data/sentencePatterns';
import { audioService } from '../../services/audioService';

interface SentencePatternProps {
  pattern: SentencePatternType;
  compact?: boolean;
}

export function SentencePattern({ pattern, compact = false }: SentencePatternProps) {
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayAudio = async () => {
    setIsPlaying(true);
    try {
      await audioService.speakCatalan(pattern.fullExample.catalan);
    } finally {
      setIsPlaying(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-miro-blue/10 dark:border-ink-light/10 overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => compact && setIsExpanded(!isExpanded)}
        className={`w-full p-4 flex items-center justify-between ${
          compact ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50' : ''
        }`}
        disabled={!compact}
      >
        <div className="text-left">
          <h3 className="font-bold text-miro-blue dark:text-ink-light">
            {pattern.name}
          </h3>
          <p className="text-sm text-miro-blue/60 dark:text-ink-light/60">
            {pattern.nameCatalan}
          </p>
        </div>
        {compact && (
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-miro-blue/50 dark:text-ink-light/50" />
          </motion.div>
        )}
      </button>

      {/* Content */}
      <motion.div
        initial={compact ? { height: 0, opacity: 0 } : false}
        animate={isExpanded ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="px-4 pb-4 space-y-4">
          {/* Description */}
          <p className="text-sm text-miro-blue/70 dark:text-ink-light/70">
            {pattern.description}
          </p>

          {/* Pattern Visualization */}
          <div className="flex flex-wrap items-center justify-center gap-2 py-4 px-2 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
            {pattern.pattern.map((part, index) => {
              const colors = PATTERN_COLORS[part.color];
              return (
                <motion.div
                  key={index}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col items-center"
                >
                  {/* Label */}
                  <span className={`text-xs font-medium mb-1 ${colors.text}`}>
                    {part.label}
                  </span>
                  {/* Example */}
                  <div
                    className={`px-3 py-2 rounded-lg border-2 ${colors.bg} ${colors.border} font-medium text-gray-800 dark:text-white`}
                  >
                    {part.example}
                  </div>
                </motion.div>
              );
            })}

            {/* Plus signs between parts */}
            {pattern.pattern.length > 1 && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {/* This is just for visual effect - the flex gap handles spacing */}
              </div>
            )}
          </div>

          {/* Full Example */}
          <div className="flex items-start gap-3 p-3 bg-miro-green/10 dark:bg-miro-green/5 rounded-xl border border-miro-green/20">
            <button
              onClick={handlePlayAudio}
              disabled={isPlaying}
              className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                isPlaying
                  ? 'bg-miro-green text-white'
                  : 'bg-miro-green/20 text-miro-green hover:bg-miro-green/30'
              }`}
            >
              <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-pulse' : ''}`} />
            </button>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-miro-blue dark:text-ink-light">
                {pattern.fullExample.catalan}
              </p>
              <p className="text-sm text-miro-blue/60 dark:text-ink-light/60 mt-0.5">
                {pattern.fullExample.english}
              </p>
            </div>
          </div>

          {/* Notes */}
          {pattern.notes && pattern.notes.length > 0 && (
            <div className="p-3 bg-miro-yellow/10 dark:bg-miro-yellow/5 rounded-xl border border-miro-yellow/20">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-miro-yellow flex-shrink-0 mt-0.5" />
                <ul className="text-sm text-miro-blue/70 dark:text-ink-light/70 space-y-1">
                  {pattern.notes.map((note, i) => (
                    <li key={i}>{note}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Grid component to display multiple patterns
interface SentencePatternGridProps {
  patterns: SentencePatternType[];
  title?: string;
}

export function SentencePatternGrid({ patterns, title }: SentencePatternGridProps) {
  return (
    <div className="space-y-4">
      {title && (
        <h2 className="text-xl font-bold text-miro-blue dark:text-ink-light flex items-center gap-2">
          <span className="text-2xl">🔤</span>
          {title}
        </h2>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {patterns.map((pattern) => (
          <SentencePattern key={pattern.id} pattern={pattern} compact />
        ))}
      </div>
    </div>
  );
}
