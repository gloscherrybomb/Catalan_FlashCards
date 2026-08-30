import { describe, it, expect } from 'vitest';
import {
  buildReviewForecast,
  retentionByStage,
  findLeeches,
  summariseWorkload,
} from './reviewForecast';
import { createInitialProgress } from './sm2Algorithm';
import { MASTERY_CONFIG, SM2_CONFIG } from '../config/constants';
import type { CardProgress, StudyDirection } from '../types/flashcard';

const NOW = new Date(2026, 7, 30, 12, 0, 0); // Sun 30 Aug 2026, midday local

function progress(
  cardId: string,
  overrides: Partial<CardProgress> = {},
  direction: StudyDirection = 'english-to-catalan'
): CardProgress {
  return { ...createInitialProgress(cardId, direction), ...overrides };
}

function daysFromNow(n: number): Date {
  const d = new Date(NOW);
  d.setDate(d.getDate() + n);
  return d;
}

function mapOf(...entries: CardProgress[]): Map<string, CardProgress> {
  return new Map(entries.map((p, i) => [`${p.cardId}_${p.direction}_${i}`, p]));
}

describe('reviewForecast', () => {
  describe('buildReviewForecast', () => {
    it('returns one bucket per requested day', () => {
      expect(buildReviewForecast(new Map(), 14, NOW)).toHaveLength(14);
    });

    it('marks only the first day as today', () => {
      const forecast = buildReviewForecast(new Map(), 7, NOW);
      expect(forecast.filter(d => d.isToday)).toHaveLength(1);
      expect(forecast[0].isToday).toBe(true);
    });

    it('places a card on the day it falls due', () => {
      const forecast = buildReviewForecast(
        mapOf(progress('a', { repetitions: 3, nextReviewDate: daysFromNow(3) })),
        14,
        NOW
      );
      expect(forecast[3].due).toBe(1);
      expect(forecast.reduce((sum, d) => sum + d.due, 0)).toBe(1);
    });

    /**
     * Overdue work is work you still owe. Dropping it would make today look
     * lighter than it is, which is the opposite of what this chart is for.
     */
    it('collects overdue cards into today', () => {
      const forecast = buildReviewForecast(
        mapOf(
          progress('a', { repetitions: 3, nextReviewDate: daysFromNow(-5) }),
          progress('b', { repetitions: 3, nextReviewDate: daysFromNow(-1) })
        ),
        14,
        NOW
      );
      expect(forecast[0].due).toBe(2);
    });

    it('ignores cards that have never been reviewed', () => {
      // A new card is available to start, not scheduled work already owed.
      const forecast = buildReviewForecast(
        mapOf(progress('a', { repetitions: 0, nextReviewDate: NOW })),
        14,
        NOW
      );
      expect(forecast.reduce((sum, d) => sum + d.due, 0)).toBe(0);
    });

    it('excludes cards due beyond the window rather than piling them on the last day', () => {
      const forecast = buildReviewForecast(
        mapOf(progress('a', { repetitions: 5, nextReviewDate: daysFromNow(90) })),
        14,
        NOW
      );
      expect(forecast[forecast.length - 1].due).toBe(0);
      expect(forecast.reduce((sum, d) => sum + d.due, 0)).toBe(0);
    });

    it('counts a card due later today as due today', () => {
      const laterToday = new Date(NOW);
      laterToday.setHours(23, 0, 0, 0);
      const forecast = buildReviewForecast(
        mapOf(progress('a', { repetitions: 2, nextReviewDate: laterToday })),
        14,
        NOW
      );
      expect(forecast[0].due).toBe(1);
    });
  });

  describe('retentionByStage', () => {
    it('reports learning, young and mature bands', () => {
      expect(retentionByStage(new Map()).map(b => b.stage)).toEqual([
        'Learning',
        'Young',
        'Mature',
      ]);
    });

    it('computes accuracy per band from review counts', () => {
      const bands = retentionByStage(
        mapOf(
          // Mature card: 10 reviews, 9 correct.
          progress('a', {
            interval: MASTERY_CONFIG.MASTERED_INTERVAL_DAYS + 10,
            totalReviews: 10,
            correctReviews: 9,
          }),
          // Learning card: 4 reviews, 2 correct.
          progress('b', { interval: 1, totalReviews: 4, correctReviews: 2 })
        )
      );

      expect(bands.find(b => b.stage === 'Mature')?.retention).toBe(90);
      expect(bands.find(b => b.stage === 'Learning')?.retention).toBe(50);
    });

    it('reports the review count so a rate on tiny samples can be discounted', () => {
      const bands = retentionByStage(
        mapOf(progress('a', { interval: 1, totalReviews: 2, correctReviews: 2 }))
      );
      const learning = bands.find(b => b.stage === 'Learning')!;
      expect(learning.retention).toBe(100);
      expect(learning.reviews).toBe(2);
    });

    it('reports zero rather than dividing by zero for an empty band', () => {
      const bands = retentionByStage(new Map());
      expect(bands.every(b => b.retention === 0 && b.reviews === 0)).toBe(true);
    });

    it('ignores cards with no reviews yet', () => {
      const bands = retentionByStage(
        mapOf(progress('a', { interval: 1, totalReviews: 0, correctReviews: 0 }))
      );
      expect(bands.find(b => b.stage === 'Learning')?.cards).toBe(0);
    });
  });

  describe('findLeeches', () => {
    it('finds a card that is repeatedly forgotten', () => {
      const leeches = findLeeches(
        mapOf(
          progress('hard', {
            totalReviews: 10,
            correctReviews: 3,
            easeFactor: SM2_CONFIG.MIN_EASE_FACTOR,
          })
        )
      );
      expect(leeches).toHaveLength(1);
      expect(leeches[0].cardId).toBe('hard');
      expect(leeches[0].accuracy).toBe(30);
      expect(leeches[0].lapses).toBe(7);
    });

    it('ignores cards without enough reviews to judge', () => {
      // One bad review is not a leech; it is a Tuesday.
      expect(
        findLeeches(mapOf(progress('a', { totalReviews: 2, correctReviews: 0 })))
      ).toEqual([]);
    });

    it('ignores cards the learner is getting right', () => {
      expect(
        findLeeches(
          mapOf(progress('a', { totalReviews: 20, correctReviews: 19, easeFactor: 2.5 }))
        )
      ).toEqual([]);
    });

    it('orders worst first', () => {
      const leeches = findLeeches(
        mapOf(
          progress('bad', { totalReviews: 10, correctReviews: 5 }),
          progress('worse', { totalReviews: 10, correctReviews: 1 })
        )
      );
      expect(leeches.map(l => l.cardId)).toEqual(['worse', 'bad']);
    });

    it('respects the limit', () => {
      const many = Array.from({ length: 30 }, (_, i) =>
        progress(`c${i}`, { totalReviews: 10, correctReviews: 1 })
      );
      expect(findLeeches(mapOf(...many), { limit: 5 })).toHaveLength(5);
    });
  });

  describe('summariseWorkload', () => {
    it('reports due today, average and peak', () => {
      const summary = summariseWorkload(
        mapOf(
          progress('a', { repetitions: 2, nextReviewDate: daysFromNow(0) }),
          progress('b', { repetitions: 2, nextReviewDate: daysFromNow(2) }),
          progress('c', { repetitions: 2, nextReviewDate: daysFromNow(2) }),
          progress('d', { repetitions: 2, nextReviewDate: daysFromNow(2) })
        ),
        10,
        14,
        NOW
      );

      expect(summary.dueToday).toBe(1);
      expect(summary.peak?.due).toBe(3);
    });

    it('counts card directions never started', () => {
      const summary = summariseWorkload(
        mapOf(progress('a', { repetitions: 3, nextReviewDate: daysFromNow(1) })),
        10, // ten card-directions exist in total
        14,
        NOW
      );
      expect(summary.untouched).toBe(9);
    });

    it('never reports a negative untouched count', () => {
      const summary = summariseWorkload(
        mapOf(progress('a', { repetitions: 3, nextReviewDate: daysFromNow(1) })),
        0,
        14,
        NOW
      );
      expect(summary.untouched).toBe(0);
    });

    it('has no peak when nothing is scheduled', () => {
      expect(summariseWorkload(new Map(), 0, 14, NOW).peak).toBeNull();
    });
  });
});
