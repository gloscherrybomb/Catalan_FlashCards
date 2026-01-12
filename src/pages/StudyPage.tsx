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
  Headphones,
  MessageSquare,
  Ear,
} from 'lucide-react';
import { useSessionStore, type SessionSummary } from '../stores/sessionStore';
import { useCardStore } from '../stores/cardStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { ProgressBar } from '../components/ui/ProgressRing';
import { FlashCard } from '../components/cards/FlashCard';
import { MultipleChoice } from '../components/cards/MultipleChoice';
import { TypeAnswer } from '../components/cards/TypeAnswer';
import { ListeningMode } from '../components/cards/ListeningMode';
import { SprintMode } from '../components/cards/SprintMode';
import { SentenceMode } from '../components/cards/SentenceMode';
import { DictationMode } from '../components/cards/DictationMode';
import { Confetti } from '../components/ui/Confetti';
import type { StudyMode } from '../types/flashcard';

export function StudyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showModeSelect, setShowModeSelect] = useState(true);
  const [selectedMode, setSelectedMode] = useState<StudyMode>('flip');
  const [isSprintMode, setIsSprintMode] = useState(false);
  const [isSentenceMode, setIsSentenceMode] = useState(false);
  const [includeDictationInMixed, setIncludeDictationInMixed] = useState(true);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showRecoveryPrompt, setShowRecoveryPrompt] = useState(false);

  const {
    isActive,
    cards,
    currentIndex,
    mode: sessionMode,
    startSession,
    submitAnswer,
    nextCard,
    endSession,
    resetSession,
    hasRecoverableSession,
    clearSavedSession,
    getCardFormat,
  } = useSessionStore();

  // Check for sprint mode in URL or recoverable session
  useEffect(() => {
    if (searchParams.get('mode') === 'sprint') {
      setIsSprintMode(true);
      setShowModeSelect(false);
    } else if (hasRecoverableSession()) {
      setShowRecoveryPrompt(true);
      setShowModeSelect(false);
      setSelectedMode(sessionMode);
    }
  }, [searchParams, hasRecoverableSession, sessionMode]);

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
    startSession(mode, 20, mode === 'mixed' ? includeDictationInMixed : true);
    setShowModeSelect(false);
  };

  const handleStartSprint = () => {
    setIsSprintMode(true);
    startSession('flip', 15);
    setShowModeSelect(false);
  };

  const handleStartSentences = () => {
    setIsSentenceMode(true);
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
    setIsSentenceMode(false);
    setShowModeSelect(true);
    setShowConfetti(false);
  };

  // Sentence mode
  if (isSentenceMode) {
    return (
      <SentenceMode
        onExit={() => {
          setIsSentenceMode(false);
          setShowModeSelect(true);
        }}
        difficulty="mixed"
        count={10}
      />
    );
  }

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

  // Session recovery prompt
  if (showRecoveryPrompt) {
    return (
      <div className="max-w-md mx-auto px-4 py-8">
        <Modal
          isOpen={showRecoveryPrompt}
          onClose={() => {
            clearSavedSession();
            setShowRecoveryPrompt(false);
            setShowModeSelect(true);
          }}
          title="Resume Session?"
        >
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-miro-yellow/20 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-miro-yellow" />
            </div>
            <p className="text-miro-blue/70 dark:text-ink-light/70 mb-4">
              You have an incomplete study session. Would you like to continue where you left off?
            </p>
            <p className="text-sm text-miro-blue/50 dark:text-ink-light/50 mb-6">
              Progress: {currentIndex}/{cards.length} cards completed
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  clearSavedSession();
                  setShowRecoveryPrompt(false);
                  setShowModeSelect(true);
                }}
              >
                Start Fresh
              </Button>
              <Button
                fullWidth
                onClick={() => {
                  setShowRecoveryPrompt(false);
                  setShowModeSelect(false);
                }}
              >
                Continue
              </Button>
            </div>
          </div>
        </Modal>
      </div>
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
                  <div className="w-14 h-14 bg-miro-blue/10 dark:bg-miro-blue/20 rounded-xl flex items-center justify-center">
                    <Shuffle size={28} className="text-miro-blue dark:text-ink-light" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-miro-blue dark:text-ink-light">Flip Cards</h3>
                    <p className="text-sm text-miro-blue/60 dark:text-ink-light/60">
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
                  <div className="w-14 h-14 bg-miro-green/10 dark:bg-miro-green/20 rounded-xl flex items-center justify-center">
                    <HelpCircle size={28} className="text-miro-green" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-miro-blue dark:text-ink-light">Multiple Choice</h3>
                    <p className="text-sm text-miro-blue/60 dark:text-ink-light/60">
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
                  <div className="w-14 h-14 bg-miro-red/10 dark:bg-miro-red/20 rounded-xl flex items-center justify-center">
                    <Keyboard size={28} className="text-miro-red" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-miro-blue dark:text-ink-light">Type Answer</h3>
                    <p className="text-sm text-miro-blue/60 dark:text-ink-light/60">
                      Practice spelling by typing your answer
                    </p>
                  </div>
                </div>
              </Card>

              {/* Mixed Mode */}
              <Card
                hover
                className="cursor-pointer bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border-violet-200 dark:border-violet-800"
                onClick={() => handleStartSession('mixed')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Sparkles size={28} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-miro-blue dark:text-ink-light flex items-center gap-2">
                      Mixed Mode
                      <span className="text-xs px-2 py-0.5 bg-violet-200 dark:bg-violet-800 text-violet-700 dark:text-violet-300 rounded-full">
                        Varied!
                      </span>
                    </h3>
                    <p className="text-sm text-miro-blue/60 dark:text-ink-light/60">
                      Random format per card - keeps you on your toes!
                    </p>
                    {/* Dictation toggle */}
                    <label
                      className="flex items-center gap-2 mt-2 text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={includeDictationInMixed}
                        onChange={(e) => setIncludeDictationInMixed(e.target.checked)}
                        className="w-4 h-4 rounded border-violet-300 text-violet-600 focus:ring-violet-500"
                      />
                      <span className="text-miro-blue/60 dark:text-ink-light/60">
                        Include dictation (requires audio)
                      </span>
                    </label>
                  </div>
                </div>
              </Card>

              {/* Listening Mode */}
              <Card
                hover
                className="cursor-pointer bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20 border-teal-200 dark:border-teal-800"
                onClick={() => handleStartSession('listening')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <Headphones size={28} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-miro-blue dark:text-ink-light">Listening Mode</h3>
                    <p className="text-sm text-miro-blue/60 dark:text-ink-light/60">
                      Hear the word first, then identify its meaning
                    </p>
                  </div>
                </div>
              </Card>

              {/* Sentence Builder Mode */}
              <Card
                hover
                className="cursor-pointer bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20 border-rose-200 dark:border-rose-800"
                onClick={handleStartSentences}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <MessageSquare size={28} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-miro-blue dark:text-ink-light flex items-center gap-2">
                      Sentence Builder
                      <span className="text-xs px-2 py-0.5 bg-rose-200 dark:bg-rose-800 text-rose-700 dark:text-rose-300 rounded-full">
                        New!
                      </span>
                    </h3>
                    <p className="text-sm text-miro-blue/60 dark:text-ink-light/60">
                      Build sentences and fill in the blanks
                    </p>
                  </div>
                </div>
              </Card>

              {/* Dictation Mode */}
              <Card
                hover
                className="cursor-pointer bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/20 dark:to-emerald-950/20 border-teal-200 dark:border-teal-800"
                onClick={() => handleStartSession('dictation')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <Ear size={28} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-miro-blue dark:text-ink-light flex items-center gap-2">
                      Dictation
                      <span className="text-xs px-2 py-0.5 bg-teal-200 dark:bg-teal-800 text-teal-700 dark:text-teal-300 rounded-full">
                        New!
                      </span>
                    </h3>
                    <p className="text-sm text-miro-blue/60 dark:text-ink-light/60">
                      Listen and type what you hear
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
                className="text-center p-4 bg-miro-blue/5 dark:bg-miro-blue/10 rounded-xl border border-miro-blue/10 dark:border-miro-blue/20"
              >
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Target className="w-5 h-5 text-miro-blue dark:text-ink-light" />
                </div>
                <p className="text-3xl font-bold text-miro-blue dark:text-ink-light">{summary.totalCards}</p>
                <p className="text-sm text-miro-blue/60 dark:text-ink-light/60">Cards Reviewed</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center p-4 bg-miro-green/5 dark:bg-miro-green/10 rounded-xl border border-miro-green/10 dark:border-miro-green/20"
              >
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Sparkles className="w-5 h-5 text-miro-green" />
                </div>
                <p className="text-3xl font-bold text-miro-green">{summary.accuracy}%</p>
                <p className="text-sm text-miro-blue/60 dark:text-ink-light/60">Accuracy</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-center p-4 bg-miro-yellow/5 dark:bg-miro-yellow/10 rounded-xl border border-miro-yellow/10 dark:border-miro-yellow/20"
              >
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Zap className="w-5 h-5 text-miro-yellow" />
                </div>
                <p className="text-3xl font-bold text-miro-yellow">+{summary.xpEarned}</p>
                <p className="text-sm text-miro-blue/60 dark:text-ink-light/60">XP Earned</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-center p-4 bg-miro-red/5 dark:bg-miro-red/10 rounded-xl border border-miro-red/10 dark:border-miro-red/20"
              >
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Clock className="w-5 h-5 text-miro-red" />
                </div>
                <p className="text-3xl font-bold text-miro-blue dark:text-ink-light">
                  {summary.timeSpentMs < 60000
                    ? `${Math.round(summary.timeSpentMs / 1000)}s`
                    : `${Math.round(summary.timeSpentMs / 1000 / 60)}m`}
                </p>
                <p className="text-sm text-miro-blue/60 dark:text-ink-light/60">Time Spent</p>
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
            {(() => {
              // For mixed mode, get the format for this specific card
              const cardFormat = selectedMode === 'mixed'
                ? getCardFormat(currentCard.flashcard.id, currentCard.direction)
                : selectedMode;

              switch (cardFormat) {
                case 'flip':
                  return <FlashCard studyCard={currentCard} onRate={handleAnswer} />;
                case 'multiple-choice':
                  return <MultipleChoice studyCard={currentCard} onAnswer={handleAnswer} />;
                case 'type-answer':
                  return <TypeAnswer studyCard={currentCard} onAnswer={handleAnswer} />;
                case 'listening':
                  return <ListeningMode studyCard={currentCard} onAnswer={handleAnswer} />;
                case 'dictation':
                  return (
                    <DictationMode
                      studyCard={currentCard}
                      onComplete={(score, correct) => handleAnswer(correct ? (score >= 80 ? 5 : 4) : 2)}
                    />
                  );
                default:
                  return <FlashCard studyCard={currentCard} onRate={handleAnswer} />;
              }
            })()}
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
