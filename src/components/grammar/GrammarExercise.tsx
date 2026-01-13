import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  X,
  ArrowRight,
  Sparkles,
  RotateCcw,
  Trophy,
  Lightbulb,
  Shuffle,
  Languages,
  Link2,
  Zap,
  Star,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import type { GrammarExercise as GrammarExerciseType } from '../../data/grammarLessons';

// Color palette for word chips in sentence-build
const WORD_COLORS = [
  { bg: 'bg-gradient-to-br from-rose-400 to-pink-500', text: 'text-white', shadow: 'shadow-pink-200 dark:shadow-pink-900/30' },
  { bg: 'bg-gradient-to-br from-amber-400 to-orange-500', text: 'text-white', shadow: 'shadow-orange-200 dark:shadow-orange-900/30' },
  { bg: 'bg-gradient-to-br from-emerald-400 to-teal-500', text: 'text-white', shadow: 'shadow-teal-200 dark:shadow-teal-900/30' },
  { bg: 'bg-gradient-to-br from-sky-400 to-blue-500', text: 'text-white', shadow: 'shadow-blue-200 dark:shadow-blue-900/30' },
  { bg: 'bg-gradient-to-br from-violet-400 to-purple-500', text: 'text-white', shadow: 'shadow-purple-200 dark:shadow-purple-900/30' },
  { bg: 'bg-gradient-to-br from-fuchsia-400 to-pink-500', text: 'text-white', shadow: 'shadow-pink-200 dark:shadow-pink-900/30' },
];

// Confetti particle component
const ConfettiParticle = ({ delay, color }: { delay: number; color: string }) => (
  <motion.div
    initial={{ opacity: 1, y: 0, x: 0, scale: 1 }}
    animate={{
      opacity: [1, 1, 0],
      y: [0, -80, -120],
      x: [0, (Math.random() - 0.5) * 100],
      scale: [1, 1.2, 0.5],
      rotate: [0, Math.random() * 360],
    }}
    transition={{ duration: 1.2, delay, ease: 'easeOut' }}
    className={`absolute w-2 h-2 rounded-sm ${color}`}
    style={{ left: '50%', top: '50%' }}
  />
);

// Success burst animation for correct answers
const SuccessBurst = () => {
  const colors = ['bg-miro-yellow', 'bg-miro-green', 'bg-miro-red', 'bg-pink-400', 'bg-sky-400'];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(12)].map((_, i) => (
        <ConfettiParticle key={i} delay={i * 0.05} color={colors[i % colors.length]} />
      ))}
    </div>
  );
};

interface GrammarExercisesProps {
  exercises: GrammarExerciseType[];
  onComplete: (score: number) => void;
  onExerciseComplete?: (exerciseId: string, correct: boolean) => void;
  onContinue?: () => void; // Called when user clicks Continue after completion
}

