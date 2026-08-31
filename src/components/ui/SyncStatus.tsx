import { useSyncExternalStore } from 'react';
import { CloudOff } from 'lucide-react';
import { getSyncState, subscribeToSyncState } from '../../services/remoteSync';
import { isUsingFirestoreProxy } from '../../services/firestoreReachability';

/**
 * Says so when work is only being kept on this device.
 *
 * Writes to Firestore are best-effort by design, so a blocked or offline
 * connection never interrupts a session. The cost of that is silence: without
 * this, a learner has no way to tell a synced week from an unsynced one, and
 * finds out when they clear their browser.
 *
 * Deliberately small and out of the way. It is information, not an error - the
 * session is fine, and nothing about it needs the learner to act right now.
 */
export function SyncStatus() {
  const state = useSyncExternalStore(subscribeToSyncState, getSyncState, () => 'unknown' as const);

  if (state !== 'failing') return null;

  return (
    <div
      role="status"
      className="flex items-center gap-1.5 text-xs text-miro-blue/60 dark:text-ink-light/60"
      title={
        isUsingFirestoreProxy()
          ? 'Could not reach the server, even through the app’s own domain. Your progress is saved on this device.'
          : 'Could not reach the server. Your progress is saved on this device and will sync when the connection returns.'
      }
    >
      <CloudOff className="w-3.5 h-3.5" aria-hidden="true" />
      <span>Saved on this device</span>
    </div>
  );
}
