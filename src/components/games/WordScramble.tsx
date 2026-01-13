import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, Check, X, RotateCcw, Trophy, Lightbulb } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import type { Flashcard } from '../../types/flashcard';
import confetti from 'canvas-confetti';

interface WordScrambleProps {
  flashcards: Flashcard[];
  onComplete: (score: number) => void;
  onExit: () => void;
}

function scrambleWord(word: string): string[] {
  const letters = word.toUpperCase().split('');
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  // Make sure it's actually scrambled
  if (letters.join('') === word.toUpperCase()) {
    return scrambleWord(word);
  }
  return letters;
}

export function WordScramble({ flashcards, onComplete, onExit }: WordScrambleProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrambledLetters, setScrambledLetters] = useState<string[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState<'correct' | 'wrong' | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  // Select random cards for the game
  const gameCards = useMemo(() => {
    const shuffled = [...flashcards]
      .filter((c) => c.back.length >= 3 && c.back.length <= 12)
      .sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 10);
  }, [flashcards]);

  const currentCard = gameCards[currentIndex];
  const correctWord = currentCard?.back.toUpperCase() || '';

  useEffect(() => {
    if (currentCard) {
      setScrambledLetters(scrambleWord(currentCard.back));
      setSelectedLetters([]);
      setShowResult(null);
    }
  }, [currentCard]);

  const handleLetterClick = (index: number) => {
    if (selectedLetters.includes(index) || showResult) return;

    const newSelected = [...selectedLetters, index];
    setSelectedLetters(newSelected);

    // Check if word is complete
    if (newSelected.length === scrambledLetters.length) {
      const userWord = newSelected.map((i) => scrambledLetters[i]).join('');
      const isCorrect = userWord === correctWord;

      setShowResult(isCorrect ? 'correct' : 'wrong');

      if (isCorrect) {
        const points = Math.max(10 - hintsUsed * 3, 1);
        setScore((prev) => prev + points);
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
      }

      // Move to next after delay
      setTimeout(() => {
        if (currentIndex < gameCards.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setHintsUsed(0);
        } else {
          setGameComplete(true);
          onComplete(score + (isCorrect ? Math.max(10 - hintsUsed * 3, 1) : 0));
        }
      }, 1500);
    }
  };

  const handleReset = () => {
    setSelectedLetters([]);
    setShowResult(null);
  };

  const handleHint = () => {
    if (hintsUsed >= 3 || showResult) return;

    // Find next correct letter position
    const currentGuess = selectedLetters.map((i) => scrambledLetters[i]).join('');
    const nextCorrectLetter = correctWord[currentGuess.length];

    // Find this letter in remaining scrambled letters
    for (let i = 0; i < scrambledLetters.length; i++) {
      if (!selectedLetters.includes(i) && scrambledLetters[i] === nextCorrectLetter) {
        handleLetterClick(i);
        setHintsUsed((prev) => prev + 1);
        break;
      }
    }
  };

  if (gameComplete) {
    const totalPossible = gameCards.length * 10;
    const percentage = Math.round((score / totalPossible) * 100);

    return (
      <Card variant="playful" className="max-w-lg mx-auto text-center py-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 10 }}
        >
          <Trophy className="w-20 h-20 mx-auto text-miro-yellow mb-4" />
        </motion.div>
        <h2 className="text-3xl font-display font-bold text-miro-blue dark:text-ink-light mb-2">
          Game Complete!
        </h2>
        <p className="text-lg text-miro-blue/60 dark:text-ink-light/60 mb-6">
          You scored {score} points ({percentage}%)
        </p>

        <div className="flex justify-center gap-4">
          <Button variant="secondary" onClick={onExit}>
            Back to Games
          </Button>
          <Button
            onClick={() => {
              setCurrentIndex(0);
              setScore(0);
              setGameComplete(false);
              setHintsUsed(0);
            }}
          >
            Play Again
          </Button>
        </div>
      </Card>
    );
  }

  if (!currentCard) return null;

  const userGuess = selectedLetters.map((i) => scrambledLetters[i]).join('');

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-miro-red to-miro-orange rounded-xl flex items-center justify-center">
            <Shuffle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-miro-blue dark:text-ink-light">
              Word Scramble
            </h2>
            <p className="text-sm text-miro-blue/60 dark:text-ink-light/60">
              {currentIndex + 1} / {gameCards.length}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-miro-blue dark:text-ink-light">
            {score}
          </p>
          <p className="text-xs text-miro-blue/60 dark:text-ink-light/60">points</p>
        </div>
      </div>

      {/* English hint */}
      <Card variant="bordered" className="mb-6 text-center">
        <p className="text-sm text-miro-blue/60 dark:text-ink-light/60 mb-1">
          English meaning:
        </p>
        <p className="text-xl font-semibold text-miro-blue dark:text-ink-light">
          {currentCard.front}
        </p>
      </Card>

      {/* Current guess */}
      <div className="mb-6">
        <div className="flex justify-center gap-2 min-h-[60px]">
          {correctWord.split('').map((_, index) => (
            <motion.div
              key={index}
              className={`w-12 h-14 rounded-xl flex items-center justify-center text-2xl font-bold border-2 ${
                showResult === 'correct'
                  ? 'bg-miro-green/20 border-miro-green text-miro-green'
                  : showResult === 'wrong'
                  ? 'bg-miro-red/20 border-miro-red text-miro-red'
                  : index < userGuess.length
                  ? 'bg-miro-blue/10 border-miro-blue text-miro-blue dark:text-ink-light'
                  : 'bg-miro-blue/5 border-miro-blue/20 dark:border-ink-light/20'
              }`}
              initial={index < userGuess.length ? { scale: 0 } : {}}
              animate={{ scale: 1 }}
            >
              {userGuess[index] || ''}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Result indicator */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center mb-4"
          >
            {showResult === 'correct' ? (
              <div className="flex items-center justify-center gap-2 text-miro-green">
                <Check className="w-6 h-6" />
                <span className="font-semibold">Correct!</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-miro-red">
                <X className="w-6 h-6" />
                <span className="font-semibold">
                  The word was: {currentCard.back}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scrambled letters */}
      <div className="flex justify-center flex-wrap gap-2 mb-6">
        {scrambledLetters.map((letter, index) => (
          <motion.button
            key={index}
            onClick={() => handleLetterClick(index)}
            disabled={selectedLetters.includes(index) || showResult !== null}
            className={`w-14 h-14 rounded-xl text-2xl font-bold transition-all ${
              selectedLetters.includes(index)
                ? 'bg-miro-blue/10 text-miro-blue/30 dark:text-ink-light/30 cursor-not-allowed'
                : 'bg-miro-yellow text-miro-blue hover:bg-miro-orange hover:text-white cursor-pointer shadow-md'
            }`}
            whileHover={!selectedLetters.includes(index) ? { scale: 1.05 } : {}}
            whileTap={!selectedLetters.includes(index) ? { scale: 0.95 } : {}}
          >
            {letter}
          </motion.button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          disabled={selectedLetters.length === 0 || showResult !== null}
          leftIcon={<RotateCcw className="w-4 h-4" />}
        >
          Reset
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleHint}
          disabled={hintsUsed >= 3 || showResult !== null}
          leftIcon={<Lightbulb className="w-4 h-4" />}
        >
          Hint ({3 - hintsUsed} left)
        </Button>
      </div>
    </div>
  );
}
