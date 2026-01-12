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
      <div className="bg-white rounded-3xl shadow-playful p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <CategoryIcon category={flashcard.category} word={questionDisplay} size="md" />
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs font-medium text-gray-400 uppercase">{questionLabel}</span>
            {flashcard.gender && (
              <Badge text={flashcard.gender === 'masculine' ? 'Masc' : 'Fem'} variant={flashcard.gender} />
            )}
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 text-center my-8">
          {questionDisplay}
        </h2>

        <p className="text-center text-gray-500 text-sm">
          Choose the correct {answerLabel.toLowerCase()} translation
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {options.map((option, index) => {
          const isSelected = selectedIndex === index;
          const showResult = hasAnswered;
          const isCorrect = option.isCorrect;

          let bgColor = 'bg-white hover:bg-gray-50';
          let borderColor = 'border-gray-200';
          let textColor = 'text-gray-800';

          if (showResult) {
            if (isCorrect) {
              bgColor = 'bg-green-50';
              borderColor = 'border-green-400';
              textColor = 'text-green-700';
            } else if (isSelected && !isCorrect) {
              bgColor = 'bg-red-50';
              borderColor = 'border-red-400';
              textColor = 'text-red-700';
            } else {
              bgColor = 'bg-gray-50';
              textColor = 'text-gray-400';
            }
          } else if (isSelected) {
            borderColor = 'border-primary';
            bgColor = 'bg-primary-50';
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
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 text-red-500" />
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
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
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
