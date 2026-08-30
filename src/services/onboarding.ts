import { logger } from './logger';

/**
 * First-run state.
 *
 * The app had no onboarding of any kind. A new learner landed on a home page
 * with no cards, a "Learn Catalan step by step" hero pointing at a 20-unit
 * course they had no vocabulary for, and a placement test buried three levels
 * deep inside the Learning Path that nothing ever offered them. Every learner
 * therefore started at unit 1 regardless of what they already knew.
 *
 * Stored per device rather than per account: it decides whether to show a
 * one-time introduction, and getting it wrong costs a skippable screen, not
 * data. Keeping it out of Firestore means it also works before sign-in, which
 * is exactly when it needs to work.
 */

const STORAGE_KEY = 'catalan-onboarding-complete';

export function hasCompletedOnboarding(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch (error) {
    // Private browsing: treat as complete rather than showing the introduction
    // on every single visit, which would be worse than never showing it.
    logger.warn('Could not read onboarding state', 'Onboarding', { error: String(error) });
    return true;
  }
}

export function markOnboardingComplete(): void {
  try {
    localStorage.setItem(STORAGE_KEY, 'true');
  } catch (error) {
    logger.warn('Could not persist onboarding state', 'Onboarding', { error: String(error) });
  }
}

/**
 * Should the introduction run?
 *
 * Deliberately also checks for existing work. Anyone who already has cards or
 * review history is not a new learner - they are an existing user on a new
 * device, or someone whose local storage was cleared - and interrupting them
 * with a welcome screen would be a bug, not an introduction.
 */
export function shouldShowOnboarding(options: {
  cardCount: number;
  totalCardsReviewed: number;
}): boolean {
  if (options.cardCount > 0 || options.totalCardsReviewed > 0) {
    // Record it, so the check is cheap and stable from now on.
    markOnboardingComplete();
    return false;
  }
  return !hasCompletedOnboarding();
}
