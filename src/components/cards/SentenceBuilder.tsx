import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Volume2,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { audioService } from '../../services/audioService';
import {
  scrambleSentence,
  validateSentenceOrder,
  getHint,
  calculateScore,
  type ScrambledWord,
} from '../../services/sentenceService';

interface SentenceBuilderProps {
  sentence: {
    catalan: string;
    english: string;
    vocabularyIndices: number[];
  };
  onComplete: (score: number, correct: boolean) => void;
  onSkip?: () => void;
}

// Miró-inspired color palette for word tiles
const TILE_COLORS = [
  { bg: 'bg-miro-yellow', border: 'border-miro-yellow', shadow: 'shadow-[0_4px_0_0_#d4a800]', darkShadow: 'dark:shadow-[0_4px_0_0_#b8930a]' },
  { bg: 'bg-miro-red', border: 'border-miro-red', shadow: 'shadow-[0_4px_0_0_#c41c1c]', darkShadow: 'dark:shadow-[0_4px_0_0_#a31717]', text: 'text-white' },
  { bg: 'bg-miro-blue', border: 'border-miro-blue', shadow: 'shadow-[0_4px_0_0_#1a3a5c]', darkShadow: 'dark:shadow-[0_4px_0_0_#0f2237]', text: 'text-white dark:text-ink-light' },
  { bg: 'bg-miro-green', border: 'border-miro-green', shadow: 'shadow-[0_4px_0_0_#1a7a3d]', darkShadow: 'dark:shadow-[0_4px_0_0_#145f30]', text: 'text-white' },
  { bg: 'bg-miro-orange', border: 'border-miro-orange', shadow: 'shadow-[0_4px_0_0_#cc6600]', darkShadow: 'dark:shadow-[0_4px_0_0_#a85500]', text: 'text-white' },
];

function getColorForIndex(index: number) {
  return TILE_COLORS[index % TILE_COLORS.length];
}

