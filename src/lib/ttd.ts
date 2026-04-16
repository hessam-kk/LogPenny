// TTD (tab/three-thing) line parser for quick-add.
// Supports these line shapes (tab or 2+ spaces as separators):
//   563\tقسط سوم هدفون گلسا\t30
//   -400\tجلسه سوم زبان (مصطفی) درآمد\t28
//   =640+90  پاک‌اسکرین 441 تومنی و 100 گرم قهوه 28 و 30
// The first token is the amount (optional leading +/-, or '='-prefixed sums),
// the middle is the title, and the optional trailing integer is the day-of-month.

export interface TtdResult {
  amount: number;
  direction: 'in' | 'out';
  title: string;
  day?: number;
  raw: string;
}

export function parseTtdLine(line: string): TtdResult | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  // Split on tab(s) or 2+ spaces.
  const parts = trimmed.split(/\t|\s{2,}/).map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return null;

  // Try to find the amount token (first token that parses as an amount expression).
  let amountIdx = -1;
  let amountValue: number | null = null;
  let direction: 'in' | 'out' = 'out';

  for (let i = 0; i < parts.length; i++) {
    const token = parts[i];
    const parsed = parseAmountToken(token);
    if (parsed !== null) {
      amountIdx = i;
      amountValue = parsed.value;
      direction = parsed.direction;
      break;
    }
  }

  if (amountIdx === -1 || amountValue === null) return null;

  // The day-of-month is the last token if it's a pure integer in 1..31.
  let day: number | undefined;
  let titleEnd = parts.length;
  if (parts.length > amountIdx + 1) {
    const last = parts[parts.length - 1];
    const dayNum = Number(last);
    if (Number.isInteger(dayNum) && dayNum >= 1 && dayNum <= 31) {
      day = dayNum;
      titleEnd = parts.length - 1;
    }
  }

  // Title is everything between the amount and the day.
  const titleParts = parts.slice(amountIdx + 1, titleEnd);
  let title = titleParts.join(' ').trim();

  // Handle the '=' prefix case: "=640+90 پاک‌اسکرین 441 تومنی و 100 گرم قهوه 28 و 30"
  // Here the amount token may already be "640+90" and the rest merges into title.
  // We also strip a leading '=' from the title if it ended up there.
  title = title.replace(/^=\s*/, '').trim();

  if (!title) return null;

  return { amount: amountValue, direction, title, day, raw: trimmed };
}

function parseAmountToken(
  token: string,
): { value: number; direction: 'in' | 'out' } | null {
  let t = token.trim();
  if (!t) return null;

  let direction: 'in' | 'out' = 'out';
  // Leading '-' or '=' denotes income (per the examples: -400 and =640+90).
  if (t.startsWith('=')) {
    direction = 'in';
    t = t.slice(1);
  } else if (t.startsWith('-')) {
    direction = 'in';
    t = t.slice(1);
  } else if (t.startsWith('+')) {
    t = t.slice(1);
  }

  // Support summation expressions like 640+90
  if (t.includes('+')) {
    const terms = t.split('+').map((x) => x.trim());
    let sum = 0;
    for (const term of terms) {
      const n = Number(term.replace(/[^\d.-]/g, ''));
      if (!Number.isFinite(n)) return null;
      sum += n;
    }
    return { value: Math.round(sum), direction };
  }

  const n = Number(t.replace(/[^\d.-]/g, ''));
  if (!Number.isFinite(n)) return null;
  return { value: Math.round(n), direction };
}
