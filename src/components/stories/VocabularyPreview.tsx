/**
 * VocabularyPreview Component
 * Teaches story vocabulary before reading
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2,
  ArrowRight,
  BookOpen,
  Eye,
  Pencil,
  SkipForward,
} from 'lucide-react';
import { type Story, type StoryVocab } from '../../data/stories';
import { audioService } from '../../services/audioService';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressRing';
import { addStoryVocabToLibrary } from '../../utils/libraryHelpers';

interface VocabularyPreviewProps {
  story: Story;
  onComplete: () => void;
  onSkip?: () => void;
  isReread?: boolean;
}

type LearnPhase = 'learn' | 'quiz';

// Single vocabulary item for learning
function VocabLearnCard({
  vocab,
  index,
  total,
  onNext,
}: {
  vocab: StoryVocab;
  index: number;
  total: number;
  onNext: () => void;
}) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [hasListened, setHasListened] = useState(false);

  const handlePlayAudio = async () => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    try {
      await audioService.speakCatalan(vocab.word);
      setHasListened(true);
    } finally {
      setIsPlayingAudio(false);
    }
  };

  const getPartOfSpeechColor = (pos?: string) => {
    switch (pos) {
      case 'verb':
        return 'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400';
      case 'noun':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400';
      case 'adjective':
        return 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400';
      case 'adverb':
        return 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400';
      case 'phrase':
        return 'bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-400';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full"
    >
      <Card className="p-6 bg-gradient-to-br from-white to-rose-50 dark:from-gray-800 dark:to-rose-950/20 border-2 border-rose-200 dark:border-rose-800">
        {/* Progress */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-rose-600 dark:text-rose-400">
            Word {index + 1} of {total}
          </span>
          {vocab.partOfSpeech && (
            <span
              className={`text-xs px-2 py-1 rounded-full capitalize ${getPartOfSpeechColor(
                vocab.partOfSpeech
              )}`}
            >
              {vocab.partOfSpeech}
            </span>
          )}
        </div>

        {/* Word display */}
        <div className="text-center mb-6">
          {/* Catalan word */}
          <div className="flex items-center justify-center gap-3 mb-3">
            <h2 className="text-3xl font-bold text-miro-blue dark:text-ink-light">
              {vocab.word}
            </h2>
            <button
              onClick={handlePlayAudio}
              disabled={isPlayingAudio}
              className={`p-2 rounded-full transition-colors ${
                isPlayingAudio
                  ? 'bg-rose-500 text-white'
                  : 'bg-rose-100 dark:bg-rose-900/50 text-rose-500 hover:bg-rose-200'
              }`}
              aria-label="Play pronunciation"
            >
              <Volume2 className={`w-5 h-5 ${isPlayingAudio ? 'animate-pulse' : ''}`} />
            </button>
          </div>

          {/* English translation */}
          <p className="text-xl text-miro-blue/70 dark:text-ink-light/70">
            {vocab.translation}
          </p>
        </div>

        {/* Continue button */}
        <Button
          fullWidth
          onClick={onNext}
          rightIcon={<ArrowRight className="w-5 h-5" />}
        >
          {hasListened ? 'Next Word' : 'Continue'}
        </Button>
      </Card>
    </motion.div>
  );
}

