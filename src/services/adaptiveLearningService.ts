/**
 * Adaptive Learning Service
 *
 * Core algorithms for personalizing the learning experience:
 * 1. Weak spot detection
 * 2. Dynamic difficulty adjustment
 * 3. Smart card scheduling
 * 4. Learning style detection
 * 5. Personalized recommendations
 */

import { logger } from './logger';
import type {
  Flashcard,
  CardProgress,
  MistakeRecord,
  MistakeType,
  StudyMode,
  StudyDirection,
  ConfusionPair,
} from '../types/flashcard';
import type {
  CategoryPerformance,
  TimePerformance,
  TimeOfDay,
  WeakSpot,
  InsightSeverity,
  DifficultyProfile,
  DifficultyAdjustment,
  LearningStyleProfile,
  LearningStyle,
  ModeEffectiveness,
  DailyRecommendation,
  StudyRecommendation,
  SessionPerformanceRecord,
  SessionComposition,
  SmartScheduleFactors,
} from '../types/adaptiveLearning';
import {
  getTimeOfDay,
  createDefaultLearningStyleProfile,
} from '../types/adaptiveLearning';
import {
  WEAK_SPOT_CONFIG,
  DIFFICULTY_CONFIG,
  SCHEDULING_CONFIG,
  LEARNING_STYLE_CONFIG,
  RECOMMENDATION_CONFIG,
  STYLE_MODE_MAPPING,
  DIFFICULTY_EFFECTS,
} from '../config/adaptiveConstants';
import { calculateSM2 } from './sm2Algorithm';

// =============================================================================
// WEAK SPOT DETECTION
// =============================================================================

/**
 * Analyze category performance from card progress and mistakes
 */
export function analyzeCategoryPerformance(
  flashcards: Flashcard[],
  cardProgress: Map<string, CardProgress>,
  mistakeHistory: MistakeRecord[]
): CategoryPerformance[] {
  const categoryMap = new Map<string, CategoryPerformance>();

  // Group cards by category
  for (const card of flashcards) {
    if (!categoryMap.has(card.category)) {
      categoryMap.set(card.category, {
        category: card.category,
        totalCards: 0,
        reviewedCards: 0,
        correctCount: 0,
        incorrectCount: 0,
        averageEaseFactor: 0,
        averageResponseTimeMs: 0,
        masteredCount: 0,
        strugglingCount: 0,
        lastReviewed: null,
        errorTypeDistribution: { accent: 0, spelling: 0, gender: 0, wrong: 0 },
        trendDirection: 'stable',
        confidenceScore: 0,
      });
    }

    const catStats = categoryMap.get(card.category)!;
    catStats.totalCards++;

    // Check progress for both directions
    for (const direction of ['english-to-catalan', 'catalan-to-english'] as StudyDirection[]) {
      const key = `${card.id}_${direction}`;
      const progress = cardProgress.get(key);

      if (progress && progress.totalReviews > 0) {
        catStats.reviewedCards++;
        catStats.correctCount += progress.correctReviews;
        catStats.incorrectCount += progress.totalReviews - progress.correctReviews;
        catStats.averageEaseFactor += progress.easeFactor;

        if (progress.interval >= 21) {
          catStats.masteredCount++;
        } else if (progress.easeFactor < WEAK_SPOT_CONFIG.WEAK_EASE_FACTOR_THRESHOLD) {
          catStats.strugglingCount++;
        }

        if (progress.lastReviewDate) {
          if (!catStats.lastReviewed || progress.lastReviewDate > catStats.lastReviewed) {
            catStats.lastReviewed = progress.lastReviewDate;
          }
        }
      }
    }
  }

  // Calculate averages and analyze mistakes
  for (const [category, stats] of categoryMap) {
    if (stats.reviewedCards > 0) {
      stats.averageEaseFactor /= stats.reviewedCards;
    } else {
      stats.averageEaseFactor = 2.5; // Default
    }

    // Count mistakes by type for this category
    const categoryMistakes = mistakeHistory.filter(m => {
      const card = flashcards.find(f => f.id === m.cardId);
      return card?.category === category;
    });

    for (const mistake of categoryMistakes) {
      stats.errorTypeDistribution[mistake.errorType]++;
    }

    // Calculate confidence score based on sample size
    const totalInteractions = stats.correctCount + stats.incorrectCount;
    stats.confidenceScore = Math.min(
      100,
      (totalInteractions / WEAK_SPOT_CONFIG.CONFIDENCE_SAMPLE_CURVE) * 100
    );

    // Determine trend (simplified - compare recent vs older performance)
    const recentMistakes = categoryMistakes.filter(
      m => Date.now() - new Date(m.timestamp).getTime() < 7 * 24 * 60 * 60 * 1000
    ).length;
    const olderMistakes = categoryMistakes.filter(
      m => Date.now() - new Date(m.timestamp).getTime() >= 7 * 24 * 60 * 60 * 1000
    ).length;

    if (totalInteractions >= WEAK_SPOT_CONFIG.MIN_SAMPLES_FOR_ANALYSIS) {
      if (recentMistakes < olderMistakes * 0.7) {
        stats.trendDirection = 'improving';
      } else if (recentMistakes > olderMistakes * 1.3) {
        stats.trendDirection = 'declining';
      }
    }
  }

  return Array.from(categoryMap.values());
}

