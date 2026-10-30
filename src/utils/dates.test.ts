import { describe, expect, it } from 'vitest';
import { formatDisplayDate, formatMonthYear, getMonthNames, isDateInMonth } from './dates.ts';

describe('formatDisplayDate', () => {
  it('formats YYYY-MM-DD to short display form', () => {
    expect(formatDisplayDate('2026-09-19')).toBe('19 Sep 2026');
  });

  it('returns empty string for empty input', () => {
    expect(formatDisplayDate('')).toBe('');
  });

  it('returns original string when format is invalid', () => {
    expect(formatDisplayDate('not-a-date')).toBe('not-a-date');
  });
});

describe('formatMonthYear', () => {
  it('formats month index and year', () => {
    expect(formatMonthYear(2026, 8)).toBe('September 2026');
    expect(formatMonthYear(2025, 0)).toBe('January 2025');
  });
});

describe('getMonthNames', () => {
  it('returns 12 month names', () => {
    expect(getMonthNames()).toHaveLength(12);
    expect(getMonthNames()[0]).toBe('January');
  });
});

describe('isDateInMonth', () => {
  it('matches year and month (0-based month index)', () => {
    expect(isDateInMonth('2026-09-19', 2026, 8)).toBe(true);
    expect(isDateInMonth('2026-09-01', 2026, 8)).toBe(true);
  });

  it('rejects other months or years', () => {
    expect(isDateInMonth('2026-08-19', 2026, 8)).toBe(false);
    expect(isDateInMonth('2025-09-19', 2026, 8)).toBe(false);
  });

  it('returns false for empty date', () => {
    expect(isDateInMonth('', 2026, 8)).toBe(false);
  });
});
