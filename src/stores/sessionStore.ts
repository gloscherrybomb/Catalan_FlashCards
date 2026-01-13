import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StudyCard, StudyMode, StudyResult, StudyDirection, MistakeType } from '../types/flashcard';
import { logger } from '../services/logger';
import { XP_VALUES } from '../types/gamification';
import { useUserStore } from './userStore';
import { useCardStore } from './cardStore';
import { useAdaptiveLearningStore } from './adaptiveLearningStore';
import { checkAchievements } from '../services/achievementService';
import { updateDailyChallenges } from '../types/challenges';
import { updateWeeklyChallenges } from '../types/weeklyChallenges';
import { getPersistStorage } from '../utils/persistStorage';

interface SessionState {
  isActive: boolean;
  mode: StudyMode;
  cards: StudyCard[];
  currentIndex: number;
  results: StudyResult[];
  sessionStartTime: number;
  cardStartTime: number;
  perfectStreak: number;
  sessionId: string | null;
  cardFormats: Record<string, StudyMode>; // For mixed mode: cardId_direction -> format

  // Computed
  currentCard: StudyCard | null;
  progress: number;
  isComplete: boolean;

  // Actions
  startSession: (mode: StudyMode, cardLimit?: number, includeDictation?: boolean, categoryFilter?: string[], unitNumber?: number) => void;
  submitAnswer: (quality: number, userAnswer?: string) => Promise<void>;
  nextCard: () => void;
  endSession: () => Promise<SessionSummary>;
  resetSession: () => void;
  hasRecoverableSession: () => boolean;
  clearSavedSession: () => void;
  getCardFormat: (cardId: string, direction: StudyDirection) => StudyMode;
}

export interface SessionSummary {
  totalCards: number;
  correctAnswers: number;
  accuracy: number;
  xpEarned: number;
  timeSpentMs: number;
  perfectStreak: number;
  newAchievements: string[];
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
  isActive: false,
  mode: 'flip',
  cards: [],
  currentIndex: 0,
  results: [],
  sessionStartTime: 0,
  cardStartTime: 0,
  perfectStreak: 0,
  sessionId: null,
  cardFormats: {},

  get currentCard() {
    const { cards, currentIndex } = get();
    return cards[currentIndex] || null;
  },

  get progress() {
    const { cards, currentIndex } = get();
    if (cards.length === 0) return 0;
    return Math.round((currentIndex / cards.length) * 100);
  },

  get isComplete() {
    const { cards, currentIndex } = get();
    return currentIndex >= cards.length;
  },

  startSession: (mode: StudyMode, cardLimit = 20, includeDictation = true, categoryFilter?: string[], unitNumber?: number) => {
    const cardStore = useCardStore.getState();
    const studyDeck = cardStore.getStudyDeck(cardLimit, categoryFilter, unitNumber);

    if (studyDeck.length === 0) {
      // No cards due - this is not an error, just nothing to study
      // Reset session state to ensure clean state
      set({
        isActive: false,
        cards: [],
        currentIndex: 0,
        results: [],
        sessionId: null,
        cardFormats: {},
        sessionStartTime: 0,
      });
      return;
    }

    // Update streak at session start
    useUserStore.getState().updateStreak();

    // Assign formats for mixed mode
    const cardFormats: Record<string, StudyMode> = {};
    if (mode === 'mixed') {
      // Build available modes based on settings
      const modes: StudyMode[] = ['flip', 'multiple-choice', 'type-answer'];
      if (includeDictation) {
        modes.push('dictation');
      }

      for (const card of studyDeck) {
        const key = `${card.flashcard.id}_${card.direction}`;
        // Only force type-answer for truly struggling cards (low ease factor)
        // New cards should still get random formats for variety
        if (card.progress.easeFactor < 2.0) {
          cardFormats[key] = 'type-answer';
        } else {
          // Truly random mode selection for mixed experience
          cardFormats[key] = modes[Math.floor(Math.random() * modes.length)];
        }
      }
    }

    set({
      isActive: true,
      mode,
      cards: studyDeck,
      currentIndex: 0,
      results: [],
      sessionStartTime: Date.now(),
      cardStartTime: Date.now(),
      perfectStreak: 0,
      sessionId: `session_${Date.now()}`,
      cardFormats,
    });
  },

