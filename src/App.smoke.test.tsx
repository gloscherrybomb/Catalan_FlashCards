import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

/**
 * Render smoke tests.
 *
 * These do not assert much about any one page - they assert that the app boots,
 * that every route resolves to a component that renders without throwing, and
 * that an unknown URL reaches the 404 rather than an empty shell. That is the
 * class of breakage a large refactor actually causes, and nothing else in the
 * suite would catch it: the store tests all bypass React entirely.
 */

// Firebase would try to reach the network on import. Demo mode is the offline
// path, which is what we want to exercise here.
vi.mock('./services/firebase', () => ({
  isDemoMode: true,
  auth: {},
  db: {},
  storage: {},
  functions: {},
  onAuthChange: () => () => {},
  signInWithGoogle: vi.fn(),
  signOut: vi.fn(),
  getUserProfile: vi.fn(async () => null),
  createUserProfile: vi.fn(),
  getUserProgress: vi.fn(),
  updateUserProgress: vi.fn(),
  updateUserSettings: vi.fn(),
  getUnlockedAchievements: vi.fn(async () => []),
  getFlashcards: vi.fn(async () => []),
  saveFlashcards: vi.fn(),
  deleteFlashcard: vi.fn(),
  getCardProgress: vi.fn(async () => []),
  updateCardProgress: vi.fn(),
  unlockAchievement: vi.fn(),
  saveDailyStats: vi.fn(),
  getDailyStats: vi.fn(async () => []),
  getCurriculumProgress: vi.fn(async () => null),
  updateCurriculumProgress: vi.fn(),
  getGrammarProgress: vi.fn(async () => null),
  updateGrammarProgress: vi.fn(),
  getStoryProgress: vi.fn(async () => null),
  updateStoryProgress: vi.fn(),
  getDailyChallengesData: vi.fn(async () => null),
  setDailyChallengesData: vi.fn(),
  getWeeklyChallengesData: vi.fn(async () => null),
  setWeeklyChallengesData: vi.fn(),
  getUiPreferences: vi.fn(async () => null),
  updateUiPreferences: vi.fn(),
  generateAudioFunction: vi.fn(),
  chatWithTutorFunction: vi.fn(),
}));

import App from './App';
import { markOnboardingComplete } from './services/onboarding';

/** Routes declared in App.tsx, plus a deliberately unknown one. */
const ROUTES = [
  '/',
  '/study',
  '/browse',
  '/import',
  '/stats',
  '/analytics',
  '/achievements',
  '/grammar',
  '/learn',
  '/learning-path',
  '/stories',
  '/conversation',
  '/games',
  '/drills',
  '/settings',
  '/more',
];

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
}

describe('App smoke tests', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // These tests are about the routes, so opt out of the first-run flow
    // explicitly. Without this they only avoid it by accident, because demo
    // mode happens to seed starter cards before the first render.
    markOnboardingComplete();

    // A React render error is reported through console.error rather than
    // thrown, so failing on it is the only way these tests can see it.
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('boots without crashing', async () => {
    renderAt('/');
    await waitFor(() => {
      expect(document.body.textContent).toBeTruthy();
    });
  });

  it.each(ROUTES)('renders %s without throwing', async (path) => {
    const { unmount } = renderAt(path);

    // Lazy routes resolve on a microtask; wait for the fallback to clear.
    await waitFor(
      () => {
        expect(document.body.textContent).not.toBe('');
      },
      { timeout: 5000 }
    );

    const renderErrors = errorSpy.mock.calls.filter((call) => {
      const first = String(call[0] ?? '');
      // React Router future-flag notices and act() warnings are noise here.
      return (
        !first.includes('React Router Future Flag') &&
        !first.includes('not wrapped in act') &&
        !first.includes('validateDOMNesting')
      );
    });

    expect(renderErrors).toEqual([]);
    unmount();
  });

  it('shows the not-found page for an unknown route', async () => {
    renderAt('/this-route-does-not-exist');

    // Previously an unknown URL rendered an empty shell with no way back.
    await waitFor(
      () => {
        expect(screen.getByText(/aquesta pàgina no existeix/i)).toBeTruthy();
      },
      { timeout: 5000 }
    );
  });
});
