/**
 * Progressive Difficulty System
 * Manages mastery levels and allowed study modes based on card progress
 */

import type { StudyMode, MasteryLevel, CardProgress } from '../types/flashcard';

// Required consecutive correct answers to advance to next level
const ADVANCEMENT_THRESHOLD = 3;

// Study modes allowed at each mastery level
const MODES_BY_LEVEL: Record<MasteryLevel, StudyMode[]> = {
  0: ['multiple-choice'],                                    // Brand new - multiple choice only
  1: ['multiple-choice', 'type-answer'],                     // Learning - add typing with hints
  2: ['multiple-choice', 'type-answer', 'flip'],             // Practicing - add flip cards
  3: ['multiple-choice', 'type-answer', 'flip', 'listening', 'speak'], // Advanced - add audio modes
  4: ['multiple-choice', 'type-answer', 'flip', 'listening', 'speak', 'mixed', 'sentences', 'dictation'], // Mastered - all modes
};

// Descriptive names for each level
export const LEVEL_NAMES: Record<MasteryLevel, string> = {
  0: 'New',
  1: 'Learning',
  2: 'Practicing',
  3: 'Advanced',
  4: 'Mastered',
};

// Colors for each level (for UI)
export const LEVEL_COLORS: Record<MasteryLevel, string> = {
  0: 'text-gray-500 bg-gray-100',
  1: 'text-miro-yellow bg-miro-yellow/10',
  2: 'text-miro-orange bg-miro-orange/10',
  3: 'text-miro-blue bg-miro-blue/10',
  4: 'text-miro-green bg-miro-green/10',
};

/**
 * Get the allowed study modes for a given mastery level
 */
export function getAllowedModes(level: MasteryLevel): StudyMode[] {
  return MODES_BY_LEVEL[level] || MODES_BY_LEVEL[0];
}

/**
 * Check if a specific mode is allowed at a given mastery level
 */
export function isModeAllowed(mode: StudyMode, level: MasteryLevel): boolean {
  return getAllowedModes(level).includes(mode);
}

/**
 * Get the default/recommended mode for a mastery level
 */
export function getDefaultModeForLevel(level: MasteryLevel): StudyMode {
  switch (level) {
    case 0:
      return 'multiple-choice';
    case 1:
      return 'type-answer';
    case 2:
      return 'flip';
    case 3:
    case 4:
      return 'mixed';
    default:
      return 'multiple-choice';
  }
}

/**
 * Calculate the new mastery level and consecutive count after an answer
 * Returns updated values without modifying the original
 */
export function calculateMasteryProgress(
  currentLevel: MasteryLevel,
  consecutiveCorrect: number,
  wasCorrect: boolean,
  quality: number
): { newLevel: MasteryLevel; newConsecutive: number } {
  if (!wasCorrect || quality < 3) {
    // Wrong answer or low quality - reset consecutive count
    // Don't drop levels (that would be too punishing)
    return {
      newLevel: currentLevel,
      newConsecutive: 0,
    };
  }

  // Correct answer with good quality
  const newConsecutive = consecutiveCorrect + 1;

  // Check if we should advance to next level
  if (newConsecutive >= ADVANCEMENT_THRESHOLD && currentLevel < 4) {
    return {
      newLevel: (currentLevel + 1) as MasteryLevel,
      newConsecutive: 0, // Reset counter after level up
    };
  }

  return {
    newLevel: currentLevel,
    newConsecutive: newConsecutive,
  };
}

/**
 * Get progress towards next level as a percentage
 */
export function getLevelProgress(consecutiveCorrect: number, currentLevel: MasteryLevel): number {
  if (currentLevel >= 4) return 100; // Already at max
  return Math.min(100, Math.round((consecutiveCorrect / ADVANCEMENT_THRESHOLD) * 100));
}

/**
 * Get a description of what's needed to reach the next level
 */
export function getNextLevelRequirement(
  currentLevel: MasteryLevel,
  consecutiveCorrect: number
): string | null {
  if (currentLevel >= 4) {
    return null; // Already at max
  }

  const remaining = ADVANCEMENT_THRESHOLD - consecutiveCorrect;
  const nextLevel = (currentLevel + 1) as MasteryLevel;
  const nextModes = getAllowedModes(nextLevel).filter(
    m => !getAllowedModes(currentLevel).includes(m)
  );

  const unlocksText = nextModes.length > 0
    ? `Unlocks: ${nextModes.join(', ')}`
    : '';

  return `${remaining} more correct answer${remaining !== 1 ? 's' : ''} to reach ${LEVEL_NAMES[nextLevel]}. ${unlocksText}`;
}

/**
 * Initialize mastery fields for a new CardProgress
 */
export function initializeMasteryFields(): Pick<CardProgress, 'masteryLevel' | 'consecutiveCorrect'> {
  return {
    masteryLevel: 0 as MasteryLevel,
    consecutiveCorrect: 0,
  };
}

/**
 * Filter an array of modes to only those allowed at the given level
 */
export function filterAllowedModes(modes: StudyMode[], level: MasteryLevel): StudyMode[] {
  const allowed = getAllowedModes(level);
  return modes.filter(m => allowed.includes(m));
}

/**
 * Check if a card has reached full mastery
 */
export function isFullyMastered(level: MasteryLevel): boolean {
  return level >= 4;
}

/**
 * Get study mode recommendation based on mastery level
 */
export function getModeRecommendation(level: MasteryLevel): {
  primary: StudyMode;
  reason: string;
} {
  switch (level) {
    case 0:
      return {
        primary: 'multiple-choice',
        reason: 'Start with multiple choice to learn the basics',
      };
    case 1:
      return {
        primary: 'type-answer',
        reason: 'Practice typing to strengthen recall',
      };
    case 2:
      return {
        primary: 'flip',
        reason: 'Use flashcards for quick review',
      };
    case 3:
      return {
        primary: 'listening',
        reason: 'Train your listening skills',
      };
    case 4:
      return {
        primary: 'mixed',
        reason: 'Challenge yourself with all modes',
      };
    default:
      return {
        primary: 'multiple-choice',
        reason: 'Start with the basics',
      };
  }
}
