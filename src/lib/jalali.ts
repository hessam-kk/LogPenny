// Jalali (Persian Solar) calendar helpers.
// Calendar math delegates to jalaali-js (Borkowski algorithm, battle-tested).

import { toJalaali as j2j, toGregorian as j2g } from 'jalaali-js';

const PERSIAN_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
];

export interface JalaliDate {
  jy: number;
  jm: number;
  jd: number;
}

export function persianMonthName(month: number): string {
  return PERSIAN_MONTHS[month - 1] ?? '';
}

export function toJalali(gy: number, gm: number, gd: number): JalaliDate {
  return j2j(gy, gm, gd);
}

export function toGregorian(jy: number, jm: number, jd: number): { gy: number; gm: number; gd: number } {
  return j2g(jy, jm, jd);
}

export function gregorianMonthToJalali(gy: number, gm: number): { jy: number; jm: number } {
  const first = toJalali(gy, gm, 1);
  const mid = toJalali(gy, gm, 15);
  return first.jy === mid.jy
    ? { jy: mid.jy, jm: mid.jm }
    : { jy: first.jy, jm: first.jm };
}

export function formatMonthYear(year: number, month: number, cal: 'g' | 'j'): string {
  if (cal === 'j') {
    const { jy, jm } = gregorianMonthToJalali(year, month);
    return `${persianMonthName(jm)} ${jy}`;
  }
  return `${gregorianMonthName(month)} ${year}`;
}

export function formatMonthLabel(year: number, month: number, cal: 'g' | 'j'): string {
  if (cal === 'j') return persianMonthName(gregorianMonthToJalali(year, month).jm);
  return gregorianMonthName(month);
}

export function shiftDisplayedMonth(gy: number, gm: number, direction: -1 | 1, cal: 'g' | 'j'): { gy: number; gm: number } {
  if (cal === 'g') {
    const date = new Date(gy, gm - 1 + direction, 1);
    return { gy: date.getFullYear(), gm: date.getMonth() + 1 };
  }

  const current = gregorianMonthToJalali(gy, gm);
  let jy = current.jy;
  let jm = current.jm + direction;
  if (jm < 1) { jm = 12; jy -= 1; }
  if (jm > 12) { jm = 1; jy += 1; }
  return jalaliMonthToGregorian(jy, jm);
}

export function jalaliMonthToGregorian(jy: number, jm: number): { gy: number; gm: number } {
  const g = toGregorian(jy, jm, 15);
  return { gy: g.gy, gm: g.gm };
}

function gregorianMonthName(month: number): string {
  return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][month - 1] ?? '';
}
