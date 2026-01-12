import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  TrendingDown,
  Target,
  Zap,
  Repeat,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useCardStore } from '../../stores/cardStore';
import {
  analyzeErrorPatterns,
  getMistakeTrend,
} from '../../services/mistakeAnalysisService';

// Miró-inspired color palette for error types
const ERROR_COLORS = {
  accent: '#FFB800',    // miro-yellow - accents are "close but not quite"
  spelling: '#F77F00',  // miro-orange - spelling needs attention
  gender: '#E63946',    // miro-red - gender is tricky
  wrong: '#1D3557',     // miro-blue - completely wrong
};

const ERROR_LABELS = {
  accent: 'Accent Errors',
  spelling: 'Spelling Errors',
  gender: 'Gender Confusion',
  wrong: 'Wrong Answers',
};

const ERROR_TIPS = {
  accent: 'Pay attention to à, é, è, í, ó, ò, ú and the unique l·l!',
  spelling: 'Try writing words by hand to reinforce muscle memory.',
  gender: 'Remember: most words ending in -a are feminine.',
  wrong: 'Review these cards more frequently with flashcard mode.',
};

export function MistakePatterns() {
  const navigate = useNavigate();
  const mistakeHistory = useCardStore((state) => state.mistakeHistory);
  const getWeaknessDeck = useCardStore((state) => state.getWeaknessDeck);

  // Analyze error patterns
  const analysis = useMemo(() => {
    return analyzeErrorPatterns(mistakeHistory);
  }, [mistakeHistory]);

  // Get 7-day trend data
  const trendData = useMemo(() => {
    return getMistakeTrend(mistakeHistory);
  }, [mistakeHistory]);

  // Prepare pie chart data
  const pieData = useMemo(() => {
    return [
      { name: 'Accent', value: analysis.accentErrors, color: ERROR_COLORS.accent },
      { name: 'Spelling', value: analysis.spellingErrors, color: ERROR_COLORS.spelling },
      { name: 'Gender', value: analysis.genderErrors, color: ERROR_COLORS.gender },
      { name: 'Wrong', value: analysis.wrongAnswers, color: ERROR_COLORS.wrong },
    ].filter(d => d.value > 0);
  }, [analysis]);

  // Format trend data for chart
  const chartData = useMemo(() => {
    return trendData.map(d => ({
      date: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
      total: d.count,
      accent: d.byType.accent,
      spelling: d.byType.spelling,
      gender: d.byType.gender,
      wrong: d.byType.wrong,
    }));
  }, [trendData]);

  const handlePracticeWeaknesses = () => {
    const weaknessDeck = getWeaknessDeck(20);
    if (weaknessDeck.length > 0) {
      // Navigate to study page - the weakness deck will be loaded
      navigate('/study?mode=weakness');
    }
  };

  const hasData = mistakeHistory.length > 0;
  const hasRecentMistakes = trendData.some(d => d.count > 0);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Empty state - no mistakes yet (this is good!)
  if (!hasData) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="text-center py-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-miro-green to-emerald-400 rounded-full flex items-center justify-center shadow-lg"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          <h3 className="text-2xl font-bold text-miro-blue dark:text-ink-light mb-3">
            No Mistakes Yet!
          </h3>
          <p className="text-miro-blue/60 dark:text-ink-light/60 max-w-md mx-auto mb-6">
            Start studying to see your mistake patterns here. Don't worry - mistakes
            are a natural part of learning!
          </p>
          <Button
            variant="secondary"
            onClick={() => navigate('/study')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Start Studying
          </Button>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header with Practice Button */}
      <motion.div variants={itemVariants} className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-miro-orange/10 dark:bg-miro-orange/20 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-miro-orange" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-miro-blue dark:text-ink-light">
              Mistake Patterns
            </h2>
            <p className="text-sm text-miro-blue/60 dark:text-ink-light/60">
              {analysis.total} mistakes analyzed
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          onClick={handlePracticeWeaknesses}
          leftIcon={<Target className="w-4 h-4" />}
        >
          Practice Weaknesses
        </Button>
      </motion.div>

      {/* Main Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Error Type Distribution */}
        <motion.div variants={itemVariants}>
          <Card>
            <h3 className="text-lg font-bold text-miro-blue dark:text-ink-light mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-miro-orange" />
              Error Breakdown
            </h3>
            {pieData.length > 0 ? (
              <>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            className="drop-shadow-sm"
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          borderRadius: '12px',
                          border: 'none',
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                        }}
                        formatter={(value: number, name: string) => [
                          `${value} mistakes`,
                          name,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend with tips */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {pieData.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                    >
                      <div
                        className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-miro-blue dark:text-ink-light">
                          {item.name}
                        </p>
                        <p className="text-xs text-miro-blue/50 dark:text-ink-light/50">
                          {item.value} ({Math.round((item.value / analysis.total) * 100)}%)
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-56 flex items-center justify-center text-miro-blue/50 dark:text-ink-light/50">
                No error data to display
              </div>
            )}
          </Card>
        </motion.div>

        {/* 7-Day Trend */}
        <motion.div variants={itemVariants}>
          <Card>
            <h3 className="text-lg font-bold text-miro-blue dark:text-ink-light mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-miro-yellow" />
              7-Day Trend
            </h3>
            {hasRecentMistakes ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E63946" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#E63946" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#1D3557', fontSize: 12, opacity: 0.6 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#1D3557', fontSize: 12, opacity: 0.6 }}
                      width={30}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#E63946"
                      strokeWidth={3}
                      fill="url(#colorTotal)"
                      dot={{ fill: '#E63946', strokeWidth: 0, r: 4 }}
                      activeDot={{ r: 6, fill: '#E63946' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 mb-4 bg-miro-green/10 dark:bg-miro-green/20 rounded-full flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-miro-green" />
                </div>
                <p className="text-miro-blue/60 dark:text-ink-light/60">
                  No mistakes this week!
                </p>
                <p className="text-sm text-miro-green font-medium mt-1">
                  You're on fire!
                </p>
              </div>
            )}
            {hasRecentMistakes && (
              <div className="mt-4 p-3 bg-miro-yellow/10 dark:bg-miro-yellow/5 rounded-xl">
                <p className="text-sm text-miro-blue/70 dark:text-ink-light/70">
                  <strong className="text-miro-blue dark:text-ink-light">Tip:</strong>{' '}
                  {analysis.mostCommonType && ERROR_TIPS[analysis.mostCommonType]}
                </p>
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Confusion Pairs */}
      {analysis.confusionPairs.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card>
            <h3 className="text-lg font-bold text-miro-blue dark:text-ink-light mb-4 flex items-center gap-2">
              <Repeat className="w-5 h-5 text-miro-red" />
              Words You Confuse
            </h3>
            <p className="text-sm text-miro-blue/60 dark:text-ink-light/60 mb-4">
              These word pairs trip you up the most. Focus on learning their differences!
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {analysis.confusionPairs.slice(0, 6).map((pair, index) => (
                <motion.div
                  key={`${pair.word1}-${pair.word2}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-miro-red/5 dark:bg-miro-red/10 rounded-xl border border-miro-red/20 dark:border-miro-red/30"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="font-medium text-miro-blue dark:text-ink-light truncate">
                      {pair.word1}
                    </span>
                    <div className="flex-shrink-0">
                      <Repeat className="w-4 h-4 text-miro-red/50" />
                    </div>
                    <span className="font-medium text-miro-blue dark:text-ink-light truncate">
                      {pair.word2}
                    </span>
                  </div>
                  <span className="ml-3 px-2.5 py-1 bg-miro-red/10 dark:bg-miro-red/20 rounded-full text-xs font-bold text-miro-red flex-shrink-0">
                    {pair.confusionCount}x
                  </span>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Most Common Error Type Highlight */}
      {analysis.mostCommonType && analysis.total >= 5 && (
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-r from-miro-orange/5 to-miro-yellow/5 dark:from-miro-orange/10 dark:to-miro-yellow/5 border border-miro-orange/20">
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${ERROR_COLORS[analysis.mostCommonType]}20` }}
              >
                <AlertTriangle
                  className="w-6 h-6"
                  style={{ color: ERROR_COLORS[analysis.mostCommonType] }}
                />
              </div>
              <div>
                <h4 className="font-bold text-miro-blue dark:text-ink-light mb-1">
                  Focus Area: {ERROR_LABELS[analysis.mostCommonType]}
                </h4>
                <p className="text-sm text-miro-blue/70 dark:text-ink-light/70 mb-3">
                  {(() => {
                    const count = analysis.mostCommonType === 'wrong'
                      ? analysis.wrongAnswers
                      : analysis.mostCommonType === 'accent'
                        ? analysis.accentErrors
                        : analysis.mostCommonType === 'spelling'
                          ? analysis.spellingErrors
                          : analysis.genderErrors;
                    return Math.round((count / analysis.total) * 100);
                  })()}% of your mistakes are {ERROR_LABELS[analysis.mostCommonType].toLowerCase()}.
                </p>
                <p className="text-sm text-miro-blue/60 dark:text-ink-light/60">
                  {ERROR_TIPS[analysis.mostCommonType]}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
