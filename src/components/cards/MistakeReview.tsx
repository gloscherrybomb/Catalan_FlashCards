import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, ChevronRight, RotateCcw, CheckCircle2, XCircle, BookOpen } from 'lucide-react';
import type { Flashcard } from '../../types/flashcard';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { audioService } from '../../services/audioService';

interface MistakeReviewProps {
  mistakes: MistakeCard[];
  onComplete: () => void;
  onPracticeAgain: (cardIds: string[]) => void;
}

export interface MistakeCard {
  flashcard: Flashcard;
  direction: 'english-to-catalan' | 'catalan-to-english';
  userAnswer?: string;
  correctAnswer: string;
  errorType: 'wrong' | 'timeout' | 'typo';
}

export function MistakeReview({ mistakes, onComplete, onPracticeAgain }: MistakeReviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedForPractice, setSelectedForPractice] = useState<Set<string>>(new Set());
  const [isPlaying, setIsPlaying] = useState(false);

  const currentMistake = mistakes[currentIndex];
  const isComplete = currentIndex >= mistakes.length;

  const handleSpeak = async (text: string, lang: 'catalan' | 'english') => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      if (lang === 'catalan') {
        await audioService.speakCatalan(text);
      } else {
        await audioService.speakEnglish(text);
      }
    } finally {
      setIsPlaying(false);
    }
  };

  const togglePractice = (cardId: string) => {
    setSelectedForPractice((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };

  const nextCard = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Summary screen
  if (isComplete) {
    return (
      <div className="max-w-md mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Review Complete!
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            You reviewed {mistakes.length} cards that need more practice.
          </p>

          {/* Cards list */}
          <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
            {mistakes.map((mistake) => (
              <div
                key={`${mistake.flashcard.id}-${mistake.direction}`}
                onClick={() => togglePractice(mistake.flashcard.id)}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedForPractice.has(mistake.flashcard.id)
                    ? 'border-primary bg-primary/5 dark:bg-primary/10'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <p className="font-medium text-gray-800 dark:text-white">
                      {mistake.flashcard.front}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {mistake.flashcard.back}
                    </p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedForPractice.has(mistake.flashcard.id)
                      ? 'bg-primary border-primary'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {selectedForPractice.has(mistake.flashcard.id) && (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedForPractice.size > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {selectedForPractice.size} card{selectedForPractice.size > 1 ? 's' : ''} selected for practice
            </p>
          )}

          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={onComplete}>
              Done
            </Button>
            {selectedForPractice.size > 0 && (
              <Button
                fullWidth
                onClick={() => onPracticeAgain(Array.from(selectedForPractice))}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Practice Selected
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  const questionText = currentMistake.direction === 'english-to-catalan'
    ? currentMistake.flashcard.front
    : currentMistake.flashcard.back;

  const answerText = currentMistake.direction === 'english-to-catalan'
    ? currentMistake.flashcard.back
    : currentMistake.flashcard.front;

  const answerLang = currentMistake.direction === 'english-to-catalan' ? 'catalan' : 'english';

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Review Mistakes
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {currentIndex + 1}/{mistakes.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full mb-6 overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / mistakes.length) * 100}%` }}
        />
      </div>

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
        >
          <Card className="mb-6">
            {/* Error type badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                currentMistake.errorType === 'wrong'
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  : currentMistake.errorType === 'timeout'
                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              }`}>
                {currentMistake.errorType === 'wrong' && 'Incorrect'}
                {currentMistake.errorType === 'timeout' && 'Time Out'}
                {currentMistake.errorType === 'typo' && 'Typo'}
              </span>
              <span className="text-xs text-gray-400">
                {currentMistake.direction === 'english-to-catalan' ? 'EN → CAT' : 'CAT → EN'}
              </span>
            </div>

            {/* Question */}
            <div className="mb-6">
              <p className="text-xs text-gray-400 uppercase mb-1">Question</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                {questionText}
              </h3>
            </div>

            {/* Your answer */}
            {currentMistake.userAnswer && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-xs text-red-500 dark:text-red-400 uppercase mb-1 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  Your answer
                </p>
                <p className="text-lg text-red-700 dark:text-red-300 line-through">
                  {currentMistake.userAnswer}
                </p>
              </div>
            )}

            {/* Correct answer */}
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-xs text-green-600 dark:text-green-400 uppercase mb-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Correct answer
              </p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold text-green-700 dark:text-green-300">
                  {answerText}
                </p>
                <button
                  onClick={() => handleSpeak(answerText, answerLang)}
                  className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-full transition-colors"
                >
                  <Volume2 className={`w-4 h-4 text-green-600 dark:text-green-400 ${isPlaying ? 'animate-pulse' : ''}`} />
                </button>
              </div>
            </div>

            {/* Notes/Hint */}
            {currentMistake.flashcard.notes && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-400 uppercase mb-1">Hint</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {currentMistake.flashcard.notes}
                </p>
              </div>
            )}
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={prevCard}
          disabled={currentIndex === 0}
        >
          Previous
        </Button>
        <Button
          fullWidth
          onClick={nextCard}
          rightIcon={<ChevronRight className="w-4 h-4" />}
        >
          {currentIndex === mistakes.length - 1 ? 'Finish Review' : 'Next'}
        </Button>
      </div>

      {/* Add to practice toggle */}
      <button
        onClick={() => togglePractice(currentMistake.flashcard.id)}
        className={`mt-4 w-full py-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
          selectedForPractice.has(currentMistake.flashcard.id)
            ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary'
            : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
        }`}
      >
        {selectedForPractice.has(currentMistake.flashcard.id) ? (
          <>
            <CheckCircle2 className="w-5 h-5" />
            Added to practice list
          </>
        ) : (
          <>
            <RotateCcw className="w-5 h-5" />
            Add to practice list
          </>
        )}
      </button>
    </div>
  );
}