export function GrammarExercises({
  exercises,
  onComplete,
  onExerciseComplete,
  onContinue,
}: GrammarExercisesProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [inputAnswer, setInputAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // State for sentence-build exercise - track words with their color indices
  type WordWithColor = { word: string; colorIndex: number };
  const [selectedWords, setSelectedWords] = useState<WordWithColor[]>([]);
  const [availableWords, setAvailableWords] = useState<WordWithColor[]>([]);

  // State for match exercise
  const [matchSelections, setMatchSelections] = useState<{ left: string | null; right: string | null }>({ left: null, right: null });
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);

  // State for animations
  const [showSuccessBurst, setShowSuccessBurst] = useState(false);
  const [recentlyMatched, setRecentlyMatched] = useState<string[]>([]);

  const currentExercise = exercises[currentIndex];
  const progress = ((currentIndex + 1) / exercises.length) * 100;

  // Initialize available words for sentence-build when exercise changes
  const initializeSentenceBuild = useCallback(() => {
    if (currentExercise?.type === 'sentence-build' && currentExercise.words) {
      // Create word objects with colors, then shuffle
      const wordsWithColors: WordWithColor[] = currentExercise.words.map((word, i) => ({
        word,
        colorIndex: i % WORD_COLORS.length,
      }));
      const shuffled = [...wordsWithColors].sort(() => Math.random() - 0.5);
      setAvailableWords(shuffled);
      setSelectedWords([]);
    }
  }, [currentExercise]);

  // Initialize when current exercise changes
  useEffect(() => {
    initializeSentenceBuild();
  }, [initializeSentenceBuild]);

  const checkAnswer = () => {
    let userAnswer: string | null = null;
    let correct = false;

    switch (currentExercise.type) {
      case 'fill-blank':
        userAnswer = inputAnswer.trim();
        correct = userAnswer?.toLowerCase() === currentExercise.correctAnswer.toLowerCase();
        break;
      case 'multiple-choice':
        userAnswer = selectedAnswer;
        correct = userAnswer?.toLowerCase() === currentExercise.correctAnswer.toLowerCase();
        break;
      case 'sentence-build':
        userAnswer = selectedWords.map(w => w.word).join(' ');
        correct = userAnswer.toLowerCase() === currentExercise.correctAnswer.toLowerCase();
        break;
      case 'translate':
        userAnswer = inputAnswer.trim();
        // More lenient comparison for translation - ignore case and extra spaces
        const normalizedUser = userAnswer?.toLowerCase().replace(/\s+/g, ' ').trim() || '';
        const normalizedCorrect = currentExercise.correctAnswer.toLowerCase().replace(/\s+/g, ' ').trim();
        correct = normalizedUser === normalizedCorrect;
        break;
      case 'match':
        // For match, check if all pairs are correctly matched
        userAnswer = matchedPairs.join(',');
        correct = matchedPairs.length === (currentExercise.pairs?.length || 0);
        break;
      default:
        userAnswer = selectedAnswer;
        correct = userAnswer?.toLowerCase() === currentExercise.correctAnswer.toLowerCase();
    }

    setIsCorrect(correct);
    setIsAnswered(true);
    setShowExplanation(true);

    if (correct) {
      setScore((prev) => prev + 1);
      // Trigger success burst animation
      setShowSuccessBurst(true);
      setTimeout(() => setShowSuccessBurst(false), 1500);
    }

    onExerciseComplete?.(currentExercise.id, correct);
  };

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextExercise = exercises[nextIndex];

      setCurrentIndex(nextIndex);
      setSelectedAnswer(null);
      setInputAnswer('');
      setIsAnswered(false);
      setIsCorrect(false);
      setShowExplanation(false);

      // Reset sentence-build state
      setSelectedWords([]);
      if (nextExercise?.type === 'sentence-build' && nextExercise.words) {
        const wordsWithColors: WordWithColor[] = nextExercise.words.map((word, i) => ({
          word,
          colorIndex: i % WORD_COLORS.length,
        }));
        const shuffled = [...wordsWithColors].sort(() => Math.random() - 0.5);
        setAvailableWords(shuffled);
      }

      // Reset match state
      setMatchSelections({ left: null, right: null });
      setMatchedPairs([]);
      setRecentlyMatched([]);
      setShowSuccessBurst(false);
    } else {
      setIsComplete(true);
      onComplete(Math.round((score / exercises.length) * 100));
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setInputAnswer('');
    setIsAnswered(false);
    setIsCorrect(false);
    setShowExplanation(false);
    setScore(0);
    setIsComplete(false);

    // Reset sentence-build state
    setSelectedWords([]);
    if (exercises[0]?.type === 'sentence-build' && exercises[0].words) {
      const wordsWithColors: WordWithColor[] = exercises[0].words.map((word, i) => ({
        word,
        colorIndex: i % WORD_COLORS.length,
      }));
      const shuffled = [...wordsWithColors].sort(() => Math.random() - 0.5);
      setAvailableWords(shuffled);
    }

    // Reset match state
    setMatchSelections({ left: null, right: null });
    setMatchedPairs([]);
  };

  // Sentence-build helpers
  const handleSelectWord = (wordObj: WordWithColor, index: number) => {
    if (isAnswered) return;
    setSelectedWords([...selectedWords, wordObj]);
    setAvailableWords(availableWords.filter((_, i) => i !== index));
  };

  const handleRemoveWord = (wordObj: WordWithColor, index: number) => {
    if (isAnswered) return;
    setAvailableWords([...availableWords, wordObj]);
    setSelectedWords(selectedWords.filter((_, i) => i !== index));
  };

  const handleShuffleWords = () => {
    if (isAnswered) return;
    // Reset: put all words back and shuffle
    const allWords: WordWithColor[] = [...selectedWords, ...availableWords];
    const shuffled = [...allWords].sort(() => Math.random() - 0.5);
    setAvailableWords(shuffled);
    setSelectedWords([]);
  };

  // Match exercise helpers
  const handleMatchSelect = (side: 'left' | 'right', value: string) => {
    if (isAnswered || matchedPairs.includes(value)) return;

    const newSelections = { ...matchSelections, [side]: value };
    setMatchSelections(newSelections);

    // Check if both sides are selected
    if (newSelections.left && newSelections.right) {
      // Check if this is a correct match
      const pair = currentExercise.pairs?.find(
        p => p.left === newSelections.left && p.right === newSelections.right
      );
      if (pair) {
        // Mark as recently matched for animation
        setRecentlyMatched([newSelections.left, newSelections.right]);
        setTimeout(() => setRecentlyMatched([]), 600);

        setMatchedPairs([...matchedPairs, newSelections.left, newSelections.right]);
      }
      // Reset selections after a short delay
      setTimeout(() => {
        setMatchSelections({ left: null, right: null });
      }, 300);
    }
  };

  // Celebration screen
  if (isComplete) {
    const percentage = Math.round((score / exercises.length) * 100);
    const getMessage = () => {
      if (percentage >= 90) return { text: 'Perfect!', emoji: '🏆', color: 'text-miro-yellow' };
      if (percentage >= 70) return { text: 'Great job!', emoji: '⭐', color: 'text-miro-green' };
      if (percentage >= 50) return { text: 'Good effort!', emoji: '👏', color: 'text-miro-blue dark:text-ink-light' };
      return { text: 'Keep practicing!', emoji: '💪', color: 'text-miro-orange' };
    };
    const message = getMessage();

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        {/* Celebration animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="relative w-32 h-32 mx-auto mb-6"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-miro-yellow to-miro-orange rounded-full animate-pulse" />
          <div className="absolute inset-2 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
            <span className="text-6xl">{message.emoji}</span>
          </div>
          {/* Sparkle decorations */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className="w-8 h-8 text-miro-yellow animate-bounce" />
          </motion.div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`text-3xl font-bold mb-2 ${message.color}`}
        >
          {message.text}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <p className="text-5xl font-bold text-miro-blue dark:text-ink-light mb-1">
            {score}/{exercises.length}
          </p>
          <p className="text-miro-blue/60 dark:text-ink-light/60">
            {percentage}% correct
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex gap-3 justify-center"
        >
          <Button
            variant="outline"
            onClick={handleRetry}
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            Try Again
          </Button>
          <Button
            variant="secondary"
            onClick={() => onContinue ? onContinue() : onComplete(percentage)}
            leftIcon={<Trophy className="w-4 h-4" />}
          >
            Continue
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="relative">
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-miro-yellow to-miro-green"
          />
        </div>
        <span className="absolute right-0 -top-6 text-sm text-miro-blue/60 dark:text-ink-light/60">
          {currentIndex + 1} / {exercises.length}
        </span>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="relative overflow-visible">
            {/* Decorative element */}
            <div className="absolute -top-3 -left-3 w-8 h-8 bg-miro-red rounded-full flex items-center justify-center text-white font-bold shadow-playful-sm">
              {currentIndex + 1}
            </div>

            {/* Question type badge */}
            <div className="flex justify-end mb-4">
              <span className="px-3 py-1 bg-miro-blue/10 dark:bg-miro-blue/20 rounded-full text-xs font-medium text-miro-blue dark:text-ink-light flex items-center gap-1">
                {currentExercise.type === 'fill-blank' && 'Fill in the blank'}
                {currentExercise.type === 'multiple-choice' && 'Multiple choice'}
                {currentExercise.type === 'sentence-build' && (
                  <>
                    <Shuffle className="w-3 h-3" />
                    Build the sentence
                  </>
                )}
                {currentExercise.type === 'translate' && (
                  <>
                    <Languages className="w-3 h-3" />
                    Translate
                  </>
                )}
                {currentExercise.type === 'match' && (
                  <>
                    <Link2 className="w-3 h-3" />
                    Match pairs
                  </>
                )}
              </span>
            </div>

            {/* Question */}
            <div className="mb-6">
              <p className="text-xl font-medium text-miro-blue dark:text-ink-light leading-relaxed">
                {currentExercise.question.split('___').map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <span
                        className={`inline-block min-w-[80px] mx-1 border-b-3 ${
                          isAnswered
                            ? isCorrect
                              ? 'border-miro-green bg-miro-green/10'
                              : 'border-miro-red bg-miro-red/10'
                            : 'border-miro-blue/30 dark:border-ink-light/30'
                        } px-2 py-1 rounded-lg text-center`}
                      >
                        {isAnswered ? (
                          <span
                            className={
                              isCorrect ? 'text-miro-green' : 'text-miro-red'
                            }
                          >
                            {inputAnswer || selectedAnswer || '?'}
                          </span>
                        ) : (
                          <span className="text-miro-blue/30 dark:text-ink-light/30">?</span>
                        )}
                      </span>
                    )}
                  </span>
                ))}
              </p>
            </div>

            {/* Answer Input */}
            {currentExercise.type === 'fill-blank' && !isAnswered && (
              <div className="mb-6">
                <input
                  type="text"
                  value={inputAnswer}
                  onChange={(e) => setInputAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && inputAnswer.trim()) {
                      checkAnswer();
                    }
                  }}
                  placeholder="Type your answer..."
                  className="w-full px-4 py-3 text-lg border-3 border-miro-blue/20 dark:border-ink-light/20 rounded-xl bg-white dark:bg-gray-800 text-miro-blue dark:text-ink-light placeholder-miro-blue/40 dark:placeholder-ink-light/40 focus:border-miro-yellow focus:ring-0 transition-colors"
                  autoFocus
                />
              </div>
            )}

            {/* Multiple Choice Options */}
            {currentExercise.type === 'multiple-choice' && currentExercise.options && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                {currentExercise.options.map((option) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrectOption =
                    option.toLowerCase() === currentExercise.correctAnswer.toLowerCase();

                  let buttonClass =
                    'p-4 rounded-xl border-3 text-left font-medium transition-all ';

                  if (isAnswered) {
                    if (isCorrectOption) {
                      buttonClass +=
                        'border-miro-green bg-miro-green/10 text-miro-green';
                    } else if (isSelected && !isCorrect) {
                      buttonClass +=
                        'border-miro-red bg-miro-red/10 text-miro-red';
                    } else {
                      buttonClass +=
                        'border-gray-200 dark:border-gray-700 text-miro-blue/50 dark:text-ink-light/50';
                    }
                  } else {
                    buttonClass += isSelected
                      ? 'border-miro-yellow bg-miro-yellow/10 text-miro-blue dark:text-ink-light shadow-playful-sm'
                      : 'border-miro-blue/20 dark:border-ink-light/20 text-miro-blue dark:text-ink-light hover:border-miro-yellow hover:bg-miro-yellow/5';
                  }

                  return (
                    <motion.button
                      key={option}
                      whileHover={!isAnswered ? { scale: 1.02 } : {}}
                      whileTap={!isAnswered ? { scale: 0.98 } : {}}
                      onClick={() => !isAnswered && setSelectedAnswer(option)}
                      disabled={isAnswered}
                      className={buttonClass}
                    >
                      <span className="flex items-center gap-2">
                        {isAnswered && isCorrectOption && (
                          <Check className="w-5 h-5 text-miro-green" />
                        )}
                        {isAnswered && isSelected && !isCorrect && (
                          <X className="w-5 h-5 text-miro-red" />
                        )}
                        {option}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* Sentence Build Exercise - Enhanced */}
            {currentExercise.type === 'sentence-build' && (
              <div className="mb-6 space-y-5 relative">
                {/* Success burst animation */}
                {showSuccessBurst && <SuccessBurst />}

                {/* Sentence construction zone */}
                <div className="relative">
                  {/* Decorative corner accents */}
                  <div className={`absolute -top-1 -left-1 w-4 h-4 border-l-3 border-t-3 rounded-tl-lg ${
                    isAnswered
                      ? isCorrect ? 'border-miro-green' : 'border-miro-red'
                      : 'border-miro-yellow'
                  }`} />
                  <div className={`absolute -top-1 -right-1 w-4 h-4 border-r-3 border-t-3 rounded-tr-lg ${
                    isAnswered
                      ? isCorrect ? 'border-miro-green' : 'border-miro-red'
                      : 'border-miro-yellow'
                  }`} />
                  <div className={`absolute -bottom-1 -left-1 w-4 h-4 border-l-3 border-b-3 rounded-bl-lg ${
                    isAnswered
                      ? isCorrect ? 'border-miro-green' : 'border-miro-red'
                      : 'border-miro-yellow'
                  }`} />
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-r-3 border-b-3 rounded-br-lg ${
                    isAnswered
                      ? isCorrect ? 'border-miro-green' : 'border-miro-red'
                      : 'border-miro-yellow'
                  }`} />

                  <div
                    className={`min-h-[80px] p-4 rounded-xl transition-all duration-300 ${
                      isAnswered
                        ? isCorrect
                          ? 'bg-gradient-to-br from-miro-green/10 to-emerald-50 dark:from-miro-green/10 dark:to-emerald-900/10'
                          : 'bg-gradient-to-br from-miro-red/10 to-rose-50 dark:from-miro-red/10 dark:to-rose-900/10'
                        : 'bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-800/80 dark:to-gray-900/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className={`w-4 h-4 ${
                        isAnswered
                          ? isCorrect ? 'text-miro-green' : 'text-miro-red'
                          : 'text-miro-yellow'
                      }`} />
                      <span className="text-xs font-semibold uppercase tracking-wider text-miro-blue/60 dark:text-ink-light/60">
                        Your sentence
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 min-h-[44px] items-center">
                      <AnimatePresence mode="popLayout">
                        {selectedWords.length === 0 ? (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            className="text-miro-blue/40 dark:text-ink-light/40 italic text-sm"
                          >
                            Tap the colorful words below to build your sentence...
                          </motion.span>
                        ) : (
                          selectedWords.map((wordObj, index) => {
                            const colors = WORD_COLORS[wordObj.colorIndex];
                            return (
                              <motion.button
                                key={`selected-${wordObj.word}-${index}`}
                                initial={{ scale: 0.5, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.8, opacity: 0, y: -10 }}
                                whileHover={!isAnswered ? { scale: 1.05, y: -2 } : {}}
                                whileTap={!isAnswered ? { scale: 0.95 } : {}}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                onClick={() => handleRemoveWord(wordObj, index)}
                                disabled={isAnswered}
                                className={`px-4 py-2 rounded-xl font-semibold shadow-md transition-shadow ${
                                  isAnswered
                                    ? `${colors.bg} ${colors.text} cursor-default opacity-80`
                                    : `${colors.bg} ${colors.text} ${colors.shadow} cursor-pointer hover:shadow-lg`
                                }`}
                              >
                                {wordObj.word}
                              </motion.button>
                            );
                          })
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Available words section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-miro-blue dark:bg-ink-light rounded-full animate-pulse" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-miro-blue/60 dark:text-ink-light/60">
                        Available words
                      </span>
                    </div>
                    {!isAnswered && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleShuffleWords}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-miro-blue/5 dark:bg-ink-light/5 text-xs font-medium text-miro-blue/70 dark:text-ink-light/70 hover:bg-miro-blue/10 dark:hover:bg-ink-light/10 transition-colors"
                      >
                        <Shuffle className="w-3 h-3" />
                        Shuffle
                      </motion.button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <AnimatePresence mode="popLayout">
                      {availableWords.map((wordObj, index) => {
                        const colors = WORD_COLORS[wordObj.colorIndex];
                        return (
                          <motion.button
                            key={`available-${wordObj.word}-${index}`}
                            layout
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            whileHover={!isAnswered ? { scale: 1.08, y: -3 } : {}}
                            whileTap={!isAnswered ? { scale: 0.92 } : {}}
                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                            onClick={() => handleSelectWord(wordObj, index)}
                            disabled={isAnswered}
                            className={`px-4 py-2 rounded-xl font-semibold shadow-md transition-all ${
                              isAnswered
                                ? 'bg-gray-100 dark:bg-gray-800 text-miro-blue/30 dark:text-ink-light/30 cursor-default shadow-none'
                                : `${colors.bg} ${colors.text} ${colors.shadow} cursor-pointer hover:shadow-lg`
                            }`}
                          >
                            {wordObj.word}
                          </motion.button>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            )}

            {/* Translate Exercise - Enhanced */}
            {currentExercise.type === 'translate' && (
              <div className="mb-6 space-y-5 relative">
                {/* Success burst animation */}
                {showSuccessBurst && <SuccessBurst />}

                {/* Hints section with enhanced styling */}
                {currentExercise.hints && currentExercise.hints.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/10 border-2 border-dashed border-miro-yellow/40"
                  >
                    {/* Lightbulb decoration */}
                    <div className="absolute -top-3 left-4 bg-miro-yellow rounded-full p-1.5 shadow-md">
                      <Star className="w-4 h-4 text-white" />
                    </div>

                    <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300 mb-3 ml-6">
                      Helpful vocabulary
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {currentExercise.hints.map((hint, i) => (
                        <motion.span
                          key={i}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg text-sm font-semibold text-miro-blue dark:text-ink-light shadow-sm border border-amber-200 dark:border-amber-800/30 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-default"
                        >
                          {hint}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Translation input with enhanced styling */}
                {!isAnswered && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Languages className="w-4 h-4 text-miro-blue/60 dark:text-ink-light/60" />
                      <label className="text-xs font-semibold uppercase tracking-wider text-miro-blue/60 dark:text-ink-light/60">
                        Your translation ({currentExercise.targetLanguage === 'catalan' ? 'in Catalan' : 'in English'})
                      </label>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={inputAnswer}
                        onChange={(e) => setInputAnswer(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && inputAnswer.trim()) {
                            checkAnswer();
                          }
                        }}
                        placeholder={`Type your ${currentExercise.targetLanguage === 'catalan' ? 'Catalan' : 'English'} translation...`}
                        className="w-full px-4 py-4 text-lg border-3 border-miro-blue/20 dark:border-ink-light/20 rounded-2xl bg-white dark:bg-gray-800 text-miro-blue dark:text-ink-light placeholder-miro-blue/40 dark:placeholder-ink-light/40 focus:border-miro-yellow focus:ring-4 focus:ring-miro-yellow/20 transition-all"
                        autoFocus
                      />

                      {/* Typing progress indicator */}
                      {inputAnswer.length > 0 && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((inputAnswer.length / 30) * 100, 100)}%` }}
                          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-miro-yellow to-miro-green rounded-full"
                        />
                      )}
                    </div>

                    {/* Character count hint */}
                    {inputAnswer.length > 0 && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-miro-blue/40 dark:text-ink-light/40 text-right"
                      >
                        {inputAnswer.length} characters typed
                      </motion.p>
                    )}
                  </div>
                )}

                {/* Show user's answer after submission - Enhanced */}
                {isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`relative p-4 rounded-2xl overflow-hidden ${
                      isCorrect
                        ? 'bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/10'
                        : 'bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/10'
                    }`}
                  >
                    {/* Icon badge */}
                    <div className={`absolute -top-2 -right-2 p-3 rounded-full ${
                      isCorrect ? 'bg-miro-green' : 'bg-miro-red'
                    }`}>
                      {isCorrect ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : (
                        <X className="w-5 h-5 text-white" />
                      )}
                    </div>

                    <p className="text-xs font-semibold uppercase tracking-wider text-miro-blue/50 dark:text-ink-light/50 mb-2">
                      Your translation
                    </p>
                    <p className={`text-lg font-semibold ${isCorrect ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
                      {inputAnswer}
                    </p>
                  </motion.div>
                )}
              </div>
            )}

            {/* Match Exercise - Enhanced */}
            {currentExercise.type === 'match' && currentExercise.pairs && (
              <div className="mb-6 space-y-4 relative">
                {/* Success burst animation */}
                {showSuccessBurst && <SuccessBurst />}

                {/* Header */}
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-miro-blue/60 dark:text-ink-light/60" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-miro-blue/60 dark:text-ink-light/60">
                    Connect matching pairs
                  </p>
                </div>

                {/* Match grid with enhanced styling */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Left column - Catalan */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-br from-sky-400 to-blue-500" />
                      <span className="text-xs font-medium text-miro-blue/50 dark:text-ink-light/50">Catalan</span>
                    </div>
                    {currentExercise.pairs.map((pair, index) => {
                      const isMatched = matchedPairs.includes(pair.left);
                      const isSelected = matchSelections.left === pair.left;
                      const isRecentlyMatched = recentlyMatched.includes(pair.left);

                      return (
                        <motion.button
                          key={`left-${pair.left}`}
                          onClick={() => handleMatchSelect('left', pair.left)}
                          disabled={isMatched || isAnswered}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{
                            opacity: 1,
                            x: 0,
                            scale: isRecentlyMatched ? [1, 1.05, 1] : 1,
                          }}
                          transition={{
                            delay: index * 0.05,
                            scale: { duration: 0.4 },
                          }}
                          whileHover={!isMatched && !isAnswered ? { scale: 1.02, x: 4 } : {}}
                          whileTap={!isMatched && !isAnswered ? { scale: 0.98 } : {}}
                          className={`w-full p-4 rounded-xl border-3 text-left font-semibold transition-all relative overflow-hidden ${
                            isMatched
                              ? 'border-emerald-400 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/20 text-emerald-700 dark:text-emerald-300'
                              : isSelected
                              ? 'border-miro-yellow bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/20 text-miro-blue dark:text-ink-light shadow-lg shadow-yellow-200/50 dark:shadow-yellow-900/20'
                              : 'border-sky-200 dark:border-sky-800 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/10 text-miro-blue dark:text-ink-light hover:border-sky-400 hover:shadow-md'
                          }`}
                        >
                          {/* Match indicator */}
                          {isMatched && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center"
                            >
                              <Check className="w-4 h-4 text-white" />
                            </motion.div>
                          )}

                          {/* Selection pulse effect */}
                          {isSelected && (
                            <motion.div
                              initial={{ opacity: 0.5, scale: 0.8 }}
                              animate={{ opacity: 0, scale: 2 }}
                              transition={{ duration: 0.8, repeat: Infinity }}
                              className="absolute inset-0 bg-miro-yellow rounded-xl"
                            />
                          )}

                          <span className="relative z-10">{pair.left}</span>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Right column - English */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-br from-violet-400 to-purple-500" />
                      <span className="text-xs font-medium text-miro-blue/50 dark:text-ink-light/50">English</span>
                    </div>
                    {currentExercise.pairs.map((pair, index) => {
                      const isMatched = matchedPairs.includes(pair.right);
                      const isSelected = matchSelections.right === pair.right;
                      const isRecentlyMatched = recentlyMatched.includes(pair.right);

                      return (
                        <motion.button
                          key={`right-${pair.right}`}
                          onClick={() => handleMatchSelect('right', pair.right)}
                          disabled={isMatched || isAnswered}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{
                            opacity: 1,
                            x: 0,
                            scale: isRecentlyMatched ? [1, 1.05, 1] : 1,
                          }}
                          transition={{
                            delay: index * 0.05,
                            scale: { duration: 0.4 },
                          }}
                          whileHover={!isMatched && !isAnswered ? { scale: 1.02, x: -4 } : {}}
                          whileTap={!isMatched && !isAnswered ? { scale: 0.98 } : {}}
                          className={`w-full p-4 rounded-xl border-3 text-left font-semibold transition-all relative overflow-hidden ${
                            isMatched
                              ? 'border-emerald-400 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/20 text-emerald-700 dark:text-emerald-300'
                              : isSelected
                              ? 'border-miro-yellow bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/20 text-miro-blue dark:text-ink-light shadow-lg shadow-yellow-200/50 dark:shadow-yellow-900/20'
                              : 'border-violet-200 dark:border-violet-800 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/10 text-miro-blue dark:text-ink-light hover:border-violet-400 hover:shadow-md'
                          }`}
                        >
                          {/* Match indicator */}
                          {isMatched && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center"
                            >
                              <Check className="w-4 h-4 text-white" />
                            </motion.div>
                          )}

                          {/* Selection pulse effect */}
                          {isSelected && (
                            <motion.div
                              initial={{ opacity: 0.5, scale: 0.8 }}
                              animate={{ opacity: 0, scale: 2 }}
                              transition={{ duration: 0.8, repeat: Infinity }}
                              className="absolute inset-0 bg-miro-yellow rounded-xl"
                            />
                          )}

                          <span className="relative z-10">{pair.right}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Enhanced progress indicator */}
                {!isAnswered && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-miro-blue/50 dark:text-ink-light/50">
                        Progress
                      </span>
                      <span className="text-xs font-bold text-miro-blue dark:text-ink-light">
                        {matchedPairs.length / 2} / {currentExercise.pairs.length}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(matchedPairs.length / 2 / currentExercise.pairs.length) * 100}%` }}
                        transition={{ type: 'spring', stiffness: 100 }}
                        className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Explanation */}
            <AnimatePresence>
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-4 rounded-xl border-2 mb-6 ${
                    isCorrect
                      ? 'bg-miro-green/5 border-miro-green/20'
                      : 'bg-miro-orange/5 border-miro-orange/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        isCorrect ? 'bg-miro-green/10' : 'bg-miro-orange/10'
                      }`}
                    >
                      <Lightbulb
                        className={`w-5 h-5 ${
                          isCorrect ? 'text-miro-green' : 'text-miro-orange'
                        }`}
                      />
                    </div>
                    <div>
                      <p
                        className={`font-bold mb-1 ${
                          isCorrect ? 'text-miro-green' : 'text-miro-orange'
                        }`}
                      >
                        {isCorrect ? 'Correct!' : 'Not quite...'}
                      </p>
                      <p className="text-miro-blue/70 dark:text-ink-light/70">
                        {currentExercise.explanation}
                      </p>
                      {!isCorrect && (
                        <p className="mt-2 font-medium text-miro-blue dark:text-ink-light">
                          Correct answer:{' '}
                          <span className="text-miro-green">
                            {currentExercise.correctAnswer}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {!isAnswered ? (
                <Button
                  fullWidth
                  onClick={checkAnswer}
                  disabled={
                    currentExercise.type === 'fill-blank' ? !inputAnswer.trim() :
                    currentExercise.type === 'multiple-choice' ? !selectedAnswer :
                    currentExercise.type === 'sentence-build' ? selectedWords.length === 0 :
                    currentExercise.type === 'translate' ? !inputAnswer.trim() :
                    currentExercise.type === 'match' ? matchedPairs.length !== (currentExercise.pairs?.length || 0) * 2 :
                    false
                  }
                >
                  Check Answer
                </Button>
              ) : (
                <Button
                  fullWidth
                  onClick={handleNext}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  variant={isCorrect ? 'secondary' : 'primary'}
                >
                  {currentIndex < exercises.length - 1 ? 'Next Question' : 'See Results'}
                </Button>
              )}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Score indicator */}
      <div className="flex justify-center">
        <div className="flex gap-1">
          {exercises.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i < currentIndex
                  ? 'bg-miro-green'
                  : i === currentIndex
                  ? 'bg-miro-yellow'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
