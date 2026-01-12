import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Sparkles, RefreshCw } from 'lucide-react';
import { useCardStore } from '../../stores/cardStore';
import { audioService } from '../../services/audioService';
import type { Flashcard } from '../../types/flashcard';

function getSeededRandom(seed: number): () => number {
  return function() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function WordOfTheDay() {
  const flashcards = useCardStore((state) => state.flashcards);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  const wordOfTheDay = useMemo((): Flashcard | null => {
    if (flashcards.length === 0) return null;

    // Use day of year as seed for consistent daily word
    const today = new Date();
    const seed = getDayOfYear(today) + today.getFullYear() * 1000;
    const random = getSeededRandom(seed);

    const index = Math.floor(random() * flashcards.length);
    return flashcards[index];
  }, [flashcards]);

  const handleSpeak = async () => {
    if (!wordOfTheDay || isPlaying) return;
    setIsPlaying(true);
    try {
      await audioService.speakCatalan(wordOfTheDay.back);
    } finally {
      setIsPlaying(false);
    }
  };

  if (!wordOfTheDay) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 p-1"
    >
      <div className="bg-white dark:bg-gray-900 rounded-xl p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">
              Word of the Day
            </span>
          </div>
          <span className="text-xs text-gray-400">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Word display */}
        <div className="text-center py-4">
          <motion.h3
            className="text-2xl font-bold text-gray-800 dark:text-white mb-1"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            {wordOfTheDay.back}
          </motion.h3>

          {/* Pronunciation button */}
          <button
            onClick={handleSpeak}
            disabled={isPlaying}
            className="mt-2 inline-flex items-center gap-1 px-3 py-1 text-sm text-purple-600 dark:text-purple-400
                     hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-full transition-colors"
          >
            <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-pulse' : ''}`} />
            Listen
          </button>
        </div>

        {/* Translation reveal */}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
          {showTranslation ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <p className="text-lg text-gray-600 dark:text-gray-300">{wordOfTheDay.front}</p>
              {wordOfTheDay.notes && (
                <p className="text-xs text-gray-400 mt-1">{wordOfTheDay.notes}</p>
              )}
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500">
                  {wordOfTheDay.category}
                </span>
                {wordOfTheDay.gender && (
                  <span className={`text-xs px-2 py-0.5 rounded-full
                    ${wordOfTheDay.gender === 'masculine'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                      : 'bg-pink-100 dark:bg-pink-900/30 text-pink-600'}`}
                  >
                    {wordOfTheDay.gender === 'masculine' ? 'M' : 'F'}
                  </span>
                )}
              </div>
            </motion.div>
          ) : (
            <button
              onClick={() => setShowTranslation(true)}
              className="w-full py-2 text-sm font-medium text-purple-600 dark:text-purple-400
                       hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors
                       flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reveal Translation
            </button>
          )}
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
      <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full blur-lg" />
    </motion.div>
  );
}
