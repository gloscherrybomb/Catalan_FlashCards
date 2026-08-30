import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  hasCompletedOnboarding,
  markOnboardingComplete,
  shouldShowOnboarding,
} from './onboarding';

/** In-memory localStorage so the flag actually round-trips. */
function installStorage(initial: Record<string, string> = {}) {
  const store = new Map(Object.entries(initial));
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: () => null,
    length: 0,
  });
  return store;
}

describe('onboarding', () => {
  beforeEach(() => {
    installStorage();
  });

  it('is not complete for a fresh install', () => {
    expect(hasCompletedOnboarding()).toBe(false);
  });

  it('persists completion', () => {
    markOnboardingComplete();
    expect(hasCompletedOnboarding()).toBe(true);
  });

  describe('shouldShowOnboarding', () => {
    it('shows for a genuinely new learner', () => {
      expect(shouldShowOnboarding({ cardCount: 0, totalCardsReviewed: 0 })).toBe(true);
    });

    it('does not show once completed', () => {
      markOnboardingComplete();
      expect(shouldShowOnboarding({ cardCount: 0, totalCardsReviewed: 0 })).toBe(false);
    });

    /**
     * Someone with cards is an existing user on a new device or with cleared
     * storage. Interrupting them with a welcome screen would be a bug.
     */
    it('does not show to someone who already has cards', () => {
      expect(shouldShowOnboarding({ cardCount: 150, totalCardsReviewed: 0 })).toBe(false);
    });

    it('does not show to someone who has review history', () => {
      expect(shouldShowOnboarding({ cardCount: 0, totalCardsReviewed: 40 })).toBe(false);
    });

    it('records completion when it detects existing work, so the check stays stable', () => {
      shouldShowOnboarding({ cardCount: 150, totalCardsReviewed: 0 });
      // Even after the cards go away (e.g. a failed sync), it must not reappear.
      expect(shouldShowOnboarding({ cardCount: 0, totalCardsReviewed: 0 })).toBe(false);
    });
  });

  describe('unavailable storage', () => {
    it('treats onboarding as done rather than showing it on every visit', () => {
      vi.stubGlobal('localStorage', {
        getItem: () => { throw new Error('denied'); },
        setItem: () => { throw new Error('denied'); },
        removeItem: () => {},
        clear: () => {},
        key: () => null,
        length: 0,
      });

      expect(hasCompletedOnboarding()).toBe(true);
      expect(shouldShowOnboarding({ cardCount: 0, totalCardsReviewed: 0 })).toBe(false);
    });

    it('does not throw when completion cannot be written', () => {
      vi.stubGlobal('localStorage', {
        getItem: () => null,
        setItem: () => { throw new Error('quota'); },
        removeItem: () => {},
        clear: () => {},
        key: () => null,
        length: 0,
      });

      expect(() => markOnboardingComplete()).not.toThrow();
    });
  });
});
