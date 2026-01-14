import type { TypingResult, Correction, MatchType } from '../types/flashcard';
import { TYPING_CONFIG } from '../config/constants';
import { stripBracketedContent, extractAllForms } from '../utils/textUtils';
import {
  CATALAN_PHRASE_EQUIVALENCES,
  CATALAN_SYNONYMS,
  CATALAN_ARTICLES,
  CATALAN_CONTRACTIONS,
} from '../config/catalanEquivalences';

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

/**
 * Check if two phrases are equivalent based on Catalan phrase mappings.
 * E.g., "si us plau" ↔ "sisplau"
 */
function areEquivalentPhrases(user: string, correct: string): boolean {
  const normalizedUser = normalizeForComparison(user);
  const normalizedCorrect = normalizeForComparison(correct);

  // Check if user's phrase has equivalents that match correct
  const userEquivalents = CATALAN_PHRASE_EQUIVALENCES[normalizedUser];
  if (userEquivalents) {
    for (const eq of userEquivalents) {
      if (normalizeForComparison(eq) === normalizedCorrect) return true;
    }
  }

  // Check if correct phrase has equivalents that match user
  const correctEquivalents = CATALAN_PHRASE_EQUIVALENCES[normalizedCorrect];
  if (correctEquivalents) {
    for (const eq of correctEquivalents) {
      if (normalizeForComparison(eq) === normalizedUser) return true;
    }
  }

  return false;
}

/**
 * Check if two words are synonyms based on Catalan synonym groups.
 * E.g., "noi" ↔ "nen", "muller" ↔ "dona"
 */
function areSynonyms(user: string, correct: string): boolean {
  const normalizedUser = normalizeForComparison(user);
  const normalizedCorrect = normalizeForComparison(correct);

  for (const synonymGroup of CATALAN_SYNONYMS) {
    const normalizedGroup = synonymGroup.map(s => normalizeForComparison(s));
    if (normalizedGroup.includes(normalizedUser) && normalizedGroup.includes(normalizedCorrect)) {
      return true;
    }
  }
  return false;
}

/**
 * Strip leading Catalan articles from text.
 * E.g., "el gat" → "gat", "la casa" → "casa"
 */
function stripArticles(text: string): string {
  const words = text.trim().split(/\s+/);
  if (words.length === 0) return text;

  // Check if first word is an article
  const firstWord = words[0].toLowerCase();

  // Handle elided articles (l', d')
  if (firstWord.startsWith("l'") || firstWord.startsWith("d'")) {
    // Remove the article prefix, keep the rest of the first word
    words[0] = words[0].substring(2);
    return words.join(' ').trim();
  }

  // Handle regular articles
  if (CATALAN_ARTICLES.includes(firstWord)) {
    return words.slice(1).join(' ');
  }

  return text;
}

/**
 * Check if two phrases match after expanding/contracting Catalan contractions.
 * E.g., "al" ↔ "a el", "del" ↔ "de el"
 */
function matchWithContractions(user: string, correct: string): boolean {
  const normalizedUser = normalizeForComparison(user);
  const normalizedCorrect = normalizeForComparison(correct);

  // Try expanding user's contractions
  let expandedUser = normalizedUser;
  for (const [contraction, expansion] of Object.entries(CATALAN_CONTRACTIONS)) {
    const regex = new RegExp(`\\b${contraction}\\b`, 'g');
    expandedUser = expandedUser.replace(regex, expansion);
  }

  if (expandedUser === normalizedCorrect) return true;

  // Try expanding correct answer's contractions
  let expandedCorrect = normalizedCorrect;
  for (const [contraction, expansion] of Object.entries(CATALAN_CONTRACTIONS)) {
    const regex = new RegExp(`\\b${contraction}\\b`, 'g');
    expandedCorrect = expandedCorrect.replace(regex, expansion);
  }

  if (normalizedUser === expandedCorrect) return true;
  if (expandedUser === expandedCorrect) return true;

  return false;
}

/**
 * Create a result object with the specified match type and feedback.
 */
function createResult(
  userAnswer: string,
  correctAnswer: string,
  isCorrect: boolean,
  isAcceptable: boolean,
  matchType: MatchType,
  corrections: Correction[] = [],
  feedbackMessage?: string,
  hasTypo?: boolean
): TypingResult {
  return {
    isCorrect,
    isAcceptable,
    userAnswer,
    correctAnswer,
    corrections,
    matchType,
    feedbackMessage,
    hasTypo,
  };
}

