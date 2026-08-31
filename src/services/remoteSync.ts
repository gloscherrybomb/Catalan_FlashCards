import { logger } from './logger';

/**
 * Best-effort writes to Firestore.
 *
 * Local state is the source of truth during a session; the remote copy is a
 * backup that catches up when it can. Every store used to `await` its Firestore
 * write directly, so a single denied request rejected all the way out through
 * submitAnswer and StudyPage never reached nextCard - the study session stopped
 * dead on whichever card you were on.
 *
 * That is not a rare edge case. Firestore is routinely blocked by ad blockers
 * and privacy extensions (ERR_BLOCKED_BY_CLIENT), rules reject writes when auth
 * has not resolved, and phones lose signal mid-session. In every one of those
 * situations the learner should carry on studying and the data should reconcile
 * later, which is exactly what the local persistence layer already provides.
 *
 * So: never let a sync failure surface as a rejection. Log it and move on.
 *
 * "Move on" is not the same as "say nothing", though. Failing silently means a
 * learner can study for weeks with nothing reaching the cloud and no way to
 * know until they open a browser console - which is how this was actually
 * found. The outcome of every write is recorded below so the interface can say
 * plainly when work is only being kept on this device.
 */

type SyncState = 'unknown' | 'ok' | 'failing';

let state: SyncState = 'unknown';
let consecutiveFailures = 0;
const listeners = new Set<() => void>();

/** Failures below this are ordinary flakiness, not a broken connection. */
const FAILURES_BEFORE_REPORTING = 2;

function publish(next: SyncState): void {
  if (next === state) return;
  state = next;
  listeners.forEach(notify => notify());
}

export function getSyncState(): SyncState {
  return state;
}

export function subscribeToSyncState(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}
export async function syncQuietly(
  operation: string,
  write: () => Promise<unknown>
): Promise<boolean> {
  try {
    await write();
    consecutiveFailures = 0;
    publish('ok');
    return true;
  } catch (error) {
    consecutiveFailures++;
    if (consecutiveFailures >= FAILURES_BEFORE_REPORTING) publish('failing');
    logger.warn('Remote sync failed; keeping local changes', 'RemoteSync', {
      operation,
      error: String(error),
    });
    return false;
  }
}
