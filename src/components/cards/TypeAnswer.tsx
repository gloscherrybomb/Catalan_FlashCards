import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Keyboard } from 'lucide-react';
import type { StudyCard } from '../../types/flashcard';
import { validateTyping } from '../../services/typingValidator';
import { CategoryIcon, Badge } from './CategoryIcon';
import { Button } from '../ui/Button';
import { stripBracketedContent } from '../../utils/textUtils';

interface TypeAnswerProps {
  studyCard: StudyCard;
  onAnswer: (quality: number, userAnswer: string) => void;
}

// Catalan special character keyboard
const CATALAN_KEYBOARD = [
  ['à', 'é', 'è', 'í', 'ï'],
  ['ó', 'ò', 'ú', 'ü', 'ç'],
  ['l·l'],
];

export function TypeAnswer({ studyCard, onAnswer }: TypeAnswerProps) {
  const [userInput, setUserInput] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof validateTyping> | null>(null);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [startTime] = useState(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);

  const { flashcard, direction } = studyCard;

  const question = stripBracketedContent(direction === 'english-to-catalan' ? flashcard.front : flashcard.back);
  const correctAnswer = stripBracketedContent(direction === 'english-to-catalan' ? flashcard.back : flashcard.front);
  const questionLabel = direction === 'english-to-catalan' ? 'English' : 'Català';
  const answerLabel = direction === 'english-to-catalan' ? 'Català' : 'English';

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (hasSubmitted || !userInput.trim()) return;

    const validationResult = validateTyping(userInput, correctAnswer);
    setResult(validationResult);
    setHasSubmitted(true);

    // Calculate quality
    const timeSpent = Date.now() - startTime;
    let quality: number;

    if (validationResult.isCorrect) {
      if (timeSpent < 3000) quality = 5;
      else if (timeSpent < 6000) quality = 4;
      else quality = 3;
    } else if (validationResult.isAcceptable) {
      quality = 3; // Acceptable but not perfect
    } else {
      quality = 1; // Wrong
    }

    // Delay before next card
    setTimeout(() => {
      onAnswer(quality, userInput);
      setUserInput('');
      setHasSubmitted(false);
      setResult(null);
    }, 2500);
  };

  const insertChar = (char: string) => {
    const input = inputRef.current;
    if (!input) return;

    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;

    const newValue = userInput.slice(0, start) + char + userInput.slice(end);
    setUserInput(newValue);

    // Move cursor after inserted character
    setTimeout(() => {
      input.setSelectionRange(start + char.length, start + char.length);
      input.focus();
    }, 0);
  };

  // Render answer with corrections highlighted
  const renderCorrectedAnswer = () => {
    if (!result || result.isCorrect) return null;

    return (
      <div className="mt-4 space-y-2">
        <p className="text-sm text-gray-600">Correct answer:</p>
        <div className="p-3 bg-white rounded-lg font-mono text-lg">
          {correctAnswer.split('').map((char, i) => {
            const correction = result.corrections.find(c => c.position === i);
            if (correction) {
              return (
                <span
                  key={i}
                  className={`px-0.5 rounded ${
                    correction.type === 'accent'
                      ? 'bg-yellow-200 text-yellow-800'
                      : 'bg-red-200 text-red-800'
                  }`}
                  title={`Expected "${correction.expected}", got "${correction.received}"`}
                >
                  {char}
                </span>
              );
            }
            return <span key={i}>{char}</span>;
          })}
        </div>

        {result.corrections.some(c => c.type === 'accent') && (
          <p className="text-sm text-yellow-700">
            Pay attention to accents! They change pronunciation and meaning.
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Question card */}
      <div className="bg-white rounded-3xl shadow-playful p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <CategoryIcon category={flashcard.category} word={question} size="md" />
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs font-medium text-gray-400 uppercase">{questionLabel}</span>
            {flashcard.gender && (
              <Badge text={flashcard.gender === 'masculine' ? 'Masc' : 'Fem'} variant={flashcard.gender} />
            )}
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 text-center my-6">
          {question}
        </h2>

        {flashcard.notes && (
          <p className="text-center text-gray-500 text-sm italic">
            {flashcard.notes}
          </p>
        )}
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={hasSubmitted}
            placeholder={`Type the ${answerLabel.toLowerCase()}...`}
            className={`w-full px-4 py-4 text-lg rounded-xl border-2 transition-colors outline-none ${
              hasSubmitted
                ? result?.isCorrect || result?.isAcceptable
                  ? 'border-green-400 bg-green-50'
                  : 'border-red-400 bg-red-50'
                : 'border-gray-200 focus:border-primary'
            }`}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
          />

          {/* Toggle Catalan keyboard */}
          <button
            type="button"
            onClick={() => setShowKeyboard(!showKeyboard)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600"
          >
            <Keyboard size={20} />
          </button>
        </div>

        {/* Catalan special characters keyboard */}
        <AnimatePresence>
          {showKeyboard && !hasSubmitted && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gray-100 rounded-xl p-3 space-y-2"
            >
              {CATALAN_KEYBOARD.map((row, rowIndex) => (
                <div key={rowIndex} className="flex justify-center gap-2">
                  {row.map((char) => (
                    <button
                      key={char}
                      type="button"
                      onClick={() => insertChar(char)}
                      className="w-10 h-10 bg-white rounded-lg shadow-sm text-lg font-medium hover:bg-gray-50 active:bg-gray-100"
                    >
                      {char}
                    </button>
                  ))}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {!hasSubmitted && (
          <Button
            type="submit"
            fullWidth
            size="lg"
            disabled={!userInput.trim()}
          >
            Check Answer
          </Button>
        )}
      </form>

      {/* Result feedback */}
      <AnimatePresence>
        {hasSubmitted && result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-4 p-4 rounded-xl ${
              result.isCorrect
                ? 'bg-green-100'
                : result.isAcceptable
                ? 'bg-yellow-100'
                : 'bg-red-100'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {result.isCorrect ? (
                <>
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="font-bold text-green-700">Perfect!</span>
                </>
              ) : result.isAcceptable ? (
                <>
                  <Check className="w-5 h-5 text-yellow-600" />
                  <span className="font-bold text-yellow-700">
                    {result.hasTypo ? 'Correct! Minor typo:' : 'Almost! Watch the accents.'}
                  </span>
                </>
              ) : (
                <>
                  <X className="w-5 h-5 text-red-600" />
                  <span className="font-bold text-red-700">Not quite right</span>
                </>
              )}
            </div>

            {!result.isCorrect && renderCorrectedAnswer()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
