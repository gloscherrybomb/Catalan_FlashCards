import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import type { StudyCard } from '../../types/flashcard';
import { CategoryIcon, Badge } from './CategoryIcon';
import { useCardStore } from '../../stores/cardStore';

interface MultipleChoiceProps {
  studyCard: StudyCard;
  onAnswer: (quality: number) => void;
}

export function MultipleChoice({ studyCard, onAnswer }: MultipleChoiceProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [startTime] = useState(Date.now());

  const { flashcard, direction } = studyCard;
  const flashcards = useCardStore((state) => state.flashcards);

  // Generate options
  const options = useMemo(() => {
    const correctAnswer = direction === 'english-to-catalan' ? flashcard.back : flashcard.front;

    // Get wrong answers from other cards
    const otherCards = flashcards.filter(c => c.id !== flashcard.id);
    const wrongAnswers: string[] = [];

    // Prioritize cards from same category
    const sameCategory = otherCards.filter(c => c.category === flashcard.category);
    const differentCategory = otherCards.filter(c => c.category !== flashcard.category);

    const shuffled = [...sameCategory.sort(() => Math.random() - 0.5), ...differentCategory.sort(() => Math.random() - 0.5)];

    for (const card of shuffled) {
      const answer = direction === 'english-to-catalan' ? card.back : card.front;
      if (answer !== correctAnswer && !wrongAnswers.includes(answer)) {
        wrongAnswers.push(answer);
        if (wrongAnswers.length >= 3) break;
      }
    }

    // Create options array with correct answer
    const allOptions = [
      { text: correctAnswer, isCorrect: true },
      ...wrongAnswers.map(text => ({ text, isCorrect: false })),
    ];

    // Shuffle options
    return allOptions.sort(() => Math.random() - 0.5);
  }, [flashcard, direction, flashcards]);

  const questionDisplay = direction === 'english-to-catalan' ? flashcard.front : flashcard.back;
  const questionLabel = direction === 'english-to-catalan' ? 'English' : 'Català';
  const answerLabel = direction === 'english-to-catalan' ? 'Català' : 'English';

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
    } else if (timeSpent < 2000) {
      quality = 5;
    } else if (timeSpent < 4000) {
      quality = 4;
    } else {
      quality = 3;
    }

    // Delay before moving to next card
    setTimeout(() => {
      onAnswer(quality);
      setSelectedIndex(null);
      setHasAnswered(false);
    }, 1500);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Question card */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-playful p-6 mb-6 border-3 border-miro-blue dark:border-ink-light/50">
        <div className="flex items-start justify-between mb-4">
          <CategoryIcon category={flashcard.category} word={questionDisplay} size="md" />
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs font-medium text-miro-blue/50 dark:text-ink-light/50 uppercase">{questionLabel}</span>
            {flashcard.gender && (
              <Badge text={flashcard.gender === 'masculine' ? 'Masc' : 'Fem'} variant={flashcard.gender} />
            )}
          </div>
        </div>

        <h2 className="text-2xl font-bold text-miro-blue dark:text-ink-light text-center my-8">
          {questionDisplay}
        </h2>

        <p className="text-center text-miro-blue/60 dark:text-ink-light/60 text-sm">
          Choose the correct {answerLabel.toLowerCase()} translation
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
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
          } else if (isSelected) {
            borderColor = 'border-miro-blue dark:border-ink-light';
            bgColor = 'bg-miro-blue/5 dark:bg-ink-light/10';
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
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
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
      </div>

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
