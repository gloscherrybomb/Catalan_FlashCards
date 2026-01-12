import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  completedAt?: Date;
  exerciseScores: Record<string, boolean>; // exerciseId -> correct/incorrect
  bestScore: number; // percentage
  attempts: number;
}

interface GrammarState {
  lessonProgress: Map<string, LessonProgress>;
  currentLesson: string | null;

  // Actions
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

export const useGrammarStore = create<GrammarState>()(
  persist(
    (set, get) => ({
      lessonProgress: new Map(),
      currentLesson: null,

      startLesson: (lessonId: string) => {
        const { lessonProgress } = get();
        const newProgress = new Map(lessonProgress);

        if (!newProgress.has(lessonId)) {
          newProgress.set(lessonId, createInitialProgress(lessonId));
        }

        const progress = newProgress.get(lessonId)!;
        progress.attempts++;
        newProgress.set(lessonId, progress);

        set({ currentLesson: lessonId, lessonProgress: newProgress });
      },

      completeExercise: (lessonId: string, exerciseId: string, correct: boolean) => {
        const { lessonProgress } = get();
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
      },

      completeLesson: (lessonId: string) => {
        const { lessonProgress } = get();
        const newProgress = new Map(lessonProgress);

        let progress = newProgress.get(lessonId);
        if (!progress) {
          progress = createInitialProgress(lessonId);
        }

        progress.completed = true;
        progress.completedAt = new Date();

        newProgress.set(lessonId, progress);
        set({ lessonProgress: newProgress, currentLesson: null });
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
        set({ lessonProgress: new Map(), currentLesson: null });
      },
    }),
    {
      name: 'catalan-grammar-storage',
      partialize: (state) => ({
        lessonProgress: Array.from(state.lessonProgress.entries()),
        currentLesson: state.currentLesson,
      }),
      merge: (persisted: any, current) => ({
        ...current,
        ...persisted,
        lessonProgress: new Map(persisted?.lessonProgress || []),
      }),
    }
  )
);
