import type {
  MistakeRecord,
  MistakeType,
  ConfusionPair,
  ErrorPatternAnalysis,
  Flashcard,
  CardProgress,
  StudyCard,
  StudyDirection
} from '../types/flashcard';
import { createInitialProgress } from './sm2Algorithm';

/**
 * Analyzes error patterns from mistake history
 */
export function analyzeErrorPatterns(mistakes: MistakeRecord[]): ErrorPatternAnalysis {
  const counts: Record<MistakeType, number> = {
    accent: 0,
    spelling: 0,
    gender: 0,
    wrong: 0,
  };

  for (const mistake of mistakes) {
    counts[mistake.errorType]++;
  }

  const total = mistakes.length;
  const mostCommonType = (Object.entries(counts) as [MistakeType, number][])
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'wrong';

  return {
    accentErrors: counts.accent,
    spellingErrors: counts.spelling,
    genderErrors: counts.gender,
    wrongAnswers: counts.wrong,
    total,
    mostCommonType,
    confusionPairs: getConfusionPairs(mistakes),
  };
}

/**
 * Finds words that are commonly confused with each other
 */
export function getConfusionPairs(mistakes: MistakeRecord[]): ConfusionPair[] {
  const pairMap = new Map<string, { count: number; lastConfused: Date }>();

  for (const mistake of mistakes) {
    // Create a normalized pair key (alphabetically sorted)
    const words = [
      mistake.userAnswer.toLowerCase().trim(),
      mistake.correctAnswer.toLowerCase().trim(),
    ].sort();

    // Skip if user answer is empty or too short
    if (words[0].length < 2) continue;

    const key = `${words[0]}|${words[1]}`;
    const existing = pairMap.get(key);

    if (existing) {
      existing.count++;
      if (mistake.timestamp > existing.lastConfused) {
        existing.lastConfused = mistake.timestamp;
      }
    } else {
      pairMap.set(key, { count: 1, lastConfused: mistake.timestamp });
    }
  }

  // Convert to array and sort by confusion count
  const pairs: ConfusionPair[] = [];
  for (const [key, value] of pairMap) {
    if (value.count >= 2) { // Only include pairs confused 2+ times
      const [word1, word2] = key.split('|');
      pairs.push({
        word1,
        word2,
        confusionCount: value.count,
        lastConfused: value.lastConfused,
      });
    }
  }

  return pairs.sort((a, b) => b.confusionCount - a.confusionCount).slice(0, 10);
}

/**
 * Generates a study deck focused on weak areas
 */
export function generateWeaknessDeck(
  cardProgress: Map<string, CardProgress>,
  flashcards: Flashcard[],
  mistakeHistory: MistakeRecord[],
  limit = 20
): StudyCard[] {
  // Count mistakes per card
  const mistakesByCard = new Map<string, number>();
  for (const mistake of mistakeHistory) {
    const current = mistakesByCard.get(mistake.cardId) || 0;
    mistakesByCard.set(mistake.cardId, current + 1);
  }

  // Get cards with low ease factor or high mistake count
  const weakCards: Array<{
    card: Flashcard;
    direction: StudyDirection;
    score: number;
  }> = [];

  for (const card of flashcards) {
    for (const direction of ['english-to-catalan', 'catalan-to-english'] as StudyDirection[]) {
      const key = `${card.id}_${direction}`;
      const progress = cardProgress.get(key);
      const mistakeCount = mistakesByCard.get(card.id) || 0;

      // Calculate weakness score (higher = more need for review)
      let score = 0;

      if (progress) {
        // Low ease factor = harder card
        score += (3 - progress.easeFactor) * 10;
        // Low accuracy
        if (progress.totalReviews > 0) {
          const accuracy = progress.correctReviews / progress.totalReviews;
          score += (1 - accuracy) * 20;
        }
      }

      // Add mistake count weight
      score += mistakeCount * 5;

      if (score > 0) {
        weakCards.push({ card, direction, score });
      }
    }
  }

  // Sort by weakness score and take top cards
  weakCards.sort((a, b) => b.score - a.score);

  return weakCards.slice(0, limit).map(({ card, direction }) => {
    const key = `${card.id}_${direction}`;
    const progress = cardProgress.get(key) || createInitialProgress(card.id, direction);

    return {
      flashcard: card,
      progress,
      direction,
      requiresTyping: true, // Weakness deck always requires typing
    };
  });
}

/**
 * Gets error rate by type
 */
export function getErrorRateByType(
  mistakes: MistakeRecord[],
  type: MistakeType
): number {
  if (mistakes.length === 0) return 0;
  const typeCount = mistakes.filter(m => m.errorType === type).length;
  return Math.round((typeCount / mistakes.length) * 100);
}

/**
 * Gets mistakes from the last N days
 */
export function getRecentMistakes(
  mistakes: MistakeRecord[],
  days: number
): MistakeRecord[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return mistakes.filter(m => new Date(m.timestamp) >= cutoff);
}

/**
 * Gets trend data for mistakes over time (last 7 days)
 */
export function getMistakeTrend(
  mistakes: MistakeRecord[]
): Array<{ date: string; count: number; byType: Record<MistakeType, number> }> {
  const trend: Array<{ date: string; count: number; byType: Record<MistakeType, number> }> = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const dayMistakes = mistakes.filter(m => {
      const mDate = new Date(m.timestamp).toISOString().split('T')[0];
      return mDate === dateStr;
    });

    const byType: Record<MistakeType, number> = {
      accent: 0,
      spelling: 0,
      gender: 0,
      wrong: 0,
    };

    for (const m of dayMistakes) {
      byType[m.errorType]++;
    }

    trend.push({
      date: dateStr,
      count: dayMistakes.length,
      byType,
    });
  }

  return trend;
}

/**
 * Determines error type from a typing result
 */
export function classifyMistakeType(
  userAnswer: string,
  correctAnswer: string,
  cardGender?: 'masculine' | 'feminine'
): MistakeType {
  const userLower = userAnswer.toLowerCase().trim();
  const correctLower = correctAnswer.toLowerCase().trim();

  // Check for gender-related mistakes (wrong article, wrong ending)
  if (cardGender) {
    const genderIndicators = {
      masculine: ['el ', 'un ', 'lo '],
      feminine: ['la ', 'una '],
    };

    const wrongGender = cardGender === 'masculine' ? 'feminine' : 'masculine';
    for (const indicator of genderIndicators[wrongGender]) {
      if (userLower.startsWith(indicator)) {
        return 'gender';
      }
    }
  }

  // Normalize for accent comparison
  const normalizeAccents = (s: string) =>
    s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  if (normalizeAccents(userLower) === normalizeAccents(correctLower)) {
    return 'accent';
  }

  // Check similarity for spelling vs completely wrong
  const similarity = calculateSimilarity(userLower, correctLower);

  if (similarity > 0.5) {
    return 'spelling';
  }

  return 'wrong';
}

/**
 * Simple similarity calculation using Levenshtein distance
 */
function calculateSimilarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;

  const distance = levenshteinDistance(a, b);
  return 1 - distance / maxLen;
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}