/**
 * Analyze time-of-day performance patterns
 */
export function analyzeTimePerformance(
  sessionHistory: SessionPerformanceRecord[]
): TimePerformance[] {
  const timeStats: Record<TimeOfDay, TimePerformance> = {
    morning: { timeOfDay: 'morning', sessionsCount: 0, averageAccuracy: 0, averageResponseTimeMs: 0, averageCardsPerSession: 0, optimalScore: 0 },
    afternoon: { timeOfDay: 'afternoon', sessionsCount: 0, averageAccuracy: 0, averageResponseTimeMs: 0, averageCardsPerSession: 0, optimalScore: 0 },
    evening: { timeOfDay: 'evening', sessionsCount: 0, averageAccuracy: 0, averageResponseTimeMs: 0, averageCardsPerSession: 0, optimalScore: 0 },
    night: { timeOfDay: 'night', sessionsCount: 0, averageAccuracy: 0, averageResponseTimeMs: 0, averageCardsPerSession: 0, optimalScore: 0 },
  };

  // Accumulate stats by time of day
  for (const session of sessionHistory) {
    const stats = timeStats[session.timeOfDay];
    stats.sessionsCount++;
    stats.averageAccuracy += session.accuracy;
    stats.averageResponseTimeMs += session.averageResponseTimeMs;
    stats.averageCardsPerSession += session.cardsReviewed;
  }

  // Calculate averages and optimal scores
  for (const time of Object.keys(timeStats) as TimeOfDay[]) {
    const stats = timeStats[time];
    if (stats.sessionsCount > 0) {
      stats.averageAccuracy /= stats.sessionsCount;
      stats.averageResponseTimeMs /= stats.sessionsCount;
      stats.averageCardsPerSession /= stats.sessionsCount;

      // Calculate optimal score (weighted: accuracy 60%, speed 30%, cards 10%)
      const speedScore = Math.max(0, 100 - stats.averageResponseTimeMs / 100);
      stats.optimalScore =
        stats.averageAccuracy * 0.6 +
        speedScore * 0.3 +
        Math.min(100, stats.averageCardsPerSession * 5) * 0.1;
    }
  }

  return Object.values(timeStats);
}

/**
 * Detect weak spots from performance analysis
 */
