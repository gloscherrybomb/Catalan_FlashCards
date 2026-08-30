import { describe, it, expect, vi, afterEach } from 'vitest';
import { toDayKey, todayKey, getWeekStartDate, weekStartKey } from './dateKeys';

describe('dateKeys', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('toDayKey', () => {
    it('formats a date as YYYY-MM-DD', () => {
      expect(toDayKey(new Date(2026, 7, 30, 12, 0, 0))).toBe('2026-08-30');
    });

    it('accepts a timestamp or an ISO string', () => {
      const d = new Date(2026, 0, 5, 9, 30);
      expect(toDayKey(d.getTime())).toBe('2026-01-05');
      expect(toDayKey(d.toISOString())).toBe('2026-01-05');
    });

    it('zero-pads single-digit months and days', () => {
      expect(toDayKey(new Date(2026, 0, 1, 12))).toBe('2026-01-01');
    });

    /**
     * The bug this module exists to prevent: for a learner east of UTC,
     * studying just after midnight local time falls on the *previous* UTC day.
     * Day keys must follow the wall calendar, not UTC.
     */
    it('uses the local calendar day, not the UTC day', () => {
      // 00:30 local. In any timezone ahead of UTC this instant is still the
      // previous day in UTC, which is exactly what used to break streaks.
      const justAfterMidnight = new Date(2026, 7, 30, 0, 30, 0);
      expect(toDayKey(justAfterMidnight)).toBe('2026-08-30');
      expect(toDayKey(justAfterMidnight)).toBe(
        `${justAfterMidnight.getFullYear()}-` +
          `${String(justAfterMidnight.getMonth() + 1).padStart(2, '0')}-` +
          `${String(justAfterMidnight.getDate()).padStart(2, '0')}`
      );
    });

    it('agrees with itself across an entire local day', () => {
      // Every hour of one local day must produce the same key.
      const keys = new Set(
        Array.from({ length: 24 }, (_, hour) => toDayKey(new Date(2026, 7, 30, hour, 30)))
      );
      expect(keys).toEqual(new Set(['2026-08-30']));
    });
  });

  describe('todayKey', () => {
    it('returns the key for the current local day', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 7, 30, 1, 15));
      expect(todayKey()).toBe('2026-08-30');
    });
  });

  describe('getWeekStartDate', () => {
    it('returns the Monday of the given week', () => {
      // 2026-08-30 is a Sunday; its week began Monday 2026-08-24.
      expect(toDayKey(getWeekStartDate(new Date(2026, 7, 30, 12)))).toBe('2026-08-24');
    });

    it('returns the same day when given a Monday', () => {
      expect(toDayKey(getWeekStartDate(new Date(2026, 7, 24, 12)))).toBe('2026-08-24');
    });

    it('treats Sunday as the end of the week, not the start', () => {
      const sunday = new Date(2026, 7, 30, 12);
      expect(getWeekStartDate(sunday).getDay()).toBe(1); // Monday
    });

    it('starts at midnight', () => {
      const start = getWeekStartDate(new Date(2026, 7, 30, 23, 59));
      expect(start.getHours()).toBe(0);
      expect(start.getMinutes()).toBe(0);
    });
  });

  describe('weekStartKey', () => {
    it('is stable for every day within one week', () => {
      const keys = new Set(
        // Mon 24th through Sun 30th August 2026.
        Array.from({ length: 7 }, (_, i) => weekStartKey(new Date(2026, 7, 24 + i, 12)))
      );
      expect(keys).toEqual(new Set(['2026-08-24']));
    });

    it('rolls over on Monday', () => {
      expect(weekStartKey(new Date(2026, 7, 30, 12))).toBe('2026-08-24'); // Sunday
      expect(weekStartKey(new Date(2026, 7, 31, 12))).toBe('2026-08-31'); // Monday
    });
  });
});
