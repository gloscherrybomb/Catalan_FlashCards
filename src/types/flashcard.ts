export type StudyDirection = 'english-to-catalan' | 'catalan-to-english';

export interface Flashcard {
  id: string;
  front: string;           // English
  back: string;            // Catalan
  notes: string;           // Original notes from CSV
  category: string;        // Parsed category
  subcategory?: string;    // E.g., "Ser", "Estar"
  gender?: 'masculine' | 'feminine';
  iconKey: string;         // For icon generation
  createdAt: Date;
  // Image fields (optional, populated by imageService)
  imageUrl?: string;
  imageThumbUrl?: string;
  imageAttribution?: string;
  // Mnemonic fields for memory aids
  userMnemonic?: string;   // User's custom mnemonic
  etymology?: string;      // Word origin/root info
}

export interface CardProgress {
  cardId: string;
  direction: StudyDirection;

  // SM-2 fields
  easeFactor: number;      // Default 2.5
  interval: number;        // Days until next review
  repetitions: number;     // Successful reviews in a row
  nextReviewDate: Date;
  lastReviewDate?: Date;

  // Stats
  totalReviews: number;
  correctReviews: number;
  lastQuality?: number;    // Last quality rating (0-5)

  // Progressive difficulty
  masteryLevel: MasteryLevel; // 0-4, determines available study modes
  consecutiveCorrect: number; // Correct answers at current level
}

// Mastery levels determine which study modes are available
export type MasteryLevel = 0 | 1 | 2 | 3 | 4;

// Level 0: Multiple choice only (brand new)
// Level 1: Multiple choice + Type with hint
// Level 2: Multiple choice + Type (no hint)
// Level 3: All modes except sprint
// Level 4: Full mastery (all modes)

export interface StudyCard {
  flashcard: Flashcard;
  progress: CardProgress;
  direction: StudyDirection;
  requiresTyping: boolean; // True for new cards or struggling cards
}

export type StudyMode = 'flip' | 'multiple-choice' | 'type-answer' | 'mixed' | 'listening' | 'sentences' | 'dictation' | 'speak';

export interface StudySession {
  id: string;
  startedAt: Date;
  endedAt?: Date;
  mode: StudyMode;
  cards: StudyCard[];
  currentIndex: number;
  results: StudyResult[];
}

export interface StudyResult {
  cardId: string;
  direction: StudyDirection;
  mode: StudyMode;
  quality: number;         // 0-5 rating
  isCorrect: boolean;
  timeSpentMs: number;
  userAnswer?: string;     // For type-answer mode
}

export type MatchType = 'exact' | 'case' | 'accent' | 'phrase' | 'synonym' | 'article' | 'loose' | 'contraction' | 'typo' | 'none';

export interface TypingResult {
  isCorrect: boolean;      // Exact match
  isAcceptable: boolean;   // Close enough (minor accent issues)
  hasTypo?: boolean;       // Has minor typo but still acceptable
  userAnswer: string;
  correctAnswer: string;
  corrections: Correction[];
  matchType?: MatchType;   // How the answer was matched
  feedbackMessage?: string; // User-friendly explanation of match type
}

export interface Correction {
  position: number;
  expected: string;
  received: string;
  type: 'accent' | 'spelling' | 'missing' | 'extra';
}

// Mistake tracking for analytics
export type MistakeType = 'accent' | 'spelling' | 'gender' | 'wrong';

export interface MistakeRecord {
  cardId: string;
  direction: StudyDirection;
  timestamp: Date;
  errorType: MistakeType;
  userAnswer: string;
  correctAnswer: string;
}

export interface ConfusionPair {
  word1: string;
  word2: string;
  confusionCount: number;
  lastConfused: Date;
}

export interface ErrorPatternAnalysis {
  accentErrors: number;
  spellingErrors: number;
  genderErrors: number;
  wrongAnswers: number;
  total: number;
  mostCommonType: MistakeType;
  confusionPairs: ConfusionPair[];
}

// Example sentences for contextual learning
export interface ExampleSentence {
  catalan: string;
  english: string;
  wordPositions: number[]; // Indices of target vocabulary words
}
