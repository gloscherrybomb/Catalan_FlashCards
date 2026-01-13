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
