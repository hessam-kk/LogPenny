import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { createDb, schema } from '../db';

import { ok, fail } from '../lib/response';
import { fetchMonthly, fetchBreakdown, fetchTrends } from '../lib/reports-data';
import { getDb, isoDate, isoMonth, positiveInt } from '../lib/validation';

const app = new Hono();

// Monthly summary
app.get('/monthly', async (c) => {
  const accountId = c.req.query('account_id');
  if (!accountId) return fail(c, 'account_id is required', 400);
  const now = new Date();
  const year = c.req.query('year') ? Number(c.req.query('year')) : now.getFullYear();
  const month = c.req.query('month') ? Number(c.req.query('month')) : now.getMonth() + 1;
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12)
    return fail(c, 'invalid year/month', 422);

  const accountNumber = positiveInt(accountId);
  if (!accountNumber) return fail(c, 'invalid account_id', 422);
  const db = getDb(c);
  const [acct] = await db.select().from(schema.accounts).where(eq(schema.accounts.id, accountNumber)).all();
  if (!acct) return fail(c, 'account not found', 404);

  const monthStr = String(month).padStart(2, '0');
  const to = `${year}-${monthStr}-${String(new Date(year, month, 0).getDate()).padStart(2, '0')}`;
  const balanceRow = await ((c.env as any).DB as D1Database).prepare(
    `SELECT COALESCE(SUM(CASE WHEN direction = 'in' THEN amount ELSE 0 END), 0)
       - COALESCE(SUM(CASE WHEN direction = 'out' THEN amount ELSE 0 END), 0) AS net
       FROM entries WHERE account_id = ? AND deleted_at IS NULL AND date <= ?`,
  ).bind(accountId, to).first<{ net: number }>();

  const { income, expense, daily } = await fetchMonthly((c.env as any).DB as D1Database, Number(accountId), year, month);
  return ok(c, {
    account: { id: acct.id, name: acct.name, currency: acct.defaultCurrency },
    year, month, income, expense, net: income - expense,
    balanceTo: (balanceRow?.net ?? 0) + acct.startingBalance, daily,
  });
});

// Breakdown by item or category
app.get('/breakdown', async (c) => {
  const accountId = c.req.query('account_id');
  const from = c.req.query('from');
  const to = c.req.query('to');
  if (from && !isoDate(from) && !isoMonth(from)) return fail(c, 'invalid from', 422);
  if (to && !isoDate(to) && !isoMonth(to)) return fail(c, 'invalid to', 422);
  if (from && to && from > to) return fail(c, 'from must not be after to', 422);
  const groupBy = c.req.query('group_by') === 'category' ? 'category' : 'item';
  if (!accountId) return fail(c, 'account_id is required', 400);

  const accountNumber = positiveInt(accountId);
  if (!accountNumber) return fail(c, 'invalid account_id', 422);
  const db = getDb(c);
  const [acct] = await db.select().from(schema.accounts).where(eq(schema.accounts.id, accountNumber)).all();
  if (!acct) return fail(c, 'account not found', 404);

  if (groupBy === 'item') {
    const col = 'e.item_id';
    const join = 'LEFT JOIN items i ON i.id = e.item_id';
    const label = "COALESCE(i.title, '(standalone)')";
    let stmt = ((c.env as any).DB as D1Database).prepare(
      `SELECT ${col} AS group_id, ${label} AS label,
       SUM(CASE WHEN e.direction = 'in' THEN e.amount ELSE 0 END) AS income,
       SUM(CASE WHEN e.direction = 'out' THEN e.amount ELSE 0 END) AS expense,
       COUNT(*) AS entry_count
       FROM entries e ${join} WHERE e.account_id = ? AND e.deleted_at IS NULL`
        + (from ? ' AND e.date >= ?' : '')
        + (to ? ' AND e.date <= ?' : '')
        + ' GROUP BY ' + col + ' ORDER BY (income + expense) DESC',
    );
    const binds: (string | number)[] = [accountId];
    if (from) binds.push(from);
    if (to) binds.push(to);
    const result = await (from || to ? stmt.bind(...binds) : stmt.bind(accountId))
      .all<{ group_id: number | null; label: string; income: number; expense: number; entry_count: number }>();
    return ok(c, buildBreakdown(acct, groupBy, from ?? null, to ?? null, result.results ?? []));
  } else {
    const col = 'e.category_id';
    const join = 'LEFT JOIN categories cat ON cat.id = e.category_id';
    const label = "COALESCE(cat.name, '(uncategorized)')";
    let stmt = ((c.env as any).DB as D1Database).prepare(
      `SELECT ${col} AS group_id, ${label} AS label,
       SUM(CASE WHEN e.direction = 'in' THEN e.amount ELSE 0 END) AS income,
       SUM(CASE WHEN e.direction = 'out' THEN e.amount ELSE 0 END) AS expense,
       COUNT(*) AS entry_count
       FROM entries e ${join} WHERE e.account_id = ? AND e.deleted_at IS NULL`
        + (from ? ' AND e.date >= ?' : '')
        + (to ? ' AND e.date <= ?' : '')
        + ' GROUP BY ' + col + ' ORDER BY (income + expense) DESC',
    );
    const binds: (string | number)[] = [accountId];
    if (from) binds.push(from);
    if (to) binds.push(to);
    const result = await (from || to ? stmt.bind(...binds) : stmt.bind(accountId))
      .all<{ group_id: number | null; label: string; income: number; expense: number; entry_count: number }>();
    return ok(c, buildBreakdown(acct, groupBy, from ?? null, to ?? null, result.results ?? []));
  }
});

