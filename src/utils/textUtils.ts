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
