import { initializeApp, FirebaseError } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  getDocs,
  writeBatch,
  deleteDoc,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getStorage } from 'firebase/storage';
import type { Flashcard, CardProgress } from '../types/flashcard';
import type { PlacementResult } from '../types/curriculum';
import type { DailyChallenge } from '../types/challenges';
import type { WeeklyChallenge } from '../types/weeklyChallenges';
import type { NotificationSettings } from '../types/notifications';
import type { UserProfile, UserProgress, DailyStats } from '../types/user';
import type { UnlockedAchievement } from '../types/gamification';
import type { CEFRLevel } from '../data/curriculum';

// Firebase configuration - Replace with your own config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef',
};

// Check if we're in demo mode (no real Firebase config)
export const isDemoMode = !import.meta.env.VITE_FIREBASE_API_KEY;

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, 'europe-west2');

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

// TTS Cloud Function types
interface GenerateAudioRequest {
  text: string;
  language: 'ca-ES' | 'en-US';
}

interface GenerateAudioResponse {
  url: string;
  cached: boolean;
}

// TTS Cloud Function callable
export const generateAudioFunction = httpsCallable<GenerateAudioRequest, GenerateAudioResponse>(
  functions,
  'generateAudio'
);

// Auth functions
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);

    if (!result.user) {
      throw new Error('Sign-in successful but no user data returned');
    }

    return result.user;
  } catch (error) {

    // Provide more helpful error messages for Firebase errors
    if (error instanceof FirebaseError) {
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in cancelled - popup was closed');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Sign-in popup was blocked by your browser. Please allow popups for this site.');
      } else if (error.code === 'auth/unauthorized-domain') {
        throw new Error('This domain is not authorized for OAuth operations. Please add it to the Firebase Console.');
      }
    }

    throw error;
  }
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

// User profile functions
export async function createUserProfile(user: User): Promise<UserProfile> {
  const profile: UserProfile = {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || 'Learner',
    photoURL: user.photoURL || undefined,
    createdAt: new Date(),
    settings: {
      dailyGoal: 20,
      preferredMode: 'mixed',
      soundEnabled: true,
      vibrationEnabled: true,
      showHints: true,
    },
  };

  await setDoc(doc(db, 'users', user.uid, 'data', 'profile'), {
    ...profile,
    createdAt: Timestamp.fromDate(profile.createdAt),
  });

  return profile;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const docSnap = await getDoc(doc(db, 'users', userId, 'data', 'profile'));
  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  return {
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
  } as UserProfile;
}

// Progress functions
export async function getUserProgress(userId: string): Promise<UserProgress> {
  const docSnap = await getDoc(doc(db, 'users', userId, 'data', 'progress'));
  if (!docSnap.exists()) {
    return {
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
  }

  const data = docSnap.data();
  return {
    ...data,
    lastStudyDate: data.lastStudyDate?.toDate() || null,
    lastStreakFreezeUsed: data.lastStreakFreezeUsed?.toDate(),
  } as UserProgress;
}

export async function updateUserProgress(userId: string, progress: Partial<UserProgress>): Promise<void> {
  const ref = doc(db, 'users', userId, 'data', 'progress');

  const updateData: Record<string, unknown> = { ...progress };
  if (progress.lastStudyDate) {
    updateData.lastStudyDate = Timestamp.fromDate(progress.lastStudyDate);
  }
  if (progress.lastStreakFreezeUsed) {
    updateData.lastStreakFreezeUsed = Timestamp.fromDate(progress.lastStreakFreezeUsed);
  }

  await setDoc(ref, updateData, { merge: true });
}

// Helper function to remove undefined values from an object
function removeUndefinedFields<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned as Partial<T>;
}

// Flashcard functions
export async function saveFlashcards(userId: string, flashcards: Flashcard[]): Promise<void> {
  const batch = writeBatch(db);

  for (const card of flashcards) {
    const ref = doc(db, 'users', userId, 'cards', card.id);
    const cardData = removeUndefinedFields({
      ...card,
      createdAt: Timestamp.fromDate(card.createdAt),
    });
    batch.set(ref, cardData);
  }

  await batch.commit();
}

export async function getFlashcards(userId: string): Promise<Flashcard[]> {
  const q = query(
    collection(db, 'users', userId, 'cards'),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as Flashcard;
  });
}

