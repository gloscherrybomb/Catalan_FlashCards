import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Grid3X3, Trophy, Clock, RotateCcw } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import type { Flashcard } from '../../types/flashcard';
import { stripBracketedContent } from '../../utils/textUtils';
import confetti from 'canvas-confetti';

interface MemoryMatchProps {
  flashcards: Flashcard[];
  onComplete: (score: number) => void;
  onExit: () => void;
}

interface MemoryCard {
  id: string;
  content: string;
  type: 'catalan' | 'english';
  pairId: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export function MemoryMatch({ flashcards, onComplete, onExit }: MemoryMatchProps) {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  // Select cards and create pairs
  const gameCards = useMemo(() => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 6); // 6 pairs = 12 cards

    const memoryCards: MemoryCard[] = [];

    selected.forEach((card) => {
      // Catalan card
      memoryCards.push({
        id: `${card.id}-catalan`,
        content: stripBracketedContent(card.back),
        type: 'catalan',
        pairId: card.id,
        isFlipped: false,
        isMatched: false,
      });
      // English card
      memoryCards.push({
        id: `${card.id}-english`,
        content: stripBracketedContent(card.front),
        type: 'english',
        pairId: card.id,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle the cards
    return memoryCards.sort(() => Math.random() - 0.5);
  }, [flashcards]);

  useEffect(() => {
    setCards(gameCards);
    setStartTime(Date.now());
  }, [gameCards]);

  // Timer
  useEffect(() => {
    if (startTime && !gameComplete) {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime, gameComplete]);

  const handleCardClick = (cardId: string) => {
    if (flippedCards.length >= 2) return;
    if (flippedCards.includes(cardId)) return;
    if (matchedPairs.has(cards.find((c) => c.id === cardId)?.pairId || '')) return;

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1);

      const [first, second] = newFlipped.map((id) => cards.find((c) => c.id === id)!);

      if (first.pairId === second.pairId) {
        // Match found!
        const newMatched = new Set(matchedPairs).add(first.pairId);
        setMatchedPairs(newMatched);
        setFlippedCards([]);

        confetti({ particleCount: 20, spread: 40, origin: { y: 0.7 } });

        // Check if game is complete
        if (newMatched.size === gameCards.length / 2) {
          setGameComplete(true);
          const score = calculateScore();
          onComplete(score);
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      } else {
        // No match - flip back after delay
        setTimeout(() => {
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const calculateScore = () => {
    const pairCount = gameCards.length / 2;
    const perfectMoves = pairCount;
    const moveScore = Math.max(0, 100 - (moves - perfectMoves) * 5);
    const timeBonus = Math.max(0, 50 - Math.floor(elapsedTime / 10));
    return moveScore + timeBonus;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetGame = () => {
    setCards(gameCards.sort(() => Math.random() - 0.5));
    setFlippedCards([]);
    setMatchedPairs(new Set());
    setMoves(0);
    setStartTime(Date.now());
    setElapsedTime(0);
    setGameComplete(false);
  };

  if (gameComplete) {
    const score = calculateScore();

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
          All Matched!
        </h2>

        <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto my-6">
          <div className="bg-miro-blue/5 dark:bg-ink-light/5 rounded-xl p-4">
            <p className="text-2xl font-bold text-miro-blue dark:text-ink-light">
              {moves}
            </p>
            <p className="text-xs text-miro-blue/60 dark:text-ink-light/60">moves</p>
          </div>
          <div className="bg-miro-blue/5 dark:bg-ink-light/5 rounded-xl p-4">
            <p className="text-2xl font-bold text-miro-blue dark:text-ink-light">
              {formatTime(elapsedTime)}
            </p>
            <p className="text-xs text-miro-blue/60 dark:text-ink-light/60">time</p>
          </div>
        </div>

        <p className="text-lg text-miro-blue/60 dark:text-ink-light/60 mb-6">
          Final Score: <span className="font-bold text-miro-blue dark:text-ink-light">{score}</span>
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

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-miro-green to-miro-blue rounded-xl flex items-center justify-center">
            <Grid3X3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-miro-blue dark:text-ink-light">
              Memory Match
            </h2>
            <p className="text-sm text-miro-blue/60 dark:text-ink-light/60">
              Match Catalan with English
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-xl font-bold text-miro-blue dark:text-ink-light">
              {moves}
            </p>
            <p className="text-xs text-miro-blue/60 dark:text-ink-light/60">moves</p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1 text-miro-blue dark:text-ink-light">
              <Clock className="w-4 h-4" />
              <span className="font-bold">{formatTime(elapsedTime)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-miro-blue/60 dark:text-ink-light/60">
            Pairs found
          </span>
          <span className="font-medium text-miro-blue dark:text-ink-light">
            {matchedPairs.size} / {gameCards.length / 2}
          </span>
        </div>
        <div className="h-2 bg-miro-blue/10 dark:bg-ink-light/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-miro-green to-miro-blue rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(matchedPairs.size / (gameCards.length / 2)) * 100}%` }}
          />
        </div>
      </div>

      {/* Game grid */}
      <div className="grid grid-cols-4 gap-3">
        {cards.map((card) => {
          const isFlipped = flippedCards.includes(card.id) || matchedPairs.has(card.pairId);
          const isMatched = matchedPairs.has(card.pairId);

          return (
            <motion.button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={isMatched || flippedCards.length >= 2}
              className={`aspect-square rounded-xl transition-all ${
                isMatched
                  ? 'bg-miro-green/20 border-2 border-miro-green'
                  : isFlipped
                  ? card.type === 'catalan'
                    ? 'bg-miro-red/10 border-2 border-miro-red'
                    : 'bg-miro-blue/10 border-2 border-miro-blue'
                  : 'bg-miro-yellow hover:bg-miro-orange cursor-pointer shadow-md'
              }`}
              whileHover={!isFlipped && !isMatched ? { scale: 1.02 } : {}}
              whileTap={!isFlipped && !isMatched ? { scale: 0.98 } : {}}
            >
              {isFlipped ? (
                <motion.div
                  initial={{ rotateY: 90 }}
                  animate={{ rotateY: 0 }}
                  className="p-2 h-full flex items-center justify-center"
                >
                  <span
                    className={`text-sm font-medium text-center ${
                      isMatched
                        ? 'text-miro-green'
                        : card.type === 'catalan'
                        ? 'text-miro-red'
                        : 'text-miro-blue dark:text-ink-light'
                    }`}
                  >
                    {card.content}
                  </span>
                </motion.div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <span className="text-2xl">?</span>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Reset button */}
      <div className="mt-6 text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={resetGame}
          leftIcon={<RotateCcw className="w-4 h-4" />}
        >
          Restart Game
        </Button>
      </div>
    </div>
  );
}
