/**
 * Configuration constants for the Adaptive Learning Engine.
 * All algorithm thresholds and tunable parameters are defined here.
 */

// =============================================================================
// WEAK SPOT DETECTION
// =============================================================================

export const WEAK_SPOT_CONFIG = {
  /** Ease factor threshold for weak category detection */
  WEAK_EASE_FACTOR_THRESHOLD: 2.0,
  /** Accuracy threshold for weak category detection (0-1) */
  WEAK_ACCURACY_THRESHOLD: 0.7,
  /** Error type dominance threshold (0-1) - flag if > 40% of errors are one type */
  ERROR_TYPE_DOMINANCE_THRESHOLD: 0.4,
  /** Minimum samples needed for confident analysis */
  MIN_SAMPLES_FOR_ANALYSIS: 10,
  /** Minimum samples for category analysis */
  MIN_CATEGORY_SAMPLES: 5,
  /** Critical severity score threshold (0-100) */
  CRITICAL_SEVERITY_THRESHOLD: 70,
  /** Warning severity score threshold (0-100) */
  WARNING_SEVERITY_THRESHOLD: 40,
  /** Time-of-day accuracy difference to flag (0-1) */
  TIME_ACCURACY_DIFFERENCE_THRESHOLD: 0.15,
  /** Direction asymmetry threshold (0-1) - flag if > 15% difference */
  DIRECTION_ASYMMETRY_THRESHOLD: 0.15,
  /** Recency weight for recent mistakes (past 7 days) */
  RECENCY_WEIGHT_FACTOR: 1.5,
  /** Sample size confidence curve (more samples = higher confidence) */
  CONFIDENCE_SAMPLE_CURVE: 50, // Asymptotic confidence at 50 samples
} as const;

// =============================================================================
// DIFFICULTY ADJUSTMENT
// =============================================================================

export const DIFFICULTY_CONFIG = {
  /** Smoothing factor for difficulty changes (0-1, higher = more responsive) */
  SMOOTHING_FACTOR: 0.3,
  /** Accuracy threshold to increase difficulty (percent) */
  ACCURACY_THRESHOLD_INCREASE: 90,
  /** Accuracy threshold to decrease difficulty (percent) */
  ACCURACY_THRESHOLD_DECREASE: 60,
  /** Fast response time threshold (milliseconds) */
  RESPONSE_TIME_FAST_MS: 3000,
  /** Slow response time threshold (milliseconds) */
  RESPONSE_TIME_SLOW_MS: 10000,
  /** Minimum sessions before adjusting difficulty */
  MIN_SESSIONS_FOR_ADJUSTMENT: 3,
  /** Perfect streak threshold for difficulty increase */
  PERFECT_STREAK_THRESHOLD: 10,
  /** Minimum difficulty level */
  MIN_DIFFICULTY_LEVEL: 1,
  /** Maximum difficulty level */
  MAX_DIFFICULTY_LEVEL: 10,
  /** Default starting difficulty level */
  DEFAULT_DIFFICULTY_LEVEL: 5,
  /** Maximum adjustment history entries to keep */
  MAX_ADJUSTMENT_HISTORY: 20,
  /** Number of recent sessions to consider for adjustment */
  RECENT_SESSIONS_WINDOW: 5,
} as const;

// =============================================================================
// SMART SCHEDULING
// =============================================================================

export const SCHEDULING_CONFIG = {
  /** Minimum time-of-day multiplier */
  TIME_MULTIPLIER_MIN: 0.8,
  /** Maximum time-of-day multiplier */
  TIME_MULTIPLIER_MAX: 1.0,
  /** Category difficulty multiplier for hard categories */
  CATEGORY_MULTIPLIER_HARD: 0.85,
  /** Category difficulty multiplier for easy categories */
  CATEGORY_MULTIPLIER_EASY: 1.1,
  /** Penalty per recent mistake (reduces interval) */
  MISTAKE_PENALTY_PER_RECENT: 0.1,
  /** Maximum mistake penalty (minimum multiplier) */
  MISTAKE_PENALTY_MAX: 0.3,
  /** Interference penalty for confusion pairs */
  INTERFERENCE_PENALTY: 0.1,
  /** Fatigue threshold - cards after which fatigue kicks in */
  FATIGUE_THRESHOLD_CARDS: 15,
  /** Fatigue penalty per card after threshold */
  FATIGUE_PENALTY: 0.05,
  /** Maximum fatigue penalty */
  FATIGUE_PENALTY_MAX: 0.15,
  /** Days to look back for recent mistakes */
  RECENT_MISTAKE_WINDOW_DAYS: 7,
} as const;

// =============================================================================
// LEARNING STYLE DETECTION
// =============================================================================

