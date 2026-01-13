import type { StudyMode, StudyDirection, MistakeType } from './flashcard';

// ============================================================================
// TIME AND LEARNING STYLE TYPES
// ============================================================================

/** Time-of-day performance buckets */
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

/** Learning style classifications */
export type LearningStyle = 'visual' | 'auditory' | 'kinesthetic' | 'reading';

/** Insight severity levels */
export type InsightSeverity = 'info' | 'warning' | 'critical';

/** Recommendation types */
export type RecommendationType =
  | 'focus_category'
  | 'focus_error_type'
  | 'change_mode'
  | 'increase_difficulty'
  | 'reduce_load'
  | 'optimal_time'
  | 'streak_at_risk';

// ============================================================================
// CATEGORY PERFORMANCE ANALYSIS
// ============================================================================

/** Per-category performance metrics */
export interface CategoryPerformance {
  category: string;
  subcategory?: string;
  totalCards: number;
  reviewedCards: number;
  correctCount: number;
  incorrectCount: number;
  averageEaseFactor: number;
  averageResponseTimeMs: number;
  masteredCount: number;
  strugglingCount: number;
  lastReviewed: Date | null;
  errorTypeDistribution: Record<MistakeType, number>;
  trendDirection: 'improving' | 'declining' | 'stable';
  confidenceScore: number; // 0-100, based on sample size
}

/** Time-based performance analysis */
export interface TimePerformance {
  timeOfDay: TimeOfDay;
  sessionsCount: number;
  averageAccuracy: number;
  averageResponseTimeMs: number;
  averageCardsPerSession: number;
  optimalScore: number; // Weighted composite score
}

// ============================================================================
// WEAK SPOT DETECTION
// ============================================================================

/** Weak spot type categories */
export type WeakSpotType = 'category' | 'error_type' | 'direction' | 'time_based' | 'mode';

/** Detected weak spot with actionable data */
export interface WeakSpot {
  id: string;
  type: WeakSpotType;
  target: string; // Category name, error type, etc.
  severity: InsightSeverity;
  score: number; // 0-100, higher = worse
  description: string;
  suggestedAction: string;
  affectedCardIds: string[];
  detectedAt: Date;
  lastUpdated: Date;
}

/** Actionable insight generated from analysis */
export interface LearningInsight {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  severity: InsightSeverity;
  data: Record<string, unknown>;
  createdAt: Date;
  expiresAt: Date;
  dismissed: boolean;
  actionTaken: boolean;
}

// ============================================================================
// DIFFICULTY ADJUSTMENT
// ============================================================================

/** User's current difficulty profile */
export interface DifficultyProfile {
  globalLevel: number; // 1-10, current adaptive difficulty
  categoryLevels: Record<string, number>; // Per-category difficulty
  recentTrend: 'up' | 'down' | 'stable';
  lastAdjustment: Date | null;
  adjustmentHistory: DifficultyAdjustment[];
}

/** Record of difficulty adjustment */
export interface DifficultyAdjustment {
  timestamp: Date;
  previousLevel: number;
  newLevel: number;
  reason: string;
  triggerMetrics: {
    recentAccuracy: number;
    averageResponseTime: number;
    streakLength: number;
  };
}

/** Card difficulty classification */
export interface CardDifficulty {
  cardId: string;
  intrinsicDifficulty: number; // 1-10, based on word complexity
  userDifficulty: number; // 1-10, based on user performance
  combinedScore: number; // Weighted combination
  factors: {
    wordLength: number;
    hasSpecialChars: boolean;
    categoryComplexity: number;
    userEaseFactor: number;
    mistakeCount: number;
  };
}

// ============================================================================
// SMART SCHEDULING
// ============================================================================

/** Enhanced scheduling parameters beyond SM-2 */
export interface SmartScheduleFactors {
  baseInterval: number; // From SM-2
  timeOfDayMultiplier: number; // Based on user's performance patterns
  categoryDifficultyMultiplier: number;
  mistakeRecencyMultiplier: number; // Recent mistakes = shorter interval
  interferenceFactor: number; // Similar cards confusing each other
  fatigueAdjustment: number; // Session length impact
}

/** Card scheduling priority */
export interface CardSchedulePriority {
  cardId: string;
  direction: StudyDirection;
  basePriority: number; // From due date
  adjustedPriority: number; // After applying factors
  factors: SmartScheduleFactors;
  recommendedMode: StudyMode;
}

// ============================================================================
// LEARNING STYLE ADAPTATION
// ============================================================================

/** User's learning style profile */
export interface LearningStyleProfile {
  primaryStyle: LearningStyle;
  secondaryStyle: LearningStyle | null;
  styleScores: Record<LearningStyle, number>; // 0-100
  modeEffectiveness: Record<StudyMode, ModeEffectiveness>;
  lastUpdated: Date;
  confidenceLevel: number; // 0-100, based on data points
}

/** Effectiveness metrics for a study mode */
export interface ModeEffectiveness {
  mode: StudyMode;
  sessionsCount: number;
  cardsReviewed: number;
  averageAccuracy: number;
  averageQuality: number; // Average SM-2 quality rating
  retentionRate: number; // % of cards remembered next session
  averageResponseTimeMs: number;
  effectivenessScore: number; // Composite 0-100
}

