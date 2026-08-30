import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from 'firebase/auth';
import type { UserProfile, UserProgress, UserSettings } from '../types/user';
import type { UnlockedAchievement } from '../types/gamification';
import { getLevelForXP, XP_VALUES } from '../types/gamification';
import {
  onAuthChange,
  getUserProfile,
  createUserProfile,
  getUserProgress,
  updateUserProgress,
  updateUserSettings,
  getUnlockedAchievements,
  signInWithGoogle,
  signOut,
  isDemoMode,
} from '../services/firebase';
import { logger } from '../services/logger';
import { isSameDay, differenceInDays, startOfDay } from 'date-fns';
import { useCurriculumStore } from './curriculumStore';
import { useGrammarStore } from './grammarStore';
import { useStoryStore } from './storyStore';
import { getPersistStorage } from '../utils/persistStorage';
import { notificationService } from '../services/notificationService';
import { todayKey } from '../utils/dateKeys';

// Module-scoped variable for auth unsubscribe (replaces window.__authUnsubscribe)
// Exported for potential cleanup usage by the app
export let authUnsubscribe: (() => void) | null = null;

// Type for persisted state deserialization
interface PersistedUserState {
  progress?: UserProgress & {
    lastStudyDate?: string | null;
    lastStreakFreezeUsed?: string;
  };
  achievements?: Array<Omit<UnlockedAchievement, 'unlockedAt'> & { unlockedAt: string }>;
  profile?: Omit<UserProfile, 'createdAt'> & { createdAt: string };
  isAuthenticated?: boolean;
}

interface UserState {
  user: User | null;
  profile: UserProfile | null;
  progress: UserProgress;
  achievements: UnlockedAchievement[];
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  initialize: () => Promise<void>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  addXP: (amount: number) => Promise<void>;
  updateStreak: () => Promise<void>;
  useStreakFreeze: () => Promise<boolean>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  recordStudySession: (cardsReviewed: number, correctAnswers: number, timeSpentMs: number) => Promise<void>;
  addAchievements: (newAchievements: UnlockedAchievement[]) => void;
  updateCardsLearned: (count: number) => Promise<void>;
  recordSpeakingAttempt: (wasExcellent: boolean) => Promise<void>;
}

const DEFAULT_PROGRESS: UserProgress = {
  xp: 0,
  level: 1,
  currentStreak: 0,
  longestStreak: 0,
  lastStudyDate: null,
  totalCardsReviewed: 0,
  totalCorrect: 0,
  totalTimeSpentMs: 0,
  cardsLearned: 0,
  streakFreezeAvailable: true,
  dailyActivity: {},
  speakingExercises: 0,
  perfectPronunciations: 0,
};

// Day keys are local-time (see utils/dateKeys) so that "today" means the same
// thing here as it does in the streak logic and the activity heatmap.

/**
 * Choose between locally-held progress and the copy Firestore returned.
 *
 * "Further along" is judged by total cards reviewed, which only ever grows.
 * This stops a device that studied offline from being rolled back by a stale
 * server document, and vice versa.
 */
function pickFurtherProgress(local: UserProgress, remote: UserProgress | null): UserProgress {
  if (!remote) return local;
  if ((local?.totalCardsReviewed ?? 0) > (remote.totalCardsReviewed ?? 0)) return local;
  return remote;
}

