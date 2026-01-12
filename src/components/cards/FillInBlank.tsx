import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2,
  HelpCircle,
  ArrowRight,
  Check,
  X,
  Lightbulb,
  Pencil,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { audioService } from '../../services/audioService';
import {
  createFillInBlank,
  validateFillInBlank,
} from '../../services/sentenceService';

interface FillInBlankProps {
  sentence: {
    catalan: string;
    english: string;
    vocabularyIndices: number[];
  };
  blankIndex?: number;
  onComplete: (score: number, correct: boolean) => void;
  onSkip?: () => void;
}

export function FillInBlank({
  sentence,
  blankIndex,
  onComplete,
  onSkip,
}: FillInBlankProps) {
  const [userAnswer, setUserAnswer] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isCloseMatch, setIsCloseMatch] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [currentHint, setCurrentHint] = useState('');
  const [blankData, setBlankData] = useState<{
    sentenceWithBlank: string;
    blankWord: string;
    blankPosition: number;
  } | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [score, setScore] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const startTime = useRef(Date.now());

  // Initialize blank data
  useEffect(() => {
    const data = createFillInBlank(
      { ...sentence, id: '', categoryId: '', hasAudio: true },
      blankIndex
    );
    setBlankData(data);
    setUserAnswer('');
    setIsChecked(false);
    setIsCorrect(false);
    setIsCloseMatch(false);
    setHintsUsed(0);
    setCurrentHint('');
    startTime.current = Date.now();

    // Auto-focus the input
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [sentence, blankIndex]);

  const handleSubmit = () => {
    if (!blankData || !userAnswer.trim()) return;

    const result = validateFillInBlank(userAnswer, blankData.blankWord);
    const timeSpent = Math.floor((Date.now() - startTime.current) / 1000);

    setIsCorrect(result.isCorrect);
    setIsCloseMatch(result.isCloseMatch);
    setIsChecked(true);

    // Calculate score
    let calculatedScore = 0;
    if (result.isCorrect) {
      calculatedScore = 100 - hintsUsed * 25;
      if (timeSpent < 10) calculatedScore += 10; // Speed bonus
    } else if (result.isCloseMatch) {
      calculatedScore = 50 - hintsUsed * 15;
    }
    setScore(Math.max(0, calculatedScore));

    if (!result.isCorrect && !result.isCloseMatch) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isChecked) {
      handleSubmit();
    }
  };

  const getProgressiveHint = () => {
    if (!blankData) return;

    const word = blankData.blankWord;
    const nextHintLevel = hintsUsed + 1;

    let hint = '';
    if (nextHintLevel === 1) {
      hint = word.charAt(0) + '_'.repeat(word.length - 1);
    } else if (nextHintLevel === 2) {
      const visibleChars = Math.ceil(word.length / 2);
      hint = word.slice(0, visibleChars) + '_'.repeat(word.length - visibleChars);
    } else if (nextHintLevel === 3) {
      hint = word.slice(0, -1) + '_';
    }

    setCurrentHint(hint);
    setHintsUsed(nextHintLevel);
  };

  const handlePlayAudio = () => {
    audioService.speakCatalan(sentence.catalan);
  };

  const handleNext = () => {
    onComplete(score, isCorrect);
  };

  if (!blankData) return null;

  // Split sentence into parts around the blank
  const parts = blankData.sentenceWithBlank.split('___');

  return (
    <Card className="relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-miro-yellow/20 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-miro-blue/10 to-transparent rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />

      {/* Header */}
      <div className="relative mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 bg-miro-red/10 dark:bg-miro-red/20 rounded-full">
              <Pencil className="w-4 h-4 text-miro-red" />
              <span className="text-xs font-semibold text-miro-red uppercase tracking-wide">
                Fill in the blank
              </span>
            </div>
            <p className="text-xl font-medium text-miro-blue dark:text-ink-light leading-relaxed">
              {sentence.english}
            </p>
          </div>
          <button
            onClick={handlePlayAudio}
            className="flex-shrink-0 p-3 rounded-xl bg-miro-green/10 dark:bg-miro-green/20 hover:bg-miro-green/20 dark:hover:bg-miro-green/30 transition-colors group"
            title="Listen to pronunciation"
          >
            <Volume2 className="w-5 h-5 text-miro-green group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      {/* Hint display */}
      <AnimatePresence>
        {currentHint && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-miro-orange/10 dark:bg-miro-orange/20 border border-miro-orange/20">
              <Lightbulb className="w-4 h-4 text-miro-orange" />
              <span className="font-mono text-lg text-miro-blue dark:text-ink-light tracking-wider">
                {currentHint}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sentence with inline blank */}
      <motion.div
        animate={{
          x: isShaking ? [0, -10, 10, -10, 10, 0] : 0,
        }}
        transition={{ duration: 0.4 }}
        className="relative p-6 mb-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-2 border-miro-blue/10 dark:border-ink-light/10"
      >
        <p className="text-2xl font-medium leading-relaxed text-miro-blue dark:text-ink-light">
          {parts[0]}
          <span className="relative inline-block mx-1">
            <input
              ref={inputRef}
              type="text"
              value={userAnswer}
              onChange={(e) => !isChecked && setUserAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={isChecked}
              className={`
                w-32 px-2 py-1 text-2xl font-bold text-center
                bg-transparent border-b-4 outline-none
                transition-all duration-300
                ${
                  isChecked
                    ? isCorrect
                      ? 'border-miro-green text-miro-green'
                      : isCloseMatch
                      ? 'border-miro-orange text-miro-orange'
                      : 'border-miro-red text-miro-red'
                    : isFocused
                    ? 'border-miro-yellow'
                    : 'border-miro-blue/30 dark:border-ink-light/30'
                }
                placeholder-miro-blue/30 dark:placeholder-ink-light/30
              `}
              placeholder="..."
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
            {/* Animated underline glow when focused */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-1 bg-miro-yellow rounded-full"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{
                scaleX: isFocused && !isChecked ? 1 : 0,
                opacity: isFocused && !isChecked ? 0.5 : 0,
              }}
              style={{ originX: 0.5 }}
            />
          </span>
          {parts[1]}
        </p>

        {/* Result badge */}
        {isChecked && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={`absolute -top-3 -right-3 w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
              isCorrect
                ? 'bg-miro-green'
                : isCloseMatch
                ? 'bg-miro-orange'
                : 'bg-miro-red'
            }`}
          >
            {isCorrect ? (
              <Check className="w-6 h-6 text-white" />
            ) : isCloseMatch ? (
              <span className="text-white text-lg">~</span>
            ) : (
              <X className="w-6 h-6 text-white" />
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Feedback messages */}
      <AnimatePresence>
        {isChecked && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            {isCorrect ? (
              <div className="p-4 rounded-xl bg-miro-green/10 dark:bg-miro-green/20 border border-miro-green/20">
                <p className="font-bold text-miro-green mb-1">Perfect! 🎉</p>
                <p className="text-sm text-miro-blue/70 dark:text-ink-light/70">
                  The word was: <span className="font-semibold">{blankData.blankWord}</span>
                </p>
              </div>
            ) : isCloseMatch ? (
              <div className="p-4 rounded-xl bg-miro-orange/10 dark:bg-miro-orange/20 border border-miro-orange/20">
                <p className="font-bold text-miro-orange mb-1">Almost! 👏</p>
                <p className="text-sm text-miro-blue/70 dark:text-ink-light/70">
                  You wrote: <span className="font-semibold">{userAnswer}</span>
                </p>
                <p className="text-sm text-miro-blue/70 dark:text-ink-light/70">
                  Correct: <span className="font-semibold text-miro-green">{blankData.blankWord}</span>
                </p>
                <p className="text-xs text-miro-orange mt-2">
                  Watch out for accents and spelling!
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-miro-red/10 dark:bg-miro-red/20 border border-miro-red/20">
                <p className="font-bold text-miro-red mb-1">Not quite...</p>
                <p className="text-sm text-miro-blue/70 dark:text-ink-light/70">
                  You wrote: <span className="font-semibold">{userAnswer || '(empty)'}</span>
                </p>
                <p className="text-sm text-miro-blue/70 dark:text-ink-light/70">
                  Correct: <span className="font-semibold text-miro-green">{blankData.blankWord}</span>
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Score display */}
      <AnimatePresence>
        {isChecked && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 text-center"
          >
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-xl bg-gradient-to-r from-miro-blue/5 to-miro-green/5 dark:from-miro-blue/10 dark:to-miro-green/10">
              <span className="text-sm text-miro-blue/60 dark:text-ink-light/60">
                Score:
              </span>
              <span className={`text-2xl font-bold ${
                score >= 80 ? 'text-miro-green' : score >= 50 ? 'text-miro-orange' : 'text-miro-blue dark:text-ink-light'
              }`}>
                {score}
              </span>
              <span className="text-sm text-miro-blue/40 dark:text-ink-light/40">
                / 100
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <div className="flex gap-3">
        {!isChecked ? (
          <>
            <Button
              variant="outline"
              onClick={getProgressiveHint}
              disabled={hintsUsed >= 3}
              leftIcon={<HelpCircle className="w-4 h-4" />}
              className="flex-1"
            >
              Hint {hintsUsed > 0 ? `(${hintsUsed}/3)` : ''}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!userAnswer.trim()}
              className="flex-1"
            >
              Check Answer
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={handlePlayAudio}
              leftIcon={<Volume2 className="w-4 h-4" />}
            >
              Listen
            </Button>
            {onSkip && !isCorrect && (
              <Button variant="outline" onClick={onSkip} className="flex-1">
                Skip
              </Button>
            )}
            <Button
              onClick={handleNext}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              variant={isCorrect ? 'secondary' : 'primary'}
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
