export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  settings: UserSettings;
}

export interface UserSettings {
  dailyGoal: number;           // Cards per day
  preferredMode: 'flip' | 'multiple-choice' | 'type-answer' | 'mixed';
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  showHints: boolean;
}

export interface UserProgress {
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: Date | null;
  totalCardsReviewed: number;
  totalCorrect: number;
  totalTimeSpentMs: number;
  cardsLearned: number;        // Cards with interval >= 21 days
  streakFreezeAvailable: boolean;
  lastStreakFreezeUsed?: Date;
}

export interface DailyStats {
  date: string;               // YYYY-MM-DD
  cardsReviewed: number;
  correctAnswers: number;
  xpEarned: number;
  timeSpentMs: number;
  newCardsLearned: number;
}

export const DEFAULT_SETTINGS: UserSettings = {
  dailyGoal: 20,
  preferredMode: 'mixed',
  soundEnabled: true,
  vibrationEnabled: true,
  showHints: true,
};

export const DEFAULT_PROGRESS: UserProgress = {
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
