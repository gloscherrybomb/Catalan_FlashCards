import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getPersistStorage } from '../utils/persistStorage';
import { getGrammarProgress, updateGrammarProgress, isDemoMode } from '../services/firebase';
import { logger } from '../services/logger';

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  completedAt?: Date;
  exerciseScores: Record<string, boolean>; // exerciseId -> correct/incorrect
  bestScore: number; // percentage
  attempts: number;
}

// Type for persisted state deserialization
interface PersistedGrammarState {
  lessonProgress?: Array<[string, Omit<LessonProgress, 'completedAt'> & { completedAt?: string }]>;
  currentLesson?: string | null;
}

interface GrammarState {
  lessonProgress: Map<string, LessonProgress>;
  currentLesson: string | null;
  currentUserId: string | null;

  // Actions
  initializeFromFirebase: (userId: string) => Promise<void>;
  clearUser: () => void;
  startLesson: (lessonId: string) => void;
  completeExercise: (lessonId: string, exerciseId: string, correct: boolean) => void;
  completeLesson: (lessonId: string) => void;
  getLessonProgress: (lessonId: string) => LessonProgress | undefined;
  isLessonCompleted: (lessonId: string) => boolean;
  getCompletedLessonCount: () => number;
  getTotalScore: () => number;
  resetProgress: () => void;
}

const createInitialProgress = (lessonId: string): LessonProgress => ({
  lessonId,
  completed: false,
  exerciseScores: {},
  bestScore: 0,
  attempts: 0,
});

const serializeLessonProgress = (lessonProgress: Map<string, LessonProgress>) => {
  const result: Record<string, {
    lessonId: string;
    completed: boolean;
    completedAt?: string;
    exerciseScores: Record<string, boolean>;
    bestScore: number;
    attempts: number;
  }> = {};

  lessonProgress.forEach((progress, lessonId) => {
    result[lessonId] = {
      lessonId,
      completed: progress.completed,
      completedAt: progress.completedAt ? progress.completedAt.toISOString() : undefined,
      exerciseScores: progress.exerciseScores,
      bestScore: progress.bestScore,
      attempts: progress.attempts,
    };
  });

  return result;
};

async function syncToFirebase(userId: string | null, lessonProgress: Map<string, LessonProgress>) {
  if (!userId || isDemoMode) return;

  try {
    await updateGrammarProgress(userId, {
      lessonProgress: serializeLessonProgress(lessonProgress),
    });
  } catch (error) {
    logger.error('Failed to sync grammar progress to Firebase', 'GrammarStore', { error: String(error) });
  }
}

export const useGrammarStore = create<GrammarState>()(
  persist(
    (set, get) => ({
      lessonProgress: new Map(),
      currentLesson: null,
      currentUserId: null,

      initializeFromFirebase: async (userId: string) => {
        if (isDemoMode) {
          set({ currentUserId: userId });
          return;
        }

        try {
          const data = await getGrammarProgress(userId);
          if (data?.lessonProgress) {
            const entries: [string, LessonProgress][] = Object.entries(data.lessonProgress).map(
              ([lessonId, progress]) => [
                lessonId,
                {
                  ...progress,
                  completedAt: progress.completedAt ? new Date(progress.completedAt) : undefined,
                },
              ]
            );
            set({
              currentUserId: userId,
              lessonProgress: new Map(entries),
            });
          } else {
            set({ currentUserId: userId });
          }
        } catch (error) {
          logger.error('Failed to load grammar progress from Firebase', 'GrammarStore', { error: String(error) });
          set({ currentUserId: userId });
        }
      },

      clearUser: () => {
        set({ currentUserId: null });
      },

      startLesson: (lessonId: string) => {
        const { lessonProgress, currentUserId } = get();
        const newProgress = new Map(lessonProgress);

        if (!newProgress.has(lessonId)) {
          newProgress.set(lessonId, createInitialProgress(lessonId));
        }

        const progress = newProgress.get(lessonId)!;
        progress.attempts++;
        newProgress.set(lessonId, progress);

        set({ currentLesson: lessonId, lessonProgress: newProgress });
        syncToFirebase(currentUserId, newProgress);
      },

      completeExercise: (lessonId: string, exerciseId: string, correct: boolean) => {
        const { lessonProgress, currentUserId } = get();
        const newProgress = new Map(lessonProgress);

        let progress = newProgress.get(lessonId);
        if (!progress) {
          progress = createInitialProgress(lessonId);
        }

        progress.exerciseScores[exerciseId] = correct;

        // Calculate current score
        const scores = Object.values(progress.exerciseScores);
        const correctCount = scores.filter(Boolean).length;
        const currentScore = scores.length > 0 ? Math.round((correctCount / scores.length) * 100) : 0;

        if (currentScore > progress.bestScore) {
          progress.bestScore = currentScore;
        }

        newProgress.set(lessonId, progress);
        set({ lessonProgress: newProgress });
        syncToFirebase(currentUserId, newProgress);
      },

      completeLesson: (lessonId: string) => {
        const { lessonProgress, currentUserId } = get();
        const newProgress = new Map(lessonProgress);

        let progress = newProgress.get(lessonId);
        if (!progress) {
          progress = createInitialProgress(lessonId);
        }

        progress.completed = true;
        progress.completedAt = new Date();

        newProgress.set(lessonId, progress);
        set({ lessonProgress: newProgress, currentLesson: null });
        syncToFirebase(currentUserId, newProgress);
      },

      getLessonProgress: (lessonId: string) => {
        return get().lessonProgress.get(lessonId);
      },

      isLessonCompleted: (lessonId: string) => {
        const progress = get().lessonProgress.get(lessonId);
        return progress?.completed ?? false;
      },

      getCompletedLessonCount: () => {
        const { lessonProgress } = get();
        let count = 0;
        lessonProgress.forEach((p) => {
          if (p.completed) count++;
        });
        return count;
      },

      getTotalScore: () => {
        const { lessonProgress } = get();
        let totalScore = 0;
        let completedCount = 0;

        lessonProgress.forEach((p) => {
          if (p.completed) {
            totalScore += p.bestScore;
            completedCount++;
          }
        });

        return completedCount > 0 ? Math.round(totalScore / completedCount) : 0;
      },

      resetProgress: () => {
        const { currentUserId } = get();
        const cleared = new Map<string, LessonProgress>();
        set({ lessonProgress: cleared, currentLesson: null });
        syncToFirebase(currentUserId, cleared);
      },
    }),
    {
      name: 'catalan-grammar-storage',
      storage: getPersistStorage(),
      partialize: (state) => ({
        lessonProgress: Array.from(state.lessonProgress.entries()),
        currentLesson: state.currentLesson,
      }),
      merge: (persistedState, current) => {
        const persisted = persistedState as PersistedGrammarState | undefined;
        // Restore lessonProgress with proper date deserialization
        const lessonProgressEntries: [string, LessonProgress][] = (persisted?.lessonProgress || []).map(
          ([key, value]) => [
            key,
            {
              ...value,
              completedAt: value.completedAt ? new Date(value.completedAt) : undefined,
            },
          ]
        );

        return {
          ...current,
          lessonProgress: new Map(lessonProgressEntries),
          currentLesson: persisted?.currentLesson ?? null,
        };
      },
    }
  )
);
