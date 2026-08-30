import { logger } from './logger';

/**
 * Tracks which category introductions the learner has already seen.
 *
 * These lived inside CategoryIntro.tsx. Storage access is not a rendering
 * concern, it is the only part of that file anything else imports, and keeping
 * it there meant the component module could not fast-refresh cleanly.
 */

const SHOWN_INTROS_KEY = 'catalan_shown_category_intros';

function readShownCategories(): string[] {
  try {
    const stored = localStorage.getItem(SHOWN_INTROS_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : [];
    // Guard the shape: a corrupted value should reset, not throw on .includes.
    return Array.isArray(parsed) ? parsed.filter((c): c is string => typeof c === 'string') : [];
  } catch (error) {
    logger.warn('Could not read shown category intros', 'CategoryIntro', {
      error: String(error),
    });
    return [];
  }
}

/** Has this category's introduction already been shown? */
export function hasCategoryIntroBeenShown(category: string): boolean {
  return readShownCategories().includes(category);
}

/** Record that this category's introduction has been shown. */
export function markCategoryIntroShown(category: string): void {
  const shown = readShownCategories();
  if (shown.includes(category)) return;

  try {
    localStorage.setItem(SHOWN_INTROS_KEY, JSON.stringify([...shown, category]));
  } catch (error) {
    // Private browsing or a full quota. Showing the intro again is a far better
    // outcome than failing the study session.
    logger.warn('Could not record shown category intro', 'CategoryIntro', {
      error: String(error),
    });
  }
}
