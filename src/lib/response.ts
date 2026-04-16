import type { Context } from 'hono';

export function ok<T>(c: Context, data: T, status: 200 | 201 = 200) {
  return c.json({ ok: true as const, data }, status);
}

export function fail(c: Context, error: string, status: 400 | 404 | 422 | 500 = 400) {
  return c.json({ ok: false as const, error }, status);
}

export type Envelope<T> = { ok: true; data: T } | { ok: false; error: string };
