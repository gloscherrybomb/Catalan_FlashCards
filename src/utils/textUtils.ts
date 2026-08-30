/**
 * Strips common punctuation from text for answer comparison.
 * Removes periods, commas, ellipsis, question marks, exclamation points,
 * quotes, colons, semicolons, and Spanish/Catalan inverted punctuation.
 *
 * @example
 * stripPunctuation("Soc...") // "Soc"
 * stripPunctuation("Hola!") // "Hola"
 * stripPunctuation("¿Què?") // "Què"
 */
export function stripPunctuation(text: string): string {
  return text
    .replace(/[.,!?;:'"¿¡…]+/g, '') // Remove common punctuation
    .replace(/\.{2,}/g, '') // Remove multiple dots (ellipsis as ...)
    .trim();
}

/**
 * Strips bracketed content from text.
 * Removes gender markers like (M), (F), (M Pl), (feminine), etc.
 * Also removes any other parenthetical notes.
 *
 * @example
 * stripBracketedContent("Platja (F)") // "Platja"
 * stripBracketedContent("Casa (feminine)") // "Casa"
 * stripBracketedContent("Gat (M Pl)") // "Gat"
 */
export function stripBracketedContent(text: string): string {
  return text
    .replace(/\s*\([^)]*\)\s*/g, ' ') // Replace bracketed content with space
    .replace(/\s+/g, ' ') // Normalize multiple spaces
    .trim();
}

/**
 * Extracts the primary (first) form from a word that may contain alternatives.
 * Handles patterns like "word1 / word2" or "word1/word2" for masculine/feminine variants.
 *
 * @example
 * extractPrimaryForm("vell / vella") // "vell"
 * extractPrimaryForm("gran") // "gran"
 * extractPrimaryForm("el gos / la gossa") // "el gos"
 * extractPrimaryForm("Old (M/F)") // "Old"
 */
export function extractPrimaryForm(text: string): string {
  // First strip any bracketed content like (F), (M), (M/F)
  const stripped = stripBracketedContent(text);

  // Split on " / " or "/" and take the first form
  const parts = stripped.split(/\s*\/\s*/);
  return parts[0].trim();
}

/**
 * Extracts all forms from a word that may contain alternatives.
 * Returns an array of all valid answer forms for validation.
 *
 * @example
 * extractAllForms("vell / vella") // ["vell", "vella"]
 * extractAllForms("gran") // ["gran"]
 * extractAllForms("el gos / la gossa") // ["el gos", "la gossa"]
 */
export function extractAllForms(text: string): string[] {
  // First strip any bracketed content
  const stripped = stripBracketedContent(text);

  // Split on " / " or "/" and return all forms
  const parts = stripped.split(/\s*\/\s*/);
  return parts.map(p => p.trim()).filter(p => p.length > 0);
}

/**
 * Letters that can occur inside a Catalan word: the accented vowels, ç, ü/ï,
 * the interpunct of `l·l`, and the hyphen of attached clitic pronouns.
 *
 * Deliberately not `\w`, which is ASCII-only and would treat `à` as a word
 * boundary - the cause of several mis-matched example sentences.
 */
export const CATALAN_WORD_CHARS = "a-zA-ZàèéíïòóúüçÀÈÉÍÏÒÓÚÜÇ0-9·\\-";

const CATALAN_SEPARATOR = new RegExp(`[^${CATALAN_WORD_CHARS}]+`);

/**
 * Split Catalan text into comparable word tokens.
 *
 * Two rules that pull in opposite directions, both needed:
 *  - Apostrophes ARE boundaries: `l'aigua` is the elided article plus `aigua`,
 *    so a card for "aigua" should match it.
 *  - Hyphens are NOT: `conèixer-te` is a verb with an attached clitic, and the
 *    `-te` there is not the noun `te` ("tea"). Splitting on it would recreate
 *    the false match the old substring search produced.
 */
export function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .split(CATALAN_SEPARATOR)
    .map(t => t.replace(/^-+|-+$/g, ''))
    .filter(Boolean);
}
