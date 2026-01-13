/**
 * Centralized configuration constants for the Catalan FlashCards application.
 * All magic numbers and configurable values should be defined here.
 */

// =============================================================================
// SM-2 SPACED REPETITION ALGORITHM
// =============================================================================

export const SM2_CONFIG = {
  /** Default ease factor for new cards */
  DEFAULT_EASE_FACTOR: 2.5,
  /** Minimum ease factor (prevents cards from becoming too hard) */
  MIN_EASE_FACTOR: 1.3,
  /** Maximum interval in days (caps at ~1 year) */
  MAX_INTERVAL_DAYS: 365,
  /** Interval for first successful review */
  FIRST_INTERVAL_DAYS: 1,
  /** Interval for second successful review */
  SECOND_INTERVAL_DAYS: 6,
  /** Ease factor threshold for struggling cards */
  STRUGGLING_EASE_THRESHOLD: 2.0,
  /** Repetitions threshold for new cards */
  NEW_CARD_REPETITIONS_THRESHOLD: 2,
} as const;

// =============================================================================
// MASTERY LEVELS
// =============================================================================

export const MASTERY_CONFIG = {
  /** Interval threshold for "learning" status (days) */
  LEARNING_INTERVAL_DAYS: 7,
  /** Interval threshold for "reviewing" status (days) */
  REVIEWING_INTERVAL_DAYS: 21,
  /** Interval threshold for "mastered" status (days) */
  MASTERED_INTERVAL_DAYS: 21,
} as const;

// =============================================================================
// STUDY SESSION
// =============================================================================

export const SESSION_CONFIG = {
  /** Default number of cards per study session */
  DEFAULT_CARD_LIMIT: 20,
  /** Minimum percentage of typing cards in a session */
  MIN_TYPING_PERCENTAGE: 0.3,
  /** Session recovery window in milliseconds (1 hour) */
  SESSION_RECOVERY_WINDOW_MS: 60 * 60 * 1000,
} as const;

// =============================================================================
// SPEED THRESHOLDS (for quality rating)
// =============================================================================

export const SPEED_THRESHOLDS = {
  /** Typing mode: very fast answer threshold (seconds) */
  TYPING_VERY_FAST_SECONDS: 3,
  /** Typing mode: normal answer threshold (seconds) */
  TYPING_NORMAL_SECONDS: 6,
  /** Multiple choice: fast answer threshold (seconds) */
  MULTIPLE_CHOICE_FAST_SECONDS: 2,
  /** Multiple choice: normal answer threshold (seconds) */
  MULTIPLE_CHOICE_NORMAL_SECONDS: 4,
  /** Fast answer threshold for statistics (milliseconds) */
  FAST_ANSWER_THRESHOLD_MS: 3000,
} as const;

// =============================================================================
// TYPING VALIDATION
// =============================================================================

export const TYPING_CONFIG = {
  /** Typo tolerance threshold (85% similarity required) */
  TYPO_SIMILARITY_THRESHOLD: 0.85,
  /** Catalan special characters for keyboard display */
  CATALAN_SPECIAL_CHARS: ['à', 'é', 'è', 'í', 'ï', 'ó', 'ò', 'ú', 'ü', 'ç', 'l·l'] as readonly string[],
} as const;

// =============================================================================
// IMAGE CACHE (Unsplash)
// =============================================================================

export const IMAGE_CACHE_CONFIG = {
  /** Cache expiry in days */
  EXPIRY_DAYS: 30,
  /** Rate limiting delay between API calls (milliseconds) */
  API_RATE_LIMIT_DELAY_MS: 100,
  /** IndexedDB database name */
  DB_NAME: 'catalan-flashcards-images',
  /** IndexedDB store name */
  STORE_NAME: 'images',
  /** Minimum search term length */
  MIN_SEARCH_TERM_LENGTH: 3,
} as const;

// =============================================================================
// AUDIO SERVICE
// =============================================================================

export const AUDIO_CONFIG = {
  /** Maximum entries in audio URL cache */
  MAX_CACHE_SIZE: 100,
  /** Slow playback rate */
  SLOW_PLAYBACK_RATE: 0.6,
  /** Normal playback rate */
  NORMAL_PLAYBACK_RATE: 1.0,
  /** Fast playback rate */
  FAST_PLAYBACK_RATE: 1.25,
  /** Minimum playback rate */
  MIN_PLAYBACK_RATE: 0.5,
  /** Maximum playback rate */
  MAX_PLAYBACK_RATE: 2.0,
  /** Default speech rate for Web Speech API */
  DEFAULT_SPEECH_RATE: 0.9,
  /** Voice initialization timeout (milliseconds) */
  VOICE_INIT_TIMEOUT_MS: 2000,
  /** Voice initialization check interval (milliseconds) */
  VOICE_INIT_CHECK_INTERVAL_MS: 100,
} as const;

