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
  getUnlockedAchievements,
  signInWithGoogle,
  signOut,
  isDemoMode,
} from '../services/firebase';
import { logger } from '../services/logger';
import { isSameDay, differenceInDays, startOfDay } from 'date-fns';

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
};

// Helper to get today's date key in YYYY-MM-DD format
function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
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
          // Demo mode - use local storage only
          set({ isLoading: false });
          return;
        }

        return new Promise<void>((resolve) => {
          try {
            const unsubscribe = onAuthChange(async (user) => {
              try {
                if (user) {
                  let profile = await getUserProfile(user.uid);
                  if (!profile) {
                    profile = await createUserProfile(user);
                  }

                  const progress = await getUserProgress(user.uid);
                  const achievements = await getUnlockedAchievements(user.uid);

                  set({
                    user,
                    profile,
                    progress,
                    achievements,
                    isAuthenticated: true,
                    isLoading: false,
                  });
                } else {
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
                set({ isLoading: false, isAuthenticated: false });
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

          set({
            user,
            profile: basicProfile,
            progress: DEFAULT_PROGRESS,
            achievements: [],
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

            // Update with full Firestore data
            set({
              profile: firestoreProfile,
              progress: progress || DEFAULT_PROGRESS,
              achievements,
            });
            logger.debug('Updated with Firestore data', 'UserStore');
          } catch (firestoreError) {
            logger.error('Firestore fetch failed (using basic profile)', 'UserStore', { error: String(firestoreError) });
          }
        } catch (error) {
          logger.error('Login failed', 'UserStore', { error: String(error) });
          throw error;
        }
      },

      logout: async () => {
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
        const newXP = progress.xp + bonusXP;
        const newLevel = getLevelForXP(newXP).level;

        // Update daily XP tracking
        const todayKey = getTodayKey();
        const todayActivity = progress.dailyActivity[todayKey] || { cards: 0, xp: 0 };
        const updatedDailyActivity = {
          ...progress.dailyActivity,
          [todayKey]: {
            ...todayActivity,
            xp: todayActivity.xp + bonusXP,
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
        const { profile } = get();
        if (!profile) return;

        const newProfile = {
          ...profile,
          settings: { ...profile.settings, ...settings },
        };

        set({ profile: newProfile });
      },

      recordStudySession: async (cardsReviewed: number, correctAnswers: number, timeSpentMs: number) => {
        const { user, progress } = get();

        // Update daily activity
        const todayKey = getTodayKey();
        const todayActivity = progress.dailyActivity[todayKey] || { cards: 0, xp: 0 };
        const updatedDailyActivity = {
          ...progress.dailyActivity,
          [todayKey]: {
            cards: todayActivity.cards + cardsReviewed,
            xp: todayActivity.xp, // XP is tracked separately via addXP
          },
        };

        const newProgress: Partial<UserProgress> = {
          totalCardsReviewed: progress.totalCardsReviewed + cardsReviewed,
          totalCorrect: progress.totalCorrect + correctAnswers,
          totalTimeSpentMs: progress.totalTimeSpentMs + timeSpentMs,
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