export function detectWeakSpots(
  flashcards: Flashcard[],
  cardProgress: Map<string, CardProgress>,
  mistakeHistory: MistakeRecord[],
  sessionHistory: SessionPerformanceRecord[],
  confusionPairs: ConfusionPair[]
): WeakSpot[] {
  const weakSpots: WeakSpot[] = [];

  // 1. Category-based weak spots
  const categoryStats = analyzeCategoryPerformance(flashcards, cardProgress, mistakeHistory);

  for (const cat of categoryStats) {
    if (cat.reviewedCards < WEAK_SPOT_CONFIG.MIN_CATEGORY_SAMPLES) continue;

    const accuracy = cat.correctCount / (cat.correctCount + cat.incorrectCount);
    const isWeakEase = cat.averageEaseFactor < WEAK_SPOT_CONFIG.WEAK_EASE_FACTOR_THRESHOLD;
    const isWeakAccuracy = accuracy < WEAK_SPOT_CONFIG.WEAK_ACCURACY_THRESHOLD;

    if (isWeakEase || isWeakAccuracy) {
      const score = calculateWeaknessScore(cat.averageEaseFactor, accuracy, cat.strugglingCount);

      weakSpots.push({
        id: `category-${cat.category.toLowerCase().replace(/\s+/g, '-')}`,
        type: 'category',
        target: cat.category,
        severity: getSeverity(score),
        score,
        description: `Struggling with ${cat.category} cards (${Math.round(accuracy * 100)}% accuracy)`,
        suggestedAction: `Focus on ${cat.category} with intensive typing practice`,
        affectedCardIds: getCardIdsForCategory(flashcards, cat.category),
        detectedAt: new Date(),
        lastUpdated: new Date(),
      });
    }
  }

  // 2. Error type weak spots
  const errorCounts: Record<MistakeType, number> = { accent: 0, spelling: 0, gender: 0, wrong: 0 };
  for (const mistake of mistakeHistory.slice(-200)) {
    errorCounts[mistake.errorType]++;
  }

  const totalErrors = Object.values(errorCounts).reduce((a, b) => a + b, 0);
  if (totalErrors >= WEAK_SPOT_CONFIG.MIN_SAMPLES_FOR_ANALYSIS) {
    for (const [errorType, count] of Object.entries(errorCounts) as [MistakeType, number][]) {
      const ratio = count / totalErrors;
      if (ratio > WEAK_SPOT_CONFIG.ERROR_TYPE_DOMINANCE_THRESHOLD) {
        const score = ratio * 100;

        weakSpots.push({
          id: `error-${errorType}`,
          type: 'error_type',
          target: errorType,
          severity: getSeverity(score),
          score,
          description: getErrorTypeDescription(errorType),
          suggestedAction: getErrorTypeAction(errorType),
          affectedCardIds: getCardsWithErrorType(mistakeHistory, errorType),
          detectedAt: new Date(),
          lastUpdated: new Date(),
        });
      }
    }
  }

  // 3. Time-based weak spots
  const timeStats = analyzeTimePerformance(sessionHistory);
  const bestTime = timeStats.reduce((a, b) => (a.optimalScore > b.optimalScore ? a : b));

  for (const time of timeStats) {
    if (time.sessionsCount < 3) continue;
    const accuracyDiff = (bestTime.averageAccuracy - time.averageAccuracy) / 100;
    if (accuracyDiff > WEAK_SPOT_CONFIG.TIME_ACCURACY_DIFFERENCE_THRESHOLD) {
      const score = accuracyDiff * 100;

      weakSpots.push({
        id: `time-${time.timeOfDay}`,
        type: 'time_based',
        target: time.timeOfDay,
        severity: 'info',
        score,
        description: `Lower performance during ${time.timeOfDay} sessions`,
        suggestedAction: `Try studying during ${bestTime.timeOfDay} for better results`,
        affectedCardIds: [],
        detectedAt: new Date(),
        lastUpdated: new Date(),
      });
    }
  }

  // 4. Confusion pairs weak spots
  const significantConfusions = confusionPairs.filter(p => p.confusionCount >= 3);
  for (const pair of significantConfusions.slice(0, 5)) {
    weakSpots.push({
      id: `confusion-${pair.word1}-${pair.word2}`,
      type: 'category',
      target: `${pair.word1} / ${pair.word2}`,
      severity: pair.confusionCount >= 5 ? 'warning' : 'info',
      score: Math.min(100, pair.confusionCount * 15),
      description: `Often confusing "${pair.word1}" with "${pair.word2}"`,
      suggestedAction: 'Practice these words separately to strengthen distinction',
      affectedCardIds: [],
      detectedAt: new Date(),
      lastUpdated: new Date(),
    });
  }

  return weakSpots.sort((a, b) => b.score - a.score);
}

// =============================================================================
// DIFFICULTY ADJUSTMENT
// =============================================================================

/**
 * Adjust difficulty based on recent performance
 */
