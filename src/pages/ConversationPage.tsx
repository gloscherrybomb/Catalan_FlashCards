import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, Filter, Trophy } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ScenarioSelector } from '../components/conversation/ScenarioSelector';
import { ChatInterface } from '../components/conversation/ChatInterface';
import { type ConversationScenario } from '../services/conversationService';
import { useUserStore } from '../stores/userStore';
import { useCurriculumStore } from '../stores/curriculumStore';

type ViewMode = 'select' | 'chat' | 'results';

interface ConversationResults {
  scenario: ConversationScenario;
  messageCount: number;
  xpEarned: number;
}

export function ConversationPage() {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>('select');
  const [selectedScenario, setSelectedScenario] = useState<ConversationScenario | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'A1' | 'A2' | 'B1' | 'B2'>('all');
  const [results, setResults] = useState<ConversationResults | null>(null);

  // Get curriculum lesson ID from URL (for Learning Path progress tracking)
  const lessonId = useMemo(() => searchParams.get('lesson') || undefined, [searchParams]);

  const addXP = useUserStore(state => state.addXP);
  const completeLesson = useCurriculumStore(state => state.completeLesson);

  const levels: Array<'all' | 'A1' | 'A2' | 'B1' | 'B2'> = ['all', 'A1', 'A2', 'B1', 'B2'];

  const handleSelectScenario = (scenario: ConversationScenario) => {
    setSelectedScenario(scenario);
    setViewMode('chat');
  };

  const handleBack = () => {
    setSelectedScenario(null);
    setViewMode('select');
  };

  const handleComplete = async (messageCount: number) => {
    if (!selectedScenario) return;

    // Calculate XP based on messages exchanged
    const xpEarned = Math.min(messageCount * 10, 100); // 10 XP per message, max 100

    setResults({
      scenario: selectedScenario,
      messageCount,
      xpEarned,
    });

    // Award XP
    await addXP(xpEarned);

    // Mark curriculum lesson as complete if we came from Learning Path
    // Require at least 3 messages exchanged to count as completed
    if (lessonId && messageCount >= 3) {
      const score = Math.min(messageCount * 10, 100); // Score based on engagement
      completeLesson(lessonId, score);
    }

    setViewMode('results');
  };

  const handleNewConversation = () => {
    setSelectedScenario(null);
    setResults(null);
    setViewMode('select');
  };

  // Results view
  if (viewMode === 'results' && results) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-6 pb-24">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            {/* Success icon */}
            <div className="w-24 h-24 bg-gradient-to-br from-miro-green to-emerald-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
              <Trophy className="w-12 h-12 text-white" />
            </div>

            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Great conversation!
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              {results.scenario.titleCatalan}
            </p>

            {/* Stats */}
            <Card className="p-6 mb-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-miro-blue dark:text-miro-yellow">
                    {results.messageCount}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Messages sent
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-miro-green">
                    +{results.xpEarned}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    XP earned
                  </p>
                </div>
              </div>
            </Card>

            {/* Tips */}
            <Card className="p-4 mb-6 bg-miro-yellow/10 dark:bg-miro-yellow/5 border-miro-yellow/30">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Tip:</strong> Practice the same scenario multiple times to build confidence, then try a harder level!
              </p>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                fullWidth
                onClick={() => {
                  setResults(null);
                  setViewMode('chat');
                }}
              >
                Practice Again
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={handleNewConversation}
              >
                Choose New Scenario
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Chat view
  if (viewMode === 'chat' && selectedScenario) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        <ChatInterface
          scenario={selectedScenario}
          onBack={handleBack}
          onComplete={handleComplete}
        />
      </div>
    );
  }

  // Scenario selection view
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-6 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <MessageCircle className="w-8 h-8 text-miro-blue" />
              Conversation
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Practice real-life conversations in Catalan
          </p>
        </motion.div>

        {/* Level filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            {levels.map(level => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`
                  px-3 py-1.5 rounded-full font-medium text-sm whitespace-nowrap transition-all
                  ${selectedLevel === level
                    ? 'bg-miro-blue text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }
                `}
              >
                {level === 'all' ? 'All Levels' : level}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Info card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <Card className="p-4 bg-gradient-to-r from-miro-blue/10 to-miro-green/10 dark:from-miro-blue/5 dark:to-miro-green/5 border-miro-blue/20">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <p className="font-medium text-gray-800 dark:text-white mb-1">
                  How it works
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Choose a scenario that matches your level</li>
                  <li>• Type your responses in Catalan</li>
                  <li>• Get instant grammar feedback on your messages</li>
                  <li>• Earn XP for practicing!</li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Scenario selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ScenarioSelector
            onSelect={handleSelectScenario}
            selectedLevel={selectedLevel === 'all' ? 'all' : selectedLevel}
          />
        </motion.div>
      </div>
    </div>
  );
}
