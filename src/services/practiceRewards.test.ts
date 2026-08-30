import { describe, it, expect, beforeEach, vi } from 'vitest';

const addXP = vi.fn(async () => {});

vi.mock('../stores/userStore', () => ({
  useUserStore: { getState: () => ({ addXP }) },
}));

import { awardPracticeXP, xpEarnedToday, xpRemainingToday } from './practiceRewards';
import { PRACTICE_REWARD_CONFIG } from '../config/constants';
import { todayKey } from '../utils/dateKeys';

const GAME_CAP = PRACTICE_REWARD_CONFIG.GAME_DAILY_XP_CAP;

/** An in-memory stand-in for localStorage, so the ledger actually round-trips. */
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

describe('practiceRewards', () => {
  beforeEach(() => {
    addXP.mockClear();
    installStorage();
  });

  it('awards the requested XP and credits the user', async () => {
    await expect(awardPracticeXP('game', 20)).resolves.toBe(20);
    expect(addXP).toHaveBeenCalledWith(20);
  });

  it('accumulates across awards within a day', async () => {
    await awardPracticeXP('game', 20);
    await awardPracticeXP('game', 30);
    expect(xpEarnedToday('game')).toBe(50);
    expect(xpRemainingToday('game')).toBe(GAME_CAP - 50);
  });

  /**
   * Games are freely repeatable, unlike a review session which is bounded by
   * what is actually due. Without a cap, replaying a five-card scramble would
   * out-earn real study and XP would stop tracking effort.
   */
  it('clamps an award to the remaining daily allowance', async () => {
    await awardPracticeXP('game', GAME_CAP - 10);
    await expect(awardPracticeXP('game', 100)).resolves.toBe(10);
    expect(xpEarnedToday('game')).toBe(GAME_CAP);
  });

  it('awards nothing once the cap is reached', async () => {
    await awardPracticeXP('game', GAME_CAP);
    addXP.mockClear();

    await expect(awardPracticeXP('game', 50)).resolves.toBe(0);
    expect(addXP).not.toHaveBeenCalled();
    expect(xpRemainingToday('game')).toBe(0);
  });

  it('keeps a separate allowance per activity', async () => {
    await awardPracticeXP('game', GAME_CAP);
    expect(xpRemainingToday('game')).toBe(0);
    expect(xpRemainingToday('grammar')).toBe(PRACTICE_REWARD_CONFIG.GRAMMAR_DAILY_XP_CAP);

    await expect(awardPracticeXP('grammar', 10)).resolves.toBe(10);
  });

  it('resets when the stored ledger is from a previous day', async () => {
    installStorage({
      'catalan-practice-rewards': JSON.stringify({
        date: '2000-01-01',
        earned: { game: GAME_CAP },
      }),
    });

    expect(xpEarnedToday('game')).toBe(0);
    await expect(awardPracticeXP('game', 25)).resolves.toBe(25);
  });

  it('keeps a same-day ledger', () => {
    installStorage({
      'catalan-practice-rewards': JSON.stringify({
        date: todayKey(),
        earned: { game: 40 },
      }),
    });
    expect(xpEarnedToday('game')).toBe(40);
  });

  it('ignores non-positive and non-finite amounts', async () => {
    await expect(awardPracticeXP('game', 0)).resolves.toBe(0);
    await expect(awardPracticeXP('game', -50)).resolves.toBe(0);
    await expect(awardPracticeXP('game', Number.NaN)).resolves.toBe(0);
    expect(addXP).not.toHaveBeenCalled();
  });

  it('survives unreadable storage rather than losing the award', async () => {
    vi.stubGlobal('localStorage', {
      getItem: () => { throw new Error('denied'); },
      setItem: () => { throw new Error('denied'); },
      removeItem: () => {},
      clear: () => {},
      key: () => null,
      length: 0,
    });

    // Private browsing shouldn't cost the learner their XP.
    await expect(awardPracticeXP('game', 20)).resolves.toBe(20);
    expect(addXP).toHaveBeenCalledWith(20);
  });

  it('rounds fractional awards', async () => {
    await expect(awardPracticeXP('game', 10.4)).resolves.toBe(10);
  });
});
