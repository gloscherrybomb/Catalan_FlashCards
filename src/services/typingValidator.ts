import type { TypingResult, Correction } from '../types/flashcard';

const CATALAN_SPECIAL_CHARS = ['à', 'é', 'è', 'í', 'ï', 'ó', 'ò', 'ú', 'ü', 'ç', 'l·l'];

export function normalizeForComparison(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/·/g, '') // Remove middle dot
    .replace(/\s+/g, ' '); // Normalize whitespace
}

export function validateTyping(userAnswer: string, correctAnswer: string): TypingResult {
  const trimmedUser = userAnswer.trim();
  const trimmedCorrect = correctAnswer.trim();

  // Exact match
  if (trimmedUser === trimmedCorrect) {
    return {
      isCorrect: true,
      isAcceptable: true,
      userAnswer: trimmedUser,
      correctAnswer: trimmedCorrect,
      corrections: [],
    };
  }

  // Case-insensitive exact match
  if (trimmedUser.toLowerCase() === trimmedCorrect.toLowerCase()) {
    return {
      isCorrect: true,
      isAcceptable: true,
      userAnswer: trimmedUser,
      correctAnswer: trimmedCorrect,
      corrections: [],
    };
  }

  // Normalize and compare (ignoring accents)
  const normalizedUser = normalizeForComparison(trimmedUser);
  const normalizedCorrect = normalizeForComparison(trimmedCorrect);

  const isAcceptable = normalizedUser === normalizedCorrect;

  // Find corrections
  const corrections = findCorrections(trimmedUser, trimmedCorrect);

  return {
    isCorrect: false,
    isAcceptable,
    userAnswer: trimmedUser,
    correctAnswer: trimmedCorrect,
    corrections,
  };
}

function findCorrections(userAnswer: string, correctAnswer: string): Correction[] {
  const corrections: Correction[] = [];
  const userLower = userAnswer.toLowerCase();
  const correctLower = correctAnswer.toLowerCase();

  // Use simple character-by-character comparison
  const maxLen = Math.max(userLower.length, correctLower.length);

  for (let i = 0; i < maxLen; i++) {
    const userChar = userLower[i] || '';
    const correctChar = correctLower[i] || '';

    if (userChar !== correctChar) {
      // Check if it's an accent difference
      const userNorm = normalizeForComparison(userChar);
      const correctNorm = normalizeForComparison(correctChar);

      if (userNorm === correctNorm && userNorm !== '') {
        corrections.push({
          position: i,
          expected: correctAnswer[i] || '',
          received: userAnswer[i] || '',
          type: 'accent',
        });
      } else if (!userChar) {
        corrections.push({
          position: i,
          expected: correctAnswer[i],
          received: '',
          type: 'missing',
        });
      } else if (!correctChar) {
        corrections.push({
          position: i,
          expected: '',
          received: userAnswer[i],
          type: 'extra',
        });
      } else {
        corrections.push({
          position: i,
          expected: correctAnswer[i],
          received: userAnswer[i],
          type: 'spelling',
        });
      }
    }
  }

  return corrections;
}

export function getLevenshteinDistance(a: string, b: string): number {
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

export function getSimilarityScore(userAnswer: string, correctAnswer: string): number {
  const normalized1 = normalizeForComparison(userAnswer);
  const normalized2 = normalizeForComparison(correctAnswer);

  if (normalized1 === normalized2) return 1;

  const distance = getLevenshteinDistance(normalized1, normalized2);
  const maxLen = Math.max(normalized1.length, normalized2.length);

  if (maxLen === 0) return 1;

  return 1 - distance / maxLen;
}

export { CATALAN_SPECIAL_CHARS };
