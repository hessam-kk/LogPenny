// Jalali (Persian Solar) calendar helpers.

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
  const gdm = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = gy > 1600 ? 979 : 0;
  let year = gy > 1600 ? gy - 1600 : gy;
  let days = 365 * year + Math.floor((year + 3) / 4) - Math.floor((year + 99) / 100)
    + Math.floor((year + 399) / 400) + gdm[gm - 1] + gd - 1;

  if (gm > 2 && isGregorianLeapYear(gy)) days += 1;
  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;

  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }

  const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return { jy, jm, jd };
}

export function toGregorian(jy: number, jm: number, jd: number): { gy: number; gm: number; gd: number } {
  let year = jy > 979 ? 1600 : 621;
  let days = jy > 979 ? (jy - 979) * 365 + Math.floor((jy - 979) / 33) * 8 + Math.floor((((jy - 979) % 33) + 3) / 4) : jy * 365 + Math.floor(jy / 33) * 8 + Math.floor(((jy % 33) + 3) / 4);
  days += jm <= 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186;
  days += jd - 1;

  year += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    year += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }

  const leap = isGregorianLeapYear(year);
  const monthLengths = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let month = 1;
  for (const length of monthLengths) {
    if (days < length) break;
    days -= length;
    month += 1;
  }
  return { gy: year, gm: month, gd: days + 1 };
}

export function gregorianMonthToJalali(gy: number, gm: number): { jy: number; jm: number } {
  return toJalali(gy, gm, 15).jy === toJalali(gy, gm, 1).jy
    ? { jy: toJalali(gy, gm, 15).jy, jm: toJalali(gy, gm, 15).jm }
    : { jy: toJalali(gy, gm, 1).jy, jm: toJalali(gy, gm, 1).jm };
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

function isGregorianLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function gregorianMonthName(month: number): string {
  return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][month - 1] ?? '';
}
