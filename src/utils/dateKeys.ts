/**
 * Calendar-day keys, always in the learner's LOCAL timezone.
 *
 * Why this module exists: day keys used to be derived two different ways.
 * Most code used `new Date().toISOString().split('T')[0]`, which is UTC, while
 * ActivityHeatmap used date-fns `format(date, 'yyyy-MM-dd')`, which is local.
 * For any learner east of UTC — Catalonia is UTC+1/+2 — studying between
 * midnight and ~02:00 wrote activity under the *previous* UTC day while the
 * heatmap looked it up under the current local day. Streaks, daily goals and
 * the heatmap could all disagree about what "today" was.
 *
 * A study day is a human, local notion: what the learner would call today when
 * they look at a calendar on the wall. Every day key in the app comes from
 * here so that notion is applied consistently.
 */

import { startOfWeek, format } from 'date-fns';

/** Day key (`YYYY-MM-DD`) for a given instant, in local time. */
export function toDayKey(date: Date | string | number): string {
  return format(new Date(date), 'yyyy-MM-dd');
}

/** Day key for today, in local time. */
export function todayKey(): string {
  return toDayKey(new Date());
}

/**
 * Start of the current week as a Date, in local time.
 *
 * Weeks start on Monday: that is the convention in Catalonia and across the
 * EU, and the weekly challenges are framed as a Monday-to-Sunday effort.
 */
export function getWeekStartDate(date: Date = new Date()): Date {
  return startOfWeek(date, { weekStartsOn: 1 });
}

/** Day key for the start of the current week, in local time. */
export function weekStartKey(date: Date = new Date()): string {
  return toDayKey(getWeekStartDate(date));
}
