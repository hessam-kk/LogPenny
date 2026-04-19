import { Hono } from 'hono';
import { eq, isNull } from 'drizzle-orm';
import { createDb, schema } from '../db';

import { ok, fail } from '../lib/response';
import { getDb, positiveInt } from '../lib/validation';

const app = new Hono();

// List active accounts
app.get('/', async (c) => {
  const db = getDb(c);
  const rows = await db
    .select()
    .from(schema.accounts)
    .where(isNull(schema.accounts.archivedAt))
    .orderBy(schema.accounts.createdAt);
  return ok(c, rows);
});

// Create
app.post('/', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body || !body.name) return fail(c, 'name is required', 422);
  const db = getDb(c);
  const [created] = await db
    .insert(schema.accounts)
    .values({
      name: String(body.name),
      defaultCurrency: body.defaultCurrency ?? 'IRR',
      startingBalance: Number(body.startingBalance ?? 0),
    })
    .returning();
  return ok(c, created, 201);
});

// Update
app.patch('/:id', async (c) => {
  const id = positiveInt(c.req.param('id'));
  if (!id) return fail(c, 'invalid id', 422);
  const body = await c.req.json().catch(() => null);
  if (!body) return fail(c, 'invalid body', 422);
  const db = getDb(c);
  const [updated] = await db
    .update(schema.accounts)
    .set({
      name: body.name !== undefined ? String(body.name) : undefined,
      defaultCurrency: body.defaultCurrency !== undefined ? String(body.defaultCurrency) : undefined,
      startingBalance: body.startingBalance !== undefined ? Number(body.startingBalance) : undefined,
      archivedAt: body.archived !== undefined ? (body.archived ? new Date() : null) : undefined,
    })
    .where(eq(schema.accounts.id, id))
    .returning();
  if (!updated) return fail(c, 'account not found', 404);
  return ok(c, updated);
});

export default app;
