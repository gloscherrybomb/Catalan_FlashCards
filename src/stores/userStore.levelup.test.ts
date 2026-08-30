import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../services/firebase', () => ({
  isDemoMode: true,
  onAuthChange: () => () => {},
  getUserProfile: vi.fn(),
  createUserProfile: vi.fn(),
  getUserProgress: vi.fn(),
  updateUserProgress: vi.fn(),
  updateUserSettings: vi.fn(),
  getUnlockedAchievements: vi.fn(async () => []),
  signInWithGoogle: vi.fn(),
  signOut: vi.fn(),
}));
vi.mock('./curriculumStore', () => ({ useCurriculumStore: { getState: () => ({ clearUser: vi.fn(), initializeFromFirebase: vi.fn() }) } }));
vi.mock('./grammarStore', () => ({ useGrammarStore: { getState: () => ({ clearUser: vi.fn(), initializeFromFirebase: vi.fn() }) } }));
vi.mock('./storyStore', () => ({ useStoryStore: { getState: () => ({ clearUser: vi.fn(), initializeFromFirebase: vi.fn() }) } }));
vi.mock('../services/notificationService', () => ({ notificationService: { initialize: vi.fn(), clearUser: vi.fn() } }));

import { useUserStore } from './userStore';
import { getLevelForXP, LEVELS } from '../types/gamification';

/** XP that sits inside level 1, and XP that is unambiguously past level 2. */
const LEVEL_2_XP = LEVELS[1].xpRequired;

describe('userStore level-up detection', () => {
  beforeEach(() => {
    useUserStore.setState({
      user: null,
      pendingLevelUp: null,
      progress: {
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
      },
    });
  });

  it('raises nothing when XP stays inside the current level', async () => {
    await useUserStore.getState().addXP(1);
    expect(useUserStore.getState().pendingLevelUp).toBeNull();
  });

  /**
   * addXP computed the new level and wrote it, but never compared it to the
   * old one, so levelling up produced no feedback at all.
   */
  it('raises a level-up when XP crosses a boundary', async () => {
    await useUserStore.getState().addXP(LEVEL_2_XP);

    const pending = useUserStore.getState().pendingLevelUp;
    expect(pending).not.toBeNull();
    expect(pending!.from).toBe(1);
    expect(pending!.to).toBe(getLevelForXP(LEVEL_2_XP).level);
  });

  it('does not overwrite a celebration that has not been shown yet', async () => {
    await useUserStore.getState().addXP(LEVEL_2_XP);
    const first = useUserStore.getState().pendingLevelUp;

    // A second award lands before the learner dismisses the first.
    await useUserStore.getState().addXP(LEVEL_2_XP * 4);

    expect(useUserStore.getState().pendingLevelUp).toEqual(first);
  });

  it('clears once the celebration is dismissed', async () => {
    await useUserStore.getState().addXP(LEVEL_2_XP);
    useUserStore.getState().clearLevelUp();
    expect(useUserStore.getState().pendingLevelUp).toBeNull();
  });

  it('still records the XP and the new level', async () => {
    await useUserStore.getState().addXP(LEVEL_2_XP);
    const { progress } = useUserStore.getState();
    expect(progress.xp).toBe(LEVEL_2_XP);
    expect(progress.level).toBe(getLevelForXP(LEVEL_2_XP).level);
  });
});