// Quiz mode - simple flashcard style
function VocabQuizCard({
  vocab,
  index,
  total,
  onAnswer,
}: {
  vocab: StoryVocab;
  index: number;
  total: number;
  onAnswer: (correct: boolean) => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handlePlayAudio = async () => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    try {
      await audioService.speakCatalan(vocab.word);
    } finally {
      setIsPlayingAudio(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full"
    >
      <Card className="p-6 bg-gradient-to-br from-white to-emerald-50 dark:from-gray-800 dark:to-emerald-950/20 border-2 border-emerald-200 dark:border-emerald-800">
        {/* Progress */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            Quiz {index + 1} of {total}
          </span>
          <span className="text-xs px-2 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-full">
            Test Yourself
          </span>
        </div>

        {/* Question */}
        <div className="text-center mb-6">
          <p className="text-sm text-miro-blue/60 dark:text-ink-light/60 mb-2">
            What is the Catalan word for:
          </p>
          <h2 className="text-2xl font-bold text-miro-blue dark:text-ink-light mb-4">
            {vocab.translation}
          </h2>

          {!revealed ? (
            <Button
              onClick={() => setRevealed(true)}
              leftIcon={<Eye className="w-5 h-5" />}
            >
              Reveal Answer
            </Button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {vocab.word}
                </p>
                <button
                  onClick={handlePlayAudio}
                  disabled={isPlayingAudio}
                  className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-500 hover:bg-emerald-200"
                >
                  <Volume2 className={`w-5 h-5 ${isPlayingAudio ? 'animate-pulse' : ''}`} />
                </button>
              </div>

              <p className="text-sm text-miro-blue/60 dark:text-ink-light/60 mb-4">
                Did you remember it?
              </p>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => onAnswer(false)}
                  className="border-rose-300 text-rose-600 hover:bg-rose-50"
                >
                  Not Yet
                </Button>
                <Button
                  fullWidth
                  onClick={() => onAnswer(true)}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  Got It!
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

export function VocabularyPreview({
  story,
  onComplete,
  onSkip,
  isReread = false,
}: VocabularyPreviewProps) {
  const [phase, setPhase] = useState<LearnPhase>('learn');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [isAddingToLibrary, setIsAddingToLibrary] = useState(false);

  const vocabulary = story.vocabulary;

  const handleLearnNext = () => {
    if (currentIndex < vocabulary.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Move to quiz phase
      setCurrentIndex(0);
      setPhase('quiz');
    }
  };

  const handleQuizAnswer = async (correct: boolean) => {
    if (correct) {
      setQuizScore(quizScore + 1);
    }

    if (currentIndex < vocabulary.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Quiz complete - add to library and proceed
      setIsAddingToLibrary(true);
      try {
        await addStoryVocabToLibrary(vocabulary, story.title);
      } catch (error) {
        console.error('Failed to add vocab to library:', error);
      } finally {
        setIsAddingToLibrary(false);
        onComplete();
      }
    }
  };

  const handleSkip = () => {
    // Still add vocab to library when skipping
    addStoryVocabToLibrary(vocabulary, story.title).catch(console.error);
    onSkip?.();
  };

  const progress =
    phase === 'learn'
      ? Math.round(((currentIndex + 1) / vocabulary.length) * 50)
      : 50 + Math.round(((currentIndex + 1) / vocabulary.length) * 50);

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-rose-500" />
            <h1 className="text-lg font-bold text-miro-blue dark:text-ink-light">
              {phase === 'learn' ? 'Story Vocabulary' : 'Quick Quiz'}
            </h1>
          </div>
          {(onSkip || isReread) && (
            <button
              onClick={handleSkip || onComplete}
              className="flex items-center gap-1 text-sm text-miro-blue/50 dark:text-ink-light/50 hover:text-miro-blue dark:hover:text-ink-light"
            >
              <SkipForward className="w-4 h-4" />
              Skip
            </button>
          )}
        </div>
        <p className="text-sm text-miro-blue/60 dark:text-ink-light/60 mt-1">
          {story.title} - {story.titleCatalan}
        </p>
      </div>

      {/* Phase indicator */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            phase === 'learn'
              ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400'
              : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          <Eye className="w-3 h-3" />
          Learn
        </div>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            phase === 'quiz'
              ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400'
              : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          <Pencil className="w-3 h-3" />
          Quiz
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <ProgressBar progress={progress} />
      </div>

      {/* Current card */}
      <AnimatePresence mode="wait">
        {phase === 'learn' ? (
          <VocabLearnCard
            key={`learn-${currentIndex}`}
            vocab={vocabulary[currentIndex]}
            index={currentIndex}
            total={vocabulary.length}
            onNext={handleLearnNext}
          />
        ) : (
          <VocabQuizCard
            key={`quiz-${currentIndex}`}
            vocab={vocabulary[currentIndex]}
            index={currentIndex}
            total={vocabulary.length}
            onAnswer={handleQuizAnswer}
          />
        )}
      </AnimatePresence>

      {/* Info text */}
      <p className="text-xs text-center text-miro-blue/50 dark:text-ink-light/50 mt-4">
        {vocabulary.length} words will be added to your flashcard library
      </p>

      {isAddingToLibrary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-miro-blue dark:text-ink-light">
              Adding vocabulary to your library...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
