import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Trophy, Target, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { PLACEMENT_QUESTIONS, type PlacementQuestion } from '../../data/curriculum';
import { useCurriculumStore } from '../../stores/curriculumStore';
import type { PlacementResult } from '../../types/curriculum';

interface PlacementTestProps {
  onComplete: (result: PlacementResult) => void;
  onCancel: () => void;
}

export function PlacementTest({ onComplete, onCancel }: PlacementTestProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const {
    placementAnswers,
    answerPlacementQuestion,
    completePlacementTest,
  } = useCurriculumStore();

  // Shuffle questions for variety
  const questions = useMemo(() => {
    const shuffled = [...PLACEMENT_QUESTIONS];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  const currentQuestion: PlacementQuestion = questions[currentIndex];
  const selectedAnswer = placementAnswers[currentQuestion.id];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleSelectAnswer = (answer: string) => {
    answerPlacementQuestion(currentQuestion.id, answer);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      const result = completePlacementTest();
      setShowResult(true);
      onComplete(result);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'A1': return 'bg-emerald-500';
      case 'A2': return 'bg-blue-500';
      case 'B1': return 'bg-violet-500';
      case 'B2': return 'bg-rose-500';
      default: return 'bg-gray-500';
    }
  };

  if (showResult) {
    const result = useCurriculumStore.getState().placementResult;
    if (!result) return null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto"
      >
        <Card className="p-8 text-center">
          {/* Trophy animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-miro-yellow to-amber-500 rounded-full flex items-center justify-center shadow-lg"
          >
            <Trophy className="w-12 h-12 text-miro-blue" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Your Level: {result.level}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You scored {result.correctAnswers}/{result.totalQuestions} ({result.score}%)
            </p>

            {/* Level breakdown */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {(['A1', 'A2', 'B1', 'B2'] as const).map(level => (
                <div key={level} className="text-center">
                  <div className={`
                    w-10 h-10 mx-auto mb-1 rounded-full flex items-center justify-center text-white font-bold text-sm
                    ${getLevelColor(level)}
                    ${result.level === level ? 'ring-4 ring-miro-yellow ring-offset-2 dark:ring-offset-gray-900' : 'opacity-60'}
                  `}>
                    {level}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {result.breakdown[level].correct}/{result.breakdown[level].total}
                  </p>
                </div>
              ))}
            </div>

            {/* Recommendation */}
            <div className="bg-gradient-to-r from-miro-blue/10 to-miro-red/10 dark:from-miro-blue/20 dark:to-miro-red/20 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-miro-blue" />
                <span className="font-semibold text-gray-900 dark:text-white">
                  Your Learning Path
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {result.level === 'A1' && "Let's start from the basics! You'll build a strong foundation."}
                {result.level === 'A2' && "Great start! You know the basics, let's expand your skills."}
                {result.level === 'B1' && "Impressive! You're ready for intermediate challenges."}
                {result.level === 'B2' && "Excellent! Let's polish your advanced Catalan skills."}
              </p>
            </div>

            <Button fullWidth onClick={() => window.location.reload()}>
              Start Learning
            </Button>
          </motion.div>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-miro-blue" />
            <span className="font-semibold text-gray-900 dark:text-white">
              Placement Test
            </span>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {currentIndex + 1} of {questions.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-miro-blue to-miro-red rounded-full"
          />
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="p-6 mb-6">
            {/* Level indicator */}
            <div className="flex items-center gap-2 mb-4">
              <span className={`
                px-2 py-0.5 rounded-full text-xs font-bold text-white
                ${getLevelColor(currentQuestion.level)}
              `}>
                {currentQuestion.level}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {currentQuestion.type}
              </span>
            </div>

            {/* Question */}
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              {currentQuestion.question}
            </h3>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <motion.button
                  key={option}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSelectAnswer(option)}
                  className={`
                    w-full p-4 rounded-xl border-2 text-left transition-all
                    ${selectedAnswer === option
                      ? 'border-miro-blue bg-miro-blue/10 dark:bg-miro-blue/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                      ${selectedAnswer === option
                        ? 'bg-miro-blue text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }
                    `}>
                      {selectedAnswer === option ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-medium">
                          {String.fromCharCode(65 + index)}
                        </span>
                      )}
                    </div>
                    <span className={`font-medium ${
                      selectedAnswer === option
                        ? 'text-miro-blue dark:text-miro-yellow'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {option}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          onClick={currentIndex === 0 ? onCancel : handlePrevious}
          leftIcon={<ChevronLeft className="w-5 h-5" />}
        >
          {currentIndex === 0 ? 'Cancel' : 'Previous'}
        </Button>

        <Button
          onClick={handleNext}
          disabled={!selectedAnswer}
          rightIcon={<ChevronRight className="w-5 h-5" />}
        >
          {currentIndex === questions.length - 1 ? 'Finish' : 'Next'}
        </Button>
      </div>

      {/* Skip option */}
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
        Don't know? Just guess - it helps us find your level!
      </p>
    </div>
  );
}
