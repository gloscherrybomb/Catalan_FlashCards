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
 */
export async function syncQuietly(
  operation: string,
  write: () => Promise<unknown>
): Promise<boolean> {
  try {
    await write();
    return true;
  } catch (error) {
    logger.warn('Remote sync failed; keeping local changes', 'RemoteSync', {
      operation,
      error: String(error),
    });
    return false;
  }
}