export function SentenceBuilder({ sentence, onComplete, onSkip }: SentenceBuilderProps) {
  const [wordBank, setWordBank] = useState<ScrambledWord[]>([]);
  const [answerSlots, setAnswerSlots] = useState<ScrambledWord[]>([]);
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [startTime] = useState(Date.now());
  const [score, setScore] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const answerRef = useRef<HTMLDivElement>(null);

  // Initialize scrambled words
  useEffect(() => {
    const scrambled = scrambleSentence(sentence.catalan);
    setWordBank(scrambled);
    setAnswerSlots([]);
    setIsChecked(false);
    setIsCorrect(false);
    setHintsUsed(0);
    setCurrentHint(null);
    setShowHint(false);
  }, [sentence]);

  const handleWordClick = (word: ScrambledWord, source: 'bank' | 'answer') => {
    if (isChecked) return;

    if (source === 'bank') {
      // Move from bank to answer
      setWordBank((prev) => prev.filter((w) => w.id !== word.id));
      setAnswerSlots((prev) => [...prev, word]);
    } else {
      // Move from answer back to bank
      setAnswerSlots((prev) => prev.filter((w) => w.id !== word.id));
      setWordBank((prev) => [...prev, word]);
    }
  };

  const handleCheckAnswer = () => {
    const result = validateSentenceOrder(answerSlots, sentence.catalan);
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const calculatedScore = calculateScore(result.isCorrect, hintsUsed, timeSpent);

    setIsCorrect(result.isCorrect);
    setIsChecked(true);
    setScore(calculatedScore);

    if (!result.isCorrect) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handleGetHint = () => {
    const nextHintLevel = Math.min(hintsUsed + 1, 3) as 1 | 2 | 3;
    const hint = getHint(sentence.catalan, nextHintLevel);
    setCurrentHint(hint.hint);
    setShowHint(true);
    setHintsUsed(nextHintLevel);
  };

  const handlePlayAudio = () => {
    audioService.speakCatalan(sentence.catalan);
  };

  const handleReset = () => {
    const scrambled = scrambleSentence(sentence.catalan);
    setWordBank(scrambled);
    setAnswerSlots([]);
    setIsChecked(false);
    setIsCorrect(false);
    setIsShaking(false);
  };

  const handleNext = () => {
    onComplete(score, isCorrect);
  };

  const allWordsPlaced = wordBank.length === 0;

  return (
    <Card className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-miro-yellow/10 dark:bg-miro-yellow/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-miro-red/10 dark:bg-miro-red/5 rounded-full blur-2xl" />

      {/* Header with English prompt */}
      <div className="relative mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 bg-miro-blue/10 dark:bg-miro-blue/20 rounded-full">
              <Sparkles className="w-4 h-4 text-miro-blue dark:text-ink-light" />
              <span className="text-xs font-semibold text-miro-blue dark:text-ink-light uppercase tracking-wide">
                Build the sentence
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
        {showHint && currentHint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <div className="p-3 rounded-xl bg-miro-orange/10 dark:bg-miro-orange/20 border-2 border-dashed border-miro-orange/30">
              <div className="flex items-center gap-2 mb-1">
                <HelpCircle className="w-4 h-4 text-miro-orange" />
                <span className="text-xs font-semibold text-miro-orange uppercase">
                  Hint {hintsUsed}/3
                </span>
              </div>
              <p className="font-mono text-miro-blue dark:text-ink-light">{currentHint}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Answer drop zone */}
      <div
        ref={answerRef}
        className={`relative min-h-[100px] p-4 mb-6 rounded-2xl border-3 border-dashed transition-all duration-300 ${
          isChecked
            ? isCorrect
              ? 'border-miro-green bg-miro-green/5 dark:bg-miro-green/10'
              : 'border-miro-red bg-miro-red/5 dark:bg-miro-red/10'
            : answerSlots.length > 0
            ? 'border-miro-blue/40 bg-miro-blue/5 dark:bg-miro-blue/10'
            : 'border-miro-blue/20 dark:border-ink-light/20 bg-gray-50/50 dark:bg-gray-800/50'
        }`}
      >
        {/* Drop zone label */}
        {answerSlots.length === 0 && !isChecked && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-miro-blue/30 dark:text-ink-light/30 font-medium">
              Tap words to build your sentence
            </span>
          </div>
        )}

        {/* Reorderable answer words */}
        <Reorder.Group
          axis="x"
          values={answerSlots}
          onReorder={setAnswerSlots}
          className="flex flex-wrap gap-2"
        >
          <AnimatePresence mode="popLayout">
            {answerSlots.map((word) => {
              const color = getColorForIndex(word.originalIndex);
              return (
                <Reorder.Item
                  key={word.id}
                  value={word}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    x: isShaking ? [0, -8, 8, -8, 8, 0] : 0,
                  }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 25,
                    x: { duration: 0.4 },
                  }}
                  whileHover={!isChecked ? { scale: 1.05, y: -2 } : {}}
                  whileTap={!isChecked ? { scale: 0.95 } : {}}
                  whileDrag={{ scale: 1.1, zIndex: 50, cursor: 'grabbing' }}
                  onClick={() => !isChecked && handleWordClick(word, 'answer')}
                  className={`
                    px-4 py-2 rounded-xl font-bold text-lg cursor-pointer select-none
                    ${color.bg} ${color.text || 'text-miro-blue'} ${color.shadow} ${color.darkShadow}
                    ${isChecked ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}
                    border-2 border-white/20
                  `}
                  style={{ touchAction: 'none' }}
                >
                  {word.word}
                </Reorder.Item>
              );
            })}
          </AnimatePresence>
        </Reorder.Group>

        {/* Result indicator */}
        {isChecked && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`absolute -top-3 -right-3 w-10 h-10 rounded-full flex items-center justify-center ${
              isCorrect ? 'bg-miro-green' : 'bg-miro-red'
            }`}
          >
            {isCorrect ? (
              <Check className="w-6 h-6 text-white" />
            ) : (
              <X className="w-6 h-6 text-white" />
            )}
          </motion.div>
        )}
      </div>

      {/* Correct answer (shown on wrong answer) */}
      <AnimatePresence>
        {isChecked && !isCorrect && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6"
          >
            <div className="p-4 rounded-xl bg-miro-green/5 dark:bg-miro-green/10 border-2 border-miro-green/20">
              <p className="text-xs font-semibold text-miro-green uppercase mb-2">
                Correct answer:
              </p>
              <p className="text-lg font-medium text-miro-blue dark:text-ink-light">
                {sentence.catalan}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Word bank */}
      {!isChecked && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-miro-blue/50 dark:text-ink-light/50 uppercase tracking-wide mb-3">
            Word Bank
          </p>
          <div className="flex flex-wrap gap-2 min-h-[50px] p-3 rounded-xl bg-gray-100/50 dark:bg-gray-800/50">
            <AnimatePresence mode="popLayout">
              {wordBank.map((word) => {
                const color = getColorForIndex(word.originalIndex);
                return (
                  <motion.button
                    key={word.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
                    whileHover={{ scale: 1.08, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleWordClick(word, 'bank')}
                    className={`
                      px-4 py-2 rounded-xl font-bold text-lg select-none
                      ${color.bg} ${color.text || 'text-miro-blue'} ${color.shadow} ${color.darkShadow}
                      border-2 border-white/20
                      hover:brightness-105 active:translate-y-[2px] active:shadow-none
                      transition-all duration-100
                    `}
                  >
                    {word.word}
                  </motion.button>
                );
              })}
            </AnimatePresence>

            {wordBank.length === 0 && (
              <span className="text-miro-blue/30 dark:text-ink-light/30 text-sm py-2">
                All words placed!
              </span>
            )}
          </div>
        </div>
      )}

      {/* Score display (after checking) */}
      <AnimatePresence>
        {isChecked && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 text-center"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-miro-yellow/10 to-miro-orange/10 dark:from-miro-yellow/20 dark:to-miro-orange/20">
              <span className="text-sm font-medium text-miro-blue/60 dark:text-ink-light/60">
                Score:
              </span>
              <span className="text-3xl font-bold text-miro-blue dark:text-ink-light">
                {score}
              </span>
              <span className="text-sm text-miro-blue/40 dark:text-ink-light/40">
                / 100
              </span>
            </div>
            {hintsUsed > 0 && (
              <p className="text-xs text-miro-blue/50 dark:text-ink-light/50 mt-2">
                {hintsUsed} hint{hintsUsed > 1 ? 's' : ''} used (-{hintsUsed * 25} points)
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <div className="flex gap-3">
        {!isChecked ? (
          <>
            <Button
              variant="outline"
              onClick={handleGetHint}
              disabled={hintsUsed >= 3}
              leftIcon={<HelpCircle className="w-4 h-4" />}
              className="flex-1"
            >
              Hint
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Reset
            </Button>
            <Button
              onClick={handleCheckAnswer}
              disabled={!allWordsPlaced}
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
              {isCorrect ? 'Continue' : 'Next'}
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
