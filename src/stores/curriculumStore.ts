import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  CEFRLevel,
  CURRICULUM_UNITS,
  getUnitById,
  getUnitForLesson,
  PLACEMENT_QUESTIONS,
} from '../data/curriculum';
import type { PlacementResult } from '../types/curriculum';
import {
  getCurriculumProgress,
  updateCurriculumProgress,
  isDemoMode,
} from '../services/firebase';
import { logger } from '../services/logger';
import { useCardStore } from './cardStore';

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  completedAt?: string;
  score: number;
  attempts: number;
}

interface CurriculumState {
  // Progress tracking
  lessonProgress: Record<string, LessonProgress>;
  currentLevel: CEFRLevel;
  placementResult: PlacementResult | null;
  currentUnitId: string | null;
  currentLessonId: string | null;

  // Placement test state
  placementAnswers: Record<string, string>;
  placementInProgress: boolean;

  // User tracking for Firebase sync
  currentUserId: string | null;

  // Actions
  initializeFromFirebase: (userId: string) => Promise<void>;
  clearUser: () => void;
  startLesson: (lessonId: string) => void;
  completeLesson: (lessonId: string, score: number) => void;
  getLessonProgress: (lessonId: string) => LessonProgress | undefined;
  isLessonCompleted: (lessonId: string) => boolean;
  isUnitCompleted: (unitId: string) => boolean;
  isUnitUnlocked: (unitId: string) => boolean;
  getUnitProgress: (unitId: string) => { completed: number; total: number };
  getLevelProgress: (level: CEFRLevel) => { completed: number; total: number };
  getNextLesson: () => { unitId: string; lessonId: string } | null;
  getTotalXPEarned: () => number;

  // Placement test
  startPlacementTest: () => void;
  answerPlacementQuestion: (questionId: string, answer: string) => void;
  completePlacementTest: () => PlacementResult;
  resetPlacement: () => void;

  // Utils
  setCurrentLevel: (level: CEFRLevel) => void;
  resetProgress: () => void;
}

const calculateLevel = (breakdown: PlacementResult['breakdown']): CEFRLevel => {
  // If they got most B2 correct, they're B2
  if (breakdown.B2.correct >= 3) return 'B2';
  // If they got most B1 correct, they're B1
  if (breakdown.B1.correct >= 3) return 'B1';
  // If they got most A2 correct, they're A2
  if (breakdown.A2.correct >= 3) return 'A2';
  // Default to A1
  return 'A1';
};

const findLessonById = (lessonId: string) => {
  for (const unit of CURRICULUM_UNITS) {
    const lesson = unit.lessons.find(candidate => candidate.id === lessonId);
    if (lesson) return lesson;
  }
  return undefined;
};

const CEFR_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];

const isCEFRLevel = (value: string): value is CEFRLevel => {
  return CEFR_LEVELS.includes(value as CEFRLevel);
};

const isPlacementBreakdown = (value: unknown): value is PlacementResult['breakdown'] => {
  if (!value || typeof value !== 'object') return false;
  const breakdown = value as PlacementResult['breakdown'];
  const levels: Array<keyof PlacementResult['breakdown']> = ['A1', 'A2', 'B1', 'B2'];

  return levels.every(level => {
    const stats = breakdown[level];
    return (
      stats &&
      typeof stats.correct === 'number' &&
      typeof stats.total === 'number'
    );
  });
};

const normalizePlacementResult = (value: unknown): PlacementResult | null => {
  if (!value || typeof value !== 'object') return null;
  const result = value as PlacementResult;

  if (!isCEFRLevel((result as { level?: string }).level || '')) return null;
  if (
    typeof result.score !== 'number' ||
    typeof result.totalQuestions !== 'number' ||
    typeof result.correctAnswers !== 'number' ||
    typeof result.takenAt !== 'string'
  ) {
    return null;
  }
  if (!isPlacementBreakdown(result.breakdown)) return null;

  return result;
};

// Helper to sync curriculum progress to Firebase
async function syncToFirebase(userId: string | null, state: Partial<{
  lessonProgress: Record<string, LessonProgress>;
  currentLevel: CEFRLevel;
  placementResult: PlacementResult | null;
}>) {
  if (!userId || isDemoMode) return;

  try {
    await updateCurriculumProgress(userId, state);
  } catch (error) {
    logger.error('Failed to sync curriculum progress to Firebase', 'CurriculumStore', { error: String(error) });
  }
}

