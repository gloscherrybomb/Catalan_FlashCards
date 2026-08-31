import { describe, it, expect, vi } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { APP_STORAGE_PATTERN, clearLocalData } from './resetAccount';

/**
 * A reset that misses a key is worse than no reset: sign-in merges with
 * pickFurtherProgress, so whatever survives in localStorage is treated as the
 * further-along copy and pushed back to Firestore. The learner presses reset,
 * reloads, and everything is still there.
 *
 * The pattern is matched by prefix rather than by a hand-kept list, and this
 * checks the prefix actually covers every persisted store.
 */
describe('account reset', () => {
  it('covers the storage key of every persisted store', () => {
    const dir = 'src/stores';
    const names = readdirSync(dir)
      .filter(file => file.endsWith('.ts') && !file.includes('.test.'))
      .flatMap(file => {
        const source = readFileSync(join(dir, file), 'utf8');
        // The `name:` given to zustand's persist middleware.
        return [...source.matchAll(/name:\s*'([^']+)'/g)].map(match => match[1]);
      });

    expect(names.length).toBeGreaterThan(5);

    const uncovered = names.filter(name => !APP_STORAGE_PATTERN.test(name));
    expect(uncovered).toEqual([]);
  });

  it('covers the keys written outside the stores', () => {
    // These are set directly rather than through zustand.
    const standalone = [
      'catalan-practice-rewards',
      'catalan_shown_category_intros',
      'catalan-onboarding-complete',
    ];

    expect(standalone.filter(key => !APP_STORAGE_PATTERN.test(key))).toEqual([]);
  });

  it('removes app keys and leaves everything else alone', () => {
    const store: Record<string, string> = {
      'catalan-user-storage': '{}',
      'catalan_shown_category_intros': '[]',
      'adaptive-learning-storage': '{}',
      'theme-preference-from-another-app': 'dark',
    };

    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => { store[k] = v; },
      removeItem: (k: string) => { delete store[k]; },
      get length() { return Object.keys(store).length; },
      key: (i: number) => Object.keys(store)[i] ?? null,
    });

    const removed = clearLocalData();

    expect(removed.sort()).toEqual([
      'adaptive-learning-storage',
      'catalan-user-storage',
      'catalan_shown_category_intros',
    ]);
    expect(Object.keys(store)).toEqual(['theme-preference-from-another-app']);

    vi.unstubAllGlobals();
  });
});
