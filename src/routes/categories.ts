import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { createDb, schema } from '../db';

import { ok, fail } from '../lib/response';

const app = new Hono();

app.get('/', async (c) => {
  const accountId = c.req.query('account_id');
  const db = createDb((c.env as any).DB as D1Database);
  let query = db.select().from(schema.categories).$dynamic();
  if (accountId) {
    query = query.where(eq(schema.categories.accountId, Number(accountId)));
  }
  const rows = await query.orderBy(schema.categories.name);
  return ok(c, rows);
});

app.post('/', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body || !body.accountId || !body.name) return fail(c, 'accountId and name required', 422);
  const db = createDb((c.env as any).DB as D1Database);
  const [created] = await db
    .insert(schema.categories)
    .values({
      accountId: Number(body.accountId),
      name: String(body.name),
      kind: body.kind ?? 'both',
      color: body.color ?? '#6366f1',
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
    .update(schema.categories)
    .set({
      name: body.name !== undefined ? String(body.name) : undefined,
      kind: body.kind !== undefined ? String(body.kind) : undefined,
      color: body.color !== undefined ? String(body.color) : undefined,
    })
    .where(eq(schema.categories.id, id))
    .returning();
  if (!updated) return fail(c, 'category not found', 404);
  return ok(c, updated);
});

export default app;
