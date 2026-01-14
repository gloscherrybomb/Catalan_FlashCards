/**
 * PhraseTeaching Component
 * Teaches key phrases before conversation practice
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2,
  ArrowRight,
  BookOpen,
  MessageCircle,
  Lightbulb,
} from 'lucide-react';
import { type ConversationScenario } from '../../services/conversationService';
import { audioService } from '../../services/audioService';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressRing';
import { addConversationPhrasesToLibrary } from '../../utils/libraryHelpers';

interface PhraseTeachingProps {
  scenario: ConversationScenario;
  onComplete: () => void;
  onSkip?: () => void;
}

interface Phrase {
  catalan: string;
  english: string;
}

// Single phrase teaching card
function PhraseCard({
  phrase,
  index,
  total,
  onNext,
  isLast,
}: {
  phrase: Phrase;
  index: number;
  total: number;
  onNext: () => void;
  isLast: boolean;
}) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [hasListened, setHasListened] = useState(false);

  const handlePlayAudio = async () => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    try {
      await audioService.speakCatalan(phrase.catalan);
      setHasListened(true);
    } finally {
      setIsPlayingAudio(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full"
    >
      <Card className="p-6 bg-gradient-to-br from-white to-violet-50 dark:from-gray-800 dark:to-violet-950/20 border-2 border-violet-200 dark:border-violet-800">
        {/* Progress */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-violet-600 dark:text-violet-400">
            Phrase {index + 1} of {total}
          </span>
          <span className="text-xs px-2 py-1 bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 rounded-full">
            Key Vocabulary
          </span>
        </div>

        {/* Phrase display */}
        <div className="text-center mb-6">
          {/* English */}
          <p className="text-lg text-miro-blue/70 dark:text-ink-light/70 mb-3">
            {phrase.english}
          </p>

          {/* Catalan - main focus */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <h2 className="text-2xl font-bold text-miro-blue dark:text-ink-light">
              {phrase.catalan}
            </h2>
          </div>

          {/* Audio button */}
          <button
            onClick={handlePlayAudio}
            disabled={isPlayingAudio}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              isPlayingAudio
                ? 'bg-violet-500 text-white'
                : hasListened
                ? 'bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 hover:bg-violet-200'
                : 'bg-violet-500 text-white hover:bg-violet-600 animate-pulse'
            }`}
          >
            <Volume2 className={`w-5 h-5 ${isPlayingAudio ? 'animate-pulse' : ''}`} />
            {hasListened ? 'Listen Again' : 'Listen to Pronunciation'}
          </button>
        </div>

        {/* Tip */}
        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg mb-6">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Listen carefully and try to remember this phrase - you'll use it in the conversation!
            </p>
          </div>
        </div>

        {/* Continue button */}
        <Button
          fullWidth
          onClick={onNext}
          rightIcon={
            isLast ? (
              <MessageCircle className="w-5 h-5" />
            ) : (
              <ArrowRight className="w-5 h-5" />
            )
          }
          disabled={!hasListened}
          variant={hasListened ? 'primary' : 'secondary'}
        >
          {isLast ? 'Start Conversation' : 'Next Phrase'}
        </Button>

        {!hasListened && (
          <p className="text-xs text-center text-miro-blue/50 dark:text-ink-light/50 mt-2">
            Listen to the pronunciation first
          </p>
        )}
      </Card>
    </motion.div>
  );
}

export function PhraseTeaching({
  scenario,
  onComplete,
  onSkip,
}: PhraseTeachingProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAddingToLibrary, setIsAddingToLibrary] = useState(false);

  const phrases = scenario.keyVocabulary;

  // Guard against empty phrases
  if (!phrases || phrases.length === 0) {
    onComplete();
    return null;
  }

  const handleNext = async () => {
    if (currentIndex < phrases.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Add phrases to library before completing
      setIsAddingToLibrary(true);
      try {
        await addConversationPhrasesToLibrary(phrases, scenario.title);
      } catch (error) {
        console.error('Failed to add phrases to library:', error);
      } finally {
        setIsAddingToLibrary(false);
        onComplete();
      }
    }
  };

  const progress = Math.round(((currentIndex + 1) / phrases.length) * 100);

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-violet-500" />
            <h1 className="text-lg font-bold text-miro-blue dark:text-ink-light">
              Learn Key Phrases
            </h1>
          </div>
          {onSkip && (
            <button
              onClick={onSkip}
              className="text-sm text-miro-blue/50 dark:text-ink-light/50 hover:text-miro-blue dark:hover:text-ink-light"
            >
              Skip
            </button>
          )}
        </div>
        <p className="text-sm text-miro-blue/60 dark:text-ink-light/60 mt-1">
          {scenario.title} - {scenario.titleCatalan}
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <ProgressBar progress={progress} />
      </div>

      {/* Current phrase card */}
      <AnimatePresence mode="wait">
        <PhraseCard
          key={currentIndex}
          phrase={phrases[currentIndex]}
          index={currentIndex}
          total={phrases.length}
          onNext={handleNext}
          isLast={currentIndex === phrases.length - 1}
        />
      </AnimatePresence>

      {/* Info text */}
      <p className="text-xs text-center text-miro-blue/50 dark:text-ink-light/50 mt-4">
        These phrases will be added to your flashcard library for review
      </p>

      {isAddingToLibrary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-miro-blue dark:text-ink-light">
              Adding phrases to your library...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
