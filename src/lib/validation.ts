import { and, eq } from 'drizzle-orm';
import { createDb, schema } from '../db';

export function positiveInt(value: unknown): number | null {
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

export function isoDate(value: unknown): string | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return null;
  return value;
}

export function isoMonth(value: unknown): string | null {
  if (typeof value !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) return null;
  return value;
}

export function getDb(c: { env: unknown }) {
  return createDb((c.env as { DB: D1Database }).DB);
}

export async function accountExists(db: ReturnType<typeof createDb>, accountId: number) {
  const [account] = await db.select({ id: schema.accounts.id }).from(schema.accounts).where(eq(schema.accounts.id, accountId)).all();
  return Boolean(account);
}

export async function itemBelongsToAccount(db: ReturnType<typeof createDb>, itemId: number, accountId: number) {
  const [item] = await db
    .select({ id: schema.items.id })
    .from(schema.items)
    .where(and(eq(schema.items.id, itemId), eq(schema.items.accountId, accountId)))
    .all();
  return Boolean(item);
}

export async function categoryBelongsToAccount(db: ReturnType<typeof createDb>, categoryId: number, accountId: number) {
  const [category] = await db
    .select({ id: schema.categories.id })
    .from(schema.categories)
    .where(and(eq(schema.categories.id, categoryId), eq(schema.categories.accountId, accountId)))
    .all();
  return Boolean(category);
}
