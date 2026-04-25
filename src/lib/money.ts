// Money formatting. Amounts are stored as integer minor units.
// For IRR (Toman) we treat 1 Toman = 1 unit (no subunits).

export const SUPPORTED_CURRENCIES = ['IRR', 'USD', 'EUR', 'GBP'] as const;
export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

const CURRENCY_META: Record<string, { symbol: string; locale: string; minorDigits: number }> = {
  IRR: { symbol: 'T', locale: 'fa-IR', minorDigits: 0 }, // Toman
  USD: { symbol: '$', locale: 'en-US', minorDigits: 2 },
  EUR: { symbol: '€', locale: 'en-IE', minorDigits: 2 },
  GBP: { symbol: '£', locale: 'en-GB', minorDigits: 2 },
};

export function normalizeCurrency(value: unknown): CurrencyCode | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toUpperCase();
  return (SUPPORTED_CURRENCIES as readonly string[]).includes(normalized)
    ? normalized as CurrencyCode
    : null;
}

export function getMeta(currency: string) {
  return CURRENCY_META[currency] ?? { symbol: currency, locale: 'en-US', minorDigits: 0 };
}

// Format an integer amount for display (no sign).
export function formatAmount(amount: number, currency: string): string {
  const meta = getMeta(currency);
  const value = meta.minorDigits > 0 ? amount / Math.pow(10, meta.minorDigits) : amount;
  const formatted = new Intl.NumberFormat(meta.locale, {
    minimumFractionDigits: meta.minorDigits,
    maximumFractionDigits: meta.minorDigits,
  }).format(value);
  return `${formatted} ${meta.symbol}`;
}

// Compact format for chart axes / small spaces.
export function formatCompact(amount: number, currency: string): string {
  const meta = getMeta(currency);
  const value = meta.minorDigits > 0 ? amount / Math.pow(10, meta.minorDigits) : amount;
  const formatted = new Intl.NumberFormat(meta.locale, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
  return `${formatted}${meta.symbol}`;
}

// Parse a raw string amount input into integer minor units. Accepts commas/dots
// as thousands separators. For IRR (Toman) the value is kept whole.
export function parseAmount(raw: string, currency: string): number | null {
  const meta = getMeta(currency);
  // Strip everything except digits, dot, minus
  const cleaned = raw.replace(/[^\d.\-]/g, '');
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return null;
  const units = meta.minorDigits > 0 ? Math.round(n * Math.pow(10, meta.minorDigits)) : Math.round(n);
  return units;
}
