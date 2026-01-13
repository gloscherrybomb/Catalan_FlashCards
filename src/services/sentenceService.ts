import type { SentenceData } from '../data/exampleSentences';

export interface ScrambledWord {
  word: string;
  originalIndex: number;
  id: string;
}

export interface SentenceValidationResult {
  isCorrect: boolean;
  correctOrder: string[];
  userOrder: string[];
  firstErrorIndex: number | null;
  accuracy: number; // 0-100
}

export interface FillInBlankResult {
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer: string;
  isCloseMatch: boolean; // Minor accent/spelling difference
  hint?: string;
}

export interface HintLevel {
  level: 1 | 2 | 3;
  hint: string;
}

/**
 * Scrambles words in a Catalan sentence while keeping punctuation attached
 */
export function scrambleSentence(sentence: string): ScrambledWord[] {
  // Split into words, keeping punctuation attached
  const words = tokenizeSentence(sentence);

  // Create word objects with original indices
  const wordObjects: ScrambledWord[] = words.map((word, index) => ({
    word,
    originalIndex: index,
    id: `word-${index}-${Date.now()}`,
  }));

  // Shuffle using Fisher-Yates algorithm
  const shuffled = [...wordObjects];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Ensure it's actually scrambled (not in original order)
  const isOriginalOrder = shuffled.every((w, i) => w.originalIndex === i);
  if (isOriginalOrder && shuffled.length > 1) {
    // Swap first and last if still in order
    [shuffled[0], shuffled[shuffled.length - 1]] = [shuffled[shuffled.length - 1], shuffled[0]];
  }

  return shuffled;
}

/**
 * Tokenize a sentence into words, handling Catalan-specific contractions
 */
export function tokenizeSentence(sentence: string): string[] {
  // Handle common Catalan contractions and punctuation
  // Keep punctuation attached to words
  return sentence
    .split(/\s+/)
    .filter(word => word.length > 0);
}

/**
 * Validates user's word order against the correct sentence
 */
export function validateSentenceOrder(
  userOrder: ScrambledWord[],
  correctSentence: string
): SentenceValidationResult {
  const correctWords = tokenizeSentence(correctSentence);
  const userWords = userOrder.map(w => w.word);

  let firstErrorIndex: number | null = null;
  let correctCount = 0;

  for (let i = 0; i < Math.max(correctWords.length, userWords.length); i++) {
    if (correctWords[i]?.toLowerCase() === userWords[i]?.toLowerCase()) {
      correctCount++;
    } else if (firstErrorIndex === null) {
      firstErrorIndex = i;
    }
  }

  const accuracy = Math.round((correctCount / correctWords.length) * 100);
  const isCorrect = accuracy === 100;

  return {
    isCorrect,
    correctOrder: correctWords,
    userOrder: userWords,
    firstErrorIndex: isCorrect ? null : firstErrorIndex,
    accuracy,
  };
}

/**
 * Creates a fill-in-the-blank exercise from a sentence
 */
export function createFillInBlank(
  sentence: SentenceData,
  blankIndex?: number
): {
  sentenceWithBlank: string;
  blankWord: string;
  blankPosition: number;
} {
  const words = tokenizeSentence(sentence.catalan);

  // Choose which word to blank out
  let position: number;
  if (blankIndex !== undefined && blankIndex < words.length) {
    position = blankIndex;
  } else if (sentence.vocabularyIndices.length > 0) {
    // Prefer vocabulary words
    const validIndices = sentence.vocabularyIndices.filter(i => i < words.length);
    position = validIndices[Math.floor(Math.random() * validIndices.length)] ?? 0;
  } else {
    // Random word (avoid first and last for better context)
    const start = Math.min(1, words.length - 1);
    const end = Math.max(start, words.length - 2);
    position = Math.floor(Math.random() * (end - start + 1)) + start;
  }

  const blankWord = words[position];
  const sentenceWithBlank = words
    .map((w, i) => (i === position ? '___' : w))
    .join(' ');

  return {
    sentenceWithBlank,
    blankWord,
    blankPosition: position,
  };
}

/**
 * Validates a fill-in-the-blank answer
 */
export function validateFillInBlank(
  userAnswer: string,
  correctAnswer: string
): FillInBlankResult {
  const normalizedUser = normalizeAnswer(userAnswer);
  const normalizedCorrect = normalizeAnswer(correctAnswer);

  const isCorrect = normalizedUser === normalizedCorrect;
  const isCloseMatch = !isCorrect && isCloseEnough(normalizedUser, normalizedCorrect);

  let hint: string | undefined;
  if (!isCorrect && !isCloseMatch) {
    hint = `The word starts with "${correctAnswer.charAt(0)}"`;
  }

  return {
    isCorrect,
    userAnswer,
    correctAnswer,
    isCloseMatch,
    hint,
  };
}

/**
 * Normalize answer for comparison (lowercase, trim, remove punctuation and accents)
 */
function normalizeAnswer(answer: string): string {
  return answer
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics for comparison
    .replace(/[.,!?;:'"¿¡…]+/g, '') // Remove punctuation (including ellipsis)
    .replace(/\.{2,}/g, '') // Remove multiple dots (ellipsis as ...)
    .trim(); // Trim again after punctuation removal
}

/**
 * Check if answer is close enough (within 1-2 character differences)
 */
function isCloseEnough(user: string, correct: string): boolean {
  if (Math.abs(user.length - correct.length) > 2) return false;

  // Simple Levenshtein distance check
  const distance = levenshteinDistance(user, correct);
  return distance <= 2;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= a.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= b.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
}

/**
 * Get progressive hints for a sentence
 */
export function getHint(sentence: string, level: 1 | 2 | 3): HintLevel {
  const words = tokenizeSentence(sentence);

  switch (level) {
    case 1:
      // First letters hint
      return {
        level: 1,
        hint: words.map(w => w.charAt(0) + '___').join(' '),
      };
    case 2:
      // First and last letters
      return {
        level: 2,
        hint: words.map(w => {
          if (w.length <= 2) return w;
          return w.charAt(0) + '_'.repeat(w.length - 2) + w.charAt(w.length - 1);
        }).join(' '),
      };
    case 3:
      // Show half the letters
      return {
        level: 3,
        hint: words.map(w => {
          if (w.length <= 3) return w;
          const visible = Math.ceil(w.length / 2);
          return w.slice(0, visible) + '_'.repeat(w.length - visible);
        }).join(' '),
      };
  }
}

/**
 * Calculate score based on hints used and time taken
 */
export function calculateScore(
  isCorrect: boolean,
  hintsUsed: number,
  timeSpentSeconds: number,
  maxTime: number = 60
): number {
  if (!isCorrect) return 0;

  // Base score of 100
  let score = 100;

  // Deduct for hints (25 points per hint)
  score -= hintsUsed * 25;

  // Time bonus/penalty
  if (timeSpentSeconds < maxTime / 3) {
    score += 20; // Fast completion bonus
  } else if (timeSpentSeconds > maxTime * 0.8) {
    score -= 10; // Slow completion penalty
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Get sentences appropriate for a specific card/word
 */
export function getSentencesForWord(
  word: string,
  sentences: SentenceData[]
): SentenceData[] {
  const normalizedWord = word.toLowerCase();
  return sentences.filter(s =>
    s.catalan.toLowerCase().includes(normalizedWord)
  );
}