  submitAnswer: async (quality: number, userAnswer?: string) => {
    const { cards, currentIndex, results, mode, cardStartTime, perfectStreak } = get();
    const currentCard = cards[currentIndex];

    if (!currentCard) return;

    const timeSpentMs = Date.now() - cardStartTime;
    const isCorrect = quality >= 3;

    const result: StudyResult = {
      cardId: currentCard.flashcard.id,
      direction: currentCard.direction,
      mode,
      quality,
      isCorrect,
      timeSpentMs,
      userAnswer,
    };

    // Update card progress in store
    const cardStore = useCardStore.getState();
    await cardStore.reviewCard(
      currentCard.flashcard.id,
      currentCard.direction,
      quality
    );

    // Calculate XP
    let xpEarned = 0;
    if (quality === 5) {
      xpEarned = XP_VALUES.CARD_PERFECT;
    } else if (quality >= 4) {
      xpEarned = XP_VALUES.CARD_CORRECT;
    } else if (quality >= 3) {
      xpEarned = XP_VALUES.CARD_DIFFICULT;
    } else {
      xpEarned = XP_VALUES.CARD_WRONG;
    }

    // Add XP
    const userStore = useUserStore.getState();
    await userStore.addXP(xpEarned);

    // Update perfect streak
    const newPerfectStreak = quality === 5 ? perfectStreak + 1 : 0;

    set({
      results: [...results, result],
      perfectStreak: newPerfectStreak,
    });
  },

  nextCard: () => {
    const { currentIndex, cards } = get();

    if (currentIndex < cards.length) {
      set({
        currentIndex: currentIndex + 1,
        cardStartTime: Date.now(),
      });
    }
  },

  endSession: async () => {
    const { results, sessionStartTime, perfectStreak, cards } = get();
    const timeSpentMs = Date.now() - sessionStartTime;

    const totalCards = results.length;
    const correctAnswers = results.filter(r => r.isCorrect).length;
    const accuracy = totalCards > 0 ? Math.round((correctAnswers / totalCards) * 100) : 0;

    // Calculate total XP
    const xpEarned = results.reduce((sum, r) => {
      if (r.quality === 5) return sum + XP_VALUES.CARD_PERFECT;
      if (r.quality >= 4) return sum + XP_VALUES.CARD_CORRECT;
      if (r.quality >= 3) return sum + XP_VALUES.CARD_DIFFICULT;
      return sum + XP_VALUES.CARD_WRONG;
    }, 0);

    // Calculate daily challenge metrics
    const fastAnswers = results.filter(r => r.timeSpentMs < 3000 && r.isCorrect).length;
    const typedCorrectAnswers = results.filter(r =>
      (r.mode === 'type-answer' || r.mode === 'dictation') && r.isCorrect
    ).length;

    // Build category counts from the cards that were reviewed
    const categoriesReviewed: Record<string, number> = {};
    for (const result of results) {
      const card = cards.find(c => c.flashcard.id === result.cardId);
      if (card) {
        const category = card.flashcard.category;
        categoriesReviewed[category] = (categoriesReviewed[category] || 0) + 1;
      }
    }

    // Update challenges, but don't block session completion if storage is corrupted.
    try {
      await updateDailyChallenges({
        cardsReviewed: totalCards,
        perfectStreak,
        fastAnswers,
        accuracy,
        typedCorrectAnswers,
        categoriesReviewed,
      });
    } catch (error) {
      logger.warn('Failed to update daily challenges', 'SessionStore', { error: String(error) });
    }

    try {
      await updateWeeklyChallenges({
        cardsReviewed: totalCards,
        cardsMastered: 0, // Will be tracked properly if needed
        studiedToday: true,
        sessionAccuracy: accuracy,
        isPerfectSession: accuracy >= 90,
        fastAnswers,
        speakingExercises: 0,
        categoriesReviewed,
      });
    } catch (error) {
      logger.warn('Failed to update weekly challenges', 'SessionStore', { error: String(error) });
    }

    // Record session in user store
    const userStore = useUserStore.getState();
    try {
      await userStore.recordStudySession(totalCards, correctAnswers, timeSpentMs);
    } catch (error) {
      logger.error('Failed to record study session', 'SessionStore', { error: String(error) });
      // Continue anyway - local state is already updated
    }

    // Check for achievements (wrapped in try-catch to not block session end)
    let newAchievements: Awaited<ReturnType<typeof checkAchievements>> = [];
    try {
      const cardStore = useCardStore.getState();
      newAchievements = await checkAchievements({
        progress: userStore.progress,
        cardProgress: cardStore.cardProgress,
        flashcards: cardStore.flashcards,
        perfectStreak,
        unlockedAchievements: userStore.achievements,
        userId: userStore.user?.uid,
        hasImported: cardStore.flashcards.length > 0,
      });

      // Award XP for new achievements and update local state
      await Promise.all(newAchievements.map(achievement =>
        userStore.addXP(achievement.xpReward)
      ));

      // Update local achievements list
      if (newAchievements.length > 0) {
        const newUnlocked = newAchievements.map(a => ({
          achievementId: a.id,
          unlockedAt: new Date(),
        }));
        userStore.addAchievements(newUnlocked);
      }
    } catch (error) {
      logger.error('Failed to check/award achievements', 'SessionStore', { error: String(error) });
      // Continue anyway - session data is more important
    }

    const summary: SessionSummary = {
      totalCards,
      correctAnswers,
      accuracy,
      xpEarned,
      timeSpentMs,
      perfectStreak,
      newAchievements: newAchievements.map(a => a.id),
    };

    // Record session for adaptive learning analysis
    try {
      const { mode } = get();
      const adaptiveStore = useAdaptiveLearningStore.getState();

      // Build category breakdown for adaptive analysis
      const categoryBreakdown: Record<string, { count: number; accuracy: number }> = {};
      for (const result of results) {
        const card = cards.find(c => c.flashcard.id === result.cardId);
        if (card) {
          const category = card.flashcard.category;
          if (!categoryBreakdown[category]) {
            categoryBreakdown[category] = { count: 0, accuracy: 0 };
          }
          categoryBreakdown[category].count++;
          if (result.isCorrect) {
            categoryBreakdown[category].accuracy++;
          }
        }
      }
      // Convert accuracy to percentage
      for (const cat of Object.keys(categoryBreakdown)) {
        const data = categoryBreakdown[cat];
        data.accuracy = data.count > 0 ? (data.accuracy / data.count) * 100 : 0;
      }

      // Build mistake types distribution
      const mistakeTypes: Record<MistakeType, number> = {
        spelling: 0,
        accent: 0,
        gender: 0,
        wrong: 0,
      };
      // Note: We don't have detailed mistake types in results yet, so we count incorrects as 'wrong'
      for (const result of results) {
        if (!result.isCorrect) {
          mistakeTypes.wrong++;
        }
      }

      // Calculate average quality
      const averageQuality = results.length > 0
        ? results.reduce((sum, r) => sum + r.quality, 0) / results.length
        : 0;

      // Calculate average response time
      const averageResponseTimeMs = results.length > 0
        ? results.reduce((sum, r) => sum + r.timeSpentMs, 0) / results.length
        : 0;

      // Record session
      adaptiveStore.recordSession({
        duration: timeSpentMs,
        cardsReviewed: totalCards,
        accuracy,
        averageQuality,
        averageResponseTimeMs,
        mode,
        categoryBreakdown,
        mistakeTypes,
      });

      // Check if difficulty adjustment is needed
      adaptiveStore.checkAndAdjustDifficulty(perfectStreak);

      logger.debug('Recorded session for adaptive learning', 'SessionStore', {
        cardsReviewed: totalCards,
        accuracy,
        perfectStreak,
      });
    } catch (error) {
      logger.error('Failed to record session for adaptive learning', 'SessionStore', { error: String(error) });
      // Continue anyway - main session data is already saved
    }

    // Clear all session data, not just isActive
    set({
      isActive: false,
      cards: [],
      currentIndex: 0,
      results: [],
      sessionId: null,
      cardFormats: {},
    });

    return summary;
  },