export async function deleteFlashcard(userId: string, cardId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', userId, 'cards', cardId));
}

// Card progress functions
export async function getCardProgress(userId: string): Promise<CardProgress[]> {
  const snapshot = await getDocs(collection(db, 'users', userId, 'cardProgress'));
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      nextReviewDate: data.nextReviewDate?.toDate() || new Date(),
      lastReviewDate: data.lastReviewDate?.toDate(),
    } as CardProgress;
  });
}

export async function updateCardProgress(userId: string, progress: CardProgress): Promise<void> {
  const id = `${progress.cardId}_${progress.direction}`;
  await setDoc(doc(db, 'users', userId, 'cardProgress', id), {
    ...progress,
    nextReviewDate: Timestamp.fromDate(progress.nextReviewDate),
    lastReviewDate: progress.lastReviewDate ? Timestamp.fromDate(progress.lastReviewDate) : null,
  });
}

// Achievement functions
export async function getUnlockedAchievements(userId: string): Promise<UnlockedAchievement[]> {
  const snapshot = await getDocs(collection(db, 'users', userId, 'achievements'));
  return snapshot.docs.map(doc => ({
    achievementId: doc.id,
    unlockedAt: doc.data().unlockedAt?.toDate() || new Date(),
  }));
}

export async function unlockAchievement(userId: string, achievementId: string): Promise<void> {
  await setDoc(doc(db, 'users', userId, 'achievements', achievementId), {
    unlockedAt: Timestamp.now(),
  });
}

// Daily stats functions
export async function saveDailyStats(userId: string, stats: DailyStats): Promise<void> {
  await setDoc(doc(db, 'users', userId, 'dailyStats', stats.date), stats);
}

// Curriculum progress types
export interface CurriculumProgressData {
  lessonProgress: Record<string, {
    lessonId: string;
    completed: boolean;
    completedAt?: string;
    score: number;
    attempts: number;
  }>;
  currentLevel: CEFRLevel;
  placementResult: PlacementResult | null;
}

// Curriculum progress functions
export async function getCurriculumProgress(userId: string): Promise<CurriculumProgressData | null> {
  const docSnap = await getDoc(doc(db, 'users', userId, 'data', 'curriculum'));
  if (!docSnap.exists()) return null;
  return docSnap.data() as CurriculumProgressData;
}

export async function updateCurriculumProgress(userId: string, data: Partial<CurriculumProgressData>): Promise<void> {
  const ref = doc(db, 'users', userId, 'data', 'curriculum');
  await setDoc(ref, data, { merge: true });
}

