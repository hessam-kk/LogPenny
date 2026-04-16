// Jalali (Persian Solar) calendar helpers.
// Algorithm: a well-known compact implementation of the Gregorian→Jalali
// conversion based on the algorithm by Kazimierz M. Borkowski (1996).

const PERSIAN_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد',
  'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر',
  'دی', 'بهمن', 'اسفند',
];

export function persianMonthName(m: number): string {
  return PERSIAN_MONTHS[m - 1] ?? '';
}

export interface JalaliDate {
  jy: number; // Jalali year
  jm: number; // Jalali month (1-12)
  jd: number; // Jalali day (1-31)
}

// Convert Gregorian date components to Jalali.
export function toJalali(gy: number, gm: number, gd: number): JalaliDate {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = gy <= 1600 ? 0 : 979;
  let gy2 = gy > 1600 ? gy - 1600 : gy;

  let days =
    365 * gy2 +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) +
    g_d_m[gm - 1] +
    gd -
    1;

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

// Convert Jalali date components to Gregorian.
export function toGregorian(jy: number, jm: number, jd: number): { gy: number; gm: number; gd: number } {
  let jy2 = jy <= 979 ? jy : jy - 979;
  let days =
    365 * jy2 +
    Math.floor(jy2 / 33) * 8 +
    Math.floor(((jy2 % 33) + 3) / 4) +
    (jm <= 7 ? (jm - 1) * 31 : 186 + (jm - 7) * 30) +
    jd -
    1;

  let gy = jy <= 979 ? 621 : 1600 + 33 * Math.floor(days / 12053);
  days %= 12053;

  gy += 4 * Math.floor(days / 1461);
  days %= 1461;

  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }

  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let gm = 0;
  for (let i = 0; i < 12; i++) {
    if (g_d_m[i] + ((gy % 4 === 0 && !((gy % 100 === 0 && gy % 400 !== 0)) ? 1 : 0)) > days) {
      gm = i;
      break;
    }
  }
  if (gm === 0) gm = 12;
  const gd = days - g_d_m[gm - 1] + 1;

  return { gy, gm, gd };
}

// Return the Jalali year and month for a given Gregorian year+month.
// Since months don't align, we convert the *first day* of the Gregorian month
// to find the Jalali month that covers most of that Gregorian month.
export function gregorianMonthToJalali(gy: number, gm: number): { jy: number; jm: number } {
  // Use the 15th of the Gregorian month as the representative day.
  const j = toJalali(gy, gm, 15);
  return { jy: j.jy, jm: j.jm };
}

// Format a year+month for display given the calendar system.
export function formatMonthYear(
  year: number,
  month: number,
  cal: 'g' | 'j',
): string {
  if (cal === 'j') {
    const { jy, jm } = gregorianMonthToJalali(year, month);
    return `${persianMonthName(jm)} ${jy}`;
  }
  return `${gregorianMonthName(month)} ${year}`;
}

export function formatMonthLabel(
  year: number,
  month: number,
  cal: 'g' | 'j',
): string {
  if (cal === 'j') {
    const { jy, jm } = gregorianMonthToJalali(year, month);
    return persianMonthName(jm);
  }
  return gregorianMonthName(month);
}

function gregorianMonthName(m: number): string {
  return [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ][m - 1] ?? '';
}

// Convert a Jalali year+month to Gregorian year+month (for URL navigation).
export function jalaliMonthToGregorian(jy: number, jm: number): { gy: number; gm: number } {
  // Convert the 15th of the Jalali month to find the overlapping Gregorian month.
  const g = toGregorian(jy, jm, 15);
  return { gy: g.gy, gm: g.gm };
}

export function shiftDisplayedMonth(
  gy: number,
  gm: number,
  direction: -1 | 1,
  cal: 'g' | 'j',
): { gy: number; gm: number } {
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
