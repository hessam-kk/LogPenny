import { Hono } from 'hono';
import { eq, and, gte, lte, desc, or, like, isNull } from 'drizzle-orm';
import { createDb, schema } from '../db';

import { ok, fail } from '../lib/response';
import { parseAmount } from '../lib/money';
import { parseTtdLine } from '../lib/ttd';
import { accountExists, categoryBelongsToAccount, getDb, isoDate, positiveInt, itemBelongsToAccount } from '../lib/validation';

const app = new Hono();

// List entries with filters
app.get('/', async (c) => {
  const accountId = c.req.query('account_id');
  if (!accountId) return fail(c, 'account_id is required', 400);
  const from = c.req.query('from');
  const to = c.req.query('to');
  const itemId = c.req.query('item_id');
  const direction = c.req.query('direction');
  const q = c.req.query('q');
  const accountNumber = positiveInt(accountId);
  if (!accountNumber) return fail(c, 'invalid account_id', 422);

  const db = getDb(c);
  if (!(await accountExists(db, accountNumber))) return fail(c, 'account not found', 404);
  if (from && !isoDate(from)) return fail(c, 'invalid from date', 422);
  if (to && !isoDate(to)) return fail(c, 'invalid to date', 422);
  if (from && to && from > to) return fail(c, 'from must not be after to', 422);
  const conditions = [eq(schema.entries.accountId, accountNumber), isNull(schema.entries.deletedAt)];
  if (from) conditions.push(gte(schema.entries.date, from));
  if (to) conditions.push(lte(schema.entries.date, to));
  if (itemId) {
    const itemNumber = positiveInt(itemId);
    if (!itemNumber) return fail(c, 'invalid item_id', 422);
    conditions.push(eq(schema.entries.itemId, itemNumber));
  }
  if (direction === 'in' || direction === 'out')
    conditions.push(eq(schema.entries.direction, direction));

  const search = q?.trim();
  const where = search
    ? and(...conditions, or(like(schema.entries.title, `%${search}%`), like(schema.entries.notes, `%${search}%`)))
    : and(...conditions);

  const rows = await db
    .select()
    .from(schema.entries)
    .where(where)
    .orderBy(desc(schema.entries.date), desc(schema.entries.createdAt));

  return ok(c, rows);
});

// Create one entry
app.post('/', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body || !body.accountId || body.amount === undefined || !body.date)
    return fail(c, 'accountId, amount, date are required', 422);
  const db = getDb(c);
  const accountNumber = positiveInt(body.accountId);
  const date = isoDate(body.date);
  if (!accountNumber) return fail(c, 'invalid accountId', 422);
  if (!date) return fail(c, 'invalid date', 422);
  if (!(await accountExists(db, accountNumber))) return fail(c, 'account not found', 404);
  const itemNumber = body.itemId == null || body.itemId === '' ? null : positiveInt(body.itemId);
  const categoryNumber = body.categoryId == null || body.categoryId === '' ? null : positiveInt(body.categoryId);
  if (body.itemId != null && body.itemId !== '' && !itemNumber) return fail(c, 'invalid itemId', 422);
  if (body.categoryId != null && body.categoryId !== '' && !categoryNumber) return fail(c, 'invalid categoryId', 422);
  if (itemNumber && !(await itemBelongsToAccount(db, itemNumber, accountNumber))) return fail(c, 'item not found for account', 422);
  if (categoryNumber && !(await categoryBelongsToAccount(db, categoryNumber, accountNumber))) return fail(c, 'category not found for account', 422);

  // Resolve currency from account if not provided
  let currency = body.currency ? String(body.currency) : undefined;
  if (!currency) {
    const [acct] = await db
      .select()
      .from(schema.accounts)
      .where(eq(schema.accounts.id, Number(body.accountId)))
      .all();
    currency = acct?.defaultCurrency ?? 'IRR';
  }

  const parsed = parseAmount(String(body.amount), currency);
  if (parsed === null) return fail(c, 'invalid amount', 422);

  const direction = body.direction === 'in' ? 'in' : 'out';

  const [created] = await db
    .insert(schema.entries)
    .values({
      accountId: accountNumber,
      itemId: itemNumber,
      categoryId: categoryNumber,
      amount: parsed,
      direction,
      currency,
      title: String(body.title ?? ''),
      date,
      notes: body.notes ? String(body.notes) : null,
    })
    .returning();
  return ok(c, created, 201);
});

