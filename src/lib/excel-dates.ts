// Parse Persian date strings from Excel imports.
// Handles formats like "1 فروردین", "۲ اردیبهشت", plain day numbers,
// and Gregorian fallback dates like "2026-03-21".

import { persianMonthName, toGregorian } from './jalali';

const PERSIAN_MONTH_MAP: Record<string, number> = {
  'فروردین': 1, 'اردیبهشت': 2, 'خرداد': 3,
  'تیر': 4, 'مرداد': 5, 'شهریور': 6,
  'مهر': 7, 'آبان': 8, 'آذر': 9,
  'دی': 10, 'بهمن': 11, 'اسفند': 12,
};

export interface ParsedImportRow {
  amount: number;
  direction: 'in' | 'out';
  title: string;
  date: string;
  notes: string | null;
  raw: unknown[];
}

export function parseExcelRow(
  row: unknown[],
  jalaliYear: number,
  fallbackMonth: number,
  fallbackDay: number,
): ParsedImportRow | null {
  if (!Array.isArray(row) || row.length < 3) return null;

  const rawAmount = row[0];
  const rawTitle = row[1];
  const rawDate = row[2];
  const rawNotes = row.length > 3 ? row[3] : undefined;

  // Amount
  const amountVal = Number(rawAmount);
  if (!Number.isFinite(amountVal)) return null;
  const amount = Math.round(Math.abs(amountVal));
  const direction: 'in' | 'out' = amountVal < 0 ? 'in' : 'out';
  if (amount === 0) return null;

  // Title
  const title = String(rawTitle ?? '').trim();
  if (!title) return null;

  // Date
  const date = parseExcelDate(rawDate, jalaliYear, fallbackMonth, fallbackDay);
  if (!date) return null;

  // Notes
  const notes = rawNotes != null ? String(rawNotes).trim() : null;

  return { amount, direction, title, date, notes: notes || null, raw: row };
}

function parseExcelDate(
  value: unknown,
  jalaliYear: number,
  fallbackMonth: number,
  fallbackDay: number,
): string | null {
  if (value == null || value === '') {
    // No date — use the fallback (usually today)
    return jalaliToIso(jalaliYear, fallbackMonth, fallbackDay);
  }

  const str = String(value).trim();

  // Try Gregorian ISO date first: "2026-03-21"
  const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return str; // Already ISO
  }

  // Try plain day number (1-31)
  const plainDay = parseArabicNumber(str);
  if (plainDay >= 1 && plainDay <= 31) {
    return jalaliToIso(jalaliYear, fallbackMonth, plainDay);
  }

  // Try Persian month format: "1 فروردین", "۲ اردیبهشت", "فروردین"
  for (const [name, monthNum] of Object.entries(PERSIAN_MONTH_MAP)) {
    const cleaned = str.replace(/[،,]/g, ' ').trim();

    // Check for "day month" pattern
    const withDay = cleaned.match(new RegExp(`^(\\d+)\\s*${name}$`));
    if (withDay) {
      const day = parseInt(withDay[1], 10);
      return jalaliToIso(jalaliYear, monthNum, day);
    }

    // Check for month-only
    if (cleaned === name || cleaned.startsWith(name)) {
      return jalaliToIso(jalaliYear, monthNum, 1);
    }

    // Check for "day month" with Arabic digits
    for (let d = 1; d <= 31; d++) {
      const arabicDay = toArabicDigits(d);
      if (cleaned === `${arabicDay} ${name}`) {
        return jalaliToIso(jalaliYear, monthNum, d);
      }
    }
  }

  // Could not parse — return null
  return null;
}

function jalaliToIso(jy: number, jm: number, jd: number): string {
  const g = toGregorian(jy, jm, jd);
  return `${String(g.gy).padStart(4, '0')}-${String(g.gm).padStart(2, '0')}-${String(g.gd).padStart(2, '0')}`;
}

function parseArabicNumber(str: string): number {
  // Replace Persian/Arabic digits with ASCII
  const cleaned = str
    .replace(/[\u06F0-\u06F9]/g, (c) => String(c.charCodeAt(0) - 0x06F0))
    .replace(/[\u0660-\u0669]/g, (c) => String(c.charCodeAt(0) - 0x0660));
  return parseInt(cleaned, 10);
}

function toArabicDigits(n: number): string {
  return String(n).replace(/[0-9]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x06F0 - 48));
}

export function parseExcelJalaliYear(sheetName: string): number | null {
  const n = parseInt(sheetName, 10);
  if (Number.isInteger(n) && n >= 1300 && n <= 1500) return n;
  return null;
}