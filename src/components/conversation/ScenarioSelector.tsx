import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { SCENARIOS, type ConversationScenario } from '../../services/conversationService';

interface ScenarioSelectorProps {
  onSelect: (scenario: ConversationScenario) => void;
  selectedLevel?: 'A1' | 'A2' | 'B1' | 'B2' | 'all';
}

export function ScenarioSelector({ onSelect, selectedLevel = 'all' }: ScenarioSelectorProps) {
  const filteredScenarios = selectedLevel === 'all'
    ? SCENARIOS
    : SCENARIOS.filter(s => s.level === selectedLevel);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'A1': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'A2': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'B1': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'B2': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
          Choose a Scenario
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Practice real-life conversations in Catalan
        </p>
      </div>

      <div className="grid gap-3">
        {filteredScenarios.map((scenario, index) => (
          <motion.div
            key={scenario.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99]"
              onClick={() => onSelect(scenario)}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="text-3xl flex-shrink-0">
                  {scenario.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-800 dark:text-white">
                      {scenario.title}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getLevelColor(scenario.level)}`}>
                      {scenario.level}
                    </span>
                  </div>

                  <p className="text-sm text-miro-blue dark:text-miro-yellow font-medium mb-1">
                    {scenario.titleCatalan}
                  </p>

                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {scenario.description}
                  </p>

                  {/* Key vocabulary preview */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {scenario.keyVocabulary.slice(0, 3).map((vocab, i) => (
                      <span
                        key={i}
                        className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded"
                      >
                        {vocab.catalan}
                      </span>
                    ))}
                    {scenario.keyVocabulary.length > 3 && (
                      <span className="text-xs text-gray-400">
                        +{scenario.keyVocabulary.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex-shrink-0 text-gray-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredScenarios.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            No scenarios available for this level.
          </p>
        </div>
      )}
    </div>
  );
}