// Quick-add: parse TTD lines without writing entries
app.post('/quick/preview', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body || !body.accountId || !body.text) return fail(c, 'accountId and text are required', 422);
  const accountId = positiveInt(body.accountId);
  if (!accountId) return fail(c, 'invalid accountId', 422);
  const db = getDb(c);
  if (!(await accountExists(db, accountId))) return fail(c, 'account not found', 404);
  const now = new Date();
  const year = body.year ? Number(body.year) : now.getFullYear();
  const month = body.month ? Number(body.month) : now.getMonth() + 1;
  if (!Number.isInteger(year) || year < 1 || !Number.isInteger(month) || month < 1 || month > 12)
    return fail(c, 'invalid year/month', 422);
  const daysInMonth = new Date(year, month, 0).getDate();
  const lines = String(body.text).split(/\r?\n/);
  const parsed = lines.map((line: string) => {
    const result = parseTtdLine(line);
    if (!result) return line.trim() ? { raw: line, error: 'Could not parse line' } : null;
    const day = result.day ? Math.min(result.day, daysInMonth) : now.getDate() <= daysInMonth ? now.getDate() : daysInMonth;
    return { ...result, date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` };
  }).filter(Boolean);
  return ok(c, { year, month, lines: parsed });
});

// Quick-add: TTD bulk parse + create
app.post('/quick', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body || !body.accountId || !body.text)
    return fail(c, 'accountId and text are required', 422);
  const accountId = positiveInt(body.accountId);
  if (!accountId) return fail(c, 'invalid accountId', 422);

  const db = getDb(c);
  if (!(await accountExists(db, accountId))) return fail(c, 'account not found', 404);
  const [acct] = await db
    .select()
    .from(schema.accounts)
    .where(eq(schema.accounts.id, accountId))
    .all();
  const currency = acct?.defaultCurrency ?? 'IRR';

  // Resolve the year/month context (defaults to current month)
  const now = new Date();
  const year = body.year ? Number(body.year) : now.getFullYear();
  const month = body.month ? Number(body.month) : now.getMonth() + 1; // 1-12
  if (!Number.isInteger(year) || year < 1 || !Number.isInteger(month) || month < 1 || month > 12)
    return fail(c, 'invalid year/month', 422);
  const daysInMonth = new Date(year, month, 0).getDate();
  const itemId = body.itemId == null || body.itemId === '' ? null : positiveInt(body.itemId);
  const categoryId = body.categoryId == null || body.categoryId === '' ? null : positiveInt(body.categoryId);
  if (body.itemId != null && body.itemId !== '' && !itemId) return fail(c, 'invalid itemId', 422);
  if (body.categoryId != null && body.categoryId !== '' && !categoryId) return fail(c, 'invalid categoryId', 422);
  if (itemId && !(await itemBelongsToAccount(db, itemId, accountId))) return fail(c, 'item not found for account', 422);
  if (categoryId && !(await categoryBelongsToAccount(db, categoryId, accountId))) return fail(c, 'category not found for account', 422);

  const lines = String(body.text).split(/\r?\n/);

  const created: (typeof schema.entries.$inferSelect)[] = [];
  const errors: string[] = [];

  for (const line of lines) {
    const parsed = parseTtdLine(line);
    if (!parsed) {
      if (line.trim()) errors.push(`Skipped: ${line}`);
      continue;
    }
    let dateStr: string;
    if (parsed.day) {
      const day = Math.min(parsed.day, daysInMonth);
      dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    } else {
      dateStr = `${year}-${String(month).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }
    const [entry] = await db
      .insert(schema.entries)
      .values({
        accountId,
        amount: parsed.amount,
        direction: parsed.direction,
        currency,
        title: parsed.title,
        date: dateStr,
        itemId,
        categoryId,
      })
      .returning();
    if (entry) created.push(entry);
  }

  return ok(c, { created, errors }, 201);
});

