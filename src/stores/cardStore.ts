import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Flashcard, CardProgress, StudyDirection, StudyCard, MistakeRecord } from '../types/flashcard';
import {
  createInitialProgress,
  calculateSM2,
  isDueForReview,
  requiresTyping,
} from '../services/sm2Algorithm';
import { parseCSV } from '../services/csvParser';
import {
  saveFlashcards,
  getFlashcards,
  deleteFlashcard,
  getCardProgress,
  updateCardProgress,
  isDemoMode,
} from '../services/firebase';
import { useUserStore } from './userStore';
import { generateWeaknessDeck } from '../services/mistakeAnalysisService';

interface CardState {
  flashcards: Flashcard[];
  cardProgress: Map<string, CardProgress>;
  mistakeHistory: MistakeRecord[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadCards: () => Promise<void>;
  importCSV: (csvContent: string) => Promise<number>;
  deleteCard: (cardId: string) => Promise<void>;
  getStudyDeck: (limit?: number) => StudyCard[];
  reviewCard: (cardId: string, direction: StudyDirection, quality: number) => Promise<void>;
  getProgress: (cardId: string, direction: StudyDirection) => CardProgress;
  getCategoryStats: () => Record<string, { total: number; mastered: number; learning: number }>;
  getDueCount: () => number;
  getNewCount: () => number;
  // Mistake tracking
  recordMistake: (mistake: MistakeRecord) => void;
  getMistakeHistory: () => MistakeRecord[];
  getWeaknessDeck: (limit?: number) => StudyCard[];
  clearMistakeHistory: () => void;
  // Mnemonic editing
  updateCardMnemonic: (cardId: string, mnemonic: string) => Promise<void>;
}

function getProgressKey(cardId: string, direction: StudyDirection): string {
  return `${cardId}_${direction}`;
}

export const useCardStore = create<CardState>()(
  persist(
    (set, get) => ({
      flashcards: [],
      cardProgress: new Map(),
      mistakeHistory: [],
      isLoading: false,
      error: null,

      loadCards: async () => {
        set({ isLoading: true, error: null });

        try {
          const userStore = useUserStore.getState();
          const userId = userStore.user?.uid;

          if (userId && !isDemoMode) {
            const cards = await getFlashcards(userId);
            const progressList = await getCardProgress(userId);

            const progressMap = new Map<string, CardProgress>();
            for (const p of progressList) {
              progressMap.set(getProgressKey(p.cardId, p.direction), p);
            }

            set({ flashcards: cards, cardProgress: progressMap, isLoading: false });
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          set({ error: 'Failed to load cards', isLoading: false });
          console.error('Load cards error:', error);
        }
      },

      importCSV: async (csvContent: string) => {
        const { flashcards } = get();

        try {
          const newCards = parseCSV(csvContent);

          // Check for duplicates
          const existingFronts = new Set(flashcards.map(c => c.front.toLowerCase()));
          const uniqueNewCards = newCards.filter(
            c => !existingFronts.has(c.front.toLowerCase())
          );

          const allCards = [...flashcards, ...uniqueNewCards];
          set({ flashcards: allCards });

          // Save to Firebase
          const userStore = useUserStore.getState();
          const userId = userStore.user?.uid;
          if (userId && !isDemoMode) {
            await saveFlashcards(userId, uniqueNewCards);
          }

          return uniqueNewCards.length;
        } catch (error) {
          console.error('CSV import error:', error);
          throw error;
        }
      },

      deleteCard: async (cardId: string) => {
        const { flashcards, cardProgress } = get();

        const newCards = flashcards.filter(c => c.id !== cardId);
        const newProgress = new Map(cardProgress);

        // Remove progress for both directions
        newProgress.delete(getProgressKey(cardId, 'english-to-catalan'));
        newProgress.delete(getProgressKey(cardId, 'catalan-to-english'));

        set({ flashcards: newCards, cardProgress: newProgress });

        const userStore = useUserStore.getState();
        const userId = userStore.user?.uid;
        if (userId && !isDemoMode) {
          await deleteFlashcard(userId, cardId);
        }
      },

      getStudyDeck: (limit = 20) => {
        const { flashcards, cardProgress } = get();
        const studyCards: StudyCard[] = [];

        // Create study items for both directions
        for (const card of flashcards) {
          for (const direction of ['english-to-catalan', 'catalan-to-english'] as StudyDirection[]) {
            const key = getProgressKey(card.id, direction);
            let progress = cardProgress.get(key);

            if (!progress) {
              progress = createInitialProgress(card.id, direction);
            }

            if (isDueForReview(progress)) {
              studyCards.push({
                flashcard: card,
                progress,
                direction,
                requiresTyping: requiresTyping(progress),
              });
            }
          }
        }

        // Sort: new cards first, then by due date
        studyCards.sort((a, b) => {
          const aNew = a.progress.repetitions === 0;
          const bNew = b.progress.repetitions === 0;

          if (aNew && !bNew) return -1;
          if (!aNew && bNew) return 1;

          return a.progress.nextReviewDate.getTime() - b.progress.nextReviewDate.getTime();
        });

        // Ensure good mix: ~30% must be typing
        const typingRequired = studyCards.filter(c => c.requiresTyping);
        const typingOptional = studyCards.filter(c => !c.requiresTyping);

        const minTyping = Math.ceil(limit * 0.3);
        const typingCards = typingRequired.slice(0, Math.max(minTyping, typingRequired.length));
        const remainingSlots = limit - typingCards.length;
        const optionalCards = typingOptional.slice(0, remainingSlots);

        // Shuffle to mix typing and non-typing
        const result = [...typingCards, ...optionalCards];
        for (let i = result.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [result[i], result[j]] = [result[j], result[i]];
        }

        return result.slice(0, limit);
      },

      reviewCard: async (cardId: string, direction: StudyDirection, quality: number) => {
        const { cardProgress } = get();
        const key = getProgressKey(cardId, direction);
        let progress = cardProgress.get(key);

        if (!progress) {
          progress = createInitialProgress(cardId, direction);
        }

        const newProgress = calculateSM2(progress, quality);
        const newProgressMap = new Map(cardProgress);
        newProgressMap.set(key, newProgress);

        set({ cardProgress: newProgressMap });

        // Save to Firebase
        const userStore = useUserStore.getState();
        const userId = userStore.user?.uid;
        if (userId && !isDemoMode) {
          await updateCardProgress(userId, newProgress);
        }
      },

      getProgress: (cardId: string, direction: StudyDirection) => {
        const { cardProgress } = get();
        const key = getProgressKey(cardId, direction);
        return cardProgress.get(key) || createInitialProgress(cardId, direction);
      },

      getCategoryStats: () => {
        const { flashcards, cardProgress } = get();
        const stats: Record<string, { total: number; mastered: number; learning: number }> = {};

        for (const card of flashcards) {
          if (!stats[card.category]) {
            stats[card.category] = { total: 0, mastered: 0, learning: 0 };
          }
          stats[card.category].total++;

          // Check both directions and classify the card based on overall progress
          const directions: StudyDirection[] = ['english-to-catalan', 'catalan-to-english'];
          let masteredCount = 0;
          let learningCount = 0;

          for (const direction of directions) {
            const key = getProgressKey(card.id, direction);
            const progress = cardProgress.get(key);

            if (progress) {
              if (progress.interval >= 21) {
                masteredCount++;
              } else if (progress.repetitions > 0) {
                learningCount++;
              }
            }
          }

          // Card is mastered if both directions are mastered
          // Card is learning if at least one direction has progress but not both mastered
          if (masteredCount === 2) {
            stats[card.category].mastered++;
          } else if (masteredCount > 0 || learningCount > 0) {
            stats[card.category].learning++;
          }
        }

        return stats;
      },

      getDueCount: () => {
        const { flashcards, cardProgress } = get();
        let count = 0;

        for (const card of flashcards) {
          for (const direction of ['english-to-catalan', 'catalan-to-english'] as StudyDirection[]) {
            const key = getProgressKey(card.id, direction);
            const progress = cardProgress.get(key) || createInitialProgress(card.id, direction);

            if (isDueForReview(progress)) {
              count++;
            }
          }
        }

        return count;
      },

      getNewCount: () => {
        const { flashcards, cardProgress } = get();
        let count = 0;

        for (const card of flashcards) {
          for (const direction of ['english-to-catalan', 'catalan-to-english'] as StudyDirection[]) {
            const key = getProgressKey(card.id, direction);
            const progress = cardProgress.get(key);

            if (!progress || progress.repetitions === 0) {
              count++;
            }
          }
        }

        return count;
      },

      // Mistake tracking methods
      recordMistake: (mistake: MistakeRecord) => {
        const { mistakeHistory } = get();
        // Keep only last 500 mistakes to prevent unbounded growth
        const newHistory = [...mistakeHistory, mistake].slice(-500);
        set({ mistakeHistory: newHistory });
      },

      getMistakeHistory: () => {
        return get().mistakeHistory;
      },

      getWeaknessDeck: (limit = 20) => {
        const { cardProgress, flashcards, mistakeHistory } = get();
        return generateWeaknessDeck(cardProgress, flashcards, mistakeHistory, limit);
      },

      clearMistakeHistory: () => {
        set({ mistakeHistory: [] });
      },

      // Mnemonic editing
      updateCardMnemonic: async (cardId: string, mnemonic: string) => {
        const { flashcards } = get();
        const newCards = flashcards.map(card =>
          card.id === cardId ? { ...card, userMnemonic: mnemonic || undefined } : card
        );
        set({ flashcards: newCards });

        // Note: Firebase sync would be done here in production
        // For now, this is persisted via localStorage
      },
    }),
    {
      name: 'catalan-cards-storage',
      partialize: (state) => ({
        flashcards: state.flashcards,
        cardProgress: Array.from(state.cardProgress.entries()),
        mistakeHistory: state.mistakeHistory,
      }),
      merge: (persisted: any, current) => {
        // Restore cardProgress Map with proper date deserialization
        const cardProgressEntries: [string, CardProgress][] = (persisted?.cardProgress || []).map(
          ([key, value]: [string, any]) => [
            key,
            {
              ...value,
              nextReviewDate: new Date(value.nextReviewDate),
              lastReviewDate: value.lastReviewDate ? new Date(value.lastReviewDate) : undefined,
            } as CardProgress,
          ]
        );

        // Restore flashcards with proper date deserialization
        const flashcards = (persisted?.flashcards || []).map((card: any) => ({
          ...card,
          createdAt: new Date(card.createdAt),
        }));

        // Restore mistake history with proper date deserialization
        const mistakeHistory = (persisted?.mistakeHistory || []).map((mistake: any) => ({
          ...mistake,
          timestamp: new Date(mistake.timestamp),
        }));

        return {
          ...current,
          ...persisted,
          flashcards,
          cardProgress: new Map(cardProgressEntries),
          mistakeHistory,
        };
      },
    }
  )
);
