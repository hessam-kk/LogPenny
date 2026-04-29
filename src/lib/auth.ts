// Session helpers: D1-backed login sessions referenced by an HttpOnly cookie.

import { eq } from 'drizzle-orm';
import { schema } from '../db';
import { getDb } from './validation';

const COOKIE_NAME = 'logpenny_session';
const SESSION_DAYS = 30;

export function readToken(c: any): string | null {
  const header = c.req.header('cookie');
  if (!header) return null;
  const match = header.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export async function getSessionUser(c: any) {
  const token = readToken(c);
  if (!token) return null;
  const db = getDb(c);
  const [session] = await db
    .select()
    .from(schema.sessions)
    .where(eq(schema.sessions.token, token))
    .all();
  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) {
    await db.delete(schema.sessions).where(eq(schema.sessions.token, token)).run();
    return null;
  }
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, session.userId))
    .all();
  return user ?? null;
}

export async function createSession(c: any, userId: number): Promise<string> {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400 * 1000);
  await getDb(c).insert(schema.sessions).values({ token, userId, expiresAt }).run();
  return token;
}

export async function destroySession(c: any) {
  const token = readToken(c);
  if (token) await getDb(c).delete(schema.sessions).where(eq(schema.sessions.token, token)).run();
}

export function setSessionCookie(c: any, token: string) {
  const secure = new URL(c.req.url).protocol === 'https:' ? '; Secure' : '';
  c.header('Set-Cookie', `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}${secure}`);
}

export function clearSessionCookie(c: any) {
  c.header('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`);
}
