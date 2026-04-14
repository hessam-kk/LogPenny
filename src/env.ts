// D1Database is a global type declared by the Cloudflare runtime types
// (worker-configuration.d.ts). We define our bindings interface separately
// to avoid conflicts with Hono's own `Env` type parameter.
export interface AppBindings {
  DB: D1Database;
  API_TOKEN?: string;
}

// Helper to extract the DB from a Hono context (whose env type Hono infers as object).
export function getDbFromContext(c: { env: Record<string, unknown> }): D1Database {
  return c.env.DB as D1Database;
}
