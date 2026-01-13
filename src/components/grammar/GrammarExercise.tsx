import { useState, useCallback } from 'react';
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
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import type { GrammarExercise as GrammarExerciseType } from '../../data/grammarLessons';

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

  // State for sentence-build exercise
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);

  // State for match exercise
  const [matchSelections, setMatchSelections] = useState<{ left: string | null; right: string | null }>({ left: null, right: null });
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);

  const currentExercise = exercises[currentIndex];
  const progress = ((currentIndex + 1) / exercises.length) * 100;

  // Initialize available words for sentence-build when exercise changes
  const initializeSentenceBuild = useCallback(() => {
    if (currentExercise?.type === 'sentence-build' && currentExercise.words) {
      // Shuffle the words
      const shuffled = [...currentExercise.words].sort(() => Math.random() - 0.5);
      setAvailableWords(shuffled);
      setSelectedWords([]);
    }
  }, [currentExercise]);

  // Initialize when current exercise changes
  useState(() => {
    initializeSentenceBuild();
  });

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
        userAnswer = selectedWords.join(' ');
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
        const shuffled = [...nextExercise.words].sort(() => Math.random() - 0.5);
        setAvailableWords(shuffled);
      }

      // Reset match state
      setMatchSelections({ left: null, right: null });
      setMatchedPairs([]);
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
      const shuffled = [...exercises[0].words].sort(() => Math.random() - 0.5);
      setAvailableWords(shuffled);
    }

    // Reset match state
    setMatchSelections({ left: null, right: null });
    setMatchedPairs([]);
  };

  // Sentence-build helpers
  const handleSelectWord = (word: string, index: number) => {
    if (isAnswered) return;
    setSelectedWords([...selectedWords, word]);
    setAvailableWords(availableWords.filter((_, i) => i !== index));
  };

  const handleRemoveWord = (word: string, index: number) => {
    if (isAnswered) return;
    setAvailableWords([...availableWords, word]);
    setSelectedWords(selectedWords.filter((_, i) => i !== index));
  };

  const handleShuffleWords = () => {
    if (isAnswered) return;
    // Reset: put all words back and shuffle
    const allWords = [...selectedWords, ...availableWords];
    const shuffled = allWords.sort(() => Math.random() - 0.5);
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

            {/* Sentence Build Exercise */}
            {currentExercise.type === 'sentence-build' && (
              <div className="mb-6 space-y-4">
                {/* Selected words area */}
                <div
                  className={`min-h-[60px] p-3 rounded-xl border-3 ${
                    isAnswered
                      ? isCorrect
                        ? 'border-miro-green bg-miro-green/5'
                        : 'border-miro-red bg-miro-red/5'
                      : 'border-miro-blue/20 dark:border-ink-light/20 bg-gray-50 dark:bg-gray-800/50'
                  }`}
                >
                  <p className="text-xs text-miro-blue/50 dark:text-ink-light/50 mb-2">Your sentence:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedWords.length === 0 ? (
                      <span className="text-miro-blue/30 dark:text-ink-light/30 italic">Tap words below to build the sentence...</span>
                    ) : (
                      selectedWords.map((word, index) => (
                        <motion.button
                          key={`selected-${index}`}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          onClick={() => handleRemoveWord(word, index)}
                          disabled={isAnswered}
                          className={`px-3 py-2 rounded-lg font-medium transition-all ${
                            isAnswered
                              ? 'bg-white dark:bg-gray-700 text-miro-blue dark:text-ink-light cursor-default'
                              : 'bg-miro-yellow text-miro-blue hover:bg-miro-yellow/80 cursor-pointer'
                          }`}
                        >
                          {word}
                        </motion.button>
                      ))
                    )}
                  </div>
                </div>

                {/* Available words */}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-miro-blue/50 dark:text-ink-light/50">Available words:</p>
                  {!isAnswered && (
                    <button
                      onClick={handleShuffleWords}
                      className="text-xs text-miro-blue/50 dark:text-ink-light/50 hover:text-miro-blue dark:hover:text-ink-light flex items-center gap-1"
                    >
                      <Shuffle className="w-3 h-3" />
                      Shuffle
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableWords.map((word, index) => (
                    <motion.button
                      key={`available-${index}`}
                      layout
                      onClick={() => handleSelectWord(word, index)}
                      disabled={isAnswered}
                      className={`px-3 py-2 rounded-lg border-2 font-medium transition-all ${
                        isAnswered
                          ? 'border-gray-200 dark:border-gray-700 text-miro-blue/40 dark:text-ink-light/40 cursor-default'
                          : 'border-miro-blue/20 dark:border-ink-light/20 text-miro-blue dark:text-ink-light hover:border-miro-yellow hover:bg-miro-yellow/10 cursor-pointer'
                      }`}
                    >
                      {word}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Translate Exercise */}
            {currentExercise.type === 'translate' && (
              <div className="mb-6 space-y-4">
                {/* Hints */}
                {currentExercise.hints && currentExercise.hints.length > 0 && (
                  <div className="p-3 rounded-xl bg-miro-yellow/10 dark:bg-miro-yellow/5 border border-miro-yellow/30">
                    <p className="text-xs text-miro-blue/60 dark:text-ink-light/60 mb-1">Helpful words:</p>
                    <div className="flex flex-wrap gap-2">
                      {currentExercise.hints.map((hint, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-white dark:bg-gray-800 rounded-md text-sm font-medium text-miro-blue dark:text-ink-light"
                        >
                          {hint}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Translation input */}
                {!isAnswered && (
                  <div>
                    <label className="text-xs text-miro-blue/50 dark:text-ink-light/50 mb-1 block">
                      Your translation ({currentExercise.targetLanguage === 'catalan' ? 'in Catalan' : 'in English'}):
                    </label>
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
                      className="w-full px-4 py-3 text-lg border-3 border-miro-blue/20 dark:border-ink-light/20 rounded-xl bg-white dark:bg-gray-800 text-miro-blue dark:text-ink-light placeholder-miro-blue/40 dark:placeholder-ink-light/40 focus:border-miro-yellow focus:ring-0 transition-colors"
                      autoFocus
                    />
                  </div>
                )}

                {/* Show user's answer after submission */}
                {isAnswered && (
                  <div className={`p-3 rounded-xl ${isCorrect ? 'bg-miro-green/10' : 'bg-miro-red/10'}`}>
                    <p className="text-xs text-miro-blue/50 dark:text-ink-light/50 mb-1">Your translation:</p>
                    <p className={`font-medium ${isCorrect ? 'text-miro-green' : 'text-miro-red'}`}>
                      {inputAnswer}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Match Exercise */}
            {currentExercise.type === 'match' && currentExercise.pairs && (
              <div className="mb-6">
                <p className="text-xs text-miro-blue/50 dark:text-ink-light/50 mb-3">Match the items on the left with their translations on the right:</p>
                <div className="grid grid-cols-2 gap-4">
                  {/* Left column */}
                  <div className="space-y-2">
                    {currentExercise.pairs.map((pair) => {
                      const isMatched = matchedPairs.includes(pair.left);
                      const isSelected = matchSelections.left === pair.left;

                      return (
                        <motion.button
                          key={`left-${pair.left}`}
                          onClick={() => handleMatchSelect('left', pair.left)}
                          disabled={isMatched || isAnswered}
                          className={`w-full p-3 rounded-xl border-2 text-left font-medium transition-all ${
                            isMatched
                              ? 'border-miro-green bg-miro-green/10 text-miro-green'
                              : isSelected
                              ? 'border-miro-yellow bg-miro-yellow/10 text-miro-blue dark:text-ink-light'
                              : 'border-miro-blue/20 dark:border-ink-light/20 text-miro-blue dark:text-ink-light hover:border-miro-yellow'
                          }`}
                        >
                          {isMatched && <Check className="inline w-4 h-4 mr-2" />}
                          {pair.left}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Right column */}
                  <div className="space-y-2">
                    {currentExercise.pairs.map((pair) => {
                      const isMatched = matchedPairs.includes(pair.right);
                      const isSelected = matchSelections.right === pair.right;

                      return (
                        <motion.button
                          key={`right-${pair.right}`}
                          onClick={() => handleMatchSelect('right', pair.right)}
                          disabled={isMatched || isAnswered}
                          className={`w-full p-3 rounded-xl border-2 text-left font-medium transition-all ${
                            isMatched
                              ? 'border-miro-green bg-miro-green/10 text-miro-green'
                              : isSelected
                              ? 'border-miro-yellow bg-miro-yellow/10 text-miro-blue dark:text-ink-light'
                              : 'border-miro-blue/20 dark:border-ink-light/20 text-miro-blue dark:text-ink-light hover:border-miro-yellow'
                          }`}
                        >
                          {isMatched && <Check className="inline w-4 h-4 mr-2" />}
                          {pair.right}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Progress indicator for match */}
                {!isAnswered && (
                  <p className="text-center text-sm text-miro-blue/50 dark:text-ink-light/50 mt-3">
                    {matchedPairs.length / 2} / {currentExercise.pairs.length} pairs matched
                  </p>
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