export async function getDailyStats(userId: string, days: number = 30): Promise<DailyStats[]> {
  const q = query(
    collection(db, 'users', userId, 'dailyStats'),
    orderBy('date', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs
    .slice(0, days)
    .map(doc => doc.data() as DailyStats);
}

// Challenge storage types
export interface DailyChallengesData {
  date: string;
  challenges: DailyChallenge[];
}

export interface WeeklyChallengesData {
  weekStart: string;
  challenges: WeeklyChallenge[];
  daysStudied: string[];
}

export interface UIPreferencesData {
  theme?: 'light' | 'dark' | 'system';
  notificationSettings?: NotificationSettings;
  studyReminderDismissedDate?: string;
}

function serializeDailyChallenge(challenge: DailyChallenge) {
  return {
    ...challenge,
    expiresAt: Timestamp.fromDate(challenge.expiresAt),
    completedAt: challenge.completedAt ? Timestamp.fromDate(challenge.completedAt) : null,
  };
}

function deserializeDailyChallenge(challenge: any): DailyChallenge {
  return {
    ...challenge,
    expiresAt: challenge.expiresAt?.toDate ? challenge.expiresAt.toDate() : new Date(challenge.expiresAt),
    completedAt: challenge.completedAt?.toDate
      ? challenge.completedAt.toDate()
      : challenge.completedAt
        ? new Date(challenge.completedAt)
        : undefined,
  } as DailyChallenge;
}

function serializeWeeklyChallenge(challenge: WeeklyChallenge) {
  return {
    ...challenge,
    startsAt: Timestamp.fromDate(challenge.startsAt),
    expiresAt: Timestamp.fromDate(challenge.expiresAt),
    completedAt: challenge.completedAt ? Timestamp.fromDate(challenge.completedAt) : null,
  };
}

function deserializeWeeklyChallenge(challenge: any): WeeklyChallenge {
  return {
    ...challenge,
    startsAt: challenge.startsAt?.toDate ? challenge.startsAt.toDate() : new Date(challenge.startsAt),
    expiresAt: challenge.expiresAt?.toDate ? challenge.expiresAt.toDate() : new Date(challenge.expiresAt),
    completedAt: challenge.completedAt?.toDate
      ? challenge.completedAt.toDate()
      : challenge.completedAt
        ? new Date(challenge.completedAt)
        : undefined,
  } as WeeklyChallenge;
}

export async function getDailyChallengesData(userId: string): Promise<DailyChallengesData | null> {
  const docSnap = await getDoc(doc(db, 'users', userId, 'data', 'dailyChallenges'));
  if (!docSnap.exists()) return null;

  const data = docSnap.data() as DailyChallengesData;
  return {
    date: data.date,
    challenges: (data.challenges || []).map(deserializeDailyChallenge),
  };
}

export async function setDailyChallengesData(userId: string, data: DailyChallengesData): Promise<void> {
  const ref = doc(db, 'users', userId, 'data', 'dailyChallenges');
  await setDoc(ref, {
    date: data.date,
    challenges: data.challenges.map(serializeDailyChallenge),
  });
}

export async function getWeeklyChallengesData(userId: string): Promise<WeeklyChallengesData | null> {
  const docSnap = await getDoc(doc(db, 'users', userId, 'data', 'weeklyChallenges'));
  if (!docSnap.exists()) return null;

  const data = docSnap.data() as WeeklyChallengesData;
  return {
    weekStart: data.weekStart,
    daysStudied: data.daysStudied || [],
    challenges: (data.challenges || []).map(deserializeWeeklyChallenge),
  };
}

export async function setWeeklyChallengesData(userId: string, data: WeeklyChallengesData): Promise<void> {
  const ref = doc(db, 'users', userId, 'data', 'weeklyChallenges');
  await setDoc(ref, {
    weekStart: data.weekStart,
    daysStudied: data.daysStudied,
    challenges: data.challenges.map(serializeWeeklyChallenge),
  });
}

export async function getUiPreferences(userId: string): Promise<UIPreferencesData | null> {
  const docSnap = await getDoc(doc(db, 'users', userId, 'data', 'uiPreferences'));
  if (!docSnap.exists()) return null;
  return docSnap.data() as UIPreferencesData;
}

export async function updateUiPreferences(userId: string, data: Partial<UIPreferencesData>): Promise<void> {
  const ref = doc(db, 'users', userId, 'data', 'uiPreferences');
  await setDoc(ref, data, { merge: true });
}

// Grammar progress types
export interface GrammarProgressData {
  lessonProgress: Record<string, {
    lessonId: string;
    completed: boolean;
    completedAt?: string;
    exerciseScores: Record<string, boolean>;
    bestScore: number;
    attempts: number;
  }>;
}

// Grammar progress functions
export async function getGrammarProgress(userId: string): Promise<GrammarProgressData | null> {
  const docSnap = await getDoc(doc(db, 'users', userId, 'data', 'grammar'));
  if (!docSnap.exists()) return null;
  return docSnap.data() as GrammarProgressData;
}

export async function updateGrammarProgress(userId: string, data: Partial<GrammarProgressData>): Promise<void> {
  const ref = doc(db, 'users', userId, 'data', 'grammar');
  await setDoc(ref, data, { merge: true });
}

// Story progress types
export interface StoryProgressData {
  storyProgress: Record<string, {
    storyId: string;
    completed: boolean;
    completedAt?: string;
    quizScore: number;
    wordsLearned: string[];
    readCount: number;
    bestQuizScore: number;
  }>;
}

// Story progress functions
export async function getStoryProgress(userId: string): Promise<StoryProgressData | null> {
  const docSnap = await getDoc(doc(db, 'users', userId, 'data', 'stories'));
  if (!docSnap.exists()) return null;
  return docSnap.data() as StoryProgressData;
}

export async function updateStoryProgress(userId: string, data: Partial<StoryProgressData>): Promise<void> {
  const ref = doc(db, 'users', userId, 'data', 'stories');
  await setDoc(ref, data, { merge: true });
}