// =============================================================================
// MISTAKE TRACKING
// =============================================================================

export const MISTAKE_CONFIG = {
  /** Maximum number of mistakes to keep in history */
  MAX_HISTORY_SIZE: 500,
  /** Default weakness deck limit */
  DEFAULT_WEAKNESS_DECK_LIMIT: 20,
} as const;

// =============================================================================
// DICTATION MODE
// =============================================================================

export const DICTATION_CONFIG = {
  /** Initial number of replays allowed */
  INITIAL_REPLAYS: 3,
  /** Wrong attempts before showing hint */
  WRONG_ATTEMPTS_BEFORE_HINT: 2,
  /** Delay before focusing input after first play (ms) */
  FOCUS_INPUT_DELAY_MS: 300,
  /** Accuracy threshold for "correct" answer (percent) */
  CORRECT_ACCURACY_THRESHOLD: 90,
  /** Slow speed accuracy penalty (points) */
  SLOW_SPEED_PENALTY: 10,
  /** Fast speed accuracy bonus (points) */
  FAST_SPEED_BONUS: 10,
  /** Replay accuracy penalty per use (points) */
  REPLAY_PENALTY: 5,
  /** Time bonus threshold (seconds) */
  TIME_BONUS_THRESHOLD_SECONDS: 10,
  /** Time bonus (points) */
  TIME_BONUS: 10,
} as const;

// =============================================================================
// PRONUNCIATION / SPEECH RECOGNITION
// =============================================================================

export const PRONUNCIATION_THRESHOLDS = {
  /** Excellent pronunciation score threshold */
  EXCELLENT: 90,
  /** Good pronunciation score threshold */
  GOOD: 75,
  /** Acceptable pronunciation score threshold */
  ACCEPTABLE: 60,
  /** Needs work pronunciation score threshold */
  NEEDS_WORK: 40,
} as const;

// =============================================================================
// NOTIFICATION SERVICE
// =============================================================================

export const NOTIFICATION_CONFIG = {
  /** Default quiet hours start (24-hour format) */
  DEFAULT_QUIET_START: 22,
  /** Default quiet hours end (24-hour format) */
  DEFAULT_QUIET_END: 8,
  /** Morning notification hour */
  MORNING_HOUR: 9,
  /** Afternoon notification hour */
  AFTERNOON_HOUR: 14,
  /** Evening notification hour */
  EVENING_HOUR: 19,
} as const;

// =============================================================================
// CSV PARSER
// =============================================================================

export const CSV_CONFIG = {
  /** Maximum file size in bytes (5MB) */
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024,
  /** Maximum number of rows */
  MAX_ROWS: 10000,
  /** Valid gender values */
  VALID_GENDERS: ['masculine', 'feminine'] as readonly string[],
} as const;

// =============================================================================
// USER / GAMIFICATION
// =============================================================================

export const USER_CONFIG = {
  /** Default daily goal (cards) */
  DEFAULT_DAILY_GOAL: 20,
} as const;

// =============================================================================
// STUDY PAGE
// =============================================================================

export const STUDY_PAGE_CONFIG = {
  /** Good effort accuracy threshold (percent) */
  GOOD_EFFORT_THRESHOLD: 60,
} as const;

// =============================================================================
// CONVERSATION / CHAT
// =============================================================================

export const CONVERSATION_CONFIG = {
  /** XP earned per message */
  XP_PER_MESSAGE: 10,
  /** Maximum XP per conversation session */
  MAX_XP_PER_SESSION: 100,
  /** Minimum typing indicator delay (ms) */
  TYPING_INDICATOR_MIN_DELAY_MS: 1000,
  /** Maximum typing indicator delay (ms) */
  TYPING_INDICATOR_MAX_DELAY_MS: 2000,
} as const;

// =============================================================================
// ANALYTICS
// =============================================================================

export const ANALYTICS_CONFIG = {
  /** Maximum days for mastery projection */
  MAX_PROJECTION_DAYS: 365,
} as const;
