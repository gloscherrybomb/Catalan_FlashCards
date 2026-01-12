import { initializeApp } from 'firebase/app';
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
import type { UserProfile, UserProgress, DailyStats } from '../types/user';
import type { UnlockedAchievement } from '../types/gamification';

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
    console.log('Attempting Google sign-in...');
    const result = await signInWithPopup(auth, googleProvider);

    if (!result.user) {
      throw new Error('Sign-in successful but no user data returned');
    }

    console.log('Sign-in successful, user:', result.user.email);
    return result.user;
  } catch (error: any) {
    console.error('Sign-in error:', error);

    // Provide more helpful error messages
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in cancelled - popup was closed');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Sign-in popup was blocked by your browser. Please allow popups for this site.');
    } else if (error.code === 'auth/unauthorized-domain') {
      throw new Error('This domain is not authorized for OAuth operations. Please add it to the Firebase Console.');
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

// Flashcard functions
export async function saveFlashcards(userId: string, flashcards: Flashcard[]): Promise<void> {
  const batch = writeBatch(db);

  for (const card of flashcards) {
    const ref = doc(db, 'users', userId, 'cards', card.id);
    batch.set(ref, {
      ...card,
      createdAt: Timestamp.fromDate(card.createdAt),
    });
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
  const snapshot = await getDocs(collection(db, 'users', userId, 'progress'));
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
