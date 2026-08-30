import type { CardProgress, StudyDirection } from '../types/flashcard';
import { MASTERY_CONFIG } from '../config/constants';

/**
 * Mastery is a *derived* property of card progress, never a stored tally.
 *
 * `cardsLearned` used to be maintained by incrementing a counter inside
 * reviewCard whenever a card crossed the mastery interval. That drifted in
 * three ways: it never decremented when a card lapsed back below the
 * threshold, it double-counted a card that lapsed and recovered, and the
 * read-modify-write raced across rapid reviews. Computing it from
 * cardProgress on demand cannot drift, because cardProgress is the truth.
 */

const DIRECTIONS: StudyDirection[] = ['english-to-catalan', 'catalan-to-english'];

/** True when a single direction of a card has reached the mastery interval. */
export function isDirectionMastered(progress: CardProgress | undefined): boolean {
  return (progress?.interval ?? 0) >= MASTERY_CONFIG.MASTERED_INTERVAL_DAYS;
}

/**
 * Number of cards mastered in BOTH directions.
 *
 * Requiring both directions is deliberate: recognising `poma` when you see it
 * is a much weaker claim than producing it when prompted with "apple", and a
 * learner who can only do the former has not really learned the word.
 */
export function countMasteredCards(cardProgress: Map<string, CardProgress>): number {
  const byCard = new Map<string, number>();

  for (const progress of cardProgress.values()) {
    if (isDirectionMastered(progress)) {
      byCard.set(progress.cardId, (byCard.get(progress.cardId) ?? 0) + 1);
    }
  }

  let mastered = 0;
  for (const directionsMastered of byCard.values()) {
    if (directionsMastered >= DIRECTIONS.length) mastered++;
  }
  return mastered;
}
