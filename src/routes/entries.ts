import { Hono } from 'hono';
import { eq, and, gte, lte, desc, or, like } from 'drizzle-orm';
import { createDb, schema } from '../db';

import { ok, fail } from '../lib/response';
import { parseAmount } from '../lib/money';
import { parseTtdLine } from '../lib/ttd';

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
  const accountNumber = Number(accountId);
  if (!Number.isInteger(accountNumber) || accountNumber < 1) return fail(c, 'invalid account_id', 422);

  const db = createDb((c.env as any).DB as D1Database);
  const conditions = [eq(schema.entries.accountId, accountNumber)];
  if (from) conditions.push(gte(schema.entries.date, from));
  if (to) conditions.push(lte(schema.entries.date, to));
  if (itemId) conditions.push(eq(schema.entries.itemId, Number(itemId)));
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
  const db = createDb((c.env as any).DB as D1Database);

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
      accountId: Number(body.accountId),
      itemId: body.itemId ? Number(body.itemId) : null,
      categoryId: body.categoryId ? Number(body.categoryId) : null,
      amount: parsed,
      direction,
      currency,
      title: String(body.title ?? ''),
      date: String(body.date),
      notes: body.notes ? String(body.notes) : null,
    })
    .returning();
  return ok(c, created, 201);
});

// Quick-add: TTD bulk parse + create
app.post('/quick', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body || !body.accountId || !body.text)
    return fail(c, 'accountId and text are required', 422);
  const accountId = Number(body.accountId);

  const db = createDb((c.env as any).DB as D1Database);
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
  const daysInMonth = new Date(year, month, 0).getDate();

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
        itemId: body.itemId ? Number(body.itemId) : null,
      })
      .returning();
    if (entry) created.push(entry);
  }

  return ok(c, { created, errors }, 201);
});

app.patch('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (!Number.isInteger(id) || id < 1) return fail(c, 'invalid id', 422);
  const body = await c.req.json().catch(() => null);
  if (!body) return fail(c, 'invalid body', 422);
  const db = createDb((c.env as any).DB as D1Database);

  const updates: Record<string, unknown> = {};
  if (body.amount !== undefined) {
    // Need currency to parse; fetch entry first
    const [existing] = await db
      .select()
      .from(schema.entries)
      .where(eq(schema.entries.id, id))
      .all();
    if (!existing) return fail(c, 'entry not found', 404);
    const parsed = parseAmount(String(body.amount), existing.currency);
    if (parsed === null) return fail(c, 'invalid amount', 422);
    updates.amount = parsed;
  }
  if (body.direction !== undefined) updates.direction = body.direction === 'in' ? 'in' : 'out';
  if (body.title !== undefined) updates.title = String(body.title);
  if (body.date !== undefined) updates.date = String(body.date);
  if (body.notes !== undefined) updates.notes = body.notes ? String(body.notes) : null;
  if (body.itemId !== undefined) updates.itemId = body.itemId ? Number(body.itemId) : null;
  if (body.categoryId !== undefined)
    updates.categoryId = body.categoryId ? Number(body.categoryId) : null;
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
  const id = Number(c.req.param('id'));
  if (!Number.isInteger(id) || id < 1) return fail(c, 'invalid id', 422);
  const db = createDb((c.env as any).DB as D1Database);
  const [deleted] = await db.delete(schema.entries).where(eq(schema.entries.id, id)).returning({ id: schema.entries.id });
  if (!deleted) return fail(c, 'entry not found', 404);
  return ok(c, deleted);
});

export default app;
