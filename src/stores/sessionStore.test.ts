import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { StudyCard, StudyDirection } from '../types/flashcard';
import { createInitialProgress } from '../services/sm2Algorithm';

// --- Collaborators are stubbed: this file is about session flow, not persistence.

const addXP = vi.fn(async () => {});
const updateStreak = vi.fn(async () => {});
const recordStudySession = vi.fn(async () => {});
const addAchievements = vi.fn();
const reviewCard = vi.fn(async () => {});

vi.mock('../services/firebase', () => ({ isDemoMode: true }));

vi.mock('./userStore', () => ({
  useUserStore: {
    getState: () => ({
      addXP,
      updateStreak,
      recordStudySession,
      addAchievements,
      progress: { cardsLearned: 0 },
      achievements: [],
      user: null,
    }),
  },
}));

vi.mock('./cardStore', () => ({
  useCardStore: {
    getState: () => ({
      reviewCard,
      cardProgress: new Map(),
      flashcards: [],
      getStudyDeck: () => [],
    }),
  },
}));

vi.mock('./adaptiveLearningStore', () => ({
  useAdaptiveLearningStore: {
    getState: () => ({ recordSession: vi.fn(), checkAndAdjustDifficulty: vi.fn() }),
  },
}));

const checkAchievements = vi.fn(async () => [] as Array<{ id: string; xpReward: number }>);
vi.mock('../services/achievementService', () => ({
  checkAchievements: (...args: unknown[]) => checkAchievements(...(args as [])),
}));

const updateDailyChallenges = vi.fn(async () => {});
const updateWeeklyChallenges = vi.fn(async () => {});
vi.mock('../types/challenges', () => ({
  updateDailyChallenges: (...a: unknown[]) => updateDailyChallenges(...(a as [])),
}));
vi.mock('../types/weeklyChallenges', () => ({
  updateWeeklyChallenges: (...a: unknown[]) => updateWeeklyChallenges(...(a as [])),
}));

import { useSessionStore, xpForQuality } from './sessionStore';
import { XP_VALUES } from '../types/gamification';

function studyCard(id: string, direction: StudyDirection = 'english-to-catalan'): StudyCard {
  return {
    flashcard: {
      id,
      front: `english-${id}`,
      back: `catala-${id}`,
      notes: '',
      category: 'Test',
      iconKey: 'default',
      createdAt: new Date(),
    },
    progress: createInitialProgress(id, direction),
    direction,
    requiresTyping: false,
  };
}

function startWith(cards: StudyCard[]) {
  useSessionStore.getState().startSessionWithDeck('flip', cards);
}

