import { describe, it, expect } from 'vitest';
import { checkAchievements } from './achievementService';
import { ACHIEVEMENTS } from '../data/achievements';
import type { UserProgress } from '../types/user';

const BASE: UserProgress = {
  xp: 0,
  level: 1,
  currentStreak: 0,
  longestStreak: 0,
  lastStudyDate: null,
  totalCardsReviewed: 0,
  totalCorrect: 0,
  totalTimeSpentMs: 0,
  cardsLearned: 0,
  streakFreezeAvailable: true,
  dailyActivity: {},
  speakingExercises: 0,
  perfectPronunciations: 0,
};

async function unlockedWith(progress: Partial<UserProgress>) {
  const result = await checkAchievements({
    progress: { ...BASE, ...progress },
    cardProgress: new Map(),
    flashcards: [],
    perfectStreak: 0,
    unlockedAchievements: [],
    hasImported: false,
  });
  return result.map(a => a.id);
}

describe('achievementService', () => {
  /**
   * Every requirement type present in the data must be handled. Five
   * achievements (three speaking, two pronunciation) used to fall through
   * checkRequirement's default and return false unconditionally, so they were
   * displayed as goals worth 490 XP that could never be unlocked.
   */
  it('handles every requirement type that appears in the achievement data', async () => {
    const typesInData = new Set(ACHIEVEMENTS.map(a => a.requirement.type));

    // A generous profile: anything still locked is locked because its type is
    // unhandled, not because the threshold was not met.
    const unlocked = await unlockedWith({
      currentStreak: 1000,
      longestStreak: 1000,
      totalCardsReviewed: 100000,
      level: 100,
      xp: 1000000,
      speakingExercises: 100000,
      perfectPronunciations: 100000,
    });

    const unreachable = ACHIEVEMENTS.filter(
      a =>
        !unlocked.includes(a.id) &&
        // These legitimately need card data rather than counters.
        !['cards_mastered', 'category_mastered', 'first_action', 'perfect_streak'].includes(
          a.requirement.type
        )
    ).map(a => `${a.id} (${a.requirement.type})`);

    expect(typesInData.size).toBeGreaterThan(0);
    expect(unreachable).toEqual([]);
  });

  it('unlocks the first speaking achievement after one attempt', async () => {
    expect(await unlockedWith({ speakingExercises: 1 })).toContain('first_speak');
  });

  it('does not unlock a speaking achievement before its threshold', async () => {
    expect(await unlockedWith({ speakingExercises: 24 })).not.toContain('speak_25');
    expect(await unlockedWith({ speakingExercises: 25 })).toContain('speak_25');
  });

  it('unlocks pronunciation achievements from excellent attempts only', async () => {
    // Many attempts, none excellent: the pronunciation badge stays locked.
    const manyAttempts = await unlockedWith({
      speakingExercises: 500,
      perfectPronunciations: 0,
    });
    expect(manyAttempts).not.toContain('perfect_pronunciation');

    const withExcellent = await unlockedWith({ perfectPronunciations: 10 });
    expect(withExcellent).toContain('perfect_pronunciation');
  });

  it('treats a profile saved before these counters existed as zero', async () => {
    const legacy = { ...BASE };
    delete legacy.speakingExercises;
    delete legacy.perfectPronunciations;

    const unlocked = await unlockedWith(legacy);
    expect(unlocked).not.toContain('first_speak');
  });
});
