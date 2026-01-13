import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getPersistStorage } from '../utils/persistStorage';
import { getStoryProgress, updateStoryProgress, isDemoMode } from '../services/firebase';
import { logger } from '../services/logger';

export interface StoryProgress {
  storyId: string;
  completed: boolean;
  completedAt?: string;
  quizScore: number;        // Percentage (0-100)
  wordsLearned: string[];   // Words added to study list
  readCount: number;
  bestQuizScore: number;
}

interface StoryState {
  // Progress tracking
  storyProgress: Record<string, StoryProgress>;
  currentStoryId: string | null;
  currentParagraphIndex: number;
  quizAnswers: Record<string, number>; // questionId -> selectedIndex
  currentUserId: string | null;

  // Reading preferences
  showTranslations: boolean;
  fontSize: 'small' | 'medium' | 'large';

  // Actions
  initializeFromFirebase: (userId: string) => Promise<void>;
  clearUser: () => void;
  startStory: (storyId: string) => void;
  nextParagraph: () => void;
  previousParagraph: () => void;
  goToParagraph: (index: number) => void;
  answerQuestion: (questionId: string, answerIndex: number) => void;
  completeStory: (storyId: string, quizScore: number) => void;
  addLearnedWord: (storyId: string, word: string) => void;

  // Getters
  getStoryProgress: (storyId: string) => StoryProgress | undefined;
  isStoryCompleted: (storyId: string) => boolean;
  getCompletedStoriesCount: () => number;
  getTotalXPFromStories: () => number;

  // Settings
  toggleTranslations: () => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;

  // Reset
  resetStory: () => void;
  resetAllProgress: () => void;
}

const createInitialProgress = (storyId: string): StoryProgress => ({
  storyId,
  completed: false,
  quizScore: 0,
  wordsLearned: [],
  readCount: 0,
  bestQuizScore: 0,
});

async function syncToFirebase(userId: string | null, storyProgress: Record<string, StoryProgress>) {
  if (!userId || isDemoMode) return;

  try {
    await updateStoryProgress(userId, { storyProgress });
  } catch (error) {
    logger.error('Failed to sync story progress to Firebase', 'StoryStore', { error: String(error) });
  }
}

export const useStoryStore = create<StoryState>()(
  persist(
    (set, get) => ({
      storyProgress: {},
      currentStoryId: null,
      currentParagraphIndex: 0,
      quizAnswers: {},
      showTranslations: false,
      fontSize: 'medium',
      currentUserId: null,

      initializeFromFirebase: async (userId: string) => {
        if (isDemoMode) {
          set({ currentUserId: userId });
          return;
        }

        try {
          const data = await getStoryProgress(userId);
          if (data?.storyProgress) {
            set({
              currentUserId: userId,
              storyProgress: data.storyProgress,
            });
          } else {
            set({ currentUserId: userId });
          }
        } catch (error) {
          logger.error('Failed to load story progress from Firebase', 'StoryStore', { error: String(error) });
          set({ currentUserId: userId });
        }
      },

      clearUser: () => {
        set({ currentUserId: null });
      },

      startStory: (storyId: string) => {
        const { storyProgress, currentUserId } = get();
        const existing = storyProgress[storyId];
        const updatedProgress = {
          ...storyProgress,
          [storyId]: {
            ...createInitialProgress(storyId),
            ...existing,
            readCount: (existing?.readCount || 0) + 1,
          },
        };

        set({
          currentStoryId: storyId,
          currentParagraphIndex: 0,
          quizAnswers: {},
          storyProgress: updatedProgress,
        });
        syncToFirebase(currentUserId, updatedProgress);
      },

      nextParagraph: () => {
        set(state => ({
          currentParagraphIndex: state.currentParagraphIndex + 1,
        }));
      },

      previousParagraph: () => {
        set(state => ({
          currentParagraphIndex: Math.max(0, state.currentParagraphIndex - 1),
        }));
      },

      goToParagraph: (index: number) => {
        set({ currentParagraphIndex: index });
      },

      answerQuestion: (questionId: string, answerIndex: number) => {
        set(state => ({
          quizAnswers: {
            ...state.quizAnswers,
            [questionId]: answerIndex,
          },
        }));
      },

      completeStory: (storyId: string, quizScore: number) => {
        const { storyProgress, currentUserId } = get();
        const existing = storyProgress[storyId];
        const updatedProgress = {
          ...storyProgress,
          [storyId]: {
            ...createInitialProgress(storyId),
            ...existing,
            completed: true,
            completedAt: new Date().toISOString(),
            quizScore,
            bestQuizScore: Math.max(existing?.bestQuizScore || 0, quizScore),
          },
        };

        set({
          storyProgress: updatedProgress,
          currentStoryId: null,
          currentParagraphIndex: 0,
          quizAnswers: {},
        });
        syncToFirebase(currentUserId, updatedProgress);
      },

      addLearnedWord: (storyId: string, word: string) => {
        const { storyProgress, currentUserId } = get();
        const existing = storyProgress[storyId];

        if (!existing) return;

        const wordsLearned = existing.wordsLearned || [];
        if (wordsLearned.includes(word)) return;

        const updatedProgress = {
          ...storyProgress,
          [storyId]: {
            ...existing,
            wordsLearned: [...wordsLearned, word],
          },
        };
        set({ storyProgress: updatedProgress });
        syncToFirebase(currentUserId, updatedProgress);
      },

      getStoryProgress: (storyId: string) => {
        return get().storyProgress[storyId];
      },

      isStoryCompleted: (storyId: string) => {
        return get().storyProgress[storyId]?.completed || false;
      },

      getCompletedStoriesCount: () => {
        const { storyProgress } = get();
        let count = 0;

        for (const progress of Object.values(storyProgress)) {
          if (progress.completed) {
            count++;
          }
        }

        return count;
      },

      getTotalXPFromStories: () => {
        // This would need to be calculated based on story XP values
        // For now, estimate 50 XP per completed story
        const { storyProgress } = get();
        let count = 0;

        for (const progress of Object.values(storyProgress)) {
          if (progress.completed) {
            count++;
          }
        }

        return count * 50;
      },

      toggleTranslations: () => {
        set(state => ({ showTranslations: !state.showTranslations }));
      },

      setFontSize: (size: 'small' | 'medium' | 'large') => {
        set({ fontSize: size });
      },

      resetStory: () => {
        set({
          currentStoryId: null,
          currentParagraphIndex: 0,
          quizAnswers: {},
        });
      },

      resetAllProgress: () => {
        const { currentUserId } = get();
        set({
          storyProgress: {},
          currentStoryId: null,
          currentParagraphIndex: 0,
          quizAnswers: {},
        });
        syncToFirebase(currentUserId, {});
      },
    }),
    {
      name: 'catalan-story-storage',
      storage: getPersistStorage(),
    }
  )
);