export function adjustDifficulty(
  currentProfile: DifficultyProfile,
  recentSessions: SessionPerformanceRecord[],
  perfectStreak: number
): DifficultyProfile {
  if (recentSessions.length < DIFFICULTY_CONFIG.MIN_SESSIONS_FOR_ADJUSTMENT) {
    return currentProfile;
  }

  const sessionsToAnalyze = recentSessions.slice(-DIFFICULTY_CONFIG.RECENT_SESSIONS_WINDOW);

  // Calculate weighted rolling accuracy (more recent = higher weight)
  let weightedAccuracy = 0;
  let weightSum = 0;
  sessionsToAnalyze.forEach((session, i) => {
    const weight = i + 1;
    weightedAccuracy += session.accuracy * weight;
    weightSum += weight;
  });
  const rollingAccuracy = weightedAccuracy / weightSum;

  // Calculate average response time
  const avgResponseTime =
    sessionsToAnalyze.reduce((sum, s) => sum + s.averageResponseTimeMs, 0) /
    sessionsToAnalyze.length;

  let newLevel = currentProfile.globalLevel;
  let reason = '';

  // Increase difficulty conditions
  if (
    rollingAccuracy >= DIFFICULTY_CONFIG.ACCURACY_THRESHOLD_INCREASE &&
    avgResponseTime < DIFFICULTY_CONFIG.RESPONSE_TIME_FAST_MS &&
    perfectStreak >= 5
  ) {
    newLevel = Math.min(DIFFICULTY_CONFIG.MAX_DIFFICULTY_LEVEL, currentProfile.globalLevel + 1);
    reason = 'Excellent performance - increasing challenge';
  } else if (
    rollingAccuracy >= 85 &&
    perfectStreak >= DIFFICULTY_CONFIG.PERFECT_STREAK_THRESHOLD
  ) {
    newLevel = Math.min(DIFFICULTY_CONFIG.MAX_DIFFICULTY_LEVEL, currentProfile.globalLevel + 1);
    reason = 'Strong streak - you\'re ready for more';
  }

  // Decrease difficulty conditions
  else if (rollingAccuracy < DIFFICULTY_CONFIG.ACCURACY_THRESHOLD_DECREASE) {
    newLevel = Math.max(DIFFICULTY_CONFIG.MIN_DIFFICULTY_LEVEL, currentProfile.globalLevel - 1);
    reason = 'Adjusting to improve learning flow';
  } else if (
    avgResponseTime > DIFFICULTY_CONFIG.RESPONSE_TIME_SLOW_MS &&
    rollingAccuracy < 75
  ) {
    newLevel = Math.max(DIFFICULTY_CONFIG.MIN_DIFFICULTY_LEVEL, currentProfile.globalLevel - 1);
    reason = 'Taking time to think - let\'s reinforce basics';
  }

  // If no change, return current profile
  if (newLevel === currentProfile.globalLevel) {
    return currentProfile;
  }

  // Apply smoothing
  newLevel = Math.round(
    currentProfile.globalLevel * (1 - DIFFICULTY_CONFIG.SMOOTHING_FACTOR) +
      newLevel * DIFFICULTY_CONFIG.SMOOTHING_FACTOR
  );

  // Ensure bounds
  newLevel = Math.max(
    DIFFICULTY_CONFIG.MIN_DIFFICULTY_LEVEL,
    Math.min(DIFFICULTY_CONFIG.MAX_DIFFICULTY_LEVEL, newLevel)
  );

  const adjustment: DifficultyAdjustment = {
    timestamp: new Date(),
    previousLevel: currentProfile.globalLevel,
    newLevel,
    reason,
    triggerMetrics: {
      recentAccuracy: rollingAccuracy,
      averageResponseTime: avgResponseTime,
      streakLength: perfectStreak,
    },
  };

  logger.info('Difficulty adjusted', 'AdaptiveLearning', {
    from: currentProfile.globalLevel,
    to: newLevel,
    reason,
  });

  return {
    ...currentProfile,
    globalLevel: newLevel,
    recentTrend:
      newLevel > currentProfile.globalLevel
        ? 'up'
        : newLevel < currentProfile.globalLevel
        ? 'down'
        : 'stable',
    lastAdjustment: new Date(),
    adjustmentHistory: [
      ...currentProfile.adjustmentHistory.slice(-DIFFICULTY_CONFIG.MAX_ADJUSTMENT_HISTORY + 1),
      adjustment,
    ],
  };
}

// =============================================================================
// SMART SCHEDULING
// =============================================================================

/**
 * Calculate smart scheduling factors for a card
 */
export function calculateSmartScheduleFactors(
  card: Flashcard,
  progress: CardProgress,
  quality: number,
  context: {
    timePerformances: TimePerformance[];
    categoryPerformances: CategoryPerformance[];
    recentMistakes: MistakeRecord[];
    confusionPairs: ConfusionPair[];
    cardsReviewedThisSession: number;
  }
): SmartScheduleFactors {
  // Get base SM-2 calculation
  const baseResult = calculateSM2(progress, quality);
  const baseInterval = baseResult.interval;

  // 1. Time-of-Day Factor
  const currentTime = getTimeOfDay();
  const timePerf = context.timePerformances.find(t => t.timeOfDay === currentTime);
  const optimalTimePerf = context.timePerformances.reduce(
    (a, b) => (a.optimalScore > b.optimalScore ? a : b),
    context.timePerformances[0]
  );

  let timeMultiplier = 1.0;
  if (timePerf && optimalTimePerf && optimalTimePerf.averageAccuracy > 0) {
    timeMultiplier =
      SCHEDULING_CONFIG.TIME_MULTIPLIER_MIN +
      (timePerf.averageAccuracy / optimalTimePerf.averageAccuracy) *
        (SCHEDULING_CONFIG.TIME_MULTIPLIER_MAX - SCHEDULING_CONFIG.TIME_MULTIPLIER_MIN);
  }

  // 2. Category Difficulty Weighting
  const categoryPerf = context.categoryPerformances.find(c => c.category === card.category);
  let categoryMultiplier = 1.0;
  if (categoryPerf) {
    const easeDiff = categoryPerf.averageEaseFactor - 1.3; // Offset from minimum
    const easeRange = 2.5 - 1.3; // Range of ease factors
    categoryMultiplier =
      SCHEDULING_CONFIG.CATEGORY_MULTIPLIER_HARD +
      (easeDiff / easeRange) *
        (SCHEDULING_CONFIG.CATEGORY_MULTIPLIER_EASY - SCHEDULING_CONFIG.CATEGORY_MULTIPLIER_HARD);
  }

  // 3. Mistake History Influence
  const recentCardMistakes = context.recentMistakes.filter(m => m.cardId === card.id).length;
  const mistakeMultiplier = Math.max(
    1 - SCHEDULING_CONFIG.MISTAKE_PENALTY_MAX,
    1 - recentCardMistakes * SCHEDULING_CONFIG.MISTAKE_PENALTY_PER_RECENT
  );

  // 4. Interference Factor
  const hasConfusion = context.confusionPairs.some(
    p => p.word1 === card.back || p.word2 === card.back
  );
  const interferenceMultiplier = hasConfusion
    ? 1 - SCHEDULING_CONFIG.INTERFERENCE_PENALTY
    : 1.0;

  // 5. Fatigue Adjustment
  let fatigueMultiplier = 1.0;
  if (context.cardsReviewedThisSession > SCHEDULING_CONFIG.FATIGUE_THRESHOLD_CARDS) {
    const cardsOver = context.cardsReviewedThisSession - SCHEDULING_CONFIG.FATIGUE_THRESHOLD_CARDS;
    fatigueMultiplier = Math.max(
      1 - SCHEDULING_CONFIG.FATIGUE_PENALTY_MAX,
      1 - cardsOver * SCHEDULING_CONFIG.FATIGUE_PENALTY
    );
  }

  return {
    baseInterval,
    timeOfDayMultiplier: timeMultiplier,
    categoryDifficultyMultiplier: categoryMultiplier,
    mistakeRecencyMultiplier: mistakeMultiplier,
    interferenceFactor: interferenceMultiplier,
    fatigueAdjustment: fatigueMultiplier,
  };
}

