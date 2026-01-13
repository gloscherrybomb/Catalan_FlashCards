/**
 * Store versioning utilities for Zustand persistence.
 *
 * Provides a migration framework for localStorage schema changes,
 * ensuring backwards compatibility when the data structure evolves.
 */

/**
 * Versioned storage wrapper
 */
export interface VersionedStorage<T> {
  version: number;
  data: T;
}

/**
 * Migration function type
 */
export type MigrationFn = (data: unknown) => unknown;

/**
 * Creates a versioned storage helper for Zustand persist middleware.
 *
 * @param currentVersion - The current schema version
 * @param migrations - Object mapping version numbers to migration functions
 * @returns serialize and deserialize functions for the storage
 *
 * @example
 * ```typescript
 * const versioning = createVersionedStorage<MyState>(2, {
 *   2: (data) => {
 *     // Migrate from v1 to v2
 *     const old = data as OldState;
 *     return { ...old, newField: 'default' };
 *   },
 * });
 *
 * // In persist config:
 * storage: {
 *   getItem: (name) => {
 *     const raw = localStorage.getItem(name);
 *     if (!raw) return null;
 *     return versioning.deserialize(JSON.parse(raw));
 *   },
 *   setItem: (name, value) => {
 *     localStorage.setItem(name, JSON.stringify(versioning.serialize(value)));
 *   },
 *   removeItem: (name) => localStorage.removeItem(name),
 * },
 * ```
 */
export function createVersionedStorage<T>(
  currentVersion: number,
  migrations: Record<number, MigrationFn> = {}
) {
  return {
    /**
     * Wraps data with version information for storage
     */
    serialize: (data: T): VersionedStorage<T> => ({
      version: currentVersion,
      data,
    }),

    /**
     * Deserializes stored data, running migrations if needed
     */
    deserialize: (stored: unknown): T | null => {
      if (!stored || typeof stored !== 'object') return null;

      // Handle both versioned and non-versioned (legacy) storage
      const record = stored as Record<string, unknown>;
      const isVersioned = 'version' in record && 'data' in record;

      let data: unknown;
      let version: number;

      if (isVersioned) {
        data = record.data;
        version = typeof record.version === 'number' ? record.version : 1;
      } else {
        // Legacy unversioned data - assume version 1
        data = stored;
        version = 1;
      }

      // Run migrations sequentially
      while (version < currentVersion) {
        const nextVersion = version + 1;
        const migration = migrations[nextVersion];

        if (migration) {
          try {
            data = migration(data);
          } catch (error) {
            console.error(`Migration to version ${nextVersion} failed:`, error);
            // Return null to fall back to defaults
            return null;
          }
        }

        version = nextVersion;
      }

      return data as T;
    },

    /**
     * Gets the current version number
     */
    getCurrentVersion: () => currentVersion,
  };
}

/**
 * Helper to check if stored data needs migration
 */
export function needsMigration(stored: unknown, currentVersion: number): boolean {
  if (!stored || typeof stored !== 'object') return false;

  const record = stored as Record<string, unknown>;

  if ('version' in record) {
    return typeof record.version === 'number' && record.version < currentVersion;
  }

  // Legacy unversioned data always needs migration (to add version)
  return true;
}

/**
 * Helper to get the version of stored data
 */
export function getStoredVersion(stored: unknown): number {
  if (!stored || typeof stored !== 'object') return 0;

  const record = stored as Record<string, unknown>;

  if ('version' in record && typeof record.version === 'number') {
    return record.version;
  }

  // Legacy unversioned data
  return 1;
}