app.patch('/:id', async (c) => {
  const id = positiveInt(c.req.param('id'));
  if (!id) return fail(c, 'invalid id', 422);
  const body = await c.req.json().catch(() => null);
  if (!body) return fail(c, 'invalid body', 422);
  const db = getDb(c);
  const existing = await db.select().from(schema.entries).where(eq(schema.entries.id, id)).all();
  const entry = existing[0];
  if (!entry) return fail(c, 'entry not found', 404);
  const accountNumber = positiveInt(body.accountId ?? entry.accountId);
  if (!accountNumber || accountNumber !== entry.accountId) return fail(c, 'account mismatch', 422);
  if (body.itemId !== undefined) {
    const itemNumber = body.itemId == null || body.itemId === '' ? null : positiveInt(body.itemId);
    if (body.itemId != null && body.itemId !== '' && !itemNumber) return fail(c, 'invalid itemId', 422);
    if (itemNumber && !(await itemBelongsToAccount(db, itemNumber, entry.accountId))) return fail(c, 'item not found for account', 422);
  }
  if (body.categoryId !== undefined) {
    const categoryNumber = body.categoryId == null || body.categoryId === '' ? null : positiveInt(body.categoryId);
    if (body.categoryId != null && body.categoryId !== '' && !categoryNumber) return fail(c, 'invalid categoryId', 422);
    if (categoryNumber && !(await categoryBelongsToAccount(db, categoryNumber, entry.accountId))) return fail(c, 'category not found for account', 422);
  }
  if (body.date !== undefined && !isoDate(body.date)) return fail(c, 'invalid date', 422);
  const updates: Record<string, unknown> = {};

  if (body.amount !== undefined) {
    // Need currency to parse; fetch entry first
    const parsed = parseAmount(String(body.amount), entry.currency);
    if (parsed === null) return fail(c, 'invalid amount', 422);
    updates.amount = parsed;
  }
  if (body.direction !== undefined) updates.direction = body.direction === 'in' ? 'in' : 'out';
  if (body.title !== undefined) updates.title = String(body.title);
  if (body.date !== undefined) updates.date = String(body.date);
  if (body.notes !== undefined) updates.notes = body.notes ? String(body.notes) : null;
  if (body.itemId !== undefined) updates.itemId = body.itemId == null || body.itemId === '' ? null : positiveInt(body.itemId);
  if (body.categoryId !== undefined)
    updates.categoryId = body.categoryId == null || body.categoryId === '' ? null : positiveInt(body.categoryId);
  updates.updatedAt = new Date();

  const [updated] = await db
    .update(schema.entries)
    .set(updates)
    .where(eq(schema.entries.id, id))
    .returning();
  if (!updated) return fail(c, 'entry not found', 404);
  return ok(c, updated);
});

app.delete('/:id', async (c) => {
  const id = positiveInt(c.req.param('id'));
  if (!id) return fail(c, 'invalid id', 422);
  const db = getDb(c);
  const accountId = positiveInt(c.req.query('account_id'));
  if (!accountId) return fail(c, 'account_id is required', 400);
  const [deleted] = await db
    .update(schema.entries)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(schema.entries.id, id), eq(schema.entries.accountId, accountId), isNull(schema.entries.deletedAt)))
    .returning({ id: schema.entries.id, deletedAt: schema.entries.deletedAt });
  if (!deleted) return fail(c, 'entry not found', 404);
  return ok(c, deleted);
});

app.post('/:id/restore', async (c) => {
  const id = positiveInt(c.req.param('id'));
  if (!id) return fail(c, 'invalid id', 422);
  const accountId = positiveInt(c.req.query('account_id'));
  if (!accountId) return fail(c, 'account_id is required', 400);
  const db = getDb(c);
  const [restored] = await db
    .update(schema.entries)
    .set({ deletedAt: null, updatedAt: new Date() })
    .where(and(eq(schema.entries.id, id), eq(schema.entries.accountId, accountId)))
    .returning({ id: schema.entries.id, deletedAt: schema.entries.deletedAt });
  if (!restored) return fail(c, 'entry not found', 404);
  return ok(c, restored);
});

export default app;
