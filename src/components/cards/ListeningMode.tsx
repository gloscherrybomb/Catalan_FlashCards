import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, RefreshCw, Check, X } from 'lucide-react';
import type { StudyCard } from '../../types/flashcard';
import { audioService } from '../../services/audioService';
import { useCardStore } from '../../stores/cardStore';

interface ListeningModeProps {
  studyCard: StudyCard;
  onAnswer: (quality: number) => void;
}

export function ListeningMode({ studyCard, onAnswer }: ListeningModeProps) {
  const [hasPlayed, setHasPlayed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());

  const { flashcard } = studyCard;
  const flashcards = useCardStore((state) => state.flashcards);

  // Listening mode ALWAYS plays Catalan audio, user identifies the English meaning
  // This is the core purpose - train your ear to recognize Catalan words
  const audioText = flashcard.back; // Always Catalan
  const correctAnswer = flashcard.front; // Always English

  // Generate options - always English answers since we always play Catalan audio
  const options = useMemo(() => {
    const otherCards = flashcards.filter(c => c.id !== flashcard.id);
    const wrongAnswers: string[] = [];

    // Prioritize same category for harder distractors
    const sameCategory = otherCards.filter(c => c.category === flashcard.category);
    const differentCategory = otherCards.filter(c => c.category !== flashcard.category);
    const shuffled = [...sameCategory.sort(() => Math.random() - 0.5), ...differentCategory.sort(() => Math.random() - 0.5)];

    for (const card of shuffled) {
      // Always use English (front) as the answer options
      const answer = card.front;
      if (answer !== correctAnswer && !wrongAnswers.includes(answer)) {
        wrongAnswers.push(answer);
        if (wrongAnswers.length >= 3) break;
      }
    }

    const allOptions = [
      { text: correctAnswer, isCorrect: true },
      ...wrongAnswers.map(text => ({ text, isCorrect: false })),
    ].sort(() => Math.random() - 0.5);

    return allOptions;
  }, [flashcard, flashcards, correctAnswer]);

  // Reset state when card changes
  useEffect(() => {
    setHasPlayed(false);
    setShowOptions(false);
    setSelectedIndex(null);
    setHasAnswered(false);
    setStartTime(Date.now());
  }, [flashcard.id]);

  const playAudio = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      // Always play Catalan audio for listening comprehension
      await audioService.speakCatalan(audioText);
      setHasPlayed(true);
      // Show options after first play
      setTimeout(() => {
        setShowOptions(true);
        setStartTime(Date.now()); // Reset timer when options appear
      }, 500);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleSelect = (index: number) => {
    if (hasAnswered) return;
    setSelectedIndex(index);
    setHasAnswered(true);

    const isCorrect = options[index].isCorrect;
    const timeSpent = Date.now() - startTime;

    // Calculate quality based on correctness and time
    let quality: number;
    if (!isCorrect) {
      quality = 1;
    } else if (timeSpent < 3000) {
      quality = 5;
    } else if (timeSpent < 6000) {
      quality = 4;
    } else {
      quality = 3;
    }

    setTimeout(() => {
      onAnswer(quality);
    }, 1500);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Audio prompt card */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-playful border-3 border-miro-blue dark:border-ink-light/50 p-8 mb-6 text-center">
        <span className="text-xs font-bold text-miro-blue/50 dark:text-ink-light/50 uppercase tracking-wider mb-4 block">
          Listening Comprehension
        </span>

        <motion.button
          onClick={playAudio}
          disabled={isPlaying}
          className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-miro-blue to-miro-green rounded-full flex items-center justify-center shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={hasPlayed ? 'Replay audio' : 'Play audio'}
        >
          {isPlaying ? (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
            >
              <Volume2 className="w-12 h-12 text-white" />
            </motion.div>
          ) : (
            <Volume2 className="w-12 h-12 text-white" />
          )}
        </motion.button>

        <p className="text-miro-blue dark:text-ink-light font-medium">
          {hasPlayed ? 'Tap to replay' : 'Tap to listen'}
        </p>

        {hasPlayed && (
          <button
            onClick={playAudio}
            className="mt-2 inline-flex items-center gap-1 text-sm text-miro-blue/60 dark:text-ink-light/60 hover:text-miro-blue dark:hover:text-ink-light"
          >
            <RefreshCw size={14} />
            Play again
          </button>
        )}
      </div>

      {/* Answer options */}
      <AnimatePresence>
        {showOptions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <p className="text-center text-miro-blue/70 dark:text-ink-light/70 text-sm font-medium mb-4">
              What did you hear?
            </p>

            {options.map((option, index) => {
              const isSelected = selectedIndex === index;
              const showResult = hasAnswered;
              const isCorrect = option.isCorrect;

              let bgColor = 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700';
              let borderColor = 'border-gray-200 dark:border-gray-700';
              let textColor = 'text-miro-blue dark:text-ink-light';

              if (showResult) {
                if (isCorrect) {
                  bgColor = 'bg-miro-green/10 dark:bg-miro-green/20';
                  borderColor = 'border-miro-green';
                  textColor = 'text-miro-green';
                } else if (isSelected && !isCorrect) {
                  bgColor = 'bg-miro-red/10 dark:bg-miro-red/20';
                  borderColor = 'border-miro-red';
                  textColor = 'text-miro-red';
                } else {
                  bgColor = 'bg-gray-50 dark:bg-gray-800';
                  textColor = 'text-gray-400 dark:text-gray-500';
                }
              }

              return (
                <motion.button
                  key={index}
                  whileHover={!hasAnswered ? { scale: 1.02 } : {}}
                  whileTap={!hasAnswered ? { scale: 0.98 } : {}}
                  onClick={() => handleSelect(index)}
                  disabled={hasAnswered}
                  className={`w-full p-4 rounded-xl border-2 ${borderColor} ${bgColor} ${textColor} text-left font-medium transition-all duration-200 flex items-center justify-between`}
                >
                  <span>{option.text}</span>
                  <AnimatePresence>
                    {showResult && (isSelected || isCorrect) && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        {isCorrect ? (
                          <Check className="w-5 h-5 text-miro-green" />
                        ) : (
                          <X className="w-5 h-5 text-miro-red" />
                        )}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback message */}
      <AnimatePresence>
        {hasAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-4 p-4 rounded-xl text-center font-medium ${
              options[selectedIndex!]?.isCorrect
                ? 'bg-miro-green/20 text-miro-green dark:bg-miro-green/30'
                : 'bg-miro-red/20 text-miro-red dark:bg-miro-red/30'
            }`}
          >
            {options[selectedIndex!]?.isCorrect ? (
              <span>Molt bé! Excellent!</span>
            ) : (
              <span>
                Not quite. The answer is: <strong>{options.find(o => o.isCorrect)?.text}</strong>
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