function buildBreakdown(
  acct: typeof schema.accounts.$inferSelect,
  groupBy: string,
  from: string | null,
  to: string | null,
  rows: { group_id: number | null; label: string; income: number; expense: number; entry_count: number }[],
) {
  const totalIncome = rows.reduce((s, r) => s + (r.income ?? 0), 0);
  const totalExpense = rows.reduce((s, r) => s + (r.expense ?? 0), 0);
  const grandTotal = totalIncome + totalExpense || 1;
  const groups = rows.map((r) => ({
    id: r.group_id, label: r.label, income: r.income ?? 0, expense: r.expense ?? 0,
    net: (r.income ?? 0) - (r.expense ?? 0), entryCount: r.entry_count ?? 0,
    shareOfTotal: ((r.income ?? 0) + (r.expense ?? 0)) / grandTotal,
  }));
  return {
    account: { id: acct.id, name: acct.name, currency: acct.defaultCurrency },
    groupBy, from: from ?? null, to: to ?? null, totalIncome, totalExpense, groups,
  };
}

// Trends
app.get('/trends', async (c) => {
  const accountId = c.req.query('account_id');
  const from = c.req.query('from');
  const to = c.req.query('to');
  if (from && !isoDate(from) && !isoMonth(from)) return fail(c, 'invalid from', 422);
  if (to && !isoDate(to) && !isoMonth(to)) return fail(c, 'invalid to', 422);
  if (from && to && from > to) return fail(c, 'from must not be after to', 422);
  if (!accountId) return fail(c, 'account_id is required', 400);
  const accountNumber = positiveInt(accountId);
  if (!accountNumber) return fail(c, 'invalid account_id', 422);
  const db = getDb(c);
  const [acct] = await db.select().from(schema.accounts).where(eq(schema.accounts.id, accountNumber)).all();
  if (!acct) return fail(c, 'account not found', 404);
  const now = new Date();
  const startMonth = from ?? `${now.getFullYear()}-01`;
  const endMonth = to ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const trends = await fetchTrends(
    (c.env as any).DB as D1Database,
    accountNumber,
    Number(startMonth.slice(0, 4)),
    startMonth,
    endMonth,
  );
  return ok(c, {
    account: { id: acct.id, name: acct.name, currency: acct.defaultCurrency },
    from: startMonth, to: endMonth, months: trends,
  });
});

// Balance
app.get('/balance', async (c) => {
  const accountId = c.req.query('account_id');
  if (!accountId) return fail(c, 'account_id is required', 400);
  const accountNumber = positiveInt(accountId);
  if (!accountNumber) return fail(c, 'invalid account_id', 422);
  const db = getDb(c);
  const [acct] = await db.select().from(schema.accounts).where(eq(schema.accounts.id, accountNumber)).all();
  if (!acct) return fail(c, 'account not found', 404);
  const row = await ((c.env as any).DB as D1Database).prepare(
    `SELECT COALESCE(SUM(CASE WHEN direction = 'in' THEN amount ELSE 0 END), 0)
       - COALESCE(SUM(CASE WHEN direction = 'out' THEN amount ELSE 0 END), 0) AS net,
       COUNT(*) AS count FROM entries WHERE account_id = ? AND deleted_at IS NULL`,
  ).bind(accountId).first<{ net: number; count: number }>();
  return ok(c, {
    account: { id: acct.id, name: acct.name, currency: acct.defaultCurrency },
    startingBalance: acct.startingBalance, net: row?.net ?? 0,
    balance: acct.startingBalance + (row?.net ?? 0), entryCount: row?.count ?? 0,
  });
});

export default app;