/**
 * Apply smart scheduling factors to get adjusted interval
 */
export function applySmartScheduling(factors: SmartScheduleFactors): number {
  const adjustedInterval = Math.round(
    factors.baseInterval *
      factors.timeOfDayMultiplier *
      factors.categoryDifficultyMultiplier *
      factors.mistakeRecencyMultiplier *
      factors.interferenceFactor *
      factors.fatigueAdjustment
  );

  return Math.max(1, adjustedInterval); // Minimum 1 day
}

// =============================================================================
// LEARNING STYLE DETECTION
// =============================================================================

/**
 * Detect learning style from session history
 */
export function detectLearningStyle(
  sessionHistory: SessionPerformanceRecord[],
  _cardProgress: Map<string, CardProgress>
): LearningStyleProfile {
  if (sessionHistory.length < LEARNING_STYLE_CONFIG.MIN_SESSIONS_FOR_DETECTION) {
    return createDefaultLearningStyleProfile();
  }

  const modeStats = new Map<StudyMode, ModeEffectiveness>();
  const modes: StudyMode[] = [
    'flip',
    'multiple-choice',
    'type-answer',
    'listening',
    'dictation',
    'speak',
  ];

  // Calculate effectiveness for each mode
  for (const mode of modes) {
    const modeSessions = sessionHistory.filter(s => s.mode === mode);
    if (modeSessions.length < 3) continue;

    const avgAccuracy =
      modeSessions.reduce((sum, s) => sum + s.accuracy, 0) / modeSessions.length;
    const avgQuality =
      modeSessions.reduce((sum, s) => sum + s.averageQuality, 0) / modeSessions.length;
    const avgResponseTime =
      modeSessions.reduce((sum, s) => sum + s.averageResponseTimeMs, 0) / modeSessions.length;
    const totalCards = modeSessions.reduce((sum, s) => sum + s.cardsReviewed, 0);

    // Estimate retention rate (simplified - based on quality)
    const retentionRate = Math.min(100, avgQuality * 20);

    // Composite effectiveness score
    const speedScore = Math.max(
      0,
      100 - avgResponseTime / LEARNING_STYLE_CONFIG.MAX_RESPONSE_TIME_MS * 100
    );
    const effectivenessScore =
      avgAccuracy * LEARNING_STYLE_CONFIG.ACCURACY_WEIGHT +
      retentionRate * LEARNING_STYLE_CONFIG.RETENTION_WEIGHT +
      (avgQuality / 5) * 100 * LEARNING_STYLE_CONFIG.QUALITY_WEIGHT +
      speedScore * LEARNING_STYLE_CONFIG.ENGAGEMENT_WEIGHT;

    modeStats.set(mode, {
      mode,
      sessionsCount: modeSessions.length,
      cardsReviewed: totalCards,
      averageAccuracy: avgAccuracy,
      averageQuality: avgQuality,
      retentionRate,
      averageResponseTimeMs: avgResponseTime,
      effectivenessScore,
    });
  }

  // Map modes to learning styles
  const styleScores: Record<LearningStyle, number> = {
    visual: 0,
    auditory: 0,
    kinesthetic: 0,
    reading: 0,
  };

  for (const [style, styleModes] of Object.entries(STYLE_MODE_MAPPING)) {
    const modeEffectivenesses = styleModes
      .map(m => modeStats.get(m as StudyMode))
      .filter((e): e is ModeEffectiveness => e !== undefined);

    if (modeEffectivenesses.length > 0) {
      styleScores[style as LearningStyle] =
        modeEffectivenesses.reduce((sum, e) => sum + e.effectivenessScore, 0) /
        modeEffectivenesses.length;
    }
  }

  // Sort styles by score
  const sortedStyles = (Object.entries(styleScores) as [LearningStyle, number][]).sort(
    (a, b) => b[1] - a[1]
  );

  // Calculate confidence based on total sessions
  const confidence = Math.min(100, sessionHistory.length / LEARNING_STYLE_CONFIG.MIN_MODE_SAMPLES * 100);

  return {
    primaryStyle: sortedStyles[0][0],
    secondaryStyle: sortedStyles[1][1] > 50 ? sortedStyles[1][0] : null,
    styleScores,
    modeEffectiveness: Object.fromEntries(modeStats) as Record<StudyMode, ModeEffectiveness>,
    lastUpdated: new Date(),
    confidenceLevel: confidence,
  };
}

