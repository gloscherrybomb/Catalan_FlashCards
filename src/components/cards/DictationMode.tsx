import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2,
  Play,
  RotateCcw,
  Check,
  X,
  Gauge,
  Ear,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { audioService } from '../../services/audioService';
import type { StudyCard } from '../../types/flashcard';

interface DictationModeProps {
  studyCard: StudyCard;
  onComplete: (score: number, correct: boolean) => void;
  onSkip?: () => void;
}

type PlaybackSpeed = 'slow' | 'normal' | 'fast';

interface CharacterComparison {
  char: string;
  expected: string;
  status: 'correct' | 'wrong' | 'accent' | 'missing' | 'extra';
}

function compareStrings(userInput: string, correct: string): CharacterComparison[] {
  const result: CharacterComparison[] = [];
  const userChars = userInput.split('');
  const correctChars = correct.split('');

  // Normalize for accent comparison
  const normalizeChar = (c: string) =>
    c.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const maxLen = Math.max(userChars.length, correctChars.length);

  for (let i = 0; i < maxLen; i++) {
    const userChar = userChars[i] || '';
    const expectedChar = correctChars[i] || '';

    if (!userChar && expectedChar) {
      result.push({ char: expectedChar, expected: expectedChar, status: 'missing' });
    } else if (userChar && !expectedChar) {
      result.push({ char: userChar, expected: '', status: 'extra' });
    } else if (userChar.toLowerCase() === expectedChar.toLowerCase()) {
      result.push({ char: userChar, expected: expectedChar, status: 'correct' });
    } else if (normalizeChar(userChar) === normalizeChar(expectedChar)) {
      result.push({ char: userChar, expected: expectedChar, status: 'accent' });
    } else {
      result.push({ char: userChar, expected: expectedChar, status: 'wrong' });
    }
  }

  return result;
}

function calculateAccuracy(comparison: CharacterComparison[]): number {
  if (comparison.length === 0) return 0;
  const correct = comparison.filter(c => c.status === 'correct').length;
  const accent = comparison.filter(c => c.status === 'accent').length;
  // Accent errors count as half correct
  return Math.round(((correct + accent * 0.5) / comparison.length) * 100);
}

