import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import { createDb, schema } from '../db';

import { ok, fail } from '../lib/response';
import { accountExists, getDb, positiveInt } from '../lib/validation';

const app = new Hono();

app.get('/', async (c) => {
  const accountId = c.req.query('account_id');
  const db = getDb(c);
  let query = db.select().from(schema.categories).$dynamic();
  if (accountId) {
    const accountNumber = positiveInt(accountId);
    if (!accountNumber) return fail(c, 'invalid account_id', 422);
    if (!(await accountExists(db, accountNumber))) return fail(c, 'account not found', 404);
    query = query.where(eq(schema.categories.accountId, accountNumber));
  }
  const rows = await query.orderBy(schema.categories.name);
  return ok(c, rows);
});

app.post('/', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body || !body.accountId || !body.name) return fail(c, 'accountId and name required', 422);
  const accountId = positiveInt(body.accountId);
  if (!accountId) return fail(c, 'invalid accountId', 422);
  const db = getDb(c);
  if (!(await accountExists(db, accountId))) return fail(c, 'account not found', 404);
  const [created] = await db
    .insert(schema.categories)
    .values({
      accountId,
      name: String(body.name),
      kind: body.kind ?? 'both',
      color: body.color ?? '#6366f1',
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
  const [updated] = await db
    .update(schema.categories)
    .set({
      name: body.name !== undefined ? String(body.name) : undefined,
      kind: body.kind !== undefined ? String(body.kind) : undefined,
      color: body.color !== undefined ? String(body.color) : undefined,
    })
    .where(and(eq(schema.categories.id, id), eq(schema.categories.accountId, accountId)))
    .returning();
  if (!updated) return fail(c, 'category not found', 404);
  return ok(c, updated);
});

export default app;