  resetSession: () => {
    set({
      isActive: false,
      mode: 'flip',
      cards: [],
      currentIndex: 0,
      results: [],
      sessionStartTime: 0,
      cardStartTime: 0,
      perfectStreak: 0,
      sessionId: null,
      cardFormats: {},
    });
  },

  hasRecoverableSession: () => {
    const { isActive, cards, currentIndex, sessionId, sessionStartTime, results } = get();
    // Session is only recoverable if:
    // 1. isActive is true
    // 2. There are cards to review
    // 3. We haven't gone through all cards
    // 4. Session has an ID
    // 5. Session is less than 1 hour old (prevents stale session prompts)
    // 6. At least 1 card has been completed (currentIndex > 0 or results.length > 0)
    //    - No point resuming if user hasn't started
    const ONE_HOUR = 60 * 60 * 1000;
    const isRecentSession = sessionStartTime > 0 && (Date.now() - sessionStartTime) < ONE_HOUR;
    const hasProgress = currentIndex > 0 || results.length > 0;
    return isActive && cards.length > 0 && currentIndex < cards.length && !!sessionId && isRecentSession && hasProgress;
  },

  clearSavedSession: () => {
    set({
      isActive: false,
      cards: [],
      currentIndex: 0,
      results: [],
      sessionId: null,
      cardFormats: {},
    });
  },

  getCardFormat: (cardId: string, direction: StudyDirection): StudyMode => {
    const { mode, cardFormats } = get();
    if (mode !== 'mixed') return mode === 'listening' ? 'flip' : mode;
    return cardFormats[`${cardId}_${direction}`] || 'flip';
  },
}),
    {
      name: 'catalan-session-storage',
      storage: getPersistStorage(),
      partialize: (state) => ({
        isActive: state.isActive,
        mode: state.mode,
        cards: state.cards,
        currentIndex: state.currentIndex,
        results: state.results,
        sessionStartTime: state.sessionStartTime,
        perfectStreak: state.perfectStreak,
        sessionId: state.sessionId,
        cardFormats: state.cardFormats,
      }),
    }
  )
);
