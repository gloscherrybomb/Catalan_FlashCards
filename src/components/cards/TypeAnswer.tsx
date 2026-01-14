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
  const startTimeRef = useRef(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);

  const { flashcard, direction } = studyCard;

  // Reset state when card changes
  useEffect(() => {
    setUserInput('');
    setHasSubmitted(false);
    setResult(null);
    setShowKeyboard(false);
    startTimeRef.current = Date.now();
    inputRef.current?.focus();
  }, [flashcard.id, direction]);

  const question = stripBracketedContent(direction === 'english-to-catalan' ? flashcard.front : flashcard.back);
  const correctAnswer = stripBracketedContent(direction === 'english-to-catalan' ? flashcard.back : flashcard.front);
  const questionLabel = direction === 'english-to-catalan' ? 'English' : 'Català';
  const answerLabel = direction === 'english-to-catalan' ? 'Català' : 'English';


  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (hasSubmitted || !userInput.trim()) return;

    const validationResult = validateTyping(userInput, correctAnswer);
    setResult(validationResult);
    setHasSubmitted(true);

    // Calculate quality
    const timeSpent = Date.now() - startTimeRef.current;
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

    // Delay before next card - state resets via useEffect when card changes
    setTimeout(() => {
      onAnswer(quality, userInput);
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
        <p className="text-sm text-gray-600 dark:text-gray-400">Correct answer:</p>
        <div className="p-3 bg-white dark:bg-gray-700 rounded-lg font-mono text-lg text-gray-800 dark:text-white">
          {correctAnswer.split('').map((char, i) => {
            const correction = result.corrections.find(c => c.position === i);
            if (correction) {
              return (
                <span
                  key={i}
                  className={`px-0.5 rounded ${
                    correction.type === 'accent'
                      ? 'bg-miro-yellow/40 text-amber-800 dark:text-yellow-200'
                      : 'bg-miro-red/40 text-red-800 dark:text-red-200'
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
          <p className="text-sm text-amber-700 dark:text-yellow-400">
            Pay attention to accents! They change pronunciation and meaning.
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Question card */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-playful p-6 mb-6 border-3 border-miro-blue dark:border-ink-light/50">
        <div className="flex items-start justify-between mb-4">
          <CategoryIcon category={flashcard.category} word={question} size="md" />
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase">{questionLabel}</span>
            {flashcard.gender && (
              <Badge text={flashcard.gender === 'masculine' ? 'Masc' : 'Fem'} variant={flashcard.gender} />
            )}
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 dark:text-white text-center my-6">
          {question}
        </h2>

        {flashcard.notes && (
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm italic">
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
                  ? 'border-miro-green bg-miro-green/10 dark:bg-miro-green/20 text-gray-800 dark:text-white'
                  : 'border-miro-red bg-miro-red/10 dark:bg-miro-red/20 text-gray-800 dark:text-white'
                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:border-miro-blue dark:focus:border-miro-yellow placeholder:text-gray-400 dark:placeholder:text-gray-500'
            }`}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
          />

          {/* Toggle Catalan keyboard */}
          <button
            type="button"
            onClick={() => setShowKeyboard(!showKeyboard)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
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
              className="bg-gray-100 dark:bg-gray-700 rounded-xl p-3 space-y-2"
            >
              {CATALAN_KEYBOARD.map((row, rowIndex) => (
                <div key={rowIndex} className="flex justify-center gap-2">
                  {row.map((char) => (
                    <button
                      key={char}
                      type="button"
                      onClick={() => insertChar(char)}
                      className="w-10 h-10 bg-white dark:bg-gray-600 rounded-lg shadow-sm text-lg font-medium text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-500 active:bg-gray-100 dark:active:bg-gray-400"
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
                ? 'bg-miro-green/20 dark:bg-miro-green/30'
                : result.isAcceptable
                ? 'bg-miro-yellow/20 dark:bg-miro-yellow/30'
                : 'bg-miro-red/20 dark:bg-miro-red/30'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {result.isCorrect ? (
                <>
                  <Check className="w-5 h-5 text-miro-green" />
                  <span className="font-bold text-miro-green">Perfect!</span>
                </>
              ) : result.isAcceptable ? (
                <>
                  <Check className="w-5 h-5 text-miro-yellow dark:text-yellow-400" />
                  <span className="font-bold text-amber-700 dark:text-yellow-400">
                    {result.hasTypo ? 'Correct! Minor typo:' : 'Almost! Watch the accents.'}
                  </span>
                </>
              ) : (
                <>
                  <X className="w-5 h-5 text-miro-red" />
                  <span className="font-bold text-miro-red">Not quite right</span>
                </>
              )}
            </div>

            {/* Display feedback message for alternative matches */}
            {result.feedbackMessage && (
              <p className="text-sm text-miro-blue/70 dark:text-ink-light/70 mb-2 italic">
                {result.feedbackMessage}
              </p>
            )}

            {!result.isCorrect && renderCorrectedAnswer()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
