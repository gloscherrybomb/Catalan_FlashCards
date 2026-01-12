import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, AlertTriangle, Target, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useCardStore } from '../stores/cardStore';
import { useUserStore } from '../stores/userStore';
import { Card } from '../components/ui/Card';
import { MistakePatterns } from '../components/analytics/MistakePatterns';

export function AnalyticsPage() {
  const flashcards = useCardStore((state) => state.flashcards);
  const cardProgress = useCardStore((state) => state.cardProgress);
  const progress = useUserStore((state) => state.progress);

  // Calculate struggling cards (lowest easeFactor, most reviews needed)
  const strugglingCards = useMemo(() => {
    const cardStats: Array<{
      card: typeof flashcards[0];
      avgEaseFactor: number;
      totalReviews: number;
      accuracy: number;
    }> = [];

    for (const card of flashcards) {
      const engToCat = cardProgress.get(`${card.id}_english-to-catalan`);
      const catToEng = cardProgress.get(`${card.id}_catalan-to-english`);

      const totalReviews = (engToCat?.totalReviews || 0) + (catToEng?.totalReviews || 0);
      const totalCorrect = (engToCat?.correctReviews || 0) + (catToEng?.correctReviews || 0);
      const avgEaseFactor = ((engToCat?.easeFactor || 2.5) + (catToEng?.easeFactor || 2.5)) / 2;
      const accuracy = totalReviews > 0 ? (totalCorrect / totalReviews) * 100 : 100;

      if (totalReviews > 0) {
        cardStats.push({ card, avgEaseFactor, totalReviews, accuracy });
      }
    }

    return cardStats
      .filter(s => s.avgEaseFactor < 2.3)
      .sort((a, b) => a.avgEaseFactor - b.avgEaseFactor)
      .slice(0, 10);
  }, [flashcards, cardProgress]);

  // Calculate mastery distribution
  const masteryDistribution = useMemo(() => {
    let newCards = 0;
    let learning = 0;
    let reviewing = 0;
    let mastered = 0;

    for (const card of flashcards) {
      const engToCat = cardProgress.get(`${card.id}_english-to-catalan`);
      const catToEng = cardProgress.get(`${card.id}_catalan-to-english`);

      const avgInterval = ((engToCat?.interval || 0) + (catToEng?.interval || 0)) / 2;
      const avgReps = ((engToCat?.repetitions || 0) + (catToEng?.repetitions || 0)) / 2;

      if (avgReps === 0) newCards++;
      else if (avgInterval >= 21) mastered++;
      else if (avgInterval >= 7) reviewing++;
      else learning++;
    }

    return [
      { name: 'New', value: newCards, color: '#94A3B8' },
      { name: 'Learning', value: learning, color: '#FFB800' },
      { name: 'Reviewing', value: reviewing, color: '#1D3557' },
      { name: 'Mastered', value: mastered, color: '#2A9D8F' },
    ].filter(d => d.value > 0);
  }, [flashcards, cardProgress]);

  // Estimate time to mastery for each card
  const timeToMastery = useMemo(() => {
    const predictions: Array<{
      card: typeof flashcards[0];
      daysRemaining: number;
      currentInterval: number;
    }> = [];

    for (const card of flashcards) {
      const engToCat = cardProgress.get(`${card.id}_english-to-catalan`);
      const catToEng = cardProgress.get(`${card.id}_catalan-to-english`);

      const avgInterval = ((engToCat?.interval || 0) + (catToEng?.interval || 0)) / 2;
      const avgEase = ((engToCat?.easeFactor || 2.5) + (catToEng?.easeFactor || 2.5)) / 2;

      if (avgInterval >= 21) continue; // Already mastered

      // Estimate reviews needed to reach 21-day interval
      let interval = avgInterval || 1;
      let daysRemaining = 0;
      while (interval < 21 && daysRemaining < 365) {
        daysRemaining += interval;
        interval = Math.round(interval * avgEase);
      }

      predictions.push({ card, daysRemaining, currentInterval: avgInterval });
    }

    return predictions.sort((a, b) => a.daysRemaining - b.daysRemaining).slice(0, 10);
  }, [flashcards, cardProgress]);

  // Overall stats
  const overallAccuracy = progress.totalCardsReviewed > 0
    ? Math.round((progress.totalCorrect / progress.totalCardsReviewed) * 100)
    : 0;

  const totalTimeHours = Math.round(progress.totalTimeSpentMs / 1000 / 60 / 60 * 10) / 10;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-miro-blue/10 dark:bg-miro-blue/20 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-miro-blue dark:text-ink-light" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-miro-blue dark:text-ink-light">
              Learning Analytics
            </h1>
            <p className="text-miro-blue/60 dark:text-ink-light/60">
              Track your progress and identify areas for improvement
            </p>
          </div>
        </div>

        {/* Overview stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center p-4">
            <Target className="w-6 h-6 mx-auto mb-2 text-miro-blue dark:text-ink-light" />
            <p className="text-3xl font-bold text-miro-blue dark:text-ink-light">
              {flashcards.length}
            </p>
            <p className="text-sm text-miro-blue/60 dark:text-ink-light/60">Total Cards</p>
          </Card>
          <Card className="text-center p-4">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-miro-green" />
            <p className="text-3xl font-bold text-miro-green">{progress.totalCardsReviewed}</p>
            <p className="text-sm text-miro-blue/60 dark:text-ink-light/60">Reviews</p>
          </Card>
          <Card className="text-center p-4">
            <Target className="w-6 h-6 mx-auto mb-2 text-miro-yellow" />
            <p className="text-3xl font-bold text-miro-yellow">{overallAccuracy}%</p>
            <p className="text-sm text-miro-blue/60 dark:text-ink-light/60">Accuracy</p>
          </Card>
          <Card className="text-center p-4">
            <Clock className="w-6 h-6 mx-auto mb-2 text-miro-red" />
            <p className="text-3xl font-bold text-miro-blue dark:text-ink-light">{totalTimeHours}h</p>
            <p className="text-sm text-miro-blue/60 dark:text-ink-light/60">Time Studied</p>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Mastery Distribution */}
          <Card>
            <h2 className="text-xl font-bold text-miro-blue dark:text-ink-light mb-4">
              Mastery Distribution
            </h2>
            {masteryDistribution.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={masteryDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {masteryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-miro-blue/50 dark:text-ink-light/50">
                No data yet - start reviewing cards!
              </div>
            )}
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
              {masteryDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-miro-blue/70 dark:text-ink-light/70">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Time to Mastery */}
          <Card>
            <h2 className="text-xl font-bold text-miro-blue dark:text-ink-light mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-miro-blue dark:text-ink-light" />
              Time to Mastery
            </h2>
            {timeToMastery.length > 0 ? (
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {timeToMastery.map(({ card, daysRemaining }) => (
                  <div
                    key={card.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-miro-blue dark:text-ink-light truncate">
                        {card.front}
                      </p>
                      <p className="text-sm text-miro-blue/60 dark:text-ink-light/60 truncate">
                        {card.back}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-miro-green ml-2 whitespace-nowrap">
                      ~{daysRemaining} days
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-miro-blue/50 dark:text-ink-light/50">
                All cards mastered!
              </div>
            )}
          </Card>
        </div>

        {/* Struggling Cards */}
        <Card className="mb-8">
          <h2 className="text-xl font-bold text-miro-blue dark:text-ink-light mb-4 flex items-center gap-2">
            <AlertTriangle className="text-miro-orange" />
            Cards Needing Attention
          </h2>
          {strugglingCards.length > 0 ? (
            <div className="space-y-3">
              {strugglingCards.map(({ card, avgEaseFactor, accuracy }) => (
                <div
                  key={card.id}
                  className="flex items-center justify-between p-4 bg-miro-red/5 dark:bg-miro-red/10 rounded-xl border border-miro-red/20"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-miro-blue dark:text-ink-light">
                      {card.front}
                    </p>
                    <p className="text-sm text-miro-blue/60 dark:text-ink-light/60">
                      {card.back}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-medium text-miro-red">
                      {accuracy.toFixed(0)}% accuracy
                    </p>
                    <p className="text-xs text-miro-blue/50 dark:text-ink-light/50">
                      Ease: {avgEaseFactor.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-miro-blue/50 dark:text-ink-light/50 text-center py-8">
              No struggling cards! You're doing great!
            </p>
          )}
        </Card>

        {/* Mistake Patterns Analysis */}
        <div className="mb-8">
          <MistakePatterns />
        </div>

        {/* Tips */}
        <Card>
          <h2 className="text-xl font-bold text-miro-blue dark:text-ink-light mb-4">
            Learning Tips
          </h2>
          <div className="space-y-3 text-miro-blue/70 dark:text-ink-light/70">
            <p>
              <strong className="text-miro-blue dark:text-ink-light">Struggling cards:</strong> These cards have a low ease factor, meaning you've found them difficult. Try using different mnemonics or creating associations.
            </p>
            <p>
              <strong className="text-miro-blue dark:text-ink-light">Time to mastery:</strong> Cards are considered "mastered" when the review interval reaches 21+ days. Keep practicing consistently!
            </p>
            <p>
              <strong className="text-miro-blue dark:text-ink-light">Mixed mode:</strong> Using different study formats helps strengthen memory through varied retrieval practice.
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