/**
 * Recommend study mode based on learning style
 */
export function recommendMode(
  learningStyle: LearningStyleProfile,
  difficultyLevel: number,
  cardNeedsTyping: boolean
): StudyMode {
  // If card requires typing, override style preference
  if (cardNeedsTyping) {
    return 'type-answer';
  }

  // Get modes for primary style
  const primaryModes = STYLE_MODE_MAPPING[learningStyle.primaryStyle] as readonly string[];

  // Adjust for difficulty level
  const easyLevels = DIFFICULTY_EFFECTS.EASY_MODE_LEVELS as readonly number[];
  const hardLevels = DIFFICULTY_EFFECTS.HARD_MODE_LEVELS as readonly number[];

  if (easyLevels.includes(difficultyLevel)) {
    // Prefer easier modes
    if (primaryModes.includes('flip')) return 'flip';
    if (primaryModes.includes('multiple-choice')) return 'multiple-choice';
  } else if (hardLevels.includes(difficultyLevel)) {
    // Prefer harder modes
    if (primaryModes.includes('type-answer')) return 'type-answer';
    if (primaryModes.includes('dictation')) return 'dictation';
  }

  // Default to first mode for primary style
  return primaryModes[0] as StudyMode;
}

// =============================================================================
// RECOMMENDATIONS
// =============================================================================

/**
 * Generate daily study recommendations
 */
