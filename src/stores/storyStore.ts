import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

  // Reading preferences
  showTranslations: boolean;
  fontSize: 'small' | 'medium' | 'large';

  // Actions
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

export const useStoryStore = create<StoryState>()(
  persist(
    (set, get) => ({
      storyProgress: {},
      currentStoryId: null,
      currentParagraphIndex: 0,
      quizAnswers: {},
      showTranslations: false,
      fontSize: 'medium',

      startStory: (storyId: string) => {
        const { storyProgress } = get();
        const existing = storyProgress[storyId];

        set({
          currentStoryId: storyId,
          currentParagraphIndex: 0,
          quizAnswers: {},
          storyProgress: {
            ...storyProgress,
            [storyId]: {
              ...createInitialProgress(storyId),
              ...existing,
              readCount: (existing?.readCount || 0) + 1,
            },
          },
        });
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
        const { storyProgress } = get();
        const existing = storyProgress[storyId];

        set({
          storyProgress: {
            ...storyProgress,
            [storyId]: {
              ...createInitialProgress(storyId),
              ...existing,
              completed: true,
              completedAt: new Date().toISOString(),
              quizScore,
              bestQuizScore: Math.max(existing?.bestQuizScore || 0, quizScore),
            },
          },
          currentStoryId: null,
          currentParagraphIndex: 0,
          quizAnswers: {},
        });
      },

      addLearnedWord: (storyId: string, word: string) => {
        const { storyProgress } = get();
        const existing = storyProgress[storyId];

        if (!existing) return;

        const wordsLearned = existing.wordsLearned || [];
        if (wordsLearned.includes(word)) return;

        set({
          storyProgress: {
            ...storyProgress,
            [storyId]: {
              ...existing,
              wordsLearned: [...wordsLearned, word],
            },
          },
        });
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
        set({
          storyProgress: {},
          currentStoryId: null,
          currentParagraphIndex: 0,
          quizAnswers: {},
        });
      },
    }),
    {
      name: 'catalan-story-storage',
    }
  )
);