export const LEARNING_STYLE_CONFIG = {
  /** Minimum sessions required for style detection */
  MIN_SESSIONS_FOR_DETECTION: 5,
  /** Confidence threshold for style recommendation (0-100) */
  CONFIDENCE_THRESHOLD: 70,
  /** Percentage of session for primary style modes */
  PRIMARY_STYLE_RATIO: 0.6,
  /** Percentage of session for secondary style modes */
  SECONDARY_STYLE_RATIO: 0.3,
  /** Percentage of session for exploration/other modes */
  EXPLORATION_RATIO: 0.1,
  /** Weight for accuracy in effectiveness calculation (0-1) */
  ACCURACY_WEIGHT: 0.3,
  /** Weight for retention in effectiveness calculation (0-1) */
  RETENTION_WEIGHT: 0.4,
  /** Weight for quality rating in effectiveness calculation (0-1) */
  QUALITY_WEIGHT: 0.2,
  /** Weight for engagement in effectiveness calculation (0-1) */
  ENGAGEMENT_WEIGHT: 0.1,
  /** Minimum samples per mode for reliable effectiveness score */
  MIN_MODE_SAMPLES: 20,
  /** Maximum response time to consider (ms) - caps outliers */
  MAX_RESPONSE_TIME_MS: 60000,
} as const;

// =============================================================================
// RECOMMENDATIONS
// =============================================================================

export const RECOMMENDATION_CONFIG = {
  /** Maximum daily recommendations to show */
  MAX_DAILY_RECOMMENDATIONS: 5,
  /** Critical weakness threshold for priority recommendations */
  CRITICAL_WEAKNESS_THRESHOLD: 70,
  /** Ratio of new cards for beginner users (0-1) */
  NEW_CARD_RATIO_BEGINNER: 0.2,
  /** Ratio of new cards for advanced users (0-1) */
  NEW_CARD_RATIO_ADVANCED: 0.1,
  /** Ratio of weakness cards in session (0-1) */
  WEAKNESS_CARD_RATIO: 0.25,
  /** Streak risk threshold (days of streak before warning) */
  STREAK_RISK_THRESHOLD: 7,
  /** Insight expiry hours */
  INSIGHT_EXPIRY_HOURS: 24,
  /** Minimum card count for session recommendation */
  MIN_SESSION_CARDS: 5,
  /** Maximum session duration recommendation (minutes) */
  MAX_SESSION_DURATION_MINUTES: 30,
  /** Time per card estimate (seconds) */
  SECONDS_PER_CARD_ESTIMATE: 20,
} as const;

// =============================================================================
// TIME OF DAY BUCKETS
// =============================================================================

export const TIME_BUCKETS = {
  morning: { start: 6, end: 12 },
  afternoon: { start: 12, end: 17 },
  evening: { start: 17, end: 21 },
  night: { start: 21, end: 6 }, // Wraps around midnight
} as const;

// =============================================================================
// ANALYSIS FREQUENCY
// =============================================================================

export const ANALYSIS_CONFIG = {
  /** Reanalysis interval (milliseconds) - 30 minutes */
  REANALYSIS_INTERVAL_MS: 30 * 60 * 1000,
  /** Profile update interval (milliseconds) - 24 hours */
  PROFILE_UPDATE_INTERVAL_MS: 24 * 60 * 60 * 1000,
  /** Maximum performance history entries to keep */
  MAX_PERFORMANCE_HISTORY: 100,
  /** Days of trend data to maintain */
  TREND_HISTORY_DAYS: 90,
  /** Minimum data points for trend calculation */
  MIN_TREND_DATA_POINTS: 3,
} as const;

// =============================================================================
// MODE TO LEARNING STYLE MAPPING
// =============================================================================

export const STYLE_MODE_MAPPING = {
  visual: ['flip', 'multiple-choice'] as const,
  auditory: ['listening', 'dictation', 'speak'] as const,
  kinesthetic: ['type-answer', 'sentences'] as const,
  reading: ['flip', 'type-answer'] as const,
} as const;

// =============================================================================
// DIFFICULTY LEVEL EFFECTS
// =============================================================================

export const DIFFICULTY_EFFECTS = {
  /** Difficulty levels that prefer easier modes (flip, multiple-choice) */
  EASY_MODE_LEVELS: [1, 2, 3] as const,
  /** Difficulty levels with mixed mode preference */
  MIXED_MODE_LEVELS: [4, 5, 6] as const,
  /** Difficulty levels that prefer harder modes (typing, dictation) */
  HARD_MODE_LEVELS: [7, 8, 9, 10] as const,
  /** Session length multipliers by difficulty range */
  SESSION_LENGTH_MULTIPLIERS: {
    easy: 0.8,    // Shorter sessions for struggling users
    medium: 1.0,  // Standard session length
    hard: 1.2,    // Longer sessions for advanced users
  } as const,
} as const;