export function generateDailyRecommendations(
  weakSpots: WeakSpot[],
  flashcards: Flashcard[],
  cardProgress: Map<string, CardProgress>,
  _learningStyle: LearningStyleProfile,
  timePerformances: TimePerformance[],
  userProgress: { currentStreak: number; lastStudyDate: Date | null },
  dailyGoal: number
): DailyRecommendation {
  const recommendations: StudyRecommendation[] = [];
  const today = new Date().toISOString().split('T')[0];

  // Check if studied today
  const hasStudiedToday =
    userProgress.lastStudyDate &&
    userProgress.lastStudyDate.toISOString().split('T')[0] === today;

  // Priority 1: Streak protection
  if (
    userProgress.currentStreak >= RECOMMENDATION_CONFIG.STREAK_RISK_THRESHOLD &&
    !hasStudiedToday
  ) {
    recommendations.push({
      id: 'streak-protect',
      priority: 1,
      type: 'review_due',
      title: 'Protect Your Streak!',
      description: `You're on a ${userProgress.currentStreak}-day streak. Complete a quick review!`,
      suggestedCardCount: Math.min(10, Math.ceil(dailyGoal / 2)),
      estimatedTimeMinutes: 5,
      expectedBenefit: 'Maintain learning momentum',
      reasoning: 'Streak protection is key to long-term success',
    });
  }

  // Priority 2: Critical weak spots
  const criticalWeakSpots = weakSpots.filter(w => w.severity === 'critical');
  for (const weakSpot of criticalWeakSpots.slice(0, 2)) {
    recommendations.push({
      id: `weakness-${weakSpot.id}`,
      priority: 2,
      type: 'weakness_drill',
      title: `Focus on ${weakSpot.target}`,
      description: weakSpot.description,
      targetCategory: weakSpot.type === 'category' ? weakSpot.target : undefined,
      suggestedCardCount: Math.min(15, weakSpot.affectedCardIds.length),
      estimatedTimeMinutes: 10,
      expectedBenefit: weakSpot.suggestedAction,
      reasoning: `This area needs attention (score: ${Math.round(weakSpot.score)})`,
    });
  }

  // Priority 3: Category focus for warning-level weak spots
  const warningWeakSpots = weakSpots.filter(
    w => w.type === 'category' && w.severity === 'warning'
  );
  if (warningWeakSpots.length > 0) {
    const topCategory = warningWeakSpots[0];
    recommendations.push({
      id: `category-focus-${topCategory.target}`,
      priority: 3,
      type: 'category_focus',
      title: `${topCategory.target} Boot Camp`,
      description: `Intensive practice to strengthen your ${topCategory.target.toLowerCase()} vocabulary`,
      targetCategory: topCategory.target,
      suggestedCardCount: 20,
      estimatedTimeMinutes: 15,
      expectedBenefit: 'Build confidence in this category',
      reasoning: 'Focused practice accelerates mastery',
    });
  }

  // Priority 4: Standard review
  let dueCount = 0;
  for (const [, progress] of cardProgress) {
    if (progress.nextReviewDate <= new Date()) {
      dueCount++;
    }
  }

  if (dueCount > 0) {
    recommendations.push({
      id: 'daily-review',
      priority: 4,
      type: 'review_due',
      title: 'Daily Review',
      description: `${dueCount} cards are waiting for review`,
      suggestedCardCount: Math.min(dueCount, dailyGoal),
      estimatedTimeMinutes: Math.ceil(
        (Math.min(dueCount, dailyGoal) * RECOMMENDATION_CONFIG.SECONDS_PER_CARD_ESTIMATE) / 60
      ),
      expectedBenefit: 'Maintain and strengthen memory',
      reasoning: 'Consistent review is the core of spaced repetition',
    });
  }

  // Priority 5: New cards (if capacity)
  const newCardCount = flashcards.filter(f => {
    const engKey = `${f.id}_english-to-catalan`;
    const catKey = `${f.id}_catalan-to-english`;
    const engProgress = cardProgress.get(engKey);
    const catProgress = cardProgress.get(catKey);
    return (!engProgress || engProgress.repetitions === 0) && (!catProgress || catProgress.repetitions === 0);
  }).length;

  if (newCardCount > 0 && dueCount < dailyGoal * 0.8) {
    const newCardsToAdd = Math.min(5, newCardCount);
    recommendations.push({
      id: 'new-cards',
      priority: 5,
      type: 'new_cards',
      title: 'Learn New Words',
      description: `${newCardCount} new words available to learn`,
      suggestedCardCount: newCardsToAdd,
      estimatedTimeMinutes: newCardsToAdd * 2,
      expectedBenefit: 'Expand your vocabulary',
      reasoning: 'New cards are introduced gradually for optimal retention',
    });
  }

  // Determine optimal time slots
  const optimalSlots = timePerformances
    .filter(t => t.sessionsCount > 0)
    .sort((a, b) => b.optimalScore - a.optimalScore)
    .slice(0, 2)
    .map(t => t.timeOfDay);

  return {
    id: `daily-${today}`,
    date: today,
    recommendations: recommendations.slice(0, RECOMMENDATION_CONFIG.MAX_DAILY_RECOMMENDATIONS),
    focusAreas: weakSpots.slice(0, 3).map(w => w.target),
    suggestedDuration: recommendations.reduce((sum, r) => sum + r.estimatedTimeMinutes, 0),
    optimalTimeSlots: optimalSlots.length > 0 ? optimalSlots : ['morning', 'evening'],
    generatedAt: new Date(),
  };
}

/**
 * Generate session composition based on adaptive analysis
 */
