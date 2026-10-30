export const CURRENCY_OPTIONS = [
  { code: 'IDR', label: 'Indonesian Rupiah (Rp)', symbol: 'Rp' },
  { code: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { code: 'EUR', label: 'Euro (€)', symbol: '€' },
  { code: 'GBP', label: 'British Pound (£)', symbol: '£' },
  { code: 'SGD', label: 'Singapore Dollar (S$)', symbol: 'S$' },
  { code: 'MYR', label: 'Malaysian Ringgit (RM)', symbol: 'RM' },
  { code: 'JPY', label: 'Japanese Yen (¥)', symbol: '¥' },
  { code: 'AUD', label: 'Australian Dollar (A$)', symbol: 'A$' },
];

/**
 * Formats an integer amount according to currency.
 * For IDR: e.g. Rp 25.000 or -Rp 25.000
 */
export function formatCurrency(amount: number, currencyCode: string = 'IDR'): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));

  if (currencyCode === 'IDR') {
    // Indonesian dot thousand separator: 25.000
    const formatted = absAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return isNegative ? `-Rp ${formatted}` : `Rp ${formatted}`;
  }

  const option = CURRENCY_OPTIONS.find((c) => c.code === currencyCode);
  const symbol = option ? option.symbol : `${currencyCode} `;

  // Standard comma format
  const formatted = absAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return isNegative ? `-${symbol}${formatted}` : `${symbol}${formatted}`;
}

/** Hidden-amount placeholder that keeps the currency symbol, e.g. "Rp ••••••". */
export function maskCurrency(currencyCode: string = 'IDR'): string {
  if (currencyCode === 'IDR') return 'Rp ••••••';
  const option = CURRENCY_OPTIONS.find((c) => c.code === currencyCode);
  return `${option ? option.symbol : `${currencyCode} `}••••••`;
}

/**
 * Parses user input string (which may have commas, dots, spaces, "Rp") into a clean positive integer.
 */
export function parseCurrencyInput(value: string): number {
  if (!value) return 0;
  // Remove non-digits
  const clean = value.replace(/[^0-9]/g, '');
  if (!clean) return 0;
  const parsed = parseInt(clean, 10);
  return isNaN(parsed) ? 0 : parsed;
}
