import { describe, it, expect, beforeEach } from 'vitest';
import {
  createInitialProgress,
  calculateSM2,
  isDueForReview,
  isNewCard,
  isStrugglingCard,
  getMasteryLevel,
  qualityFromTypingResult,
  qualityFromMultipleChoice,
} from './sm2Algorithm';
import type { CardProgress } from '../types/flashcard';
import { SM2_CONFIG, MASTERY_CONFIG } from '../config/constants';

describe('SM-2 Algorithm', () => {
  describe('createInitialProgress', () => {
    it('should create progress with default values', () => {
      const progress = createInitialProgress('card1', 'english-to-catalan');

      expect(progress.cardId).toBe('card1');
      expect(progress.direction).toBe('english-to-catalan');
      expect(progress.easeFactor).toBe(SM2_CONFIG.DEFAULT_EASE_FACTOR);
      expect(progress.interval).toBe(0);
      expect(progress.repetitions).toBe(0);
      expect(progress.totalReviews).toBe(0);
      expect(progress.correctReviews).toBe(0);
      expect(progress.nextReviewDate).toBeInstanceOf(Date);
    });

    it('should work with catalan-to-english direction', () => {
      const progress = createInitialProgress('card2', 'catalan-to-english');

      expect(progress.direction).toBe('catalan-to-english');
    });
  });

  describe('calculateSM2', () => {
    let baseProgress: CardProgress;

    beforeEach(() => {
      baseProgress = createInitialProgress('test-card', 'english-to-catalan');
    });

    it('should reset repetitions on quality < 3', () => {
      const progressWithReps = {
        ...baseProgress,
        repetitions: 5,
        interval: 30,
      };

      const result = calculateSM2(progressWithReps, 2);

      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
    });

    it('should set interval to 1 on first successful review', () => {
      const result = calculateSM2(baseProgress, 4);

      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(1);
    });

    it('should set interval to 6 on second successful review', () => {
      const firstReview = calculateSM2(baseProgress, 4);
      const secondReview = calculateSM2(firstReview, 4);

      expect(secondReview.interval).toBe(6);
      expect(secondReview.repetitions).toBe(2);
    });

    it('should multiply interval by ease factor on subsequent reviews', () => {
      const progress: CardProgress = {
        ...baseProgress,
        repetitions: 2,
        interval: 6,
        easeFactor: 2.5,
      };

      const result = calculateSM2(progress, 4);

      // interval = 6 * 2.5 = 15 (rounded)
      expect(result.interval).toBe(15);
      expect(result.repetitions).toBe(3);
    });

    it('should cap interval at max days', () => {
      const progress: CardProgress = {
        ...baseProgress,
        repetitions: 10,
        interval: 300,
        easeFactor: 2.5,
      };

      const result = calculateSM2(progress, 5);

      expect(result.interval).toBeLessThanOrEqual(SM2_CONFIG.MAX_INTERVAL_DAYS);
    });

    it('should not decrease ease factor below minimum', () => {
      const progress: CardProgress = {
        ...baseProgress,
        easeFactor: 1.5,
        repetitions: 3,
        interval: 10,
      };

      const result = calculateSM2(progress, 3);

      expect(result.easeFactor).toBeGreaterThanOrEqual(SM2_CONFIG.MIN_EASE_FACTOR);
    });

    it('should increase ease factor on quality 5', () => {
      const progress: CardProgress = {
        ...baseProgress,
        easeFactor: 2.5,
        repetitions: 3,
        interval: 10,
      };

      const result = calculateSM2(progress, 5);

      expect(result.easeFactor).toBeGreaterThan(progress.easeFactor);
    });

    it('should handle invalid quality by defaulting to 3', () => {
      const result = calculateSM2(baseProgress, NaN);

      expect(result.repetitions).toBe(1); // Should be treated as quality 3
    });

    it('should clamp quality to 0-5 range', () => {
      const result1 = calculateSM2(baseProgress, -5);
      const result2 = calculateSM2(baseProgress, 10);

      expect(result1.repetitions).toBe(0); // Quality 0 resets
      expect(result2.easeFactor).toBeGreaterThan(SM2_CONFIG.DEFAULT_EASE_FACTOR); // Quality 5 increases EF
    });

    it('should update totalReviews and correctReviews', () => {
      const result = calculateSM2(baseProgress, 4);

      expect(result.totalReviews).toBe(1);
      expect(result.correctReviews).toBe(1);

      const failed = calculateSM2(result, 1);

      expect(failed.totalReviews).toBe(2);
      expect(failed.correctReviews).toBe(1); // Still 1, didn't increment
    });
  });

  describe('isDueForReview', () => {
    it('should return true for cards due today', () => {
      const progress = createInitialProgress('card1', 'english-to-catalan');
      progress.nextReviewDate = new Date();

      expect(isDueForReview(progress)).toBe(true);
    });

    it('should return true for overdue cards', () => {
      const progress = createInitialProgress('card1', 'english-to-catalan');
      progress.nextReviewDate = new Date(Date.now() - 86400000); // Yesterday

      expect(isDueForReview(progress)).toBe(true);
    });

    it('should return false for future cards', () => {
      const progress = createInitialProgress('card1', 'english-to-catalan');
      progress.nextReviewDate = new Date(Date.now() + 86400000); // Tomorrow

      expect(isDueForReview(progress)).toBe(false);
    });
  });

  describe('isNewCard', () => {
    it('should return true for cards with 0 repetitions', () => {
      const progress = createInitialProgress('card1', 'english-to-catalan');

      expect(isNewCard(progress)).toBe(true);
    });

    it('should return true for cards with 1 repetition', () => {
      const progress = createInitialProgress('card1', 'english-to-catalan');
      progress.repetitions = 1;

      expect(isNewCard(progress)).toBe(true);
    });

    it('should return false for cards with 2+ repetitions', () => {
      const progress = createInitialProgress('card1', 'english-to-catalan');
      progress.repetitions = 2;

      expect(isNewCard(progress)).toBe(false);
    });
  });

  describe('isStrugglingCard', () => {
    it('should return true for low ease factor', () => {
      const progress = createInitialProgress('card1', 'english-to-catalan');
      progress.easeFactor = 1.5;

      expect(isStrugglingCard(progress)).toBe(true);
    });

    it('should return false for normal ease factor', () => {
      const progress = createInitialProgress('card1', 'english-to-catalan');

      expect(isStrugglingCard(progress)).toBe(false);
    });
  });

  describe('getMasteryLevel', () => {
    it('should return new for 0 repetitions', () => {
      const progress = createInitialProgress('card1', 'english-to-catalan');

      expect(getMasteryLevel(progress)).toBe('new');
    });

    it('should return learning for short intervals', () => {
      const progress = createInitialProgress('card1', 'english-to-catalan');
      progress.repetitions = 2;
      progress.interval = 5;

      expect(getMasteryLevel(progress)).toBe('learning');
    });

    it('should return reviewing for medium intervals', () => {
      const progress = createInitialProgress('card1', 'english-to-catalan');
      progress.repetitions = 3;
      progress.interval = 15;

      expect(getMasteryLevel(progress)).toBe('reviewing');
    });

    it('should return mastered for long intervals', () => {
      const progress = createInitialProgress('card1', 'english-to-catalan');
      progress.repetitions = 5;
      progress.interval = MASTERY_CONFIG.MASTERED_INTERVAL_DAYS + 1;

      expect(getMasteryLevel(progress)).toBe('mastered');
    });
  });

  describe('qualityFromTypingResult', () => {
    it('should return 1 for wrong answers', () => {
      expect(qualityFromTypingResult(false, false, 5000)).toBe(1);
    });

    it('should return 3 for acceptable but not correct', () => {
      expect(qualityFromTypingResult(false, true, 5000)).toBe(3);
    });

    it('should return 5 for very fast correct answer', () => {
      expect(qualityFromTypingResult(true, true, 2000)).toBe(5);
    });

    it('should return 4 for normal speed correct answer', () => {
      expect(qualityFromTypingResult(true, true, 4000)).toBe(4);
    });

    it('should return 3 for slow correct answer', () => {
      expect(qualityFromTypingResult(true, true, 10000)).toBe(3);
    });
  });

  describe('qualityFromMultipleChoice', () => {
    it('should return 1 for incorrect answer', () => {
      expect(qualityFromMultipleChoice(false, 1000)).toBe(1);
    });

    it('should return 5 for very fast correct', () => {
      expect(qualityFromMultipleChoice(true, 1500)).toBe(5);
    });

    it('should return 4 for normal speed correct', () => {
      expect(qualityFromMultipleChoice(true, 3000)).toBe(4);
    });

    it('should return 3 for slow correct', () => {
      expect(qualityFromMultipleChoice(true, 5000)).toBe(3);
    });
  });
});
