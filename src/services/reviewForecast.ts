import type { CardProgress } from '../types/flashcard';
import { MASTERY_CONFIG } from '../config/constants';
import { toDayKey } from '../utils/dateKeys';

/**
 * Analytics that answer the questions a spaced-repetition learner actually has.
 *
 * The Analytics page showed four totals and a mastery pie chart. Those describe
 * the past; none of them answer "how much work is coming", "is my recall
 * actually holding up", or "which cards are quietly wasting my time". Those are
 * the questions that change what a learner does next, and all three are
 * computable from card progress that the app already stores.
 */

// ---------------------------------------------------------------------------
// Review forecast
// ---------------------------------------------------------------------------

export interface ForecastDay {
  /** Local day key, YYYY-MM-DD. */
  date: string;
  /** Short label for the axis, e.g. "Mon 1". */
  label: string;
  /** Cards falling due on this day. */
  due: number;
  /** True for the first bucket, which also carries everything overdue. */
  isToday: boolean;
}

/**
 * How many reviews fall due on each of the next `days` days.
 *
 * This is the most actionable chart an SRS app can show: intervals compound, so
 * workload arrives in waves, and seeing a 200-card Thursday on a Monday is the
 * difference between spreading the load and abandoning the app on Thursday.
 *
 * Anything overdue collects into today's bucket rather than being dropped -
 * overdue work is work you still owe, and hiding it makes today look easier
 * than it is.
 */