export function generateSessionComposition(
  flashcards: Flashcard[],
  cardProgress: Map<string, CardProgress>,
  weakSpots: WeakSpot[],
  difficultyLevel: number,
  learningStyle: LearningStyleProfile,
  targetCards: number
): SessionComposition {
  // Calculate ratios based on difficulty
  const isAdvanced = difficultyLevel >= 7;
  const newCardRatio = isAdvanced
    ? RECOMMENDATION_CONFIG.NEW_CARD_RATIO_ADVANCED
    : RECOMMENDATION_CONFIG.NEW_CARD_RATIO_BEGINNER;

  // Get weakness card IDs
  const weaknessCardIds = new Set(weakSpots.flatMap(w => w.affectedCardIds));

  // Count due cards
  let dueCards = 0;
  let newCards = 0;

  for (const card of flashcards) {
    const engKey = `${card.id}_english-to-catalan`;
    const engProgress = cardProgress.get(engKey);

    if (!engProgress || engProgress.repetitions === 0) {
      newCards++;
    } else if (engProgress.nextReviewDate <= new Date()) {
      dueCards++;
    }
  }

  // Calculate composition
  const totalCards = Math.min(targetCards, flashcards.length * 2);
  const newCardCount = Math.min(Math.ceil(totalCards * newCardRatio), newCards);
  const weaknessCardCount = Math.min(
    Math.ceil(totalCards * RECOMMENDATION_CONFIG.WEAKNESS_CARD_RATIO),
    weaknessCardIds.size
  );
  const reviewCardCount = totalCards - newCardCount - weaknessCardCount;

  // Category breakdown (simplified)
  const categoryBreakdown: Record<string, number> = {};
  for (const card of flashcards.slice(0, totalCards)) {
    categoryBreakdown[card.category] = (categoryBreakdown[card.category] || 0) + 1;
  }

  // Mode breakdown based on learning style
  const modeBreakdown: Record<StudyMode, number> = {
    flip: 0,
    'multiple-choice': 0,
    'type-answer': 0,
    mixed: 0,
    listening: 0,
    sentences: 0,
    dictation: 0,
    speak: 0,
  };

  const primaryModes = STYLE_MODE_MAPPING[learningStyle.primaryStyle];
  const secondaryModes = learningStyle.secondaryStyle
    ? STYLE_MODE_MAPPING[learningStyle.secondaryStyle]
    : [];

  const primaryCount = Math.ceil(totalCards * LEARNING_STYLE_CONFIG.PRIMARY_STYLE_RATIO);
  const secondaryCount = Math.ceil(totalCards * LEARNING_STYLE_CONFIG.SECONDARY_STYLE_RATIO);

  modeBreakdown[primaryModes[0] as StudyMode] = primaryCount;
  if (secondaryModes.length > 0) {
    modeBreakdown[secondaryModes[0] as StudyMode] = secondaryCount;
  }
  modeBreakdown.mixed = totalCards - primaryCount - secondaryCount;

  // Difficulty distribution
  const easyRatio = Math.max(0.2, 0.5 - difficultyLevel * 0.03);
  const hardRatio = Math.min(0.5, 0.1 + difficultyLevel * 0.04);

  return {
    totalCards,
    newCards: newCardCount,
    reviewCards: reviewCardCount,
    weaknessCards: weaknessCardCount,
    categoryBreakdown,
    modeBreakdown,
    estimatedDuration: Math.ceil(
      (totalCards * RECOMMENDATION_CONFIG.SECONDS_PER_CARD_ESTIMATE) / 60
    ),
    difficultyDistribution: {
      easy: Math.round(totalCards * easyRatio),
      medium: Math.round(totalCards * (1 - easyRatio - hardRatio)),
      hard: Math.round(totalCards * hardRatio),
    },
  };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function calculateWeaknessScore(easeFactor: number, accuracy: number, strugglingCount: number): number {
  // Higher score = more problematic
  const easeScore = (3 - easeFactor) * 30; // 0-51 based on ease factor
  const accuracyScore = (1 - accuracy) * 40; // 0-40 based on accuracy
  const strugglingScore = Math.min(30, strugglingCount * 5); // 0-30 based on struggling cards

  return Math.min(100, easeScore + accuracyScore + strugglingScore);
}

function getSeverity(score: number): InsightSeverity {
  if (score >= WEAK_SPOT_CONFIG.CRITICAL_SEVERITY_THRESHOLD) return 'critical';
  if (score >= WEAK_SPOT_CONFIG.WARNING_SEVERITY_THRESHOLD) return 'warning';
  return 'info';
}

function getCardIdsForCategory(flashcards: Flashcard[], category: string): string[] {
  return flashcards.filter(f => f.category === category).map(f => f.id);
}

function getCardsWithErrorType(mistakes: MistakeRecord[], errorType: MistakeType): string[] {
  return [...new Set(mistakes.filter(m => m.errorType === errorType).map(m => m.cardId))];
}

function getErrorTypeDescription(errorType: MistakeType): string {
  switch (errorType) {
    case 'accent':
      return 'Accent marks are causing frequent errors';
    case 'spelling':
      return 'Spelling mistakes are common';
    case 'gender':
      return 'Gender (masculine/feminine) confusion is frequent';
    case 'wrong':
      return 'Many completely incorrect answers';
  }
}

function getErrorTypeAction(errorType: MistakeType): string {
  switch (errorType) {
    case 'accent':
      return 'Practice with typing mode to reinforce accent placement';
    case 'spelling':
      return 'Focus on dictation mode for spelling practice';
    case 'gender':
      return 'Pay attention to article hints (el/la, un/una)';
    case 'wrong':
      return 'Review cards more frequently with flip mode first';
  }
}

export const adaptiveLearningService = {
  analyzeCategoryPerformance,
  analyzeTimePerformance,
  detectWeakSpots,
  adjustDifficulty,
  calculateSmartScheduleFactors,
  applySmartScheduling,
  detectLearningStyle,
  recommendMode,
  generateDailyRecommendations,
  generateSessionComposition,
};
