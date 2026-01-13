import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gamepad2,
  Shuffle,
  Grid3X3,
  HelpCircle,
  ArrowLeft,
  Trophy,
} from 'lucide-react';
import { Card, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { WordScramble } from '../components/games/WordScramble';
import { MemoryMatch } from '../components/games/MemoryMatch';
import { Hangman } from '../components/games/Hangman';
import { useCardStore } from '../stores/cardStore';

type GameType = 'menu' | 'scramble' | 'memory' | 'hangman';

interface GameConfig {
  id: GameType;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  minCards: number;
}

const GAMES: GameConfig[] = [
  {
    id: 'scramble',
    name: 'Word Scramble',
    description: 'Unscramble letters to form Catalan words',
    icon: <Shuffle className="w-8 h-8" />,
    color: 'from-miro-red to-miro-orange',
    minCards: 5,
  },
  {
    id: 'memory',
    name: 'Memory Match',
    description: 'Match Catalan words with English translations',
    icon: <Grid3X3 className="w-8 h-8" />,
    color: 'from-miro-green to-miro-blue',
    minCards: 8,
  },
  {
    id: 'hangman',
    name: 'Hangman',
    description: 'Guess the Catalan word letter by letter',
    icon: <HelpCircle className="w-8 h-8" />,
    color: 'from-miro-blue to-purple-500',
    minCards: 5,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function GamesPage() {
  const [activeGame, setActiveGame] = useState<GameType>('menu');
  const flashcards = useCardStore((state) => state.flashcards);

  const handleGameComplete = (_finalScore: number) => {
    // Score is tracked internally by each game component
  };

  const handleBackToMenu = () => {
    setActiveGame('menu');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <AnimatePresence mode="wait">
        {activeGame === 'menu' ? (
          <motion.div
            key="menu"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Header */}
            <motion.div variants={itemVariants} className="text-center mb-10">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-miro-yellow to-miro-orange rounded-2xl flex items-center justify-center">
                <Gamepad2 className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-display font-bold text-miro-blue dark:text-ink-light mb-2">
                Mini Games
              </h1>
              <p className="text-lg text-miro-blue/60 dark:text-ink-light/60">
                Learn Catalan while having fun!
              </p>
            </motion.div>

            {/* Games Grid */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {GAMES.map((game, index) => {
                const hasEnoughCards = flashcards.length >= game.minCards;

                return (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      variant="playful"
                      hover={hasEnoughCards}
                      className={`cursor-pointer h-full ${
                        !hasEnoughCards ? 'opacity-50' : ''
                      }`}
                      onClick={() => hasEnoughCards && setActiveGame(game.id)}
                    >
                      <div className="text-center p-4">
                        <motion.div
                          className={`w-20 h-20 mx-auto mb-4 bg-gradient-to-br ${game.color} rounded-2xl flex items-center justify-center text-white`}
                          whileHover={hasEnoughCards ? { scale: 1.05, rotate: 5 } : {}}
                        >
                          {game.icon}
                        </motion.div>

                        <CardTitle className="text-xl mb-2">{game.name}</CardTitle>
                        <p className="text-sm text-miro-blue/60 dark:text-ink-light/60">
                          {game.description}
                        </p>

                        {!hasEnoughCards && (
                          <p className="text-xs text-miro-red mt-3">
                            Need at least {game.minCards} cards to play
                          </p>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* No cards message */}
            {flashcards.length === 0 && (
              <motion.div variants={itemVariants} className="mt-8 text-center">
                <Card variant="bordered" className="py-8">
                  <Gamepad2 className="w-12 h-12 mx-auto text-miro-blue/20 mb-4" />
                  <p className="text-miro-blue/60 dark:text-ink-light/60">
                    Import some flashcards to unlock mini games!
                  </p>
                </Card>
              </motion.div>
            )}

            {/* High Scores Section */}
            <motion.div variants={itemVariants} className="mt-10">
              <Card variant="bordered">
                <div className="flex items-center gap-3 mb-4">
                  <Trophy className="w-6 h-6 text-miro-yellow" />
                  <CardTitle className="mb-0">How Games Help Learning</CardTitle>
                </div>
                <ul className="space-y-2 text-sm text-miro-blue/70 dark:text-ink-light/70">
                  <li>
                    • <strong>Word Scramble</strong> improves spelling and letter
                    recognition
                  </li>
                  <li>
                    • <strong>Memory Match</strong> strengthens word-meaning
                    associations
                  </li>
                  <li>
                    • <strong>Hangman</strong> helps with vocabulary recall and
                    common letter patterns
                  </li>
                </ul>
              </Card>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key={activeGame}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {/* Back button */}
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={handleBackToMenu}
              className="mb-6"
            >
              Back to Games
            </Button>

            {/* Game content */}
            {activeGame === 'scramble' && (
              <WordScramble
                flashcards={flashcards}
                onComplete={handleGameComplete}
                onExit={handleBackToMenu}
              />
            )}
            {activeGame === 'memory' && (
              <MemoryMatch
                flashcards={flashcards}
                onComplete={handleGameComplete}
                onExit={handleBackToMenu}
              />
            )}
            {activeGame === 'hangman' && (
              <Hangman
                flashcards={flashcards}
                onComplete={handleGameComplete}
                onExit={handleBackToMenu}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
