import type { Flashcard } from '../types/flashcard';
import { EXAMPLE_SENTENCES, type SentenceData } from '../data/exampleSentences';
import { extractAllForms, tokenise, CATALAN_WORD_CHARS, normalizeTypography } from '../utils/textUtils';

// Re-exported so callers that only need tokenisation don't reach past this
// module; the implementation lives in textUtils, which imports nothing and so
// can be shared with the sentence data without creating an import cycle.
export { tokenise };

/**
 * Finding the example sentence that actually demonstrates a vocabulary word.
 *
 * This lived as a private function inside VocabularyIntro, which made it
 * untestable - and it had two defects that quietly degraded the "learn in
 * context" step for most of the vocabulary:
 *
 *  1. It compared whole whitespace-separated tokens, so a multi-word entry
 *     ("bon dia", "Com et dius?") could never match anything, because no single
 *     token ever equals a two-word phrase.
 *  2. Splitting on whitespace alone mishandles Catalan's clitics and elisions.
 *
 * Catalan needs two specific rules, and they pull in opposite directions:
 *
 *  - Apostrophes ARE word boundaries. `l'aigua` is the article `l'` plus
 *    `aigua`, so a card for "aigua" should match it. Likewise `d'hora`.
 *  - Hyphens are NOT. `conèixer-te` is a verb with an attached clitic pronoun;
 *    the `-te` there is not the noun `te` ("tea"). Splitting on the hyphen
 *    reintroduces exactly the false match the earlier substring bug produced
 *    ("te" matching "Encantada de conèixer-te!").
 */

/** Normalise for comparison: lowercase, and trim stray edge punctuation. */
function normalise(text: string): string {
  return normalizeTypography(text)
    .toLowerCase()
    .replace(new RegExp(`^[^${CATALAN_WORD_CHARS}]+|[^${CATALAN_WORD_CHARS}]+$`, 'g'), '')
    .trim();
}

/**
 * Does `haystack` contain `needle` as a whole word, or as a contiguous run of
 * whole words when `needle` is a phrase?
 */
export function containsWord(haystack: string, needle: string): boolean {
  const target = tokenise(normalise(needle));
  if (target.length === 0) return false;

  const tokens = tokenise(haystack);
  if (target.length === 1) return tokens.includes(target[0]);

  // Phrase: look for the tokens appearing consecutively.
  for (let i = 0; i + target.length <= tokens.length; i++) {
    if (target.every((word, offset) => tokens[i + offset] === word)) return true;
  }
  return false;
}

/**
 * Find an example sentence demonstrating this card.
 *
 * Both gender forms are considered, so a card for "vell / vella" matches a
 * sentence using either. Catalan is matched first because seeing the target
 * language in context is the point; the English side is a fallback for cards
 * whose Catalan happens not to appear verbatim.
 */
export function findExampleSentence(
  card: Pick<Flashcard, 'front' | 'back'>,
  sentences: SentenceData[] = EXAMPLE_SENTENCES
): SentenceData | null {
  const catalanForms = extractAllForms(card.back);
  const englishForms = extractAllForms(card.front);

  // An explicit declaration beats surface matching, and is the only thing that
  // can connect an inflected sentence to the dictionary form on the card
  // ("Em desperto..." teaches `despertar-se`).
  const byDeclaredTarget = sentences.find(sentence =>
    sentence.targetWords?.some(target =>
      catalanForms.some(form => normalise(form) === normalise(target))
    )
  );
  if (byDeclaredTarget) return byDeclaredTarget;

  const byCatalan = sentences.find(sentence =>
    catalanForms.some(form => containsWord(sentence.catalan, form))
  );
  if (byCatalan) return byCatalan;

  const byEnglish = sentences.find(sentence =>
    englishForms.some(form => containsWord(sentence.english, form))
  );
  return byEnglish ?? null;
}
