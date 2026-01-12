import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ChevronRight, Trophy, RefreshCcw } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import type { Story, ComprehensionQuestion } from '../../data/stories';
import { useStoryStore } from '../../stores/storyStore';

interface ComprehensionQuizProps {
  story: Story;
  onComplete: (score: number) => void;
  onReread: () => void;
}

interface QuestionResult {
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
}

export function ComprehensionQuiz({ story, onComplete, onReread }: ComprehensionQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const { answerQuestion } = useStoryStore();

  const currentQuestion: ComprehensionQuestion = story.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === story.questions.length - 1;

  const handleSelectAnswer = (index: number) => {
    if (showExplanation) return;

    setSelectedAnswer(index);
    answerQuestion(currentQuestion.id, index);

    const isCorrect = index === currentQuestion.correctIndex;

    setResults(prev => [
      ...prev,
      {
        questionId: currentQuestion.id,
        selectedIndex: index,
        isCorrect,
      },
    ]);

    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      // Calculate final score
      const correctCount = results.length > 0
        ? results.filter(r => r.isCorrect).length + (selectedAnswer === currentQuestion.correctIndex ? 1 : 0)
        : (selectedAnswer === currentQuestion.correctIndex ? 1 : 0);
      const totalQuestions = story.questions.length;
      const score = Math.round((correctCount / totalQuestions) * 100);

      setIsComplete(true);
      onComplete(score);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowExplanation(false);
      setSelectedAnswer(null);
    }
  };

  const finalScore = isComplete
    ? Math.round((results.filter(r => r.isCorrect).length / story.questions.length) * 100)
    : 0;

  // Results screen
  if (isComplete) {
    const correctCount = results.filter(r => r.isCorrect).length;
    const isPassing = finalScore >= 70;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto text-center"
      >
        <Card className="p-8">
          {/* Trophy/Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className={`
              w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center
              ${isPassing
                ? 'bg-gradient-to-br from-miro-yellow to-amber-500'
                : 'bg-gradient-to-br from-gray-300 to-gray-400'
              }
            `}
          >
            <Trophy className={`w-12 h-12 ${isPassing ? 'text-miro-blue' : 'text-gray-600'}`} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {isPassing ? 'Great job!' : 'Keep practicing!'}
            </h2>

            <p className="text-5xl font-bold text-miro-blue dark:text-miro-yellow mb-2">
              {finalScore}%
            </p>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {correctCount} of {story.questions.length} questions correct
            </p>

            {/* XP earned */}
            {isPassing && (
              <div className="bg-miro-green/10 dark:bg-miro-green/20 rounded-xl p-4 mb-6">
                <p className="text-miro-green font-bold text-lg">
                  +{story.xpReward} XP earned!
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              {!isPassing && (
                <Button
                  variant="outline"
                  fullWidth
                  onClick={onReread}
                  leftIcon={<RefreshCcw className="w-5 h-5" />}
                >
                  Read Again
                </Button>
              )}
              <Button fullWidth onClick={() => window.history.back()}>
                {isPassing ? 'Continue' : 'Back to Stories'}
              </Button>
            </div>
          </motion.div>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
          <span>Comprehension Quiz</span>
          <span>Question {currentQuestionIndex + 1} of {story.questions.length}</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestionIndex + 1) / story.questions.length) * 100}%` }}
            className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <Card className="p-6 mb-6">
            {/* Question in Catalan */}
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {currentQuestion.question}
            </h3>

            {/* English translation */}
            <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-6">
              {currentQuestion.questionEnglish}
            </p>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === currentQuestion.correctIndex;
                const showResult = showExplanation;

                return (
                  <motion.button
                    key={option}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSelectAnswer(index)}
                    disabled={showExplanation}
                    className={`
                      w-full p-4 rounded-xl border-2 text-left transition-all
                      ${showResult
                        ? isCorrect
                          ? 'border-miro-green bg-miro-green/10 dark:bg-miro-green/20'
                          : isSelected
                            ? 'border-miro-red bg-miro-red/10 dark:bg-miro-red/20'
                            : 'border-gray-200 dark:border-gray-700 opacity-50'
                        : isSelected
                          ? 'border-miro-blue bg-miro-blue/10 dark:bg-miro-blue/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${
                        showResult && isCorrect
                          ? 'text-miro-green'
                          : showResult && isSelected && !isCorrect
                            ? 'text-miro-red'
                            : 'text-gray-800 dark:text-gray-200'
                      }`}>
                        {option}
                      </span>

                      {showResult && (
                        <span>
                          {isCorrect ? (
                            <Check className="w-5 h-5 text-miro-green" />
                          ) : isSelected ? (
                            <X className="w-5 h-5 text-miro-red" />
                          ) : null}
                        </span>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700"
                >
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Explanation: </span>
                    {currentQuestion.explanation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Next button */}
      {showExplanation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            fullWidth
            onClick={handleNextQuestion}
            rightIcon={<ChevronRight className="w-5 h-5" />}
          >
            {isLastQuestion ? 'See Results' : 'Next Question'}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
