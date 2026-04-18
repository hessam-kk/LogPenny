// Shared report data-fetching helpers used by both the API and the views.

export interface DailyPoint { date: string; day: number; income: number; expense: number; net: number }
export interface BreakdownRow { label: string; income: number; expense: number }
export interface TrendPoint { month: string; income: number; expense: number }

export async function fetchMonthly(
  db: D1Database, accountId: number, year: number, month: number,
): Promise<{ income: number; expense: number; daily: DailyPoint[] }> {
  const monthStr = String(month).padStart(2, '0');
  const from = `${year}-${monthStr}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const to = `${year}-${monthStr}-${String(lastDay).padStart(2, '0')}`;

  const dailyRows = await db.prepare(
    `SELECT date,
       SUM(CASE WHEN direction = 'in' THEN amount ELSE 0 END) AS income,
       SUM(CASE WHEN direction = 'out' THEN amount ELSE 0 END) AS expense
       FROM entries WHERE account_id = ? AND date >= ? AND date <= ?
       GROUP BY date ORDER BY date`,
  ).bind(accountId, from, to).all<{ date: string; income: number; expense: number }>();

  const totalsRow = await db.prepare(
    `SELECT
       COALESCE(SUM(CASE WHEN direction = 'in' THEN amount ELSE 0 END), 0) AS income,
       COALESCE(SUM(CASE WHEN direction = 'out' THEN amount ELSE 0 END), 0) AS expense
       FROM entries WHERE account_id = ? AND date >= ? AND date <= ?`,
  ).bind(accountId, from, to).first<{ income: number; expense: number }>();

  const dailyMap = new Map(
    (dailyRows.results ?? []).map((r) => [r.date, { income: r.income ?? 0, expense: r.expense ?? 0 }]),
  );
  const daily: DailyPoint[] = [];
  for (let d = 1; d <= lastDay; d++) {
    const dateStr = `${year}-${monthStr}-${String(d).padStart(2, '0')}`;
    const v = dailyMap.get(dateStr) ?? { income: 0, expense: 0 };
    daily.push({ date: dateStr, day: d, ...v, net: v.income - v.expense });
  }
  return { income: totalsRow?.income ?? 0, expense: totalsRow?.expense ?? 0, daily };
}

export async function fetchBreakdown(
  db: D1Database, accountId: number, from: string, to: string,
): Promise<BreakdownRow[]> {
  const result = await db.prepare(
    `SELECT
       COALESCE(i.title, '(standalone)') AS label,
       SUM(CASE WHEN e.direction = 'in' THEN e.amount ELSE 0 END) AS income,
       SUM(CASE WHEN e.direction = 'out' THEN e.amount ELSE 0 END) AS expense
       FROM entries e LEFT JOIN items i ON i.id = e.item_id
       WHERE e.account_id = ? AND e.date >= ? AND e.date <= ?
       GROUP BY e.item_id ORDER BY (income + expense) DESC`,
  ).bind(accountId, from, to).all<BreakdownRow>();
  return (result.results ?? []).map((r) => ({
    label: r.label, income: r.income ?? 0, expense: r.expense ?? 0,
  }));
}

export async function fetchTrends(
  db: D1Database, accountId: number, year: number, fromMonth?: string, toMonth?: string,
): Promise<TrendPoint[]> {
  const from = fromMonth ? `${fromMonth}-01` : `${year}-01-01`;
  const endMonth = toMonth ?? `${year}-12`;
  const endYear = Number(endMonth.slice(0, 4));
  const endMo = Number(endMonth.slice(5, 7));
  const endDay = new Date(endYear, endMo, 0).getDate();
  const to = `${endMonth}-${String(endDay).padStart(2, '0')}`;
  const result = await db.prepare(
    `SELECT substr(date, 1, 7) AS month,
       SUM(CASE WHEN direction = 'in' THEN amount ELSE 0 END) AS income,
       SUM(CASE WHEN direction = 'out' THEN amount ELSE 0 END) AS expense
       FROM entries WHERE account_id = ? AND date >= ? AND date <= ?
       GROUP BY substr(date, 1, 7) ORDER BY month`,
  ).bind(accountId, from, to).all<TrendPoint>();
  return (result.results ?? []).map((r) => ({
    month: r.month, income: r.income ?? 0, expense: r.expense ?? 0,
  }));
}
