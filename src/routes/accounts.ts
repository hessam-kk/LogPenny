import { Hono } from 'hono';
import { and, eq, isNull } from 'drizzle-orm';
import { createDb, schema } from '../db';

import { ok, fail } from '../lib/response';
import { accountBelongsToUser, currentUserId, getDb, positiveInt } from '../lib/validation';
import { normalizeCurrency, parseAmount } from '../lib/money';

const app = new Hono();

// List the current user's active accounts
app.get('/', async (c) => {
  const userId = currentUserId(c);
  if (!userId) return fail(c, 'not authenticated', 401);
  const db = getDb(c);
  const rows = await db
    .select()
    .from(schema.accounts)
    .where(and(isNull(schema.accounts.archivedAt), eq(schema.accounts.userId, userId)))
    .orderBy(schema.accounts.createdAt);
  return ok(c, rows);
});

// Create
app.post('/', async (c) => {
  const userId = currentUserId(c);
  if (!userId) return fail(c, 'not authenticated', 401);
  const body = await c.req.json().catch(() => null);
  if (!body || !body.name) return fail(c, 'name is required', 422);
  const db = getDb(c);
  const currency = normalizeCurrency(body.defaultCurrency ?? 'IRR');
  if (!currency) return fail(c, 'unsupported currency', 422);
  const startingBalance = parseAmount(String(body.startingBalance ?? 0), currency);
  if (startingBalance === null) return fail(c, 'invalid startingBalance', 422);
  const [created] = await db
    .insert(schema.accounts)
    .values({
      userId,
      name: String(body.name),
      defaultCurrency: currency,
      startingBalance,
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
  const userId = currentUserId(c);
  if (!userId) return fail(c, 'not authenticated', 401);
  if (!(await accountBelongsToUser(db, id, userId))) return fail(c, 'account not found', 404);
  let defaultCurrency: string | undefined;
  if (body.defaultCurrency !== undefined) {
    defaultCurrency = normalizeCurrency(body.defaultCurrency) ?? undefined;
    if (!defaultCurrency) return fail(c, 'unsupported currency', 422);
  }
  let startingBalance: number | undefined;
  if (body.startingBalance !== undefined) {
    const parsed = parseAmount(String(body.startingBalance), defaultCurrency ?? 'IRR');
    if (parsed === null) return fail(c, 'invalid startingBalance', 422);
    startingBalance = parsed;
  }
  const [updated] = await db
    .update(schema.accounts)
    .set({
      name: body.name !== undefined ? String(body.name) : undefined,
      defaultCurrency,
      startingBalance,
      archivedAt: body.archived !== undefined ? (body.archived ? new Date() : null) : undefined,
    })
    .where(eq(schema.accounts.id, id))
    .returning();
  if (!updated) return fail(c, 'account not found', 404);
  return ok(c, updated);
});

export default app;
