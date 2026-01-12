import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Shuffle,
  Keyboard,
  HelpCircle,
  Trophy,
  Zap,
  Sparkles,
  Target,
  Clock,
} from 'lucide-react';
import { useSessionStore, type SessionSummary } from '../stores/sessionStore';
import { useCardStore } from '../stores/cardStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressRing';
import { FlashCard } from '../components/cards/FlashCard';
import { MultipleChoice } from '../components/cards/MultipleChoice';
import { TypeAnswer } from '../components/cards/TypeAnswer';
import { SprintMode } from '../components/cards/SprintMode';
import { Confetti } from '../components/ui/Confetti';
import type { StudyMode } from '../types/flashcard';

export function StudyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showModeSelect, setShowModeSelect] = useState(true);
  const [selectedMode, setSelectedMode] = useState<StudyMode>('flip');
  const [isSprintMode, setIsSprintMode] = useState(false);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Check for sprint mode in URL
  useEffect(() => {
    if (searchParams.get('mode') === 'sprint') {
      setIsSprintMode(true);
      setShowModeSelect(false);
    }
  }, [searchParams]);

  const {
    isActive,
    cards,
    currentIndex,
    startSession,
    submitAnswer,
    nextCard,
    endSession,
    resetSession,
  } = useSessionStore();

  const getDueCount = useCardStore((state) => state.getDueCount);
  const dueCount = getDueCount();

  const currentCard = cards[currentIndex];
  const progress = cards.length > 0 ? Math.round((currentIndex / cards.length) * 100) : 0;
  const isComplete = currentIndex >= cards.length && cards.length > 0;

  // Handle session completion
  useEffect(() => {
    if (isComplete && isActive) {
      endSession().then((s) => {
        setSummary(s);
        if (s.accuracy >= 80) {
          setShowConfetti(true);
        }
      });
    }
  }, [isComplete, isActive, endSession]);

  const handleStartSession = (mode: StudyMode) => {
    setSelectedMode(mode);
    setIsSprintMode(false);
    startSession(mode, 20);
    setShowModeSelect(false);
  };

  const handleStartSprint = () => {
    setIsSprintMode(true);
    startSession('flip', 15);
    setShowModeSelect(false);
  };

  const handleAnswer = async (quality: number, userAnswer?: string) => {
    await submitAnswer(quality, userAnswer);
    nextCard();
  };

  const handleFinish = () => {
    resetSession();
    setSummary(null);
    setIsSprintMode(false);
    setShowModeSelect(true);
    setShowConfetti(false);
  };

  // Sprint mode
  if (isSprintMode && cards.length > 0) {
    return (
      <SprintMode
        cards={cards}
        timeLimit={5}
        onComplete={(results) => {
          // Convert sprint results to session summary
          const totalCards = results.length;
          const correctAnswers = results.filter(r => r.isCorrect).length;
          const accuracy = totalCards > 0 ? Math.round((correctAnswers / totalCards) * 100) : 0;
          const timeSpentMs = results.reduce((sum, r) => sum + r.timeSpent * 1000, 0);

          setSummary({
            totalCards,
            correctAnswers,
            accuracy,
            xpEarned: correctAnswers * 15,
            timeSpentMs,
            perfectStreak: 0,
            newAchievements: [],
          });
          setIsSprintMode(false);
          if (accuracy >= 80) {
            setShowConfetti(true);
          }
        }}
        onExit={() => {
          resetSession();
          setIsSprintMode(false);
          setShowModeSelect(true);
        }}
      />
    );
  }

  // Mode selection screen
  if (showModeSelect && !isActive) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white text-center mb-2">
            Choose Study Mode
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-8">
            {dueCount > 0
              ? `${dueCount} cards ready for review`
              : 'No cards due - great job!'}
          </p>

          {dueCount > 0 ? (
            <div className="space-y-4">
              <Card
                hover
                className="cursor-pointer"
                onClick={() => handleStartSession('flip')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <Shuffle size={28} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 dark:text-white">Flip Cards</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Classic flashcard experience - flip to reveal
                    </p>
                  </div>
                </div>
              </Card>

              <Card
                hover
                className="cursor-pointer"
                onClick={() => handleStartSession('multiple-choice')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                    <HelpCircle size={28} className="text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 dark:text-white">Multiple Choice</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Pick the correct answer from 4 options
                    </p>
                  </div>
                </div>
              </Card>

              <Card
                hover
                className="cursor-pointer"
                onClick={() => handleStartSession('type-answer')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                    <Keyboard size={28} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 dark:text-white">Type Answer</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Practice spelling by typing your answer
                    </p>
                  </div>
                </div>
              </Card>

              {/* Sprint Mode */}
              <Card
                hover
                className="cursor-pointer bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800"
                onClick={handleStartSprint}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <Zap size={28} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                      Sprint Mode
                      <span className="text-xs px-2 py-0.5 bg-amber-200 dark:bg-amber-800 text-amber-700 dark:text-amber-300 rounded-full">
                        Fast!
                      </span>
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      5-second timer per card - test your speed!
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Trophy size={40} className="text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                All caught up!
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                You've reviewed all your due cards. Come back later or add more cards.
              </p>
              <Button onClick={() => navigate('/')}>Back to Home</Button>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // Summary screen
  if (summary) {
    const getMessage = () => {
      if (summary.accuracy >= 90) return { text: 'Outstanding!', emoji: '🏆' };
      if (summary.accuracy >= 80) return { text: 'Excellent work!', emoji: '⭐' };
      if (summary.accuracy >= 70) return { text: 'Great job!', emoji: '👏' };
      if (summary.accuracy >= 60) return { text: 'Good effort!', emoji: '💪' };
      return { text: 'Keep practicing!', emoji: '📚' };
    };

    const message = getMessage();

    return (
      <div className="max-w-md mx-auto px-4 py-8">
        <Confetti isActive={showConfetti} onComplete={() => setShowConfetti(false)} />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg"
          >
            <span className="text-5xl">{message.emoji}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-gray-800 dark:text-white mb-2"
          >
            {message.text}
          </motion.h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Session complete - keep up the momentum!</p>

          <Card className="text-left mb-6">
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
              >
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Target className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">{summary.totalCards}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Cards Reviewed</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
              >
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Sparkles className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-green-600">{summary.accuracy}%</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Accuracy</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
              >
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Zap className="w-5 h-5 text-yellow-500" />
                </div>
                <p className="text-3xl font-bold text-yellow-600">+{summary.xpEarned}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">XP Earned</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
              >
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Clock className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">
                  {summary.timeSpentMs < 60000
                    ? `${Math.round(summary.timeSpentMs / 1000)}s`
                    : `${Math.round(summary.timeSpentMs / 1000 / 60)}m`}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Time Spent</p>
              </motion.div>
            </div>

            {summary.perfectStreak > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl text-center"
              >
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  🔥 {summary.perfectStreak} perfect answers in a row!
                </p>
              </motion.div>
            )}
          </Card>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex gap-3"
          >
            <Button
              variant="outline"
              fullWidth
              onClick={() => navigate('/')}
            >
              Back Home
            </Button>
            <Button
              fullWidth
              onClick={handleFinish}
            >
              Study More
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Study session
  return (
    <div className="max-w-md mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => {
            resetSession();
            setShowModeSelect(true);
          }}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={24} className="text-gray-600" />
        </button>

        <div className="flex-1 mx-4">
          <ProgressBar progress={progress} height={8} />
        </div>

        <span className="text-sm font-medium text-gray-600">
          {currentIndex + 1}/{cards.length}
        </span>
      </div>

      {/* Card */}
      <AnimatePresence mode="wait">
        {currentCard && (
          <motion.div
            key={`${currentCard.flashcard.id}-${currentCard.direction}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.2 }}
          >
            {selectedMode === 'flip' && (
              <FlashCard
                studyCard={currentCard}
                onRate={handleAnswer}
              />
            )}

            {selectedMode === 'multiple-choice' && (
              <MultipleChoice
                studyCard={currentCard}
                onAnswer={handleAnswer}
              />
            )}

            {selectedMode === 'type-answer' && (
              <TypeAnswer
                studyCard={currentCard}
                onAnswer={handleAnswer}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Direction indicator */}
      {currentCard && (
        <div className="mt-6 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
            {currentCard.direction === 'english-to-catalan'
              ? 'English → Català'
              : 'Català → English'}
            {currentCard.requiresTyping && (
              <Keyboard size={14} className="text-purple-500" />
            )}
          </span>
        </div>
      )}
    </div>
  );
}
