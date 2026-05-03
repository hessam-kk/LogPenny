import { Hono } from 'hono';
import { eq, isNull } from 'drizzle-orm';
import { schema } from '../db';
import { ok, fail } from '../lib/response';
import { getDb } from '../lib/validation';
import { createSession, destroySession, getSessionUser, setSessionCookie, clearSessionCookie } from '../lib/auth';
import { normalizeCurrency } from '../lib/money';

const app = new Hono();

// Register: create a user, claim any unowned accounts, ensure a default account, and log in.
app.post('/register', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body) return fail(c, 'invalid body', 422);
  const username = String(body.username ?? '').trim();
  const password = String(body.password ?? '');
  if (!username || username.length < 3) return fail(c, 'username must be at least 3 characters', 422);
  if (!password || password.length < 4) return fail(c, 'password must be at least 4 characters', 422);
  const db = getDb(c);
  const [existing] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.username, username))
    .all();
  if (existing) return fail(c, 'username already taken', 409);

  const currency = normalizeCurrency(body.defaultCurrency ?? 'IRR') ?? 'IRR';
  const [user] = await db
    .insert(schema.users)
    .values({ username, password })
    .returning();

  // Claim accounts that have no owner (e.g. pre-auth data) to this user.
  await db.update(schema.accounts).set({ userId: user.id }).where(isNull(schema.accounts.userId)).run();

  const [hasAccount] = await db
    .select({ id: schema.accounts.id })
    .from(schema.accounts)
    .where(eq(schema.accounts.userId, user.id))
    .limit(1)
    .all();
  if (!hasAccount) {
    await db
      .insert(schema.accounts)
      .values({
        userId: user.id,
        name: String(body.accountName ?? '').trim() || 'Personal',
        defaultCurrency: currency,
        startingBalance: 0,
      })
      .run();
  }

  const token = await createSession(c, user.id);
  setSessionCookie(c, token);
  return ok(c, { id: user.id, username: user.username }, 201);
});

// Login
app.post('/login', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body) return fail(c, 'invalid body', 422);
  const username = String(body.username ?? '').trim();
  const password = String(body.password ?? '');
  const db = getDb(c);
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.username, username))
    .all();
  if (!user || user.password !== password) return fail(c, 'invalid username or password', 401);
  const token = await createSession(c, user.id);
  setSessionCookie(c, token);
  return ok(c, { id: user.id, username: user.username });
});

// Logout
app.post('/logout', async (c) => {
  await destroySession(c);
  clearSessionCookie(c);
  return ok(c, { loggedOut: true });
});

// Current user
app.get('/me', async (c) => {
  const user = await getSessionUser(c);
  if (!user) return fail(c, 'not authenticated', 401);
  return ok(c, { id: user.id, username: user.username });
});

export default app;
