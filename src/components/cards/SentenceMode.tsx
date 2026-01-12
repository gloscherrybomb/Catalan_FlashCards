import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trophy, Sparkles, Target, Zap, RotateCcw } from 'lucide-react';
import { SentenceBuilder } from './SentenceBuilder';
import { FillInBlank } from './FillInBlank';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressRing';
import { Confetti } from '../ui/Confetti';
import {
  getRandomSentences,
  type SentenceData,
} from '../../data/exampleSentences';

interface SentenceModeProps {
  onExit: () => void;
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  count?: number;
}

interface ExerciseResult {
  sentenceId: string;
  exerciseType: 'builder' | 'fill-blank';
  score: number;
  correct: boolean;
}

export function SentenceMode({
  onExit,
  difficulty = 'mixed',
  count = 10,
}: SentenceModeProps) {
  const [sentences, setSentences] = useState<SentenceData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exerciseType, setExerciseType] = useState<'builder' | 'fill-blank'>('builder');
  const [results, setResults] = useState<ExerciseResult[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Initialize sentences
  useEffect(() => {
    let selected: SentenceData[];
    if (difficulty === 'mixed') {
      selected = getRandomSentences(count);
    } else {
      selected = getRandomSentences(count, difficulty);
    }
    // If not enough sentences of that difficulty, fill with random
    if (selected.length < count) {
      const additional = getRandomSentences(count - selected.length);
      selected = [...selected, ...additional];
    }
    setSentences(selected);
    // Randomly choose initial exercise type
    setExerciseType(Math.random() > 0.5 ? 'builder' : 'fill-blank');
  }, [difficulty, count]);

  const currentSentence = sentences[currentIndex];
  const progress = sentences.length > 0
    ? Math.round((currentIndex / sentences.length) * 100)
    : 0;

  const handleExerciseComplete = (score: number, correct: boolean) => {
    if (!currentSentence) return;

    setResults((prev) => [
      ...prev,
      {
        sentenceId: currentSentence.id,
        exerciseType,
        score,
        correct,
      },
    ]);

    if (currentIndex < sentences.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      // Alternate exercise type for variety
      setExerciseType((prev) => (prev === 'builder' ? 'fill-blank' : 'builder'));
    } else {
      // Session complete
      setIsComplete(true);
      const totalScore = [...results, { score, correct }].reduce((sum, r) => sum + r.score, 0);
      const avgScore = totalScore / (results.length + 1);
      if (avgScore >= 70) {
        setShowConfetti(true);
      }
    }
  };

  const handleSkip = () => {
    handleExerciseComplete(0, false);
  };

  const handleRetry = () => {
    const selected = difficulty === 'mixed'
      ? getRandomSentences(count)
      : getRandomSentences(count, difficulty);
    setSentences(selected);
    setCurrentIndex(0);
    setResults([]);
    setIsComplete(false);
    setShowConfetti(false);
    setExerciseType(Math.random() > 0.5 ? 'builder' : 'fill-blank');
  };

  // Loading state
  if (sentences.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="text-miro-blue/60 dark:text-ink-light/60">Loading sentences...</p>
        </div>
      </div>
    );
  }

  // Completion screen
  if (isComplete) {
    const totalScore = results.reduce((sum, r) => sum + r.score, 0);
    const avgScore = Math.round(totalScore / results.length);
    const correctCount = results.filter((r) => r.correct).length;
    const accuracy = Math.round((correctCount / results.length) * 100);

    const getMessage = () => {
      if (avgScore >= 90) return { text: 'Outstanding!', emoji: '🏆', color: 'text-miro-yellow' };
      if (avgScore >= 70) return { text: 'Great work!', emoji: '⭐', color: 'text-miro-green' };
      if (avgScore >= 50) return { text: 'Good effort!', emoji: '👏', color: 'text-miro-blue dark:text-ink-light' };
      return { text: 'Keep practicing!', emoji: '💪', color: 'text-miro-orange' };
    };
    const message = getMessage();

    return (
      <div className="max-w-md mx-auto px-4 py-8">
        <Confetti isActive={showConfetti} onComplete={() => setShowConfetti(false)} />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
          >
            <span className="text-5xl">{message.emoji}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`text-3xl font-bold mb-2 ${message.color}`}
          >
            {message.text}
          </motion.h1>
          <p className="text-miro-blue/60 dark:text-ink-light/60 mb-8">
            Sentence practice complete!
          </p>

          <Card className="text-left mb-6">
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center p-4 bg-miro-blue/5 dark:bg-miro-blue/10 rounded-xl border border-miro-blue/10 dark:border-miro-blue/20"
              >
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Target className="w-5 h-5 text-miro-blue dark:text-ink-light" />
                </div>
                <p className="text-3xl font-bold text-miro-blue dark:text-ink-light">
                  {results.length}
                </p>
                <p className="text-sm text-miro-blue/60 dark:text-ink-light/60">
                  Sentences
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center p-4 bg-miro-green/5 dark:bg-miro-green/10 rounded-xl border border-miro-green/10 dark:border-miro-green/20"
              >
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Sparkles className="w-5 h-5 text-miro-green" />
                </div>
                <p className="text-3xl font-bold text-miro-green">{accuracy}%</p>
                <p className="text-sm text-miro-blue/60 dark:text-ink-light/60">
                  Accuracy
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-center p-4 bg-miro-yellow/5 dark:bg-miro-yellow/10 rounded-xl border border-miro-yellow/10 dark:border-miro-yellow/20"
              >
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Zap className="w-5 h-5 text-miro-yellow" />
                </div>
                <p className="text-3xl font-bold text-miro-yellow">{avgScore}</p>
                <p className="text-sm text-miro-blue/60 dark:text-ink-light/60">
                  Avg Score
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-center p-4 bg-rose-50 dark:bg-rose-950/20 rounded-xl border border-rose-100 dark:border-rose-900/20"
              >
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Trophy className="w-5 h-5 text-rose-500" />
                </div>
                <p className="text-3xl font-bold text-rose-500">
                  {correctCount}/{results.length}
                </p>
                <p className="text-sm text-miro-blue/60 dark:text-ink-light/60">
                  Correct
                </p>
              </motion.div>
            </div>
          </Card>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex gap-3"
          >
            <Button variant="outline" fullWidth onClick={onExit}>
              Back to Study
            </Button>
            <Button
              fullWidth
              onClick={handleRetry}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Practice More
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onExit}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} className="text-miro-blue dark:text-ink-light" />
        </button>

        <div className="flex-1 mx-4">
          <ProgressBar progress={progress} height={8} />
        </div>

        <span className="text-sm font-medium text-miro-blue/60 dark:text-ink-light/60">
          {currentIndex + 1}/{sentences.length}
        </span>
      </div>

      {/* Exercise type indicator */}
      <div className="flex justify-center mb-4">
        <span
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
            exerciseType === 'builder'
              ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
              : 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'
          }`}
        >
          {exerciseType === 'builder' ? '🧩 Word Order' : '✏️ Fill in Blank'}
        </span>
      </div>

      {/* Exercise */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentSentence.id}-${exerciseType}`}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.2 }}
        >
          {exerciseType === 'builder' ? (
            <SentenceBuilder
              sentence={{
                catalan: currentSentence.catalan,
                english: currentSentence.english,
                vocabularyIndices: currentSentence.vocabularyIndices,
              }}
              onComplete={handleExerciseComplete}
              onSkip={handleSkip}
            />
          ) : (
            <FillInBlank
              sentence={{
                catalan: currentSentence.catalan,
                english: currentSentence.english,
                vocabularyIndices: currentSentence.vocabularyIndices,
              }}
              onComplete={handleExerciseComplete}
              onSkip={handleSkip}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Progress dots */}
      <div className="flex justify-center mt-6">
        <div className="flex gap-1">
          {sentences.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i < currentIndex
                  ? results[i]?.correct
                    ? 'bg-miro-green'
                    : 'bg-miro-red'
                  : i === currentIndex
                  ? 'bg-rose-500'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