export function validateTyping(userAnswer: string, correctAnswer: string): TypingResult {
  const trimmedUser = userAnswer.trim();
  const trimmedCorrect = correctAnswer.trim();

  // Get all valid forms (handles "vell / vella" -> ["vell", "vella"])
  const validForms = extractAllForms(trimmedCorrect);

  // Also extract forms from user input in case they typed "xxx / yyy"
  const userForms = extractAllForms(trimmedUser);

  // If user typed multiple forms, check if ANY user form matches ANY valid form
  if (userForms.length > 1) {
    for (const userForm of userForms) {
      for (const validForm of validForms) {
        const cleanedValid = stripBracketedContent(validForm);
        if (normalizeForComparison(userForm) === normalizeForComparison(cleanedValid)) {
          return createResult(
            trimmedUser,
            trimmedCorrect,
            true,
            true,
            'exact',
            [],
            undefined
          );
        }
      }
    }
  }

  // Try to validate against each valid form
  for (const form of validForms) {
    const cleanedForm = stripBracketedContent(form);

    // Tier 1: Exact match
    if (trimmedUser === cleanedForm) {
      return createResult(trimmedUser, trimmedCorrect, true, true, 'exact');
    }

    // Tier 2: Case-insensitive exact match
    if (trimmedUser.toLowerCase() === cleanedForm.toLowerCase()) {
      return createResult(trimmedUser, trimmedCorrect, true, true, 'case');
    }

    // Tier 3: Normalize and compare (ignoring accents)
    const normalizedUser = normalizeForComparison(trimmedUser);
    const normalizedForm = normalizeForComparison(cleanedForm);

    if (normalizedUser === normalizedForm) {
      const corrections = findCorrections(trimmedUser, cleanedForm);
      return createResult(
        trimmedUser,
        trimmedCorrect,
        false,
        true,
        'accent',
        corrections,
        'Acceptable! Watch the accents next time.'
      );
    }

    // Tier 3.1: Catalan phrase equivalence (si us plau ↔ sisplau)
    if (areEquivalentPhrases(trimmedUser, cleanedForm)) {
      return createResult(
        trimmedUser,
        trimmedCorrect,
        true,
        true,
        'phrase',
        [],
        'Correct! Alternative spelling accepted.'
      );
    }

    // Tier 3.2: Catalan synonyms (noi ↔ nen)
    if (areSynonyms(trimmedUser, cleanedForm)) {
      return createResult(
        trimmedUser,
        trimmedCorrect,
        true,
        true,
        'synonym',
        [],
        `Correct! "${trimmedUser}" is a valid synonym.`
      );
    }

    // Tier 3.3: Article-stripped match (el gat ↔ gat)
    const userNoArticle = stripArticles(trimmedUser);
    const formNoArticle = stripArticles(cleanedForm);
    if (userNoArticle !== trimmedUser || formNoArticle !== cleanedForm) {
      // Only check if articles were actually stripped
      if (normalizeForComparison(userNoArticle) === normalizeForComparison(formNoArticle)) {
        const hasUserArticle = userNoArticle !== trimmedUser;
        const hasFormArticle = formNoArticle !== cleanedForm;
        let feedback: string | undefined;

        if (!hasUserArticle && hasFormArticle) {
          // User omitted article
          feedback = `Correct! The full form includes the article: "${cleanedForm}"`;
        } else if (hasUserArticle && !hasFormArticle) {
          // User added article
          feedback = `Correct! Article not required here.`;
        }

        return createResult(
          trimmedUser,
          trimmedCorrect,
          true,
          true,
          'article',
          [],
          feedback
        );
      }
    }

    // Tier 3.4: Catalan contractions (al ↔ a el)
    if (matchWithContractions(trimmedUser, cleanedForm)) {
      return createResult(
        trimmedUser,
        trimmedCorrect,
        true,
        true,
        'contraction',
        [],
        'Correct! Contraction accepted.'
      );
    }

    // Tier 3.5: Loose comparison ignoring spaces ("goodnight" = "good night")
    const looseUser = normalizeLooseComparison(trimmedUser);
    const looseForm = normalizeLooseComparison(cleanedForm);

    if (looseUser === looseForm) {
      return createResult(
        trimmedUser,
        trimmedCorrect,
        true,
        true,
        'loose',
        [],
        undefined
      );
    }

    // Tier 4: English contraction-normalized comparison (e.g., "don't" = "do not")
    // Use original trimmed strings for contraction expansion (before apostrophe is stripped)
    const expandedUser = expandContractions(trimmedUser.toLowerCase());
    const expandedForm = expandContractions(cleanedForm.toLowerCase());

    if (normalizeForComparison(expandedUser) === normalizeForComparison(expandedForm)) {
      return createResult(trimmedUser, trimmedCorrect, true, true, 'contraction');
    }

    // Tier 5: Typo tolerance via similarity score
    // Use the expanded forms for better comparison
    const similarity = getSimilarityScore(normalizeForComparison(expandedUser), normalizeForComparison(expandedForm));

    if (similarity >= TYPING_CONFIG.TYPO_SIMILARITY_THRESHOLD) {
      const corrections = findCorrections(trimmedUser, cleanedForm);
      return createResult(
        trimmedUser,
        trimmedCorrect,
        false,
        true,
        'typo',
        corrections,
        'Acceptable, but there was a small typo.',
        true
      );
    }
  }

  // None of the forms matched - use first form for corrections
  const primaryForm = stripBracketedContent(validForms[0] || trimmedCorrect);
  const corrections = findCorrections(trimmedUser, primaryForm);

  return createResult(
    trimmedUser,
    trimmedCorrect,
    false,
    false,
    'none',
    corrections
  );
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
