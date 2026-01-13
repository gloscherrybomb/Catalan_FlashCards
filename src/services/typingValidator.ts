import type { TypingResult, Correction } from '../types/flashcard';
import { TYPING_CONFIG } from '../config/constants';
import { stripBracketedContent, extractAllForms } from '../utils/textUtils';

const CATALAN_SPECIAL_CHARS = ['à', 'é', 'è', 'í', 'ï', 'ó', 'ò', 'ú', 'ü', 'ç', 'l·l'];

// Common English contractions mapped to expanded forms
const CONTRACTIONS: Record<string, string> = {
  "don't": "do not", "doesn't": "does not", "didn't": "did not",
  "won't": "will not", "wouldn't": "would not", "couldn't": "could not",
  "shouldn't": "should not", "can't": "cannot", "isn't": "is not",
  "aren't": "are not", "wasn't": "was not", "weren't": "were not",
  "haven't": "have not", "hasn't": "has not", "hadn't": "had not",
  "i'm": "i am", "you're": "you are", "we're": "we are", "they're": "they are",
  "he's": "he is", "she's": "she is", "it's": "it is", "that's": "that is",
  "i've": "i have", "you've": "you have", "we've": "we have", "they've": "they have",
  "i'll": "i will", "you'll": "you will", "we'll": "we will", "they'll": "they will",
  "i'd": "i would", "you'd": "you would", "we'd": "we would", "they'd": "they would",
  "let's": "let us", "who's": "who is", "what's": "what is", "where's": "where is",
};

function expandContractions(text: string): string {
  let result = text.toLowerCase();
  for (const [contraction, expanded] of Object.entries(CONTRACTIONS)) {
    result = result.replace(new RegExp(contraction.replace("'", "'"), 'gi'), expanded);
  }
  return result;
}

export function normalizeForComparison(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/·/g, '') // Remove middle dot
    .replace(/[.,!?;:'"¿¡…]+/g, '') // Remove punctuation (including ellipsis)
    .replace(/\.{2,}/g, '') // Remove multiple dots (ellipsis as ...)
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim(); // Trim again after punctuation removal
}

// Normalize for loose comparison (ignores spaces entirely)
// E.g., "goodnight" = "good night", "thankyou" = "thank you"
export function normalizeLooseComparison(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/·/g, '') // Remove middle dot
    .replace(/[.,!?;:'"¿¡…]+/g, '') // Remove punctuation (including ellipsis)
    .replace(/\.{2,}/g, '') // Remove multiple dots (ellipsis as ...)
    .replace(/[-\s]+/g, ''); // Remove all spaces and hyphens
}

export function validateTyping(userAnswer: string, correctAnswer: string): TypingResult {
  const trimmedUser = userAnswer.trim();
  const trimmedCorrect = correctAnswer.trim();

  // Get all valid forms (handles "vell / vella" -> ["vell", "vella"])
  const validForms = extractAllForms(trimmedCorrect);

  // Try to validate against each valid form
  for (const form of validForms) {
    const cleanedForm = stripBracketedContent(form);

    // Tier 1: Exact match
    if (trimmedUser === cleanedForm) {
      return {
        isCorrect: true,
        isAcceptable: true,
        userAnswer: trimmedUser,
        correctAnswer: trimmedCorrect,
        corrections: [],
      };
    }

    // Tier 2: Case-insensitive exact match
    if (trimmedUser.toLowerCase() === cleanedForm.toLowerCase()) {
      return {
        isCorrect: true,
        isAcceptable: true,
        userAnswer: trimmedUser,
        correctAnswer: trimmedCorrect,
        corrections: [],
      };
    }

    // Tier 3: Normalize and compare (ignoring accents)
    const normalizedUser = normalizeForComparison(trimmedUser);
    const normalizedForm = normalizeForComparison(cleanedForm);

    if (normalizedUser === normalizedForm) {
      const corrections = findCorrections(trimmedUser, cleanedForm);
      return {
        isCorrect: false,
        isAcceptable: true,
        userAnswer: trimmedUser,
        correctAnswer: trimmedCorrect,
        corrections,
      };
    }

    // Tier 3.5: Loose comparison ignoring spaces ("goodnight" = "good night")
    const looseUser = normalizeLooseComparison(trimmedUser);
    const looseForm = normalizeLooseComparison(cleanedForm);

    if (looseUser === looseForm) {
      // Space difference only - count as correct
      return {
        isCorrect: true,
        isAcceptable: true,
        userAnswer: trimmedUser,
        correctAnswer: trimmedCorrect,
        corrections: [],
      };
    }

    // Tier 4: Contraction-normalized comparison (e.g., "don't" = "do not")
    const contractedUser = expandContractions(normalizedUser);
    const contractedForm = expandContractions(normalizedForm);

    if (contractedUser === contractedForm) {
      return {
        isCorrect: true,
        isAcceptable: true,
        userAnswer: trimmedUser,
        correctAnswer: trimmedCorrect,
        corrections: [],
      };
    }

    // Tier 5: Typo tolerance via similarity score
    const similarity = getSimilarityScore(contractedUser, contractedForm);

    if (similarity >= TYPING_CONFIG.TYPO_SIMILARITY_THRESHOLD) {
      const corrections = findCorrections(trimmedUser, cleanedForm);
      return {
        isCorrect: false,
        isAcceptable: true,
        hasTypo: true,
        userAnswer: trimmedUser,
        correctAnswer: trimmedCorrect,
        corrections,
      };
    }
  }

  // None of the forms matched - use first form for corrections
  const primaryForm = stripBracketedContent(validForms[0] || trimmedCorrect);
  const corrections = findCorrections(trimmedUser, primaryForm);

  return {
    isCorrect: false,
    isAcceptable: false,
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
