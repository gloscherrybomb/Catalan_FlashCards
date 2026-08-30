import { describe, it, expect } from 'vitest';
import { countMasteredCards, isDirectionMastered } from './mastery';
import { createInitialProgress } from '../services/sm2Algorithm';
import { MASTERY_CONFIG } from '../config/constants';
import type { CardProgress, StudyDirection } from '../types/flashcard';

const MASTERED = MASTERY_CONFIG.MASTERED_INTERVAL_DAYS;

function progress(
  cardId: string,
  direction: StudyDirection,
  interval: number
): CardProgress {
  return { ...createInitialProgress(cardId, direction), interval };
}

function mapOf(...entries: CardProgress[]): Map<string, CardProgress> {
  return new Map(entries.map(p => [`${p.cardId}_${p.direction}`, p]));
}

describe('mastery', () => {
  describe('isDirectionMastered', () => {
    it('is true at the mastery interval', () => {
      expect(isDirectionMastered(progress('a', 'english-to-catalan', MASTERED))).toBe(true);
    });

    it('is false just below it', () => {
      expect(isDirectionMastered(progress('a', 'english-to-catalan', MASTERED - 1))).toBe(false);
    });

    it('treats missing progress as not mastered', () => {
      expect(isDirectionMastered(undefined)).toBe(false);
    });
  });

  describe('countMasteredCards', () => {
    it('counts nothing for an empty map', () => {
      expect(countMasteredCards(new Map())).toBe(0);
    });

    /**
     * Recognising a word is a weaker claim than producing it, so a card only
     * counts once both directions are mastered. achievementService used to
     * count either direction while getCategoryStats required both, which meant
     * the app reported two different numbers for the same idea.
     */
    it('requires BOTH directions to be mastered', () => {
      const oneWayOnly = mapOf(
        progress('a', 'english-to-catalan', MASTERED),
        progress('a', 'catalan-to-english', 1)
      );
      expect(countMasteredCards(oneWayOnly)).toBe(0);
    });

    it('counts a card mastered in both directions', () => {
      const both = mapOf(
        progress('a', 'english-to-catalan', MASTERED),
        progress('a', 'catalan-to-english', MASTERED)
      );
      expect(countMasteredCards(both)).toBe(1);
    });

    it('counts each card once, not once per direction', () => {
      const two = mapOf(
        progress('a', 'english-to-catalan', MASTERED + 10),
        progress('a', 'catalan-to-english', MASTERED),
        progress('b', 'english-to-catalan', MASTERED),
        progress('b', 'catalan-to-english', MASTERED)
      );
      expect(countMasteredCards(two)).toBe(2);
    });

    /**
     * The property the old incrementing counter could not hold: a card that
     * lapses stops counting. The counter only ever went up, so a lapsed card
     * stayed "mastered" forever and a recovered one was counted twice.
     */
    it('stops counting a card that lapses below the threshold', () => {
      const mastered = mapOf(
        progress('a', 'english-to-catalan', MASTERED),
        progress('a', 'catalan-to-english', MASTERED)
      );
      expect(countMasteredCards(mastered)).toBe(1);

      // The learner forgets it; SM-2 resets the interval to 1 day.
      const lapsed = mapOf(
        progress('a', 'english-to-catalan', 1),
        progress('a', 'catalan-to-english', MASTERED)
      );
      expect(countMasteredCards(lapsed)).toBe(0);
    });

    it('is idempotent - recomputing cannot double-count', () => {
      const m = mapOf(
        progress('a', 'english-to-catalan', MASTERED),
        progress('a', 'catalan-to-english', MASTERED)
      );
      expect(countMasteredCards(m)).toBe(countMasteredCards(m));
      expect(countMasteredCards(m)).toBe(1);
    });

    it('ignores cards with no mastered direction', () => {
      const none = mapOf(
        progress('a', 'english-to-catalan', 0),
        progress('b', 'catalan-to-english', 5)
      );
      expect(countMasteredCards(none)).toBe(0);
    });
  });
});
