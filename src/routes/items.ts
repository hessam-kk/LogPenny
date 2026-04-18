import { Hono } from 'hono';
import { eq, isNull, and, desc } from 'drizzle-orm';
import { createDb, schema } from '../db';

import { ok, fail } from '../lib/response';

const app = new Hono();

// List items for an account (with rolling totals from child entries)
app.get('/', async (c) => {
  const accountId = c.req.query('account_id');
  if (!accountId) return fail(c, 'account_id is required', 400);
  const db = createDb((c.env as any).DB as D1Database);

  // Fetch items
  const rows = await db
    .select()
    .from(schema.items)
    .where(
      and(
        eq(schema.items.accountId, Number(accountId)),
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
    .bind(accountId)
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
  const id = Number(c.req.param('id'));
  const db = createDb((c.env as any).DB as D1Database);
  const [item] = await db
    .select()
    .from(schema.items)
    .where(eq(schema.items.id, id))
    .all();
  if (!item) return fail(c, 'item not found', 404);

  const childEntries = await db
    .select()
    .from(schema.entries)
    .where(eq(schema.entries.itemId, id))
    .orderBy(schema.entries.date);

  return ok(c, { item, entries: childEntries });
});

app.post('/', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body || !body.accountId || !body.title)
    return fail(c, 'accountId and title required', 422);
  const db = createDb((c.env as any).DB as D1Database);
  const [created] = await db
    .insert(schema.items)
    .values({
      accountId: Number(body.accountId),
      categoryId: body.categoryId ? Number(body.categoryId) : null,
      title: String(body.title),
      kind: body.kind ?? 'both',
      notes: body.notes ?? null,
      startDate: body.startDate ?? null,
      endDate: body.endDate ?? null,
    })
    .returning();
  return ok(c, created, 201);
});

app.patch('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const body = await c.req.json().catch(() => null);
  if (!body) return fail(c, 'invalid body', 422);
  const db = createDb((c.env as any).DB as D1Database);
  const [updated] = await db
    .update(schema.items)
    .set({
      title: body.title !== undefined ? String(body.title) : undefined,
      kind: body.kind !== undefined ? String(body.kind) : undefined,
      notes: body.notes !== undefined ? String(body.notes) : undefined,
      categoryId: body.categoryId !== undefined ? Number(body.categoryId) : undefined,
      startDate: body.startDate !== undefined ? String(body.startDate) : undefined,
      endDate: body.endDate !== undefined ? String(body.endDate) : undefined,
      archivedAt: body.archived !== undefined ? (body.archived ? new Date() : null) : undefined,
    })
    .where(eq(schema.items.id, id))
    .returning();
  if (!updated) return fail(c, 'item not found', 404);
  return ok(c, updated);
});

app.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (!Number.isInteger(id) || id < 1) return fail(c, 'invalid id', 422);
  const db = createDb((c.env as any).DB as D1Database);
  const [archived] = await db
    .update(schema.items)
    .set({ archivedAt: new Date() })
    .where(eq(schema.items.id, id))
    .returning({ id: schema.items.id, archivedAt: schema.items.archivedAt });
  if (!archived) return fail(c, 'item not found', 404);
  return ok(c, archived);
});

export default app;
