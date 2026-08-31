import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { logger } from './logger';

/**
 * Wipe a learner's data and start again.
 *
 * This has to clear both sides, and the local side is the one that matters.
 * Sign-in merges with `pickFurtherProgress(local, remote)` - whichever copy is
 * further along wins, deliberately, so that a blocked Firestore can never wipe
 * real progress. The consequence is that deleting the server copy alone does
 * nothing: the browser still holds everything, the merge keeps it, and the next
 * write pushes it straight back. A reset that only touched Firestore would
 * silently undo itself on the next page load.
 */

/**
 * Every localStorage key the app owns.
 *
 * Matched by prefix rather than listed, so a store added later is covered
 * without anyone remembering to update this. resetAccount.test.ts checks that
 * every persisted store name still matches.
 */
export const APP_STORAGE_PATTERN = /^(catalan[-_]|adaptive-learning-)/;

/** Subcollections under `users/{uid}`, matching firestore.rules. */
const USER_SUBCOLLECTIONS = [
  'data',
  'cards',
  'cardProgress',
  'achievements',
  'dailyStats',
] as const;

/** Remove every app key from localStorage. Returns the keys removed. */
export function clearLocalData(): string[] {
  const removed: string[] = [];

  try {
    // Read through length/key rather than Object.keys: the latter relies on
    // Storage exposing its entries as own properties, which is true of the real
    // thing but not of polyfills or test doubles. Collect the keys first, since
    // removing while iterating shifts every later index down by one.
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && APP_STORAGE_PATTERN.test(key)) keys.push(key);
    }

    for (const key of keys) {
      localStorage.removeItem(key);
      removed.push(key);
    }
  } catch (error) {
    // Private windows and blocked site data throw on access.
    logger.warn('Could not clear local data', 'ResetAccount', { error: String(error) });
  }

  return removed;
}

/**
 * Delete the learner's documents in Firestore.
 *
 * `usage` is deliberately left alone: it holds the tutor quota counters, which
 * the rules make read-only to the client precisely so a reset cannot be used to
 * clear a spend limit.
 */
export async function clearRemoteData(userId: string): Promise<void> {
  for (const name of USER_SUBCOLLECTIONS) {
    const snapshot = await getDocs(collection(db, 'users', userId, name));
    await Promise.all(snapshot.docs.map(entry => deleteDoc(entry.ref)));
  }

  await deleteDoc(doc(db, 'users', userId));
}

/**
 * Reset everything for this learner.
 *
 * The remote delete is best-effort: if Firestore is blocked the local wipe must
 * still happen, because otherwise the learner presses the button, sees nothing
 * change, and presses it again.
 */
export async function resetAccount(userId: string | null): Promise<{ remoteCleared: boolean }> {
  let remoteCleared = false;

  if (userId) {
    try {
      await clearRemoteData(userId);
      remoteCleared = true;
    } catch (error) {
      logger.warn('Remote reset failed; clearing local data anyway', 'ResetAccount', {
        error: String(error),
      });
    }
  }

  const removed = clearLocalData();
  logger.info('Account reset', 'ResetAccount', { remoteCleared, keysRemoved: removed.length });

  return { remoteCleared };
}