export const useCurriculumStore = create<CurriculumState>()(
  persist(
    (set, get) => ({
      lessonProgress: {},
      currentLevel: 'A1',
      placementResult: null,
      currentUnitId: null,
      currentLessonId: null,
      placementAnswers: {},
      placementInProgress: false,
      currentUserId: null,

      initializeFromFirebase: async (userId: string) => {
        if (isDemoMode) {
          set({ currentUserId: userId });
          return;
        }

        try {
          logger.debug('Loading curriculum progress from Firebase', 'CurriculumStore', { userId });
          const firebaseData = await getCurriculumProgress(userId);

          if (firebaseData) {
            const { lessonProgress: localProgress, currentLevel: localLevel, placementResult: localPlacement } = get();

            // Merge Firebase data with local data (Firebase takes priority, but keep local data that might be newer)
            const mergedLessonProgress = { ...localProgress };

            // Firebase data overwrites local for completed lessons
            if (firebaseData.lessonProgress) {
              for (const [lessonId, fbProgress] of Object.entries(firebaseData.lessonProgress)) {
                const localLesson = mergedLessonProgress[lessonId];
                // Use Firebase data if it exists and is completed, or if local doesn't have it
                if (fbProgress.completed || !localLesson) {
                  mergedLessonProgress[lessonId] = fbProgress;
                }
              }
            }

            const normalizedLevel = isCEFRLevel(firebaseData.currentLevel)
              ? firebaseData.currentLevel
              : localLevel;
            const normalizedPlacement = normalizePlacementResult(firebaseData.placementResult)
              || localPlacement;

            set({
              currentUserId: userId,
              lessonProgress: mergedLessonProgress,
              currentLevel: normalizedLevel,
              placementResult: normalizedPlacement,
            });

            logger.debug('Curriculum progress loaded from Firebase', 'CurriculumStore', {
              lessonsLoaded: Object.keys(mergedLessonProgress).length,
            });
          } else {
            // No Firebase data, sync local data to Firebase
            const { lessonProgress, currentLevel, placementResult } = get();
            set({ currentUserId: userId });

            if (Object.keys(lessonProgress).length > 0) {
              logger.debug('Syncing local curriculum progress to Firebase', 'CurriculumStore');
              await syncToFirebase(userId, { lessonProgress, currentLevel, placementResult });
            }
          }
        } catch (error) {
          logger.error('Failed to load curriculum progress from Firebase', 'CurriculumStore', { error: String(error) });
          set({ currentUserId: userId });
        }
      },

      clearUser: () => {
        set({ currentUserId: null });
      },

      startLesson: (lessonId: string) => {
        const { lessonProgress } = get();
        const existing = lessonProgress[lessonId];
        const unit = getUnitForLesson(lessonId);

        set({
          currentLessonId: lessonId,
          currentUnitId: unit?.id || null,
          lessonProgress: {
            ...lessonProgress,
            [lessonId]: {
              lessonId,
              completed: existing?.completed || false,
              completedAt: existing?.completedAt,
              score: existing?.score || 0,
              attempts: (existing?.attempts || 0) + 1,
            },
          },
        });
      },

      completeLesson: (lessonId: string, score: number) => {
        const { lessonProgress, currentUserId } = get();
        const existing = lessonProgress[lessonId];

        const updatedLessonProgress = {
          ...lessonProgress,
          [lessonId]: {
            lessonId,
            completed: true,
            completedAt: new Date().toISOString(),
            score: Math.max(existing?.score || 0, score),
            attempts: existing?.attempts || 1,
          },
        };

        set({
          lessonProgress: updatedLessonProgress,
          currentLessonId: null,
        });

        // Sync to Firebase
        syncToFirebase(currentUserId, { lessonProgress: updatedLessonProgress });

        const lesson = findLessonById(lessonId);
        if (lesson?.content.type === 'vocabulary' && lesson.content.unitNumber) {
          void useCardStore.getState().addUnitVocabulary(lesson.content.unitNumber);
        }
      },

      getLessonProgress: (lessonId: string) => {
        return get().lessonProgress[lessonId];
      },

      isLessonCompleted: (lessonId: string) => {
        return get().lessonProgress[lessonId]?.completed || false;
      },

      isUnitCompleted: (unitId: string) => {
        const unit = getUnitById(unitId);
        if (!unit) return false;

        const { lessonProgress } = get();
        return unit.lessons.every(
          lesson => lessonProgress[lesson.id]?.completed
        );
      },

      isUnitUnlocked: (unitId: string) => {
        const unit = getUnitById(unitId);
        if (!unit) return false;

        // No prerequisites = unlocked
        if (unit.prerequisites.length === 0) return true;

        // Check all prerequisites are completed
        const { isUnitCompleted } = get();
        return unit.prerequisites.every(prereqId => isUnitCompleted(prereqId));
      },

      getUnitProgress: (unitId: string) => {
        const unit = getUnitById(unitId);
        if (!unit) return { completed: 0, total: 0 };

        const { lessonProgress } = get();
        const completed = unit.lessons.filter(
          lesson => lessonProgress[lesson.id]?.completed
        ).length;

        return { completed, total: unit.lessons.length };
      },

      getLevelProgress: (level: CEFRLevel) => {
        const levelUnits = CURRICULUM_UNITS.filter(u => u.level === level);
        const { lessonProgress } = get();

        let completed = 0;
        let total = 0;

        for (const unit of levelUnits) {
          for (const lesson of unit.lessons) {
            total++;
            if (lessonProgress[lesson.id]?.completed) {
              completed++;
            }
          }
        }

        return { completed, total };
      },

      getNextLesson: () => {
        const { lessonProgress, currentLevel, isUnitUnlocked } = get();

        // First, try to find next lesson in current level
        const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];
        const startIndex = levels.indexOf(currentLevel);

        for (let i = startIndex; i < levels.length; i++) {
          const levelUnits = CURRICULUM_UNITS.filter(u => u.level === levels[i]);

          for (const unit of levelUnits) {
            if (!isUnitUnlocked(unit.id)) continue;

            for (const lesson of unit.lessons) {
              if (!lessonProgress[lesson.id]?.completed) {
                return { unitId: unit.id, lessonId: lesson.id };
              }
            }
          }
        }

        return null;
      },

      getTotalXPEarned: () => {
        const { lessonProgress } = get();
        let totalXP = 0;

        for (const unit of CURRICULUM_UNITS) {
          for (const lesson of unit.lessons) {
            if (lessonProgress[lesson.id]?.completed) {
              totalXP += lesson.xpReward;
            }
          }
        }

        return totalXP;
      },

      // Placement test
      startPlacementTest: () => {
        set({
          placementInProgress: true,
          placementAnswers: {},
        });
      },

      answerPlacementQuestion: (questionId: string, answer: string) => {
        const { placementAnswers } = get();
        set({
          placementAnswers: {
            ...placementAnswers,
            [questionId]: answer,
          },
        });
      },

      completePlacementTest: () => {
        const { placementAnswers, currentUserId } = get();

        const breakdown: PlacementResult['breakdown'] = {
          A1: { correct: 0, total: 0 },
          A2: { correct: 0, total: 0 },
          B1: { correct: 0, total: 0 },
          B2: { correct: 0, total: 0 },
        };

        let totalCorrect = 0;

        for (const question of PLACEMENT_QUESTIONS) {
          breakdown[question.level].total++;

          if (placementAnswers[question.id] === question.correctAnswer) {
            breakdown[question.level].correct++;
            totalCorrect++;
          }
        }

        const level = calculateLevel(breakdown);
        const result: PlacementResult = {
          level,
          score: Math.round((totalCorrect / PLACEMENT_QUESTIONS.length) * 100),
          totalQuestions: PLACEMENT_QUESTIONS.length,
          correctAnswers: totalCorrect,
          takenAt: new Date().toISOString(),
          breakdown,
        };

        set({
          placementResult: result,
          placementInProgress: false,
          currentLevel: level,
          placementAnswers: {},
        });

        // Sync to Firebase
        syncToFirebase(currentUserId, { placementResult: result, currentLevel: level });

        return result;
      },

      resetPlacement: () => {
        set({
          placementResult: null,
          placementInProgress: false,
          placementAnswers: {},
        });
      },

      setCurrentLevel: (level: CEFRLevel) => {
        const { currentUserId } = get();
        set({ currentLevel: level });

        // Sync to Firebase
        syncToFirebase(currentUserId, { currentLevel: level });
      },

      resetProgress: () => {
        set({
          lessonProgress: {},
          currentLevel: 'A1',
          placementResult: null,
          currentUnitId: null,
          currentLessonId: null,
          placementAnswers: {},
          placementInProgress: false,
        });
      },
    }),
    {
      name: 'catalan-curriculum-storage',
    }
  )
);
