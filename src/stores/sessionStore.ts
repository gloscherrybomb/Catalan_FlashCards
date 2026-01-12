import { create } from 'zustand';
import type { StudyCard, StudyMode, StudyResult } from '../types/flashcard';
import { XP_VALUES } from '../types/gamification';
import { useUserStore } from './userStore';
import { useCardStore } from './cardStore';

interface SessionState {
  isActive: boolean;
  mode: StudyMode;
  cards: StudyCard[];
  currentIndex: number;
  results: StudyResult[];
  sessionStartTime: number;
  cardStartTime: number;
  perfectStreak: number;

  // Computed
  currentCard: StudyCard | null;
  progress: number;
  isComplete: boolean;

  // Actions
  startSession: (mode: StudyMode, cardLimit?: number) => void;
  submitAnswer: (quality: number, userAnswer?: string) => Promise<void>;
  nextCard: () => void;
  endSession: () => Promise<SessionSummary>;
  resetSession: () => void;
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

export const useSessionStore = create<SessionState>((set, get) => ({
  isActive: false,
  mode: 'flip',
  cards: [],
  currentIndex: 0,
  results: [],
  sessionStartTime: 0,
  cardStartTime: 0,
  perfectStreak: 0,

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

  startSession: (mode: StudyMode, cardLimit = 20) => {
    const cardStore = useCardStore.getState();
    const studyDeck = cardStore.getStudyDeck(cardLimit);

    if (studyDeck.length === 0) {
      return;
    }

    // Update streak at session start
    useUserStore.getState().updateStreak();

    set({
      isActive: true,
      mode,
      cards: studyDeck,
      currentIndex: 0,
      results: [],
      sessionStartTime: Date.now(),
      cardStartTime: Date.now(),
      perfectStreak: 0,
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
    const { results, sessionStartTime, perfectStreak } = get();
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

    // Record session in user store
    const userStore = useUserStore.getState();
    await userStore.recordStudySession(totalCards, correctAnswers, timeSpentMs);

    // Check for daily goal bonus
    const progress = userStore.progress;
    if (progress.totalCardsReviewed % progress.totalCardsReviewed === 0) {
      // Would check daily goal here
    }

    const summary: SessionSummary = {
      totalCards,
      correctAnswers,
      accuracy,
      xpEarned,
      timeSpentMs,
      perfectStreak,
      newAchievements: [], // TODO: Check and return new achievements
    };

    set({ isActive: false });

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
    });
  },
}));