export function buildReviewForecast(
  cardProgress: Map<string, CardProgress>,
  days = 14,
  now: Date = new Date()
): ForecastDay[] {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const buckets = new Map<string, number>();
  const dayList: ForecastDay[] = [];

  for (let offset = 0; offset < days; offset++) {
    const date = new Date(startOfToday);
    date.setDate(date.getDate() + offset);
    const key = toDayKey(date);
    buckets.set(key, 0);
    dayList.push({
      date: key,
      label: date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' }),
      due: 0,
      isToday: offset === 0,
    });
  }

  const todayKey = dayList[0]?.date;
  const lastKey = dayList[dayList.length - 1]?.date;

  for (const progress of cardProgress.values()) {
    // A card never reviewed is not scheduled work; it is a choice to start it.
    if (progress.repetitions === 0) continue;

    const due = new Date(progress.nextReviewDate);
    due.setHours(0, 0, 0, 0);
    const key = toDayKey(due);

    if (due < startOfToday) {
      // Overdue: owed today.
      if (todayKey) buckets.set(todayKey, (buckets.get(todayKey) ?? 0) + 1);
    } else if (lastKey && key <= lastKey && buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
    // Beyond the window: deliberately not shown, rather than piled onto the
    // last day, which would invent a spike that does not exist.
  }

  return dayList.map(day => ({ ...day, due: buckets.get(day.date) ?? 0 }));
}

// ---------------------------------------------------------------------------
// Retention
// ---------------------------------------------------------------------------

export interface RetentionBand {
  /** Human label for the scheduling stage. */
  stage: string;
  /** Reviews answered correctly, as a percentage. */
  retention: number;
  /** Total reviews behind that percentage - a rate on 3 reviews means little. */
  reviews: number;
  cards: number;
}

/**
 * Recall accuracy grouped by scheduling stage.
 *
 * A single overall accuracy number blends a card seen yesterday with one on a
 * six-month interval, which are not comparable. Splitting by stage shows where
 * recall is leaking: high accuracy on new cards but poor accuracy on mature
 * ones means intervals are stretching faster than memory supports.
 *
 * SM-2's own assumption is roughly 90% retention on mature cards; materially
 * below that is a signal the ease factors are too generous.
 */
export function retentionByStage(cardProgress: Map<string, CardProgress>): RetentionBand[] {
  const bands: Array<{ stage: string; test: (p: CardProgress) => boolean }> = [
    { stage: 'Learning', test: p => p.interval < MASTERY_CONFIG.LEARNING_INTERVAL_DAYS },
    {
      stage: 'Young',
      test: p =>
        p.interval >= MASTERY_CONFIG.LEARNING_INTERVAL_DAYS &&
        p.interval < MASTERY_CONFIG.MASTERED_INTERVAL_DAYS,
    },
    { stage: 'Mature', test: p => p.interval >= MASTERY_CONFIG.MASTERED_INTERVAL_DAYS },
  ];

  return bands.map(({ stage, test }) => {
    let reviews = 0;
    let correct = 0;
    let cards = 0;

    for (const progress of cardProgress.values()) {
      if (progress.totalReviews === 0 || !test(progress)) continue;
      cards++;
      reviews += progress.totalReviews;
      correct += progress.correctReviews;
    }

    return {
      stage,
      cards,
      reviews,
      retention: reviews > 0 ? Math.round((correct / reviews) * 100) : 0,
    };
  });
}

// ---------------------------------------------------------------------------
// Leeches
// ---------------------------------------------------------------------------

export interface Leech {
  cardId: string;
  direction: CardProgress['direction'];
  easeFactor: number;
  lapses: number;
  accuracy: number;
  reviews: number;
}

/**
 * Cards that keep being forgotten.
 *
 * SM-2 responds to repeated failure by shortening the interval, which means the
 * worst cards come back most often - a handful of them can quietly consume a
 * large share of every session. Naming them lets the learner rewrite the card,
 * add a mnemonic, or drop it, which is almost always better than grinding it.
 *
 * Identified by sustained poor accuracy over enough reviews to mean something,
 * rather than by failure count alone - so a card that was hard once and is now
 * fine is not flagged forever. The ease factor is reported alongside because it
 * shows how far SM-2 has already compressed the interval, but it is not a
 * separate gate: SM-2 derives ease from the same successes and failures, so
 * requiring both would only be a stricter accuracy threshold expressed twice.
 */
export function findLeeches(
  cardProgress: Map<string, CardProgress>,
  { minReviews = 4, maxAccuracy = 0.6, limit = 10 } = {}
): Leech[] {
  const leeches: Leech[] = [];

  for (const progress of cardProgress.values()) {
    if (progress.totalReviews < minReviews) continue;

    const accuracy = progress.correctReviews / progress.totalReviews;
    if (accuracy > maxAccuracy) continue;

    leeches.push({
      cardId: progress.cardId,
      direction: progress.direction,
      easeFactor: progress.easeFactor,
      lapses: progress.totalReviews - progress.correctReviews,
      accuracy: Math.round(accuracy * 100),
      reviews: progress.totalReviews,
    });
  }

  // Worst first: lowest accuracy, then most reviews wasted on it.
  return leeches
    .sort((a, b) => a.accuracy - b.accuracy || b.reviews - a.reviews)
    .slice(0, limit);
}

// ---------------------------------------------------------------------------
// Workload summary
// ---------------------------------------------------------------------------

export interface WorkloadSummary {
  /** Reviews due today, including anything overdue. */
  dueToday: number;
  /** Mean daily reviews across the forecast window. */
  dailyAverage: number;
  /** The heaviest day in the window. */
  peak: { date: string; label: string; due: number } | null;
  /** Cards never studied, which are available but not yet owed. */
  untouched: number;
}

export function summariseWorkload(
  cardProgress: Map<string, CardProgress>,
  totalCardDirections: number,
  days = 14,
  now: Date = new Date()
): WorkloadSummary {
  const forecast = buildReviewForecast(cardProgress, days, now);
  const total = forecast.reduce((sum, d) => sum + d.due, 0);

  const peak = forecast.reduce<ForecastDay | null>(
    (worst, day) => (worst === null || day.due > worst.due ? day : worst),
    null
  );

  let started = 0;
  for (const progress of cardProgress.values()) {
    if (progress.repetitions > 0) started++;
  }

  return {
    dueToday: forecast[0]?.due ?? 0,
    dailyAverage: forecast.length > 0 ? Math.round(total / forecast.length) : 0,
    peak: peak && peak.due > 0 ? { date: peak.date, label: peak.label, due: peak.due } : null,
    untouched: Math.max(0, totalCardDirections - started),
  };
}
