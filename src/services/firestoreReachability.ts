/**
 * Getting Firestore past a content blocker.
 *
 * Privacy extensions and several public filter lists block
 * `firestore.googleapis.com` outright - the browser reports
 * ERR_BLOCKED_BY_CLIENT before a request leaves the machine. There is nothing
 * unusual about a browser this happens in, and telling a learner to allowlist a
 * Google domain is not a fix; it is the app handing its problem to the user.
 *
 * The way round it is to stop naming the blocked host. The Firestore SDK builds
 * every URL as `https://` + `host` + path, so pointing `host` at a path on our
 * own origin makes the browser issue same-origin requests that a hostname-based
 * blocker cannot match, and a rewrite forwards them on (see vercel.json).
 *
 * That relies on `host` tolerating a path segment, which is concatenation
 * rather than documented behaviour, so it is used only where it is needed:
 * everyone else keeps the ordinary, supported direct connection. The probe
 * below decides which, and remembers.
 */
import { logger } from './logger';

const BLOCKED_KEY = 'catalan-firestore-blocked';
const RELOAD_GUARD = 'catalan-firestore-reloaded';

/** Path on our own origin that the rewrite forwards to Firestore. */
export const FIRESTORE_PROXY_PATH = '__fs';

function readFlag(key: string, store: Storage): boolean {
  try {
    return store.getItem(key) === 'true';
  } catch {
    return false;
  }
}

function writeFlag(key: string, store: Storage): void {
  try {
    store.setItem(key, 'true');
  } catch {
    // Private windows throw. Losing the hint only costs another probe.
  }
}

/**
 * The `host` Firestore should use, or undefined for the normal direct one.
 *
 * Read synchronously at module load, because the SDK needs its settings before
 * anything touches the database.
 */
export function firestoreHostOverride(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  if (!readFlag(BLOCKED_KEY, window.localStorage)) return undefined;
  return `${window.location.host}/${FIRESTORE_PROXY_PATH}`;
}

/**
 * Find out whether Firestore is reachable directly, and remember the answer.
 *
 * `no-cors` keeps the browser from rejecting the response for CORS reasons - we
 * do not care what comes back, only whether the request was allowed to leave.
 * A blocked request rejects; anything else, including a 401 or 404, resolves.
 *
 * On the first page load where a block is found this reloads once, so the
 * learner gets a working session immediately rather than after they happen to
 * come back. The sessionStorage guard makes a loop impossible.
 */
export async function probeFirestoreReachability(projectId: string): Promise<void> {
  if (typeof window === 'undefined') return;
  // Already proxying, so there is nothing left to detect.
  if (readFlag(BLOCKED_KEY, window.localStorage)) return;

  const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents`;

  try {
    await fetch(url, { method: 'GET', mode: 'no-cors', cache: 'no-store' });
    return; // Reached it. Keep the direct connection.
  } catch (error) {
    logger.warn('Firestore appears to be blocked; switching to the same-origin proxy', 'Firebase', {
      error: String(error),
    });
  }

  writeFlag(BLOCKED_KEY, window.localStorage);

  if (!readFlag(RELOAD_GUARD, window.sessionStorage)) {
    writeFlag(RELOAD_GUARD, window.sessionStorage);
    window.location.reload();
  }
}

/** Whether this session is talking to Firestore through our own origin. */
export function isUsingFirestoreProxy(): boolean {
  return firestoreHostOverride() !== undefined;
}
