import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Trophy, X } from 'lucide-react';
import type { StudyCard } from '../../types/flashcard';
import { Button } from '../ui/Button';
import { Confetti } from '../ui/Confetti';
import { stripBracketedContent } from '../../utils/textUtils';

interface SprintModeProps {
  cards: StudyCard[];
  timeLimit?: number; // seconds per card
  onComplete: (results: SprintResult[]) => void;
  onExit: () => void;
}

interface SprintResult {
  cardId: string;
  direction: 'english-to-catalan' | 'catalan-to-english';
  isCorrect: boolean;
  timeSpent: number;
  answer: string;
}

export function SprintMode({
  cards,
  timeLimit = 5,
  onComplete,
  onExit,
}: SprintModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [results, setResults] = useState<SprintResult[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isPaused] = useState(false);

  const currentCard = cards[currentIndex];
  const isComplete = currentIndex >= cards.length;

  const front = currentCard
    ? stripBracketedContent(currentCard.direction === 'english-to-catalan'
        ? currentCard.flashcard.front
        : currentCard.flashcard.back)
    : '';

  const back = currentCard
    ? stripBracketedContent(currentCard.direction === 'english-to-catalan'
        ? currentCard.flashcard.back
        : currentCard.flashcard.front)
    : '';

  // Timer countdown
  useEffect(() => {
    if (isComplete || showAnswer || isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          handleTimeout();
          return timeLimit;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [currentIndex, showAnswer, isComplete, isPaused, timeLimit]);

  const handleTimeout = useCallback(() => {
    if (!currentCard) return;

    // Time's up - mark as wrong
    const result: SprintResult = {
      cardId: currentCard.flashcard.id,
      direction: currentCard.direction,
      isCorrect: false,
      timeSpent: timeLimit,
      answer: 'timeout',
    };

    setResults((prev) => [...prev, result]);
    setStreak(0);
    setShowAnswer(true);

    setTimeout(() => {
      nextCard();
    }, 1500);
  }, [currentCard, timeLimit]);

  const handleAnswer = (isCorrect: boolean) => {
    if (!currentCard || showAnswer) return;

    const result: SprintResult = {
      cardId: currentCard.flashcard.id,
      direction: currentCard.direction,
      isCorrect,
      timeSpent: timeLimit - timeLeft,
      answer: isCorrect ? 'correct' : 'wrong',
    };

    setResults((prev) => [...prev, result]);

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setTotalCorrect((prev) => prev + 1);
      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
      }
      if (newStreak === 5 || newStreak === 10) {
        setShowConfetti(true);
      }
    } else {
      setStreak(0);
    }

    setShowAnswer(true);

    setTimeout(() => {
      nextCard();
    }, 1000);
  };

  const nextCard = () => {
    setShowAnswer(false);
    setTimeLeft(timeLimit);
    setCurrentIndex((prev) => prev + 1);
  };

  // Completion screen
  if (isComplete) {
    const accuracy = Math.round((totalCorrect / cards.length) * 100);
    const avgTime = results.reduce((sum, r) => sum + r.timeSpent, 0) / results.length;

    return (
      <div className="max-w-md mx-auto px-4 py-8 text-center">
        <Confetti isActive={accuracy >= 80} />

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <Trophy className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Sprint Complete!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Lightning fast learning
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <p className="text-3xl font-bold text-gray-800 dark:text-white">{accuracy}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Accuracy</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <p className="text-3xl font-bold text-gray-800 dark:text-white">{avgTime.toFixed(1)}s</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Time</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <p className="text-3xl font-bold text-primary">{totalCorrect}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Correct</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <p className="text-3xl font-bold text-amber-500">{bestStreak}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Best Streak</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={onExit}>
              Exit
            </Button>
            <Button
              fullWidth
              onClick={() => onComplete(results)}
            >
              Save Results
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Sprint interface
  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <Confetti isActive={showConfetti} onComplete={() => setShowConfetti(false)} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onExit}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        >
          <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        </button>

        <div className="flex items-center gap-4">
          {/* Streak */}
          <div className="flex items-center gap-1 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-full">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-amber-600 dark:text-amber-400">{streak}</span>
          </div>

          {/* Progress */}
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {currentIndex + 1}/{cards.length}
          </span>
        </div>
      </div>

      {/* Timer bar */}
      <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-6 overflow-hidden">
        <motion.div
          className={`absolute inset-y-0 left-0 rounded-full ${
            timeLeft < 2 ? 'bg-red-500' : timeLeft < 3 ? 'bg-amber-500' : 'bg-primary'
          }`}
          style={{ width: `${(timeLeft / timeLimit) * 100}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Timer display */}
      <div className="text-center mb-4">
        <motion.span
          key={Math.ceil(timeLeft)}
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`text-4xl font-bold ${
            timeLeft < 2 ? 'text-red-500' : timeLeft < 3 ? 'text-amber-500' : 'text-gray-800 dark:text-white'
          }`}
        >
          {Math.ceil(timeLeft)}
        </motion.span>
      </div>

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          className={`relative p-8 rounded-3xl shadow-lg ${
            showAnswer
              ? results[results.length - 1]?.isCorrect
                ? 'bg-green-100 dark:bg-green-900/30'
                : 'bg-red-100 dark:bg-red-900/30'
              : 'bg-white dark:bg-gray-800'
          }`}
        >
          <div className="text-center">
            <span className="text-xs font-medium text-gray-400 uppercase mb-4 block">
              {currentCard?.direction === 'english-to-catalan' ? 'Translate to Catalan' : 'Translate to English'}
            </span>

            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              {front}
            </h2>

            {showAnswer && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-xl text-secondary font-semibold">{back}</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Answer buttons */}
      {!showAnswer && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-4 mt-6"
        >
          <Button
            size="lg"
            variant="outline"
            className="bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 border-red-200 text-red-600"
            onClick={() => handleAnswer(false)}
          >
            Don't Know
          </Button>
          <Button
            size="lg"
            className="bg-green-500 hover:bg-green-600 text-white"
            onClick={() => handleAnswer(true)}
          >
            I Know It!
          </Button>
        </motion.div>
      )}

      {/* Streak milestone */}
      <AnimatePresence>
        {(streak === 5 || streak === 10 || streak === 15) && !showAnswer && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="text-6xl font-bold text-primary animate-bounce">
              {streak} streak!
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