describe('sessionStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    checkAchievements.mockResolvedValue([]);
    useSessionStore.getState().resetSession();
  });

  describe('xpForQuality', () => {
    it('maps quality bands to XP', () => {
      expect(xpForQuality(5)).toBe(XP_VALUES.CARD_PERFECT);
      expect(xpForQuality(4)).toBe(XP_VALUES.CARD_CORRECT);
      expect(xpForQuality(3)).toBe(XP_VALUES.CARD_DIFFICULT);
      expect(xpForQuality(1)).toBe(XP_VALUES.CARD_WRONG);
    });
  });

  describe('startSessionWithDeck', () => {
    it('uses the deck it is given', () => {
      const deck = [studyCard('a'), studyCard('b')];
      startWith(deck);

      const state = useSessionStore.getState();
      expect(state.isActive).toBe(true);
      expect(state.cards).toHaveLength(2);
      expect(state.currentIndex).toBe(0);
    });

    it('stays inactive for an empty deck', () => {
      startWith([]);
      expect(useSessionStore.getState().isActive).toBe(false);
    });

    /**
     * The streak used to be credited here, so opening the study screen and
     * walking away counted as having studied that day.
     */
    it('does not credit the streak merely for starting', () => {
      startWith([studyCard('a')]);
      expect(updateStreak).not.toHaveBeenCalled();
    });
  });

  describe('submitAnswer', () => {
    it('credits the streak on the first answered card only', async () => {
      startWith([studyCard('a'), studyCard('b'), studyCard('c')]);

      await useSessionStore.getState().submitAnswer(5);
      expect(updateStreak).toHaveBeenCalledTimes(1);

      useSessionStore.getState().nextCard();
      await useSessionStore.getState().submitAnswer(5);
      expect(updateStreak).toHaveBeenCalledTimes(1);
    });

    it('records the review and awards XP', async () => {
      startWith([studyCard('a')]);
      await useSessionStore.getState().submitAnswer(5);

      expect(reviewCard).toHaveBeenCalledWith('a', 'english-to-catalan', 5);
      expect(addXP).toHaveBeenCalledWith(XP_VALUES.CARD_PERFECT);
      expect(useSessionStore.getState().results).toHaveLength(1);
    });

    it('tracks the perfect streak and resets it on a miss', async () => {
      startWith([studyCard('a'), studyCard('b')]);

      await useSessionStore.getState().submitAnswer(5);
      expect(useSessionStore.getState().perfectStreak).toBe(1);

      useSessionStore.getState().nextCard();
      await useSessionStore.getState().submitAnswer(2);
      expect(useSessionStore.getState().perfectStreak).toBe(0);
    });

    it('marks quality below 3 as incorrect', async () => {
      startWith([studyCard('a')]);
      await useSessionStore.getState().submitAnswer(2);
      expect(useSessionStore.getState().results[0].isCorrect).toBe(false);
    });
  });

  describe('endSession', () => {
    it('summarises the session', async () => {
      startWith([studyCard('a'), studyCard('b')]);
      await useSessionStore.getState().submitAnswer(5);
      useSessionStore.getState().nextCard();
      await useSessionStore.getState().submitAnswer(2);
      useSessionStore.getState().nextCard();

      const summary = await useSessionStore.getState().endSession();

      expect(summary.totalCards).toBe(2);
      expect(summary.correctAnswers).toBe(1);
      expect(summary.accuracy).toBe(50);
    });

    /**
     * StudyPage ends the session from an effect, and endSession awaits several
     * round-trips. Without the isEnding guard a re-render during those awaits
     * could run the whole award pipeline twice, double-awarding XP and
     * achievements.
     */
    it('does not run the award pipeline twice when called concurrently', async () => {
      startWith([studyCard('a')]);
      await useSessionStore.getState().submitAnswer(5);
      useSessionStore.getState().nextCard();

      updateDailyChallenges.mockClear();
      recordStudySession.mockClear();
      checkAchievements.mockClear();

      const [first, second] = await Promise.all([
        useSessionStore.getState().endSession(),
        useSessionStore.getState().endSession(),
      ]);

      expect(updateDailyChallenges).toHaveBeenCalledTimes(1);
      expect(recordStudySession).toHaveBeenCalledTimes(1);
      expect(checkAchievements).toHaveBeenCalledTimes(1);

      // Both callers still get a usable summary.
      expect(first.totalCards).toBe(1);
      expect(second.totalCards).toBe(1);
    });

    it('awards achievement XP once', async () => {
      checkAchievements.mockResolvedValue([{ id: 'first-steps', xpReward: 100 }]);

      startWith([studyCard('a')]);
      await useSessionStore.getState().submitAnswer(5);
      useSessionStore.getState().nextCard();

      const summary = await useSessionStore.getState().endSession();

      expect(summary.newAchievements).toEqual(['first-steps']);
      expect(addXP).toHaveBeenCalledWith(100);
      expect(addAchievements).toHaveBeenCalledTimes(1);
    });

    it('reports speaking exercises to the weekly challenges', async () => {
      // 'speak' answers used to be hardcoded to 0, so that weekly challenge
      // could never progress.
      useSessionStore.getState().startSessionWithDeck('speak', [studyCard('a')]);
      await useSessionStore.getState().submitAnswer(5);
      useSessionStore.getState().nextCard();
      await useSessionStore.getState().endSession();

      expect(updateWeeklyChallenges).toHaveBeenCalledWith(
        expect.objectContaining({ speakingExercises: 1 })
      );
    });

    it('clears session state when finished', async () => {
      startWith([studyCard('a')]);
      await useSessionStore.getState().submitAnswer(5);
      useSessionStore.getState().nextCard();
      await useSessionStore.getState().endSession();

      const state = useSessionStore.getState();
      expect(state.isActive).toBe(false);
      expect(state.cards).toEqual([]);
      expect(state.isEnding).toBe(false);
    });
  });

  describe('hasRecoverableSession', () => {
    it('is false before any card is answered', () => {
      startWith([studyCard('a'), studyCard('b')]);
      expect(useSessionStore.getState().hasRecoverableSession()).toBe(false);
    });

    it('is true mid-session', async () => {
      startWith([studyCard('a'), studyCard('b')]);
      await useSessionStore.getState().submitAnswer(5);
      useSessionStore.getState().nextCard();
      expect(useSessionStore.getState().hasRecoverableSession()).toBe(true);
    });

    it('is false for a stale session', async () => {
      startWith([studyCard('a'), studyCard('b')]);
      await useSessionStore.getState().submitAnswer(5);
      useSessionStore.getState().nextCard();

      // Older than the one-hour recovery window.
      useSessionStore.setState({ sessionStartTime: Date.now() - 2 * 60 * 60 * 1000 });
      expect(useSessionStore.getState().hasRecoverableSession()).toBe(false);
    });
  });
});
