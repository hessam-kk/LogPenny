import { Hono } from 'hono';
import { eq, isNull, and, desc } from 'drizzle-orm';
import { createDb, schema } from '../db';

import { ok, fail } from '../lib/response';
import { accountExists, categoryBelongsToAccount, getDb, isoDate, positiveInt } from '../lib/validation';

const app = new Hono();

// List items for an account (with rolling totals from child entries)
app.get('/', async (c) => {
  const accountId = c.req.query('account_id');
  if (!accountId) return fail(c, 'account_id is required', 400);
  const accountNumber = positiveInt(accountId);
  if (!accountNumber) return fail(c, 'invalid account_id', 422);
  const db = getDb(c);
  if (!(await accountExists(db, accountNumber))) return fail(c, 'account not found', 404);

  // Fetch items
  const rows = await db
    .select()
    .from(schema.items)
    .where(
      and(
        eq(schema.items.accountId, accountNumber),
        isNull(schema.items.archivedAt),
      ),
    )
    .orderBy(desc(schema.items.createdAt));

  // Fetch per-item totals via raw SQL for efficiency
  const totalsRows = await ((c.env as any).DB as D1Database).prepare(
    `SELECT item_id,
       SUM(CASE WHEN direction = 'in' THEN amount ELSE 0 END) AS income,
       SUM(CASE WHEN direction = 'out' THEN amount ELSE 0 END) AS expense,
       COUNT(*) AS entry_count
       FROM entries WHERE item_id IS NOT NULL AND account_id = ?
       GROUP BY item_id`,
  )
    .bind(accountNumber)
    .all<{ item_id: number; income: number; expense: number; entry_count: number }>();

  const totalsMap = new Map(
    (totalsRows.results ?? []).map((r) => [
      r.item_id,
      {
        income: r.income ?? 0,
        expense: r.expense ?? 0,
        net: (r.income ?? 0) - (r.expense ?? 0),
        entryCount: r.entry_count ?? 0,
      },
    ]),
  );

  const items = rows.map((r) => ({ ...r, totals: totalsMap.get(r.id) ?? null }));
  return ok(c, items);
});

// Get one item with its child entries
app.get('/:id', async (c) => {
  const id = positiveInt(c.req.param('id'));
  if (!id) return fail(c, 'invalid id', 422);
  const accountId = positiveInt(c.req.query('account_id'));
  if (!accountId) return fail(c, 'account_id is required', 400);
  const db = getDb(c);
  const [item] = await db
    .select()
    .from(schema.items)
    .where(and(eq(schema.items.id, id), eq(schema.items.accountId, accountId)))
    .all();
  if (!item) return fail(c, 'item not found', 404);

  const childEntries = await db
    .select()
    .from(schema.entries)
    .where(and(eq(schema.entries.itemId, id), eq(schema.entries.accountId, accountId)))
    .orderBy(schema.entries.date);

  return ok(c, { item, entries: childEntries });
});

app.post('/', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body || !body.accountId || !body.title)
    return fail(c, 'accountId and title required', 422);
  const accountId = positiveInt(body.accountId);
  if (!accountId) return fail(c, 'invalid accountId', 422);
  const db = getDb(c);
  if (!(await accountExists(db, accountId))) return fail(c, 'account not found', 404);
  const categoryId = body.categoryId == null || body.categoryId === '' ? null : positiveInt(body.categoryId);
  if (body.categoryId != null && body.categoryId !== '' && !categoryId) return fail(c, 'invalid categoryId', 422);
  if (categoryId && !(await categoryBelongsToAccount(db, categoryId, accountId))) return fail(c, 'category not found for account', 422);
  const startDate = body.startDate == null || body.startDate === '' ? null : isoDate(body.startDate);
  const endDate = body.endDate == null || body.endDate === '' ? null : isoDate(body.endDate);
  if (body.startDate != null && body.startDate !== '' && !startDate) return fail(c, 'invalid startDate', 422);
  if (body.endDate != null && body.endDate !== '' && !endDate) return fail(c, 'invalid endDate', 422);
  if (startDate && endDate && startDate > endDate) return fail(c, 'startDate must not be after endDate', 422);
  const [created] = await db
    .insert(schema.items)
    .values({
      accountId,
      categoryId,
      title: String(body.title),
      kind: body.kind ?? 'both',
      notes: body.notes ?? null,
      startDate,
      endDate,
    })
    .returning();
  return ok(c, created, 201);
});

app.patch('/:id', async (c) => {
  const id = positiveInt(c.req.param('id'));
  if (!id) return fail(c, 'invalid id', 422);
  const body = await c.req.json().catch(() => null);
  if (!body) return fail(c, 'invalid body', 422);
  const accountId = positiveInt(body.accountId ?? c.req.query('account_id'));
  if (!accountId) return fail(c, 'account_id is required', 400);
  const db = getDb(c);
  const [existing] = await db.select().from(schema.items).where(and(eq(schema.items.id, id), eq(schema.items.accountId, accountId))).all();
  if (!existing) return fail(c, 'item not found', 404);
  const categoryId = body.categoryId === undefined ? undefined : body.categoryId == null || body.categoryId === '' ? null : positiveInt(body.categoryId);
  if (body.categoryId !== undefined && body.categoryId !== null && body.categoryId !== '' && !categoryId) return fail(c, 'invalid categoryId', 422);
  if (categoryId && !(await categoryBelongsToAccount(db, categoryId, accountId))) return fail(c, 'category not found for account', 422);
  const startDate = body.startDate === undefined ? undefined : body.startDate == null || body.startDate === '' ? null : isoDate(body.startDate);
  const endDate = body.endDate === undefined ? undefined : body.endDate == null || body.endDate === '' ? null : isoDate(body.endDate);
  if (body.startDate !== undefined && body.startDate !== null && body.startDate !== '' && !startDate) return fail(c, 'invalid startDate', 422);
  if (body.endDate !== undefined && body.endDate !== null && body.endDate !== '' && !endDate) return fail(c, 'invalid endDate', 422);
  if (startDate && endDate && startDate > endDate) return fail(c, 'startDate must not be after endDate', 422);
  const [updated] = await db
    .update(schema.items)
    .set({
      title: body.title !== undefined ? String(body.title) : undefined,
      kind: body.kind !== undefined ? String(body.kind) : undefined,
      notes: body.notes !== undefined ? String(body.notes) : undefined,
      categoryId,
      startDate,
      endDate,
      archivedAt: body.archived !== undefined ? (body.archived ? new Date() : null) : undefined,
    })
    .where(eq(schema.items.id, id))
    .returning();
  if (!updated) return fail(c, 'item not found', 404);
  return ok(c, updated);
});

app.delete('/:id', async (c) => {
  const id = positiveInt(c.req.param('id'));
  if (!id) return fail(c, 'invalid id', 422);
  const accountId = positiveInt(c.req.query('account_id'));
  if (!accountId) return fail(c, 'account_id is required', 400);
  const db = getDb(c);
  const [archived] = await db
    .update(schema.items)
    .set({ archivedAt: new Date() })
    .where(and(eq(schema.items.id, id), eq(schema.items.accountId, accountId)))
    .returning({ id: schema.items.id, archivedAt: schema.items.archivedAt });
  if (!archived) return fail(c, 'item not found', 404);
  return ok(c, archived);
});

export default app;
