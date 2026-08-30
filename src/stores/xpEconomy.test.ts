import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { StudyCard, StudyDirection } from '../types/flashcard';
import { createInitialProgress } from '../services/sm2Algorithm';

vi.mock('../services/firebase', () => ({
  isDemoMode: true,
  onAuthChange: () => () => {},
  getUserProfile: vi.fn(), createUserProfile: vi.fn(), getUserProgress: vi.fn(),
  updateUserProgress: vi.fn(), updateUserSettings: vi.fn(),
  getUnlockedAchievements: vi.fn(async () => []),
  signInWithGoogle: vi.fn(), signOut: vi.fn(),
  saveFlashcards: vi.fn(), getFlashcards: vi.fn(async () => []),
  deleteFlashcard: vi.fn(), getCardProgress: vi.fn(async () => []),
  updateCardProgress: vi.fn(), unlockAchievement: vi.fn(),
  getCurriculumProgress: vi.fn(async () => null), updateCurriculumProgress: vi.fn(),
  getGrammarProgress: vi.fn(async () => null), updateGrammarProgress: vi.fn(),
  getStoryProgress: vi.fn(async () => null), updateStoryProgress: vi.fn(),
  getDailyChallengesData: vi.fn(async () => null), setDailyChallengesData: vi.fn(),
  getWeeklyChallengesData: vi.fn(async () => null), setWeeklyChallengesData: vi.fn(),
}));
vi.mock('../services/notificationService', () => ({
  notificationService: { initialize: vi.fn(), clearUser: vi.fn() },
}));

import { useSessionStore } from './sessionStore';
import { useUserStore } from './userStore';
import { useCardStore } from './cardStore';
import { XP_VALUES } from '../types/gamification';
import { ALL_REWARDS } from '../types/rewards';

function studyCard(id: string, direction: StudyDirection = 'english-to-catalan'): StudyCard {
  return {
    flashcard: { id, front: `en-${id}`, back: `ca-${id}`, notes: '', category: 'Test', iconKey: 'x', createdAt: new Date() },
    progress: createInitialProgress(id, direction),
    direction,
    requiresTyping: false,
  };
}

function resetUser() {
  useUserStore.setState({
    user: null,
    pendingLevelUp: null,
    progress: {
      xp: 0, level: 1, currentStreak: 0, longestStreak: 0, lastStudyDate: null,
      totalCardsReviewed: 0, totalCorrect: 0, totalTimeSpentMs: 0, cardsLearned: 0,
      streakFreezeAvailable: true, dailyActivity: {},
    },
  });
  useCardStore.setState({ flashcards: [], cardProgress: new Map(), mistakeHistory: [] });
  useSessionStore.getState().resetSession();
}

describe('XP economy', () => {
  beforeEach(resetUser);

  it('awards card XP exactly once per answered card', async () => {
    const deck = Array.from({ length: 10 }, (_, i) => studyCard(`c${i}`));
    useSessionStore.getState().startSessionWithDeck('flip', deck);

    for (let i = 0; i < deck.length; i++) {
      await useSessionStore.getState().submitAnswer(5);
      useSessionStore.getState().nextCard();
    }

    // Ten perfect answers and nothing else. A double-award here would be the
    // difference between a balanced economy and an inflated one.
    expect(useUserStore.getState().progress.xp).toBe(10 * XP_VALUES.CARD_PERFECT);
  });

  it('adds only achievement rewards at the end of a session', async () => {
    const deck = Array.from({ length: 10 }, (_, i) => studyCard(`c${i}`));
    useSessionStore.getState().startSessionWithDeck('flip', deck);
    for (let i = 0; i < deck.length; i++) {
      await useSessionStore.getState().submitAnswer(5);
      useSessionStore.getState().nextCard();
    }

    const beforeEnd = useUserStore.getState().progress.xp;
    const summary = await useSessionStore.getState().endSession();
    const afterEnd = useUserStore.getState().progress.xp;

    // endSession must not pay the card XP a second time: the only permitted
    // increase is the reward for achievements it unlocked.
    const achievementXP = afterEnd - beforeEnd;
    expect(achievementXP).toBeGreaterThanOrEqual(0);
    expect(summary.newAchievements.length > 0 || achievementXP === 0).toBe(true);

    // The summary reports the session's own card XP, not the achievements.
    expect(summary.xpEarned).toBe(beforeEnd);
  });

  it('measures what one 20-card session is worth', async () => {
    const deck = Array.from({ length: 20 }, (_, i) => studyCard(`c${i}`));
    useSessionStore.getState().startSessionWithDeck('flip', deck);
    // A realistic beginner mix rather than all-perfect.
    const qualities = [5,5,5,4,4,5,3,5,4,5,5,2,5,4,5,5,3,5,4,5];
    for (let i = 0; i < deck.length; i++) {
      await useSessionStore.getState().submitAnswer(qualities[i]);
      useSessionStore.getState().nextCard();
    }
    await useSessionStore.getState().endSession();

    const xp = useUserStore.getState().progress.xp;

    // A single session is worth a few hundred XP. The catalogue is priced
    // against that: it used to total 17,350, which an engaged learner earned
    // inside a fortnight once achievements, challenges and practice rewards
    // were counted - so everything was affordable almost immediately.
    expect(xp).toBeGreaterThan(200);
    expect(xp).toBeLessThan(600);

    const catalogue = ALL_REWARDS.reduce((sum, r) => sum + r.xpCost, 0);
    expect(catalogue / xp).toBeGreaterThan(100); // sessions to buy everything
  });
});
