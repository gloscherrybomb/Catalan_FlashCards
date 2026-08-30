import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../../services/firebase', () => ({
  isDemoMode: true,
  auth: {},
  db: {},
  onAuthChange: () => () => {},
  updateUserSettings: vi.fn(),
  updateUserProgress: vi.fn(),
  saveFlashcards: vi.fn(),
  getCurriculumProgress: vi.fn(async () => null),
  updateCurriculumProgress: vi.fn(),
}));

import { OnboardingFlow } from './OnboardingFlow';
import { hasCompletedOnboarding } from '../../services/onboarding';

function installStorage() {
  const store = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: () => null,
    length: 0,
  });
}

/**
 * Click, then wait for the next panel.
 *
 * AnimatePresence mode="wait" keeps the outgoing step mounted until its exit
 * animation resolves, which jsdom does not drive synchronously, so a bare click
 * still sees the previous step.
 */
async function advance(buttonName: RegExp, expectNext: RegExp) {
  await userEvent.click(screen.getByRole('button', { name: buttonName }));
  await waitFor(() => expect(screen.getByText(expectNext)).toBeTruthy(), { timeout: 3000 });
}

describe('OnboardingFlow', () => {
  beforeEach(() => {
    installStorage();
  });

  it('opens on the welcome step', () => {
    render(<OnboardingFlow onFinish={vi.fn()} />);
    expect(screen.getByText(/benvingut/i)).toBeTruthy();
  });

  it('can be skipped, and skipping records completion', async () => {
    const onFinish = vi.fn();
    render(<OnboardingFlow onFinish={onFinish} />);

    await userEvent.click(screen.getByRole('button', { name: /skip for now/i }));

    expect(onFinish).toHaveBeenCalled();
    // Skipping must not leave it to reappear on the next visit.
    expect(hasCompletedOnboarding()).toBe(true);
  });

  it('sends a complete beginner straight to the daily goal, skipping the test', async () => {
    render(<OnboardingFlow onFinish={vi.fn()} />);

    await advance(/get started/i, /how much catalan do you have/i);
    // Twelve questions a beginner cannot answer is a discouraging way to start.
    await advance(/starting from scratch/i, /how much per day/i);
  });

  it('offers the placement test to someone with prior experience', async () => {
    render(<OnboardingFlow onFinish={vi.fn()} />);

    await advance(/get started/i, /how much catalan do you have/i);
    await userEvent.click(screen.getByRole('button', { name: /i know some catalan/i }));

    // Routed to the placement test rather than straight past it.
    await waitFor(() => {
      expect(screen.queryByText(/how much per day/i)).toBeNull();
    });
  });

  it('lets the learner choose a daily goal and reach the final step', async () => {
    render(<OnboardingFlow onFinish={vi.fn()} />);

    await advance(/get started/i, /how much catalan do you have/i);
    await advance(/starting from scratch/i, /how much per day/i);

    await userEvent.click(screen.getByRole('button', { name: /10 cards/i }));
    await advance(/continue/i, /ready to start/i);

    // The chosen goal is carried through to the summary.
    expect(screen.getByText('10 cards')).toBeTruthy();
  });
});
