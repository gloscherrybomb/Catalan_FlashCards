import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Flashcard, CardProgress, StudyDirection, StudyCard, MistakeRecord } from '../types/flashcard';
import { logger } from '../services/logger';
import { SESSION_CONFIG, MISTAKE_CONFIG, MASTERY_CONFIG } from '../config/constants';

// Type for persisted state deserialization
interface PersistedCardState {
  cardProgress?: Array<[string, Omit<CardProgress, 'nextReviewDate' | 'lastReviewDate'> & {
    nextReviewDate: string;
    lastReviewDate?: string;
  }]>;
  mistakeHistory?: Array<Omit<MistakeRecord, 'timestamp'> & { timestamp: string }>;
}
import {
  createInitialProgress,
  calculateSM2,
  isDueForReview,
  requiresTyping,
} from '../services/sm2Algorithm';
import { parseCSV } from '../services/csvParser';
import { getStarterFlashcards } from '../data/starterVocabulary';
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
  loadStarterVocabulary: () => Promise<number>;
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
  // Deduplication
  deduplicateCards: () => Promise<number>;
  getUniqueCardsDueCount: () => number;
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
          logger.error('Load cards error', 'CardStore', { error: String(error) });
        }
      },

      importCSV: async (csvContent: string) => {
        const { flashcards } = get();

        try {
          const newCards = parseCSV(csvContent);

          // Enhanced duplicate check: normalize whitespace and case
          const normalizeText = (text: string) =>
            text.toLowerCase().trim().replace(/\s+/g, ' ');

          const existingFronts = new Set(flashcards.map(c => normalizeText(c.front)));
          const existingBacks = new Set(flashcards.map(c => normalizeText(c.back)));

          // Check both front AND back to catch duplicates more reliably
          const uniqueNewCards = newCards.filter(c => {
            const normFront = normalizeText(c.front);
            const normBack = normalizeText(c.back);
            return !existingFronts.has(normFront) && !existingBacks.has(normBack);
          });

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
          logger.error('CSV import error', 'CardStore', { error: String(error) });
          throw error;
        }
      },

      loadStarterVocabulary: async () => {
        const { flashcards } = get();

        try {
          const starterCards = getStarterFlashcards();

          // Enhanced duplicate check: normalize whitespace and case
          const normalizeText = (text: string) =>
            text.toLowerCase().trim().replace(/\s+/g, ' ');

          const existingFronts = new Set(flashcards.map(c => normalizeText(c.front)));
          const existingBacks = new Set(flashcards.map(c => normalizeText(c.back)));

          // Filter out any duplicates
          const uniqueNewCards = starterCards.filter(c => {
            const normFront = normalizeText(c.front);
            const normBack = normalizeText(c.back);
            return !existingFronts.has(normFront) && !existingBacks.has(normBack);
          });

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
          logger.error('Starter vocabulary import error', 'CardStore', { error: String(error) });
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

      getStudyDeck: (limit = SESSION_CONFIG.DEFAULT_CARD_LIMIT) => {
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

        const minTyping = Math.ceil(limit * SESSION_CONFIG.MIN_TYPING_PERCENTAGE);
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

        // Track if card was mastered before this review
        const wasMastered = progress.interval >= MASTERY_CONFIG.MASTERED_INTERVAL_DAYS;

        const newProgress = calculateSM2(progress, quality);

        // Check if card is now mastered after this review
        const isNowMastered = newProgress.interval >= MASTERY_CONFIG.MASTERED_INTERVAL_DAYS;

        // If card just became mastered, increment the counter
        if (!wasMastered && isNowMastered) {
          const userStore = useUserStore.getState();
          const currentCardsLearned = userStore.progress.cardsLearned;
          userStore.updateCardsLearned(currentCardsLearned + 1);
        }

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
              if (progress.interval >= MASTERY_CONFIG.MASTERED_INTERVAL_DAYS) {
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
        // Keep only last MISTAKE_CONFIG.MAX_HISTORY_SIZE mistakes to prevent unbounded growth
        const newHistory = [...mistakeHistory, mistake].slice(-MISTAKE_CONFIG.MAX_HISTORY_SIZE);
        set({ mistakeHistory: newHistory });
      },

      getMistakeHistory: () => {
        return get().mistakeHistory;
      },

      getWeaknessDeck: (limit = MISTAKE_CONFIG.DEFAULT_WEAKNESS_DECK_LIMIT) => {
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

      // Deduplication: remove duplicate cards by normalized front text
      deduplicateCards: async () => {
        const { flashcards, cardProgress } = get();

        // Create a map to track unique cards by normalized front text
        const normalizeText = (text: string) =>
          text.toLowerCase().trim().replace(/\s+/g, ' ');

        const seenFronts = new Map<string, Flashcard>();
        const duplicateIds: string[] = [];

        for (const card of flashcards) {
          const normalizedFront = normalizeText(card.front);

          if (seenFronts.has(normalizedFront)) {
            duplicateIds.push(card.id);
          } else {
            seenFronts.set(normalizedFront, card);
          }
        }

        if (duplicateIds.length === 0) {
          return 0;
        }

        // Filter out duplicates
        const duplicateIdSet = new Set(duplicateIds);
        const uniqueCards = flashcards.filter(c => !duplicateIdSet.has(c.id));

        // Also clean up progress for deleted cards
        const newProgress = new Map(cardProgress);
        for (const id of duplicateIds) {
          newProgress.delete(getProgressKey(id, 'english-to-catalan'));
          newProgress.delete(getProgressKey(id, 'catalan-to-english'));
        }

        set({ flashcards: uniqueCards, cardProgress: newProgress });

        // Delete duplicates from Firebase
        const userStore = useUserStore.getState();
        const userId = userStore.user?.uid;
        if (userId && !isDemoMode) {
          for (const id of duplicateIds) {
            await deleteFlashcard(userId, id);
          }
        }

        return duplicateIds.length;
      },

      // Get count of unique cards that are due (not counting both directions)
      getUniqueCardsDueCount: () => {
        const { flashcards, cardProgress } = get();
        let count = 0;

        for (const card of flashcards) {
          // Card is "due" if EITHER direction is due
          let cardIsDue = false;
          for (const direction of ['english-to-catalan', 'catalan-to-english'] as StudyDirection[]) {
            const key = getProgressKey(card.id, direction);
            const progress = cardProgress.get(key) || createInitialProgress(card.id, direction);

            if (isDueForReview(progress)) {
              cardIsDue = true;
              break;
            }
          }
          if (cardIsDue) count++;
        }

        return count;
      },
    }),
    {
      name: 'catalan-cards-storage',
      partialize: (state) => ({
        // Note: flashcards are NOT persisted locally - they come from Firebase only
        // This prevents duplication between localStorage and Firebase
        cardProgress: Array.from(state.cardProgress.entries()),
        mistakeHistory: state.mistakeHistory,
      }),
      merge: (persistedState, current) => {
        const persisted = persistedState as PersistedCardState | undefined;
        // Restore cardProgress Map with proper date deserialization
        const cardProgressEntries: [string, CardProgress][] = (persisted?.cardProgress || []).map(
          ([key, value]) => [
            key,
            {
              ...value,
              nextReviewDate: new Date(value.nextReviewDate),
              lastReviewDate: value.lastReviewDate ? new Date(value.lastReviewDate) : undefined,
            } as CardProgress,
          ]
        );

        // Restore mistake history with proper date deserialization
        const mistakeHistory: MistakeRecord[] = (persisted?.mistakeHistory || []).map((mistake) => ({
          ...mistake,
          timestamp: new Date(mistake.timestamp),
        }));

        return {
          ...current,
          // Don't restore flashcards from localStorage - they come from Firebase
          flashcards: current.flashcards,
          cardProgress: new Map(cardProgressEntries),
          mistakeHistory,
        };
      },
    }
  )
);
