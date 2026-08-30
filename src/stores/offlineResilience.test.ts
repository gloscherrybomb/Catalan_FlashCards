import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { StudyCard, StudyDirection } from '../types/flashcard';
import { createInitialProgress } from '../services/sm2Algorithm';

/**
 * A blocked or denied Firestore must never break the study loop.
 *
 * Reported from a real browser: every answer produced
 * "FirebaseError: Missing or insufficient permissions" as an unhandled
 * rejection and the session never advanced. The answer path awaits several
 * remote writes, and any rejection propagated out of submitAnswer before
 * StudyPage could call nextCard.
 *
 * isDemoMode is false here on purpose: the existing store tests all run in demo
 * mode, which skips every remote write, which is exactly why they never saw it.
 */
vi.mock('../services/firebase', () => {
  // Defined inside the factory: vi.mock is hoisted above top-level consts.
  const denied = () => Promise.reject(new Error('Missing or insufficient permissions'));
  return {
  isDemoMode: false,
  onAuthChange: () => () => {},
  getUserProfile: vi.fn(denied),
  createUserProfile: vi.fn(denied),
  getUserProgress: vi.fn(denied),
  getUnlockedAchievements: vi.fn(async () => []),
  signInWithGoogle: vi.fn(),
  signOut: vi.fn(),
  // Every write is denied, as it is for a learner whose extension blocks
  // Firestore or whose rules reject them.
  updateUserProgress: vi.fn(denied),
  updateUserSettings: vi.fn(denied),
  updateCardProgress: vi.fn(denied),
  saveFlashcards: vi.fn(denied),
  deleteFlashcard: vi.fn(denied),
  getFlashcards: vi.fn(denied),
  getCardProgress: vi.fn(denied),
  unlockAchievement: vi.fn(denied),
  getCurriculumProgress: vi.fn(denied),
  updateCurriculumProgress: vi.fn(denied),
  getGrammarProgress: vi.fn(denied),
  updateGrammarProgress: vi.fn(denied),
  getStoryProgress: vi.fn(denied),
  updateStoryProgress: vi.fn(denied),
  getDailyChallengesData: vi.fn(denied),
  setDailyChallengesData: vi.fn(denied),
  getWeeklyChallengesData: vi.fn(denied),
    setWeeklyChallengesData: vi.fn(denied),
  };
});
vi.mock('../services/notificationService', () => ({
  notificationService: { initialize: vi.fn(), clearUser: vi.fn() },
}));

import { useSessionStore } from './sessionStore';
import { useCardStore } from './cardStore';
import { useUserStore } from './userStore';

function studyCard(id: string, direction: StudyDirection = 'english-to-catalan'): StudyCard {
  return {
    flashcard: {
      id, front: `en-${id}`, back: `ca-${id}`, notes: '',
      category: 'Test', iconKey: 'x', createdAt: new Date(),
    },
    progress: createInitialProgress(id, direction),
    direction,
    requiresTyping: false,
  };
}

describe('study loop with Firestore denied', () => {
  beforeEach(() => {
    useSessionStore.getState().resetSession();
    useCardStore.setState({ flashcards: [], cardProgress: new Map(), mistakeHistory: [] });
    // A signed-in user, so the remote writes are actually attempted.
    useUserStore.setState({
      user: { uid: 'u1' } as never,
      progress: {
        xp: 0, level: 1, currentStreak: 0, longestStreak: 0, lastStudyDate: null,
        totalCardsReviewed: 0, totalCorrect: 0, totalTimeSpentMs: 0, cardsLearned: 0,
        streakFreezeAvailable: true, dailyActivity: {},
      },
    });
  });

  it('submitAnswer resolves so the session can advance', async () => {
    useSessionStore.getState().startSessionWithDeck('flip', [studyCard('a'), studyCard('b')]);

    await expect(useSessionStore.getState().submitAnswer(5)).resolves.toBeUndefined();

    useSessionStore.getState().nextCard();
    expect(useSessionStore.getState().currentIndex).toBe(1);
  });

  it('still records the answer locally', async () => {
    useSessionStore.getState().startSessionWithDeck('flip', [studyCard('a')]);
    await useSessionStore.getState().submitAnswer(5);

    // Local truth must survive: the sync is best-effort, the review is not.
    expect(useSessionStore.getState().results).toHaveLength(1);
    expect(useCardStore.getState().cardProgress.size).toBeGreaterThan(0);
    expect(useUserStore.getState().progress.xp).toBeGreaterThan(0);
  });

  it('can complete a whole session', async () => {
    useSessionStore.getState().startSessionWithDeck('flip', [studyCard('a'), studyCard('b')]);

    await useSessionStore.getState().submitAnswer(5);
    useSessionStore.getState().nextCard();
    await useSessionStore.getState().submitAnswer(4);
    useSessionStore.getState().nextCard();

    const summary = await useSessionStore.getState().endSession();
    expect(summary.totalCards).toBe(2);
  });
});
