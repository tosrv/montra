import { describe, expect, it } from 'vitest';
import { computeBudgetHealth } from './budgetService.ts';

describe('computeBudgetHealth', () => {
  it('returns on_track when spending is below 80% of budget', () => {
    const result = computeBudgetHealth(5000000, 10000000);
    expect(result.healthStatus).toBe('on_track');
    expect(result.percentageUsed).toBe(50);
  });

  it('returns watch_spending when spending is between 80% and 100%', () => {
    const resultAt80 = computeBudgetHealth(8000000, 10000000);
    expect(resultAt80.healthStatus).toBe('watch_spending');
    expect(resultAt80.percentageUsed).toBe(80);

    const resultAt95 = computeBudgetHealth(9500000, 10000000);
    expect(resultAt95.healthStatus).toBe('watch_spending');
    expect(resultAt95.percentageUsed).toBe(95);

    const resultAt100 = computeBudgetHealth(10000000, 10000000);
    expect(resultAt100.healthStatus).toBe('watch_spending');
    expect(resultAt100.percentageUsed).toBe(100);
  });

  it('returns over_budget when spending exceeds total budget', () => {
    const result = computeBudgetHealth(10500000, 10000000);
    expect(result.healthStatus).toBe('over_budget');
    expect(result.percentageUsed).toBe(105);
  });

  it('handles zero total budget gracefully', () => {
    const resultZero = computeBudgetHealth(0, 0);
    expect(resultZero.healthStatus).toBe('on_track');
    expect(resultZero.percentageUsed).toBe(0);

    const resultOver = computeBudgetHealth(50000, 0);
    expect(resultOver.healthStatus).toBe('over_budget');
  });
});
