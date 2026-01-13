import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Trophy, Heart, RotateCcw, Volume2 } from 'lucide-react';
import { Card, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import type { Flashcard } from '../../types/flashcard';
import { audioService } from '../../services/audioService';
import confetti from 'canvas-confetti';

interface HangmanProps {
  flashcards: Flashcard[];
  onComplete: (score: number) => void;
  onExit: () => void;
}

const CATALAN_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÀÈÉÍÏÒÓÚÜÇ'.split('');
const MAX_WRONG_GUESSES = 6;

export function Hangman({ flashcards, onComplete, onExit }: HangmanProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [score, setScore] = useState(0);
  const [wordsWon, setWordsWon] = useState(0);
  const [showResult, setShowResult] = useState<'won' | 'lost' | null>(null);
  const [gameComplete, setGameComplete] = useState(false);

  // Select random cards for the game
  const gameCards = useMemo(() => {
    const shuffled = [...flashcards]
      .filter((c) => c.back.length >= 3 && c.back.length <= 15)
      .sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5);
  }, [flashcards]);

  const currentCard = gameCards[currentIndex];
  const word = currentCard?.back.toUpperCase() || '';
  const wordLetters = new Set(word.replace(/\s/g, '').split(''));

  const displayWord = word
    .split('')
    .map((letter) => {
      if (letter === ' ') return ' ';
      return guessedLetters.has(letter) ? letter : '_';
    })
    .join('');

  const isWon = [...wordLetters].every((letter) => guessedLetters.has(letter));
  const isLost = wrongGuesses >= MAX_WRONG_GUESSES;

  useEffect(() => {
    if (isWon && !showResult) {
      setShowResult('won');
      const points = Math.max(20 - wrongGuesses * 3, 5);
      setScore((prev) => prev + points);
      setWordsWon((prev) => prev + 1);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } else if (isLost && !showResult) {
      setShowResult('lost');
    }
  }, [isWon, isLost, showResult, wrongGuesses]);

  const handleLetterGuess = (letter: string) => {
    if (guessedLetters.has(letter) || showResult) return;

    const newGuessed = new Set(guessedLetters).add(letter);
    setGuessedLetters(newGuessed);

    if (!wordLetters.has(letter)) {
      setWrongGuesses((prev) => prev + 1);
    }
  };

  const handleNextWord = () => {
    if (currentIndex < gameCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setGuessedLetters(new Set());
      setWrongGuesses(0);
      setShowResult(null);
    } else {
      setGameComplete(true);
      onComplete(score);
    }
  };

  const handlePlayAudio = async () => {
    if (currentCard) {
      await audioService.speakCatalan(currentCard.back);
    }
  };

  const resetGame = () => {
    setCurrentIndex(0);
    setGuessedLetters(new Set());
    setWrongGuesses(0);
    setScore(0);
    setWordsWon(0);
    setShowResult(null);
    setGameComplete(false);
  };

  if (gameComplete) {
    const percentage = Math.round((wordsWon / gameCards.length) * 100);

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
          Game Over!
        </h2>

        <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto my-6">
          <div className="bg-miro-blue/5 dark:bg-ink-light/5 rounded-xl p-4">
            <p className="text-2xl font-bold text-miro-blue dark:text-ink-light">
              {wordsWon}/{gameCards.length}
            </p>
            <p className="text-xs text-miro-blue/60 dark:text-ink-light/60">words saved</p>
          </div>
          <div className="bg-miro-blue/5 dark:bg-ink-light/5 rounded-xl p-4">
            <p className="text-2xl font-bold text-miro-blue dark:text-ink-light">
              {score}
            </p>
            <p className="text-xs text-miro-blue/60 dark:text-ink-light/60">points</p>
          </div>
        </div>

        <p className="text-lg text-miro-blue/60 dark:text-ink-light/60 mb-6">
          {percentage >= 80
            ? 'Excellent work!'
            : percentage >= 50
            ? 'Good effort!'
            : 'Keep practicing!'}
        </p>

        <div className="flex justify-center gap-4">
          <Button variant="secondary" onClick={onExit}>
            Back to Games
          </Button>
          <Button onClick={resetGame}>Play Again</Button>
        </div>
      </Card>
    );
  }

  if (!currentCard) return null;

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-miro-blue to-purple-500 rounded-xl flex items-center justify-center">
            <HelpCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-miro-blue dark:text-ink-light">
              Hangman
            </h2>
            <p className="text-sm text-miro-blue/60 dark:text-ink-light/60">
              Word {currentIndex + 1} of {gameCards.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-xl font-bold text-miro-blue dark:text-ink-light">
              {score}
            </p>
            <p className="text-xs text-miro-blue/60 dark:text-ink-light/60">points</p>
          </div>
        </div>
      </div>

      {/* Lives */}
      <div className="flex justify-center gap-1 mb-4">
        {Array.from({ length: MAX_WRONG_GUESSES }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 1 }}
            animate={i < wrongGuesses ? { scale: 0 } : { scale: 1 }}
          >
            <Heart
              className={`w-6 h-6 ${
                i < wrongGuesses
                  ? 'text-miro-blue/20 dark:text-ink-light/20'
                  : 'text-miro-red fill-miro-red'
              }`}
            />
          </motion.div>
        ))}
      </div>

      {/* English hint */}
      <Card variant="bordered" className="mb-6 text-center">
        <p className="text-sm text-miro-blue/60 dark:text-ink-light/60 mb-1">
          English meaning:
        </p>
        <p className="text-xl font-semibold text-miro-blue dark:text-ink-light">
          {currentCard.front}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePlayAudio}
          className="mt-2"
          leftIcon={<Volume2 className="w-4 h-4" />}
        >
          Hear pronunciation
        </Button>
      </Card>

      {/* Word display */}
      <div className="flex justify-center gap-2 mb-8 flex-wrap">
        {displayWord.split('').map((char, i) => (
          <motion.span
            key={i}
            className={`text-3xl font-mono font-bold ${
              char === ' '
                ? 'w-4'
                : char === '_'
                ? 'border-b-4 border-miro-blue dark:border-ink-light w-8 text-transparent'
                : 'text-miro-blue dark:text-ink-light'
            }`}
            initial={char !== '_' && char !== ' ' ? { scale: 0 } : {}}
            animate={{ scale: 1 }}
          >
            {char === '_' ? 'X' : char}
          </motion.span>
        ))}
      </div>

      {/* Result message */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`text-center mb-4 p-4 rounded-xl ${
              showResult === 'won'
                ? 'bg-miro-green/20 text-miro-green'
                : 'bg-miro-red/20 text-miro-red'
            }`}
          >
            {showResult === 'won' ? (
              <p className="font-semibold">Correct! The word was: {currentCard.back}</p>
            ) : (
              <p className="font-semibold">
                The word was: <span className="font-bold">{currentCard.back}</span>
              </p>
            )}
            <Button
              className="mt-3"
              onClick={handleNextWord}
            >
              {currentIndex < gameCards.length - 1 ? 'Next Word' : 'See Results'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard */}
      {!showResult && (
        <div className="flex flex-wrap justify-center gap-2">
          {CATALAN_ALPHABET.map((letter) => {
            const isGuessed = guessedLetters.has(letter);
            const isCorrect = wordLetters.has(letter);

            return (
              <motion.button
                key={letter}
                onClick={() => handleLetterGuess(letter)}
                disabled={isGuessed}
                className={`w-10 h-10 rounded-lg text-lg font-bold transition-all ${
                  isGuessed
                    ? isCorrect
                      ? 'bg-miro-green/20 text-miro-green'
                      : 'bg-miro-red/20 text-miro-red/50'
                    : 'bg-miro-blue/10 dark:bg-ink-light/10 text-miro-blue dark:text-ink-light hover:bg-miro-yellow hover:text-miro-blue'
                }`}
                whileHover={!isGuessed ? { scale: 1.05 } : {}}
                whileTap={!isGuessed ? { scale: 0.95 } : {}}
              >
                {letter}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Reset button */}
      <div className="mt-6 text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={resetGame}
          leftIcon={<RotateCcw className="w-4 h-4" />}
        >
          Start Over
        </Button>
      </div>
    </div>
  );
}