/** Mode recommendation for a session */
export interface ModeRecommendation {
  recommendedMode: StudyMode;
  confidence: number;
  reason: string;
  alternatives: Array<{
    mode: StudyMode;
    score: number;
    reason: string;
  }>;
}

// ============================================================================
// PERSONALIZED RECOMMENDATIONS
// ============================================================================

/** Recommendation priority types */
export type RecommendationPriority =
  | 'category_focus'
  | 'weakness_drill'
  | 'review_due'
  | 'new_cards'
  | 'mode_practice';

/** Daily study recommendation */
export interface DailyRecommendation {
  id: string;
  date: string; // YYYY-MM-DD
  recommendations: StudyRecommendation[];
  focusAreas: string[];
  suggestedDuration: number; // minutes
  optimalTimeSlots: TimeOfDay[];
  generatedAt: Date;
}

/** Individual study recommendation */
export interface StudyRecommendation {
  id: string;
  priority: number; // 1 = highest
  type: RecommendationPriority;
  title: string;
  description: string;
  targetCategory?: string;
  targetMode?: StudyMode;
  suggestedCardCount: number;
  estimatedTimeMinutes: number;
  expectedBenefit: string;
  reasoning: string;
}

/** Session composition suggestion */
export interface SessionComposition {
  totalCards: number;
  newCards: number;
  reviewCards: number;
  weaknessCards: number;
  categoryBreakdown: Record<string, number>;
  modeBreakdown: Record<StudyMode, number>;
  estimatedDuration: number;
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
}

// ============================================================================
// SESSION PERFORMANCE ANALYTICS
// ============================================================================

/** Session performance record for analysis */
export interface SessionPerformanceRecord {
  sessionId: string;
  timestamp: Date;
  timeOfDay: TimeOfDay;
  duration: number;
  cardsReviewed: number;
  accuracy: number;
  averageQuality: number;
  averageResponseTimeMs: number;
  mode: StudyMode;
  categoryBreakdown: Record<string, { count: number; accuracy: number }>;
  mistakeTypes: Record<MistakeType, number>;
}

/** Aggregated performance trends */
export interface PerformanceTrends {
  daily: TrendDataPoint[];
  weekly: TrendDataPoint[];
  monthly: TrendDataPoint[];
  overall: {
    accuracyTrend: 'improving' | 'declining' | 'stable';
    speedTrend: 'improving' | 'declining' | 'stable';
    consistencyScore: number;
    predictedMasteryDate: Date | null;
  };
}

/** Single data point for trend tracking */
export interface TrendDataPoint {
  date: string;
  accuracy: number;
  cardsReviewed: number;
  timeSpentMs: number;
  newCardsMastered: number;
}

// ============================================================================
// ADAPTIVE LEARNING STATE
// ============================================================================

/** Complete adaptive learning state */
export interface AdaptiveLearningState {
  // User profiles
  difficultyProfile: DifficultyProfile;
  learningStyleProfile: LearningStyleProfile;

  // Analysis results
  categoryPerformances: CategoryPerformance[];
  timePerformances: TimePerformance[];
  weakSpots: WeakSpot[];
  insights: LearningInsight[];

  // Recommendations
  currentRecommendations: DailyRecommendation | null;
  sessionComposition: SessionComposition | null;

  // History
  performanceHistory: SessionPerformanceRecord[];
  trends: PerformanceTrends;

  // Meta
  lastAnalysisAt: Date | null;
  analysisVersion: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/** Get time of day from date */
export function getTimeOfDay(date: Date = new Date()): TimeOfDay {
  const hour = date.getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

/** Create default difficulty profile */
export function createDefaultDifficultyProfile(): DifficultyProfile {
  return {
    globalLevel: 5,
    categoryLevels: {},
    recentTrend: 'stable',
    lastAdjustment: null,
    adjustmentHistory: [],
  };
}

/** Create default learning style profile */
export function createDefaultLearningStyleProfile(): LearningStyleProfile {
  return {
    primaryStyle: 'visual',
    secondaryStyle: null,
    styleScores: {
      visual: 50,
      auditory: 50,
      kinesthetic: 50,
      reading: 50,
    },
    modeEffectiveness: {} as Record<StudyMode, ModeEffectiveness>,
    lastUpdated: new Date(),
    confidenceLevel: 0,
  };
}

/** Create default adaptive learning state */
export function createDefaultAdaptiveLearningState(): AdaptiveLearningState {
  return {
    difficultyProfile: createDefaultDifficultyProfile(),
    learningStyleProfile: createDefaultLearningStyleProfile(),
    categoryPerformances: [],
    timePerformances: [],
    weakSpots: [],
    insights: [],
    currentRecommendations: null,
    sessionComposition: null,
    performanceHistory: [],
    trends: {
      daily: [],
      weekly: [],
      monthly: [],
      overall: {
        accuracyTrend: 'stable',
        speedTrend: 'stable',
        consistencyScore: 0,
        predictedMasteryDate: null,
      },
    },
    lastAnalysisAt: null,
    analysisVersion: 1,
  };
}