/** Union of unlocked achievements; unlocking is monotonic, so never drop any. */
function mergeAchievements(
  local: UnlockedAchievement[],
  remote: UnlockedAchievement[]
): UnlockedAchievement[] {
  const byId = new Map<string, UnlockedAchievement>();
  for (const achievement of [...remote, ...local]) {
    if (!byId.has(achievement.achievementId)) byId.set(achievement.achievementId, achievement);
  }
  return [...byId.values()];
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      progress: DEFAULT_PROGRESS,
      achievements: [],
      isLoading: true,
      isAuthenticated: false,

      initialize: async () => {
        set({ isLoading: true });

        if (isDemoMode) {
          // Demo mode - skip Firebase sync
          set({ isLoading: false });
          return;
        }

        return new Promise<void>((resolve) => {
          try {
            const unsubscribe = onAuthChange(async (user) => {
              try {
                if (user) {
                  // Set user as authenticated immediately with basic profile
                  // so the app works even if Firestore is unavailable
                  const basicProfile: UserProfile = {
                    uid: user.uid,
                    email: user.email || '',
                    displayName: user.displayName || 'Learner',
                    photoURL: user.photoURL || undefined,
                    createdAt: new Date(),
                    settings: {
                      dailyGoal: 20,
                      preferredMode: 'mixed' as const,
                      soundEnabled: true,
                      vibrationEnabled: true,
                      showHints: true,
                    },
                  };

                  set({
                    user,
                    profile: basicProfile,
                    isAuthenticated: true,
                  });

                  // Now try to fetch full data from Firestore
                  try {
                    let profile = await getUserProfile(user.uid);
                    if (!profile) {
                      profile = await createUserProfile(user);
                    }

                    const progress = await getUserProgress(user.uid);
                    const achievements = await getUnlockedAchievements(user.uid);

                    set((state) => ({
                      profile,
                      progress: pickFurtherProgress(state.progress, progress),
                      achievements: mergeAchievements(state.achievements, achievements),
                      isLoading: false,
                    }));

                    // Initialize curriculum progress from Firebase
                    await useCurriculumStore.getState().initializeFromFirebase(user.uid);
                    await useGrammarStore.getState().initializeFromFirebase(user.uid);
                    await useStoryStore.getState().initializeFromFirebase(user.uid);
                    await notificationService.initialize(user.uid);
                  } catch (firestoreError) {
                    logger.error('Firestore fetch failed during init (using basic profile)', 'UserStore', { error: String(firestoreError) });
                    set({ isLoading: false });
                  }
                } else {
                  // Clear curriculum user when logged out
                  useCurriculumStore.getState().clearUser();
                  useGrammarStore.getState().clearUser();
                  useStoryStore.getState().clearUser();
                  notificationService.clearUser();

                  set({
                    user: null,
                    profile: null,
                    progress: DEFAULT_PROGRESS,
                    achievements: [],
                    isAuthenticated: false,
                    isLoading: false,
                  });
                }
              } catch (error) {
                logger.error('Auth state change error', 'UserStore', { error: String(error) });
                set({ isLoading: false });
              }
              resolve();
            });

            // Store unsubscribe for cleanup
            authUnsubscribe = unsubscribe;
          } catch (error) {
            logger.error('Initialize error', 'UserStore', { error: String(error) });
            set({ isLoading: false });
            resolve();
          }
        });
      },

      login: async () => {
        if (isDemoMode) {
          // Demo mode - simulate login
          set({
            isAuthenticated: true,
            profile: {
              uid: 'demo-user',
              email: 'demo@catalan.app',
              displayName: 'Demo Learner',
              createdAt: new Date(),
              settings: {
                dailyGoal: 20,
                preferredMode: 'mixed',
                soundEnabled: true,
                vibrationEnabled: true,
                showHints: true,
              },
            },
          });
          return;
        }

        try {
          const user = await signInWithGoogle();
          logger.info('Google sign-in successful', 'UserStore', { email: user.email });

          // Manually update state after successful login
          logger.debug('Fetching user profile', 'UserStore', { uid: user.uid });

          // Skip Firestore for now and just use basic profile
          // This ensures login works even if Firestore has issues
          const basicProfile: UserProfile = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'Learner',
            photoURL: user.photoURL || undefined,
            createdAt: new Date(),
            settings: {
              dailyGoal: 20,
              preferredMode: 'mixed' as const,
              soundEnabled: true,
              vibrationEnabled: true,
              showHints: true,
            },
          };

          // Keep whatever progress is already in the store (rehydrated from
          // local storage). Resetting to DEFAULT_PROGRESS here meant that if
          // the Firestore read below then failed - blocked, offline, rules
          // misconfigured - the learner's XP, streak and achievements were
          // already gone, with nothing left to restore them from.
          set({
            user,
            profile: basicProfile,
            isAuthenticated: true,
            isLoading: false,
          });
          logger.debug('User authenticated with basic profile', 'UserStore');

          // Try to fetch Firestore data in background (non-blocking)
          try {
            logger.debug('Attempting to fetch Firestore profile', 'UserStore');
            let firestoreProfile = await getUserProfile(user.uid);
            logger.debug('Firestore profile fetched', 'UserStore', { hasProfile: !!firestoreProfile });

            if (!firestoreProfile) {
              logger.debug('Creating new user profile in Firestore', 'UserStore');
              firestoreProfile = await createUserProfile(user);
              logger.debug('Profile created', 'UserStore');
            }

            logger.debug('Fetching progress', 'UserStore');
            const progress = await getUserProgress(user.uid);
            logger.debug('Progress fetched', 'UserStore');

            logger.debug('Fetching achievements', 'UserStore');
            const achievements = await getUnlockedAchievements(user.uid);
            logger.debug('Achievements fetched', 'UserStore', { count: achievements.length });

            // Prefer whichever record has seen more work. A fresh Firestore
            // document (new device, or an earlier failed write) must not
            // silently roll back progress this browser already holds.
            set((state) => ({
              profile: firestoreProfile,
              progress: pickFurtherProgress(state.progress, progress),
              achievements: mergeAchievements(state.achievements, achievements),
            }));
            logger.debug('Updated with Firestore data', 'UserStore');

            // Initialize curriculum progress from Firebase
            await useCurriculumStore.getState().initializeFromFirebase(user.uid);
            await useGrammarStore.getState().initializeFromFirebase(user.uid);
            await useStoryStore.getState().initializeFromFirebase(user.uid);
            await notificationService.initialize(user.uid);
            logger.debug('Progress initialized from Firebase', 'UserStore');
          } catch (firestoreError) {
            logger.error('Firestore fetch failed (using basic profile)', 'UserStore', { error: String(firestoreError) });
          }
        } catch (error) {
          logger.error('Login failed', 'UserStore', { error: String(error) });
          throw error;
        }
      },

      logout: async () => {
        // Clear curriculum user
        useCurriculumStore.getState().clearUser();
        useGrammarStore.getState().clearUser();
        useStoryStore.getState().clearUser();
        notificationService.clearUser();

        if (isDemoMode) {
          set({
            isAuthenticated: false,
            profile: null,
            progress: DEFAULT_PROGRESS,
            achievements: [],
          });
          return;
        }

        try {
          await signOut();
        } catch (error) {
          logger.error('Logout failed', 'UserStore', { error: String(error) });
          throw error;
        }
      },

      addXP: async (amount: number) => {
        const { user, progress } = get();

        // Apply streak bonus
        let multiplier = 1;
        if (progress.currentStreak >= 100) multiplier = XP_VALUES.STREAK_BONUS_100;
        else if (progress.currentStreak >= 60) multiplier = XP_VALUES.STREAK_BONUS_60;
        else if (progress.currentStreak >= 30) multiplier = XP_VALUES.STREAK_BONUS_30;
        else if (progress.currentStreak >= 14) multiplier = XP_VALUES.STREAK_BONUS_14;
        else if (progress.currentStreak >= 7) multiplier = XP_VALUES.STREAK_BONUS_7;

        const bonusXP = Math.round(amount * multiplier);
        const newXP = (progress.xp || 0) + bonusXP;
        const newLevel = getLevelForXP(newXP).level;

        // Update daily XP tracking - ensure dailyActivity exists
        const today = todayKey();
        const dailyActivity = progress.dailyActivity || {};
        const todayActivity = dailyActivity[today] || { cards: 0, xp: 0 };
        const updatedDailyActivity = {
          ...dailyActivity,
          [today]: {
            ...todayActivity,
            xp: (todayActivity.xp || 0) + bonusXP,
          },
        };

        const newProgress = {
          ...progress,
          xp: newXP,
          level: newLevel,
          dailyActivity: updatedDailyActivity,
        };

        set({ progress: newProgress });

        if (user && !isDemoMode) {
          await updateUserProgress(user.uid, { xp: newXP, level: newLevel, dailyActivity: updatedDailyActivity });
        }
      },

      updateStreak: async () => {
        const { user, progress } = get();
        const today = startOfDay(new Date());
        const lastStudy = progress.lastStudyDate ? startOfDay(new Date(progress.lastStudyDate)) : null;

        let newStreak = progress.currentStreak;
        let usedFreeze = false;

        if (!lastStudy) {
          // First study session ever
          newStreak = 1;
        } else if (isSameDay(today, lastStudy)) {
          // Already studied today
          return;
        } else {
          const daysDiff = differenceInDays(today, lastStudy);

          if (daysDiff === 1) {
            // Consecutive day
            newStreak = progress.currentStreak + 1;
          } else if (daysDiff === 2 && progress.streakFreezeAvailable) {
            // Missed one day, use streak freeze
            newStreak = progress.currentStreak + 1;
            usedFreeze = true;
          } else {
            // Streak broken
            newStreak = 1;
          }
        }

        const newProgress: Partial<UserProgress> = {
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, progress.longestStreak),
          lastStudyDate: new Date(),
        };

        if (usedFreeze) {
          newProgress.streakFreezeAvailable = false;
          newProgress.lastStreakFreezeUsed = new Date();
        }

        set({ progress: { ...progress, ...newProgress } });

        if (user && !isDemoMode) {
          await updateUserProgress(user.uid, newProgress);
        }
      },

      useStreakFreeze: async () => {
        const { user, progress } = get();

        if (!progress.streakFreezeAvailable) return false;

        const newProgress = {
          streakFreezeAvailable: false,
          lastStreakFreezeUsed: new Date(),
        };

        set({ progress: { ...progress, ...newProgress } });

        if (user && !isDemoMode) {
          await updateUserProgress(user.uid, newProgress);
        }

        return true;
      },

      updateSettings: async (settings: Partial<UserSettings>) => {
        const { user, profile } = get();
        if (!profile) return;

        const newProfile = {
          ...profile,
          settings: { ...profile.settings, ...settings },
        };

        set({ profile: newProfile });

        // This used to update local state only. The profile is refetched from
        // Firestore on the next sign-in, so every settings change silently
        // reverted the next time the learner signed in on any device.
        if (user && !isDemoMode) {
          try {
            await updateUserSettings(user.uid, newProfile.settings);
          } catch (error) {
            logger.error('Failed to persist settings', 'UserStore', { error: String(error) });
          }
        }
      },

      recordStudySession: async (cardsReviewed: number, correctAnswers: number, timeSpentMs: number) => {
        const { user, progress } = get();

        // Update daily activity - ensure dailyActivity exists
        const today = todayKey();
        const dailyActivity = progress.dailyActivity || {};
        const todayActivity = dailyActivity[today] || { cards: 0, xp: 0 };
        const updatedDailyActivity = {
          ...dailyActivity,
          [today]: {
            cards: (todayActivity.cards || 0) + cardsReviewed,
            xp: todayActivity.xp || 0, // XP is tracked separately via addXP
          },
        };

        const newProgress: Partial<UserProgress> = {
          totalCardsReviewed: (progress.totalCardsReviewed || 0) + cardsReviewed,
          totalCorrect: (progress.totalCorrect || 0) + correctAnswers,
          totalTimeSpentMs: (progress.totalTimeSpentMs || 0) + timeSpentMs,
          dailyActivity: updatedDailyActivity,
        };

        set({ progress: { ...progress, ...newProgress } });

        if (user && !isDemoMode) {
          await updateUserProgress(user.uid, newProgress);
        }
      },

      addAchievements: (newAchievements: UnlockedAchievement[]) => {
        const { achievements } = get();
        const existingIds = new Set(achievements.map(a => a.achievementId));
        const uniqueNew = newAchievements.filter(a => !existingIds.has(a.achievementId));

        if (uniqueNew.length > 0) {
          set({ achievements: [...achievements, ...uniqueNew] });
        }
      },

      recordSpeakingAttempt: async (wasExcellent: boolean) => {
        const { user, progress } = get();

        const newProgress: Partial<UserProgress> = {
          speakingExercises: (progress.speakingExercises ?? 0) + 1,
          perfectPronunciations:
            (progress.perfectPronunciations ?? 0) + (wasExcellent ? 1 : 0),
        };

        set({ progress: { ...progress, ...newProgress } });

        if (user && !isDemoMode) {
          await updateUserProgress(user.uid, newProgress);
        }
      },

      updateCardsLearned: async (count: number) => {
        const { user, progress } = get();

        const newProgress: Partial<UserProgress> = {
          cardsLearned: count,
        };

        set({ progress: { ...progress, ...newProgress } });

        if (user && !isDemoMode) {
          await updateUserProgress(user.uid, newProgress);
        }
      },
    }),
    {
      name: 'catalan-user-storage',
      storage: getPersistStorage(),
      partialize: (state) => ({
        progress: state.progress,
        achievements: state.achievements,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
      }),
      merge: (persistedState, current) => {
        const persisted = persistedState as PersistedUserState | undefined;
        // Restore progress with proper date deserialization
        const progress = persisted?.progress ? {
          ...persisted.progress,
          lastStudyDate: persisted.progress.lastStudyDate
            ? new Date(persisted.progress.lastStudyDate)
            : null,
          lastStreakFreezeUsed: persisted.progress.lastStreakFreezeUsed
            ? new Date(persisted.progress.lastStreakFreezeUsed)
            : undefined,
        } : current.progress;

        // Restore profile with proper date deserialization
        const profile = persisted?.profile ? {
          ...persisted.profile,
          createdAt: new Date(persisted.profile.createdAt),
        } as UserProfile : current.profile;

        // Restore achievements with proper date deserialization
        const achievements: UnlockedAchievement[] = (persisted?.achievements || []).map((a) => ({
          ...a,
          unlockedAt: new Date(a.unlockedAt),
        }));

        return {
          ...current,
          progress,
          achievements,
          profile,
          isAuthenticated: persisted?.isAuthenticated ?? false,
        };
      },
    }
  )
);
