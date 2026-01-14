import { addDays } from 'date-fns';
import type { CardProgress, StudyDirection, MasteryLevel } from '../types/flashcard';
import { SM2_CONFIG, MASTERY_CONFIG, SPEED_THRESHOLDS } from '../config/constants';
import { calculateMasteryProgress } from '../utils/progressiveDifficulty';

/**
 * SM-2 Spaced Repetition Algorithm
 *
 * Quality ratings:
 * 0 - Complete blackout, no recall
 * 1 - Incorrect, but recognized the answer
 * 2 - Incorrect, but answer was easy to recall
 * 3 - Correct with serious difficulty
 * 4 - Correct with hesitation
 * 5 - Perfect recall
 */

export function createInitialProgress(cardId: string, direction: StudyDirection): CardProgress {
  return {
    cardId,
    direction,
    easeFactor: SM2_CONFIG.DEFAULT_EASE_FACTOR,
    interval: 0,
    repetitions: 0,
    nextReviewDate: new Date(),
    totalReviews: 0,
    correctReviews: 0,
    masteryLevel: 0 as MasteryLevel,
    consecutiveCorrect: 0,
  };
}

export function calculateSM2(
  progress: CardProgress,
  quality: number
): CardProgress {
  // Validate quality is a valid number, fallback to 3 (correct with difficulty) if invalid
  const validatedQuality = (typeof quality === 'number' && !isNaN(quality)) ? quality : 3;
  // Clamp quality to valid range (0-5)
  const q = Math.max(0, Math.min(5, Math.round(validatedQuality)));

  const now = new Date();
  let newEF = progress.easeFactor;
  let newInterval = progress.interval;
  let newReps = progress.repetitions;

  if (q < 3) {
    // Failed - reset repetitions
    newReps = 0;
    newInterval = 1;
  } else {
    // Success - update ease factor
    newEF = Math.max(
      SM2_CONFIG.MIN_EASE_FACTOR,
      progress.easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    );

    if (newReps === 0) {
      newInterval = 1;
    } else if (newReps === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(progress.interval * newEF);
    }

    newReps++;
  }

  // Cap maximum interval at configured max days
  newInterval = Math.min(newInterval, SM2_CONFIG.MAX_INTERVAL_DAYS);

  // Update mastery level based on answer quality
  const currentMasteryLevel = progress.masteryLevel ?? 0;
  const currentConsecutive = progress.consecutiveCorrect ?? 0;
  const wasCorrect = q >= 3;

  const { newLevel, newConsecutive } = calculateMasteryProgress(
    currentMasteryLevel as MasteryLevel,
    currentConsecutive,
    wasCorrect,
    q
  );

  return {
    ...progress,
    easeFactor: newEF,
    interval: newInterval,
    repetitions: newReps,
    nextReviewDate: addDays(now, newInterval),
    lastReviewDate: now,
    lastQuality: q,
    totalReviews: progress.totalReviews + 1,
    correctReviews: progress.correctReviews + (q >= 3 ? 1 : 0),
    masteryLevel: newLevel,
    consecutiveCorrect: newConsecutive,
  };
}

export function isDueForReview(progress: CardProgress): boolean {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const dueDate = new Date(progress.nextReviewDate);
  dueDate.setHours(0, 0, 0, 0);
  return dueDate <= now;
}

export function isNewCard(progress: CardProgress): boolean {
  return progress.repetitions < SM2_CONFIG.NEW_CARD_REPETITIONS_THRESHOLD;
}

export function isStrugglingCard(progress: CardProgress): boolean {
  return progress.easeFactor < SM2_CONFIG.STRUGGLING_EASE_THRESHOLD;
}

export function requiresTyping(progress: CardProgress): boolean {
  return isNewCard(progress) || isStrugglingCard(progress);
}

export function getMasteryLevel(progress: CardProgress): 'new' | 'learning' | 'reviewing' | 'mastered' {
  if (progress.repetitions === 0) return 'new';
  if (progress.interval < MASTERY_CONFIG.LEARNING_INTERVAL_DAYS) return 'learning';
  if (progress.interval < MASTERY_CONFIG.REVIEWING_INTERVAL_DAYS) return 'reviewing';
  return 'mastered';
}

export function qualityFromTypingResult(
  isCorrect: boolean,
  isAcceptable: boolean,
  timeSpentMs: number
): number {
  if (!isCorrect && !isAcceptable) {
    return 1; // Wrong
  }

  if (isAcceptable && !isCorrect) {
    return 3; // Acceptable but with issues
  }

  // Correct answer - rate based on speed
  const seconds = timeSpentMs / 1000;

  if (seconds < SPEED_THRESHOLDS.TYPING_VERY_FAST_SECONDS) return 5; // Very fast
  if (seconds < SPEED_THRESHOLDS.TYPING_NORMAL_SECONDS) return 4; // Normal
  return 3; // Slow but correct
}

export function qualityFromMultipleChoice(
  isCorrect: boolean,
  timeSpentMs: number
): number {
  if (!isCorrect) return 1;

  const seconds = timeSpentMs / 1000;

  if (seconds < SPEED_THRESHOLDS.MULTIPLE_CHOICE_FAST_SECONDS) return 5;
  if (seconds < SPEED_THRESHOLDS.MULTIPLE_CHOICE_NORMAL_SECONDS) return 4;
  return 3;
}
