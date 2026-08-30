import { useUserStore } from '../stores/userStore';
import { todayKey } from '../utils/dateKeys';
import { PRACTICE_REWARD_CONFIG } from '../config/constants';
import { logger } from './logger';

/**
 * XP for the practice activities that sit outside the spaced-repetition loop:
 * mini games, grammar exercises and practice drills.
 *
 * All three previously awarded nothing at all - GamesPage's completion handler
 * was an explicit no-op, and the grammar and drill components never touched the
 * user store. Finishing them changed no number anywhere, which is a poor deal
 * for the learner and made the XP total a bad summary of effort.
 *
 * Unlike a review session these activities are freely repeatable, so each has a
 * daily ceiling. Without one, replaying a five-card word scramble would be a
 * faster route to a level-up than actually studying, and XP would stop meaning
 * anything.
 */

export type PracticeActivity = 'game' | 'grammar' | 'drill';

interface PracticeLedger {
  date: string;
  earned: Partial<Record<PracticeActivity, number>>;
}

const STORAGE_KEY = 'catalan-practice-rewards';

const DAILY_CAP: Record<PracticeActivity, number> = {
  game: PRACTICE_REWARD_CONFIG.GAME_DAILY_XP_CAP,
  grammar: PRACTICE_REWARD_CONFIG.GRAMMAR_DAILY_XP_CAP,
  drill: PRACTICE_REWARD_CONFIG.DRILL_DAILY_XP_CAP,
};

function readLedger(): PracticeLedger {
  const today = todayKey();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PracticeLedger;
      // A ledger from a previous day is spent; today starts fresh.
      if (parsed.date === today) return parsed;
    }
  } catch (error) {
    logger.warn('Could not read practice ledger', 'PracticeRewards', { error: String(error) });
  }
  return { date: today, earned: {} };
}

function writeLedger(ledger: PracticeLedger): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ledger));
  } catch (error) {
    // Private browsing or a full quota. Losing the cap for this session is
    // preferable to losing the learner's XP, so carry on.
    logger.warn('Could not persist practice ledger', 'PracticeRewards', { error: String(error) });
  }
}

/** XP already earned from an activity today. */
export function xpEarnedToday(activity: PracticeActivity): number {
  return readLedger().earned[activity] ?? 0;
}

/** XP still available from an activity today. */
export function xpRemainingToday(activity: PracticeActivity): number {
  return Math.max(0, DAILY_CAP[activity] - xpEarnedToday(activity));
}

/**
 * Award XP for a practice activity, clamped to the day's remaining allowance.
 *
 * @returns the XP actually awarded, which is 0 once the cap is reached.
 */
export async function awardPracticeXP(
  activity: PracticeActivity,
  amount: number
): Promise<number> {
  if (!Number.isFinite(amount) || amount <= 0) return 0;

  const ledger = readLedger();
  const alreadyEarned = ledger.earned[activity] ?? 0;
  const award = Math.min(Math.round(amount), Math.max(0, DAILY_CAP[activity] - alreadyEarned));

  if (award <= 0) return 0;

  ledger.earned[activity] = alreadyEarned + award;
  writeLedger(ledger);

  await useUserStore.getState().addXP(award);
  logger.debug('Practice XP awarded', 'PracticeRewards', { activity, award });

  return award;
}
