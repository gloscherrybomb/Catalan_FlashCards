/**
 * Adaptive Learning Store
 *
 * Zustand store for managing adaptive learning state including:
 * - Difficulty profile
 * - Learning style profile
 * - Weak spots and insights
 * - Performance history
 * - Recommendations
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { logger } from '../services/logger';
import { adaptiveLearningService } from '../services/adaptiveLearningService';
import { getPersistStorage } from '../utils/persistStorage';
import type {
  AdaptiveLearningState,
  WeakSpot,
  LearningInsight,
  SessionComposition,
  SessionPerformanceRecord,
  PerformanceTrends,
} from '../types/adaptiveLearning';
import {
  createDefaultAdaptiveLearningState,
  createDefaultDifficultyProfile,
  createDefaultLearningStyleProfile,
  getTimeOfDay,
} from '../types/adaptiveLearning';
import type { Flashcard, CardProgress, MistakeRecord, ConfusionPair, StudyMode } from '../types/flashcard';
import { ANALYSIS_CONFIG } from '../config/adaptiveConstants';

interface AdaptiveLearningStore extends AdaptiveLearningState {
  // Actions
  initialize: () => void;
  reset: () => void;

  // Analysis actions
  analyzePerformance: (
    flashcards: Flashcard[],
    cardProgress: Map<string, CardProgress>,
    mistakeHistory: MistakeRecord[],
    confusionPairs: ConfusionPair[]
  ) => void;

  // Session recording
  recordSession: (record: Omit<SessionPerformanceRecord, 'sessionId' | 'timestamp' | 'timeOfDay'>) => void;

  // Difficulty management
  checkAndAdjustDifficulty: (perfectStreak: number) => void;
  setDifficultyLevel: (level: number) => void;

  // Recommendations
  refreshRecommendations: (
    flashcards: Flashcard[],
    cardProgress: Map<string, CardProgress>,
    userProgress: { currentStreak: number; lastStudyDate: Date | null },
    dailyGoal: number
  ) => void;
  getSessionComposition: (
    flashcards: Flashcard[],
    cardProgress: Map<string, CardProgress>,
    targetCards: number
  ) => SessionComposition;

  // Insights management
  dismissInsight: (insightId: string) => void;
  markInsightActionTaken: (insightId: string) => void;

  // Learning style
  updateLearningStyleProfile: (cardProgress: Map<string, CardProgress>) => void;
  getRecommendedMode: (cardNeedsTyping: boolean) => StudyMode;

  // Getters
  getCriticalWeakSpots: () => WeakSpot[];
  getActiveInsights: () => LearningInsight[];
  shouldReanalyze: () => boolean;
}

export const useAdaptiveLearningStore = create<AdaptiveLearningStore>()(
  persist(
    (set, get) => ({
      // Initial state
      ...createDefaultAdaptiveLearningState(),

      // Initialize store
      initialize: () => {
        logger.info('Initializing adaptive learning store', 'AdaptiveLearning');
        const state = get();

        // Reset if no difficulty profile
        if (!state.difficultyProfile) {
          set({ difficultyProfile: createDefaultDifficultyProfile() });
        }

        // Reset if no learning style profile
        if (!state.learningStyleProfile) {
          set({ learningStyleProfile: createDefaultLearningStyleProfile() });
        }
      },

      // Reset store to defaults
      reset: () => {
        logger.info('Resetting adaptive learning store', 'AdaptiveLearning');
        set(createDefaultAdaptiveLearningState());
      },

      // Main analysis function
      analyzePerformance: (flashcards, cardProgress, mistakeHistory, confusionPairs) => {
        logger.info('Running adaptive performance analysis', 'AdaptiveLearning');
        const state = get();

        try {
          // Analyze category performance
          const categoryPerformances = adaptiveLearningService.analyzeCategoryPerformance(
            flashcards,
            cardProgress,
            mistakeHistory
          );

          // Analyze time-of-day performance
          const timePerformances = adaptiveLearningService.analyzeTimePerformance(
            state.performanceHistory
          );

          // Detect weak spots
          const weakSpots = adaptiveLearningService.detectWeakSpots(
            flashcards,
            cardProgress,
            mistakeHistory,
            state.performanceHistory,
            confusionPairs
          );

          // Update learning style if we have enough data
          let learningStyleProfile = state.learningStyleProfile;
          if (state.performanceHistory.length >= 5) {
            learningStyleProfile = adaptiveLearningService.detectLearningStyle(
              state.performanceHistory,
              cardProgress
            );
          }

          set({
            categoryPerformances,
            timePerformances,
            weakSpots,
            learningStyleProfile,
            lastAnalysisAt: new Date(),
            analysisVersion: state.analysisVersion + 1,
          });

          logger.info(
            `Analysis complete: ${weakSpots.length} weak spots detected`,
            'AdaptiveLearning'
          );
        } catch (error) {
          logger.error('Performance analysis failed', 'AdaptiveLearning', { error: String(error) });
        }
      },

      // Record session performance
      recordSession: (record) => {
        const state = get();
        const newRecord: SessionPerformanceRecord = {
          ...record,
          sessionId: `session-${Date.now()}`,
          timestamp: new Date(),
          timeOfDay: getTimeOfDay(),
        };

        // Add to history, keep last N records
        const updatedHistory = [
          ...state.performanceHistory.slice(-ANALYSIS_CONFIG.MAX_PERFORMANCE_HISTORY + 1),
          newRecord,
        ];

        // Update trends (simplified)
        const trends = calculateTrends(updatedHistory, state.trends);

        set({
          performanceHistory: updatedHistory,
          trends,
        });

        logger.debug('Session recorded for adaptive analysis', 'AdaptiveLearning', {
          sessionId: newRecord.sessionId,
          accuracy: record.accuracy,
          cardsReviewed: record.cardsReviewed,
        });
      },

      // Check and adjust difficulty
      checkAndAdjustDifficulty: (perfectStreak) => {
        const state = get();

        if (state.performanceHistory.length < 3) {
          return; // Not enough data
        }

        const newProfile = adaptiveLearningService.adjustDifficulty(
          state.difficultyProfile,
          state.performanceHistory,
          perfectStreak
        );

        if (newProfile.globalLevel !== state.difficultyProfile.globalLevel) {
          set({ difficultyProfile: newProfile });
        }
      },

      // Manually set difficulty level
      setDifficultyLevel: (level) => {
        const state = get();
        const clampedLevel = Math.max(1, Math.min(10, level));

        set({
          difficultyProfile: {
            ...state.difficultyProfile,
            globalLevel: clampedLevel,
            lastAdjustment: new Date(),
          },
        });
      },

      // Refresh daily recommendations
      refreshRecommendations: (flashcards, cardProgress, userProgress, dailyGoal) => {
        const state = get();

        const recommendations = adaptiveLearningService.generateDailyRecommendations(
          state.weakSpots,
          flashcards,
          cardProgress,
          state.learningStyleProfile,
          state.timePerformances,
          userProgress,
          dailyGoal
        );

        set({ currentRecommendations: recommendations });
      },

      // Get session composition
      getSessionComposition: (flashcards, cardProgress, targetCards) => {
        const state = get();

        return adaptiveLearningService.generateSessionComposition(
          flashcards,
          cardProgress,
          state.weakSpots,
          state.difficultyProfile.globalLevel,
          state.learningStyleProfile,
          targetCards
        );
      },

      // Dismiss an insight
      dismissInsight: (insightId) => {
        const state = get();
        set({
          insights: state.insights.map(i =>
            i.id === insightId ? { ...i, dismissed: true } : i
          ),
        });
      },

      // Mark insight action taken
      markInsightActionTaken: (insightId) => {
        const state = get();
        set({
          insights: state.insights.map(i =>
            i.id === insightId ? { ...i, actionTaken: true } : i
          ),
        });
      },

      // Update learning style profile
      updateLearningStyleProfile: (cardProgress) => {
        const state = get();

        if (state.performanceHistory.length < 5) {
          return; // Not enough data
        }

        const profile = adaptiveLearningService.detectLearningStyle(
          state.performanceHistory,
          cardProgress
        );

        set({ learningStyleProfile: profile });
      },

      // Get recommended mode
      getRecommendedMode: (cardNeedsTyping) => {
        const state = get();
        return adaptiveLearningService.recommendMode(
          state.learningStyleProfile,
          state.difficultyProfile.globalLevel,
          cardNeedsTyping
        );
      },

      // Get critical weak spots
      getCriticalWeakSpots: () => {
        const state = get();
        return state.weakSpots.filter(w => w.severity === 'critical');
      },

      // Get active (non-dismissed) insights
      getActiveInsights: () => {
        const state = get();
        const now = new Date();
        return state.insights.filter(
          i => !i.dismissed && new Date(i.expiresAt) > now
        );
      },

      // Check if reanalysis is needed
      shouldReanalyze: () => {
        const state = get();
        if (!state.lastAnalysisAt) return true;

        const timeSinceAnalysis = Date.now() - new Date(state.lastAnalysisAt).getTime();
        return timeSinceAnalysis > ANALYSIS_CONFIG.REANALYSIS_INTERVAL_MS;
      },
    }),
    {
      name: 'adaptive-learning-storage',
      storage: getPersistStorage(),
      partialize: (state) => ({
        difficultyProfile: state.difficultyProfile,
        learningStyleProfile: state.learningStyleProfile,
        categoryPerformances: state.categoryPerformances,
        timePerformances: state.timePerformances,
        weakSpots: state.weakSpots,
        insights: state.insights,
        currentRecommendations: state.currentRecommendations,
        performanceHistory: state.performanceHistory.slice(-50), // Keep last 50
        trends: state.trends,
        lastAnalysisAt: state.lastAnalysisAt,
        analysisVersion: state.analysisVersion,
      }),
    }
  )
);

// Helper function to calculate trends
function calculateTrends(
  history: SessionPerformanceRecord[],
  currentTrends: PerformanceTrends
): PerformanceTrends {
  if (history.length < ANALYSIS_CONFIG.MIN_TREND_DATA_POINTS) {
    return currentTrends;
  }

  // Get last 7 days of data for daily trends
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const recentSessions = history.filter(
    h => new Date(h.timestamp).getTime() > sevenDaysAgo
  );

  // Calculate daily aggregate
  const dailyMap = new Map<string, { accuracy: number; cards: number; time: number; count: number }>();

  for (const session of recentSessions) {
    const date = new Date(session.timestamp).toISOString().split('T')[0];
    const existing = dailyMap.get(date) || { accuracy: 0, cards: 0, time: 0, count: 0 };
    dailyMap.set(date, {
      accuracy: existing.accuracy + session.accuracy,
      cards: existing.cards + session.cardsReviewed,
      time: existing.time + session.duration,
      count: existing.count + 1,
    });
  }

  const daily = Array.from(dailyMap.entries()).map(([date, data]) => ({
    date,
    accuracy: data.accuracy / data.count,
    cardsReviewed: data.cards,
    timeSpentMs: data.time,
    newCardsMastered: 0, // Would need more data to calculate
  }));

  // Determine overall trends
  const sortedDaily = daily.sort((a, b) => a.date.localeCompare(b.date));
  let accuracyTrend: 'improving' | 'declining' | 'stable' = 'stable';

  if (sortedDaily.length >= 3) {
    const firstHalf = sortedDaily.slice(0, Math.floor(sortedDaily.length / 2));
    const secondHalf = sortedDaily.slice(Math.floor(sortedDaily.length / 2));

    const firstAvg = firstHalf.reduce((sum, d) => sum + d.accuracy, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, d) => sum + d.accuracy, 0) / secondHalf.length;

    if (secondAvg > firstAvg + 5) {
      accuracyTrend = 'improving';
    } else if (secondAvg < firstAvg - 5) {
      accuracyTrend = 'declining';
    }
  }

  // Calculate consistency score
  const recentAccuracies = recentSessions.map(s => s.accuracy);
  const avgAccuracy = recentAccuracies.reduce((a, b) => a + b, 0) / recentAccuracies.length;
  const variance =
    recentAccuracies.reduce((sum, a) => sum + Math.pow(a - avgAccuracy, 2), 0) /
    recentAccuracies.length;
  const consistencyScore = Math.max(0, 100 - Math.sqrt(variance));

  return {
    ...currentTrends,
    daily,
    overall: {
      accuracyTrend,
      speedTrend: 'stable', // Simplified
      consistencyScore,
      predictedMasteryDate: null, // Would need more complex calculation
    },
  };
}
