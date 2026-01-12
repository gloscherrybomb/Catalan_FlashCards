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
import { isSameDay, differenceInDays, startOfDay } from 'date-fns';

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
};

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
                console.error('Auth state change error:', error);
                set({ isLoading: false, isAuthenticated: false });
              }
              resolve();
            });

            // Store unsubscribe for cleanup
            (window as any).__authUnsubscribe = unsubscribe;
          } catch (error) {
            console.error('Initialize error:', error);
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
          console.log('Google sign-in successful:', user.email);

          // Manually update state after successful login
          console.log('Fetching user profile for:', user.uid);

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
          console.log('User authenticated with basic profile');

          // Try to fetch Firestore data in background (non-blocking)
          try {
            console.log('Attempting to fetch Firestore profile...');
            let firestoreProfile = await getUserProfile(user.uid);
            console.log('Firestore profile result:', firestoreProfile);

            if (!firestoreProfile) {
              console.log('Creating new user profile in Firestore...');
              firestoreProfile = await createUserProfile(user);
              console.log('Profile created:', firestoreProfile);
            }

            console.log('Fetching progress...');
            const progress = await getUserProgress(user.uid);
            console.log('Progress:', progress);

            console.log('Fetching achievements...');
            const achievements = await getUnlockedAchievements(user.uid);
            console.log('Achievements:', achievements);

            // Update with full Firestore data
            set({
              profile: firestoreProfile,
              progress: progress || DEFAULT_PROGRESS,
              achievements,
            });
            console.log('Updated with Firestore data');
          } catch (firestoreError) {
            console.error('Firestore fetch failed (using basic profile):', firestoreError);
          }
        } catch (error) {
          console.error('Login failed:', error);
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
          console.error('Logout failed:', error);
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

        const newProgress = {
          ...progress,
          xp: newXP,
          level: newLevel,
        };

        set({ progress: newProgress });

        if (user && !isDemoMode) {
          await updateUserProgress(user.uid, { xp: newXP, level: newLevel });
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

        const newProgress: Partial<UserProgress> = {
          totalCardsReviewed: progress.totalCardsReviewed + cardsReviewed,
          totalCorrect: progress.totalCorrect + correctAnswers,
          totalTimeSpentMs: progress.totalTimeSpentMs + timeSpentMs,
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
        isAuthenticated: state.isAuthenticated,
        profile: state.profile,
      }),
    }
  )
);
