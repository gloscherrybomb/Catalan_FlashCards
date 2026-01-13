import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Target,
  Clock,
  Award,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useUserStore } from '../stores/userStore';
import { useCardStore } from '../stores/cardStore';
import { Card, CardTitle } from '../components/ui/Card';
import { ProgressRing } from '../components/ui/ProgressRing';

const COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95D5B2', '#F9844A', '#6366F1'];

export function StatsPage() {
  const progress = useUserStore((state) => state.progress);
  const flashcards = useCardStore((state) => state.flashcards);
  const getCategoryStats = useCardStore((state) => state.getCategoryStats);
  const getDueCount = useCardStore((state) => state.getDueCount);

  const getUniqueCardsDueCount = useCardStore((state) => state.getUniqueCardsDueCount);

  const categoryStats = getCategoryStats();
  const dueCount = getDueCount(); // Total review items (cards × 2 directions)
  const uniqueCardsDue = getUniqueCardsDueCount(); // Unique cards with at least one direction due

  // Calculate stats
  const accuracy = progress.totalCardsReviewed > 0
    ? Math.round((progress.totalCorrect / progress.totalCardsReviewed) * 100)
    : 0;

  const totalHours = Math.round(progress.totalTimeSpentMs / 1000 / 60 / 60 * 10) / 10;
  const avgTimePerCard = progress.totalCardsReviewed > 0
    ? Math.round(progress.totalTimeSpentMs / progress.totalCardsReviewed / 1000)
    : 0;

  // Category data for pie chart
  const categoryData = useMemo(() => {
    return Object.entries(categoryStats).map(([name, stats]) => ({
      name,
      value: stats.total,
      mastered: stats.mastered,
    }));
  }, [categoryStats]);

  // Weekly activity from real daily tracking data
  const weeklyData = useMemo(() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result: Array<{ day: string; cards: number; xp: number }> = [];
    const today = new Date();

    // Get the last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      const dayName = dayNames[date.getDay()];
      const activity = progress.dailyActivity?.[dateKey] || { cards: 0, xp: 0 };

      result.push({
        day: dayName,
        cards: activity.cards,
        xp: activity.xp,
      });
    }

    return result;
  }, [progress.dailyActivity]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Statistics</h1>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 bg-primary/10 rounded-xl flex items-center justify-center">
              <BarChart3 size={24} className="text-primary" />
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {progress.totalCardsReviewed}
            </p>
            <p className="text-sm text-gray-500">Cards Reviewed</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 bg-green-100 rounded-xl flex items-center justify-center">
              <Target size={24} className="text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{accuracy}%</p>
            <p className="text-sm text-gray-500">Accuracy</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-xl flex items-center justify-center">
              <Clock size={24} className="text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{totalHours}h</p>
            <p className="text-sm text-gray-500">Study Time</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 bg-purple-100 rounded-xl flex items-center justify-center">
              <Award size={24} className="text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {progress.cardsLearned}
            </p>
            <p className="text-sm text-gray-500">Cards Mastered</p>
          </Card>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Weekly activity chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardTitle>Weekly Activity</CardTitle>
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Bar
                    dataKey="cards"
                    fill="#FF6B6B"
                    radius={[4, 4, 0, 0]}
                    name="Cards"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Category breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardTitle>Cards by Category</CardTitle>
            <div className="h-64 mt-4">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {categoryData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No cards imported yet
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Mastery progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardTitle>Mastery Progress</CardTitle>
            <div className="mt-4 space-y-4">
              {Object.entries(categoryStats).slice(0, 5).map(([category, stats]) => {
                const progress = stats.total > 0
                  ? Math.round((stats.mastered / stats.total) * 100)
                  : 0;

                return (
                  <div key={category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{category}</span>
                      <span className="text-gray-500">{progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-secondary to-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                );
              })}

              {Object.keys(categoryStats).length === 0 && (
                <p className="text-gray-400 text-center py-8">
                  Start reviewing cards to see progress
                </p>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Review forecast */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardTitle>Upcoming Reviews</CardTitle>
            <div className="mt-4 flex items-center gap-6">
              <ProgressRing
                progress={Math.min(100, (uniqueCardsDue / 20) * 100)}
                size={100}
                color={uniqueCardsDue > 30 ? '#F9844A' : uniqueCardsDue > 10 ? '#FFE66D' : '#95D5B2'}
              >
                <span className="text-2xl font-bold text-gray-800">{uniqueCardsDue}</span>
              </ProgressRing>
              <div>
                <p className="font-medium text-gray-800">Cards due today</p>
                <p className="text-sm text-gray-500 mt-1">
                  {dueCount} reviews ({uniqueCardsDue} cards × 2 directions)
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {uniqueCardsDue === 0
                    ? "You're all caught up!"
                    : uniqueCardsDue <= 10
                    ? 'Light day ahead'
                    : uniqueCardsDue <= 30
                    ? 'Good practice session'
                    : 'Time to focus!'}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Additional stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="mt-6"
      >
        <Card>
          <CardTitle>Study Habits</CardTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-xl font-bold text-gray-800">{avgTimePerCard}s</p>
              <p className="text-sm text-gray-500">Avg. per card</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-xl font-bold text-gray-800">
                {progress.longestStreak}
              </p>
              <p className="text-sm text-gray-500">Best streak</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-xl font-bold text-gray-800">
                {flashcards.length}
              </p>
              <p className="text-sm text-gray-500">Total cards</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-xl font-bold text-gray-800">{progress.xp}</p>
              <p className="text-sm text-gray-500">Total XP</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
