import { describe, expect, it } from 'vitest';
import { formatCurrency, parseCurrencyInput } from './currency.ts';

describe('formatCurrency', () => {
  it('formats IDR with dot thousands separator', () => {
    expect(formatCurrency(25000, 'IDR')).toBe('Rp 25.000');
    expect(formatCurrency(0, 'IDR')).toBe('Rp 0');
  });

  it('formats negative IDR amounts', () => {
    expect(formatCurrency(-1500, 'IDR')).toBe('-Rp 1.500');
  });

  it('formats USD with comma thousands separator', () => {
    expect(formatCurrency(25000, 'USD')).toBe('$25,000');
    expect(formatCurrency(-1000, 'USD')).toBe('-$1,000');
  });

  it('rounds fractional amounts to integers', () => {
    expect(formatCurrency(10.6, 'IDR')).toBe('Rp 11');
  });

  it('falls back for unknown currency codes', () => {
    expect(formatCurrency(1000, 'XYZ')).toBe('XYZ 1,000');
  });
});

describe('parseCurrencyInput', () => {
  it('parses plain digits', () => {
    expect(parseCurrencyInput('25000')).toBe(25000);
  });

  it('strips currency symbols and separators', () => {
    expect(parseCurrencyInput('Rp 25.000')).toBe(25000);
    expect(parseCurrencyInput('$1,250')).toBe(1250);
  });

  it('returns 0 for empty or non-numeric input', () => {
    expect(parseCurrencyInput('')).toBe(0);
    expect(parseCurrencyInput('abc')).toBe(0);
  });
});