export function DictationMode({ studyCard, onComplete, onSkip }: DictationModeProps) {
  const [hasPlayed, setHasPlayed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [replaysLeft, setReplaysLeft] = useState(3);
  const [speed, setSpeed] = useState<PlaybackSpeed>('normal');
  const [userInput, setUserInput] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [comparison, setComparison] = useState<CharacterComparison[]>([]);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef<number>(0);

  const { flashcard } = studyCard;
  // Always dictate Catalan words
  const correctAnswer = flashcard.back;

  // Reset on card change
  useEffect(() => {
    setHasPlayed(false);
    setReplaysLeft(3);
    setSpeed('normal');
    setUserInput('');
    setIsSubmitted(false);
    setComparison([]);
    setWrongAttempts(0);
    setShowHint(false);
    setScore(0);
    startTimeRef.current = 0;
  }, [flashcard.id]);

  // Show hint after 2 wrong attempts
  useEffect(() => {
    if (wrongAttempts >= 2 && !showHint) {
      setShowHint(true);
    }
  }, [wrongAttempts, showHint]);

  const playAudio = async () => {
    if (isPlaying) return;
    if (hasPlayed && replaysLeft <= 0) return;

    setIsPlaying(true);
    try {
      await audioService.speakCatalanAtSpeed(correctAnswer, speed);

      if (!hasPlayed) {
        setHasPlayed(true);
        startTimeRef.current = Date.now();
        // Focus input after first play
        setTimeout(() => inputRef.current?.focus(), 300);
      } else {
        setReplaysLeft(prev => prev - 1);
      }
    } finally {
      setIsPlaying(false);
    }
  };

  const handleSubmit = () => {
    if (!userInput.trim() || isSubmitted) return;

    const comp = compareStrings(userInput.trim(), correctAnswer);
    setComparison(comp);

    const accuracy = calculateAccuracy(comp);
    const isCorrect = accuracy >= 90; // 90% threshold for "correct"

    if (!isCorrect && wrongAttempts < 2) {
      // Allow retry
      setWrongAttempts(prev => prev + 1);
      setComparison(comp);
      return;
    }

    setIsSubmitted(true);

    // Calculate score
    // Base: accuracy percentage
    // Bonuses/penalties: speed used, replays used, time taken
    let finalScore = accuracy;

    // Speed bonus/penalty
    if (speed === 'slow') finalScore -= 10;
    if (speed === 'fast') finalScore += 10;

    // Replay penalty
    const replaysUsed = 3 - replaysLeft;
    finalScore -= replaysUsed * 5;

    // Time bonus (if answered quickly)
    const timeSpent = (Date.now() - startTimeRef.current) / 1000;
    if (timeSpent < 10 && accuracy >= 90) finalScore += 10;

    finalScore = Math.max(0, Math.min(100, finalScore));
    setScore(Math.round(finalScore));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleNext = () => {
    const accuracy = calculateAccuracy(comparison);
    onComplete(score, accuracy >= 90);
  };

  const getCharacterClass = (status: CharacterComparison['status']) => {
    switch (status) {
      case 'correct':
        return 'bg-miro-green/20 text-miro-green border-miro-green/30';
      case 'accent':
        return 'bg-miro-yellow/20 text-miro-yellow border-miro-yellow/30';
      case 'wrong':
        return 'bg-miro-red/20 text-miro-red border-miro-red/30';
      case 'missing':
        return 'bg-gray-200 dark:bg-gray-700 text-gray-400 border-gray-300 dark:border-gray-600';
      case 'extra':
        return 'bg-miro-orange/20 text-miro-orange border-miro-orange/30 line-through';
      default:
        return '';
    }
  };

  return (
    <Card className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-gradient-to-br from-teal-400/20 to-cyan-400/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-gradient-to-tr from-cyan-400/15 to-teal-400/5 rounded-full blur-2xl" />

      {/* Header */}
      <div className="relative mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 dark:from-teal-500/20 dark:to-cyan-500/20 rounded-full">
          <Ear className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wide">
            Dictation Mode
          </span>
        </div>
        <p className="text-lg text-miro-blue/70 dark:text-ink-light/70">
          Listen and type what you hear in Catalan
        </p>
      </div>

      {/* Audio Player Section */}
      <div className="relative mb-6 p-6 rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 border-2 border-teal-200/50 dark:border-teal-800/50">
        {/* Play Button */}
        <div className="flex flex-col items-center">
          <motion.button
            onClick={playAudio}
            disabled={isPlaying || (hasPlayed && replaysLeft <= 0)}
            className={`
              relative w-24 h-24 rounded-full flex items-center justify-center
              ${isPlaying
                ? 'bg-gradient-to-br from-teal-400 to-cyan-400'
                : hasPlayed && replaysLeft <= 0
                ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                : 'bg-gradient-to-br from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400'
              }
              shadow-lg transition-all
            `}
            whileHover={!isPlaying && replaysLeft > 0 ? { scale: 1.05 } : {}}
            whileTap={!isPlaying && replaysLeft > 0 ? { scale: 0.95 } : {}}
          >
            {isPlaying ? (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
              >
                <Volume2 className="w-10 h-10 text-white" />
              </motion.div>
            ) : hasPlayed ? (
              <RotateCcw className="w-10 h-10 text-white" />
            ) : (
              <Play className="w-10 h-10 text-white ml-1" />
            )}

            {/* Replay counter badge */}
            {hasPlayed && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-7 h-7 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md border-2 border-teal-500"
              >
                <span className={`text-sm font-bold ${replaysLeft > 0 ? 'text-teal-600' : 'text-gray-400'}`}>
                  {replaysLeft}
                </span>
              </motion.div>
            )}
          </motion.button>

          <p className="mt-3 text-sm text-teal-700 dark:text-teal-300 font-medium">
            {!hasPlayed
              ? 'Tap to listen'
              : replaysLeft > 0
              ? `${replaysLeft} replay${replaysLeft !== 1 ? 's' : ''} left`
              : 'No replays left'}
          </p>
        </div>

        {/* Speed Controls */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <Gauge className="w-4 h-4 text-teal-600/60 dark:text-teal-400/60" />
          <div className="flex rounded-xl bg-white/60 dark:bg-gray-800/60 p-1 border border-teal-200/50 dark:border-teal-800/50">
            {(['slow', 'normal', 'fast'] as PlaybackSpeed[]).map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`
                  px-3 py-1.5 text-xs font-semibold rounded-lg transition-all
                  ${speed === s
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-sm'
                    : 'text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/30'
                  }
                `}
              >
                {s === 'slow' ? '0.6×' : s === 'normal' ? '1.0×' : '1.25×'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hint (shows after 2 wrong attempts) */}
      <AnimatePresence>
        {showHint && !isSubmitted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <div className="p-3 rounded-xl bg-miro-yellow/10 dark:bg-miro-yellow/20 border border-miro-yellow/30">
              <p className="text-sm text-miro-yellow font-medium">
                💡 Hint: The word starts with "{correctAnswer.charAt(0).toUpperCase()}"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Section */}
      <AnimatePresence>
        {hasPlayed && !isSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type what you heard..."
              className="w-full px-4 py-4 text-xl font-medium text-center border-3 border-teal-300 dark:border-teal-700 rounded-xl bg-white dark:bg-gray-800 text-miro-blue dark:text-ink-light placeholder-gray-400 focus:border-teal-500 focus:ring-0 transition-colors"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />

            {/* Live comparison preview (before submit) */}
            {comparison.length > 0 && wrongAttempts > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50"
              >
                <p className="text-xs text-miro-blue/50 dark:text-ink-light/50 mb-2 font-medium">
                  Your attempt ({wrongAttempts}/2 tries):
                </p>
                <div className="flex flex-wrap gap-1 justify-center">
                  {comparison.map((char, i) => (
                    <span
                      key={i}
                      className={`
                        inline-flex items-center justify-center w-7 h-8 text-lg font-mono font-bold
                        rounded border ${getCharacterClass(char.status)}
                      `}
                    >
                      {char.char || '·'}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Section */}
      <AnimatePresence>
        {isSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            {/* Character-by-character breakdown */}
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 mb-4">
              <p className="text-xs text-miro-blue/50 dark:text-ink-light/50 mb-3 font-medium">
                Your answer:
              </p>
              <div className="flex flex-wrap gap-1 justify-center mb-4">
                {comparison.map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`
                      inline-flex items-center justify-center w-8 h-10 text-xl font-mono font-bold
                      rounded-lg border-2 ${getCharacterClass(char.status)}
                    `}
                  >
                    {char.char || '·'}
                  </motion.span>
                ))}
              </div>

              {/* Correct answer */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-miro-blue/50 dark:text-ink-light/50 mb-2 font-medium">
                  Correct answer:
                </p>
                <p className="text-xl font-bold text-miro-green text-center">
                  {correctAnswer}
                </p>
              </div>
            </div>

            {/* Score */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className={`
                flex items-center gap-2 px-4 py-2 rounded-xl
                ${calculateAccuracy(comparison) >= 90
                  ? 'bg-miro-green/10 text-miro-green'
                  : calculateAccuracy(comparison) >= 70
                  ? 'bg-miro-yellow/10 text-miro-yellow'
                  : 'bg-miro-red/10 text-miro-red'
                }
              `}>
                {calculateAccuracy(comparison) >= 90 ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <X className="w-5 h-5" />
                )}
                <span className="font-bold">{calculateAccuracy(comparison)}% accuracy</span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-miro-blue/10 dark:bg-ink-light/10">
                <span className="font-bold text-miro-blue dark:text-ink-light">
                  Score: {score}
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-miro-green/30 border border-miro-green/50" />
                <span className="text-miro-blue/60 dark:text-ink-light/60">Correct</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-miro-yellow/30 border border-miro-yellow/50" />
                <span className="text-miro-blue/60 dark:text-ink-light/60">Accent issue</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-miro-red/30 border border-miro-red/50" />
                <span className="text-miro-blue/60 dark:text-ink-light/60">Wrong</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-gray-200 dark:bg-gray-600 border border-gray-300 dark:border-gray-500" />
                <span className="text-miro-blue/60 dark:text-ink-light/60">Missing</span>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <div className="flex gap-3">
        {!isSubmitted ? (
          <>
            {onSkip && (
              <Button variant="outline" onClick={onSkip}>
                Skip
              </Button>
            )}
            <Button
              onClick={handleSubmit}
              disabled={!userInput.trim() || !hasPlayed}
              className="flex-1"
            >
              Check Answer
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={() => audioService.speakCatalan(correctAnswer)}
              leftIcon={<Volume2 className="w-4 h-4" />}
            >
              Listen
            </Button>
            <Button
              onClick={handleNext}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              variant={calculateAccuracy(comparison) >= 90 ? 'secondary' : 'primary'}
              className="flex-1"
            >
              Continue
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
