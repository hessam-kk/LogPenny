import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { jsxRenderer } from 'hono/jsx-renderer';
import { isNull } from 'drizzle-orm';
import { createDb, schema } from './db';
import accountsRoute from './routes/accounts';
import categoriesRoute from './routes/categories';
import itemsRoute from './routes/items';
import entriesRoute from './routes/entries';
import reportsRoute from './routes/reports';
import { Layout } from './views/layout';
import { SetupView } from './views/setup';
import { EntriesView } from './views/entries';
import { ItemsView } from './views/items';
import { ReportsView } from './views/reports';
import { fetchMonthly, fetchBreakdown, fetchTrends } from './lib/reports-data';

const app = new Hono();
app.use('*', logger());

const api = new Hono();
api.route('/accounts', accountsRoute);
api.route('/categories', categoriesRoute);
api.route('/items', itemsRoute);
api.route('/entries', entriesRoute);
api.route('/reports', reportsRoute);
app.route('/api/v1', api);

function db(c: any) {
  return createDb((c.env as any).DB as D1Database);
}

async function loadContext(c: any) {
  const d = db(c);
  const accounts = await d.select().from(schema.accounts).where(isNull(schema.accounts.archivedAt)).all();
  const requestedId = c.req.query('account_id');
  let activeAccount = accounts[0] ?? null;
  if (requestedId) {
    const found = accounts.find((a: any) => a.id === Number(requestedId));
    if (found) activeAccount = found;
  }
  return { accounts, activeAccount };
}

app.use('*', jsxRenderer(({ children }: any) => <Layout>{children}</Layout>));
app.get('/', (c) => c.redirect('/entries'));

app.get('/entries', async (c) => {
  const { accounts, activeAccount } = await loadContext(c);
  if (!activeAccount) return c.redirect('/setup');
  const d = db(c);
  const now = new Date();
  const year = c.req.query('year') ? Number(c.req.query('year')) : now.getFullYear();
  const month = c.req.query('month') ? Number(c.req.query('month')) : now.getMonth() + 1;
  const cal = c.req.query('cal') === 'j' ? 'j' : 'g';
  const itemId = c.req.query('item_id') ? Number(c.req.query('item_id')) : null;
  const from = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const to = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  const allItems = await d.select().from(schema.items).where(isNull(schema.items.archivedAt)).all();
  const items = allItems.filter((i: any) => i.accountId === activeAccount.id);
  const allEntries = await d.select().from(schema.entries).all();
  const entries = allEntries
    .filter((r: any) => r.accountId === activeAccount.id && r.date >= from && r.date <= to && (!itemId || r.itemId === itemId))
    .sort((a: any, b: any) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return c.render(<EntriesView accounts={accounts} account={activeAccount} items={items} entries={entries} year={year} month={month} cal={cal} itemId={itemId} />);
});

app.get('/items', async (c) => {
  const { accounts, activeAccount } = await loadContext(c);
  if (!activeAccount) return c.redirect('/setup');
  const cal = c.req.query('cal') === 'j' ? 'j' : 'g';
  const d = db(c);
  const allItems = await d.select().from(schema.items).all();
  const items = allItems.filter((i: any) => i.accountId === activeAccount.id && !i.archivedAt);
  const totalsRows = await ((c.env as any).DB as D1Database).prepare(
    `SELECT item_id, SUM(CASE WHEN direction = 'in' THEN amount ELSE 0 END) AS income,
       SUM(CASE WHEN direction = 'out' THEN amount ELSE 0 END) AS expense, COUNT(*) AS entry_count
       FROM entries WHERE item_id IS NOT NULL AND account_id = ? GROUP BY item_id`,
  ).bind(activeAccount.id).all<{ item_id: number; income: number; expense: number; entry_count: number }>();
  const totalsMap = new Map(
    (totalsRows.results ?? []).map((r: any) => [r.item_id, { income: r.income ?? 0, expense: r.expense ?? 0, entryCount: r.entry_count ?? 0 }]),
  );
  return c.render(<ItemsView accounts={accounts} account={activeAccount} cal={cal} items={items.map((i: any) => ({ ...i, totals: totalsMap.get(i.id) ?? null }))} />);
});

app.get('/reports', async (c) => {
  const { accounts, activeAccount } = await loadContext(c);
  if (!activeAccount) return c.redirect('/setup');
  const now = new Date();
  const year = c.req.query('year') ? Number(c.req.query('year')) : now.getFullYear();
  const month = c.req.query('month') ? Number(c.req.query('month')) : now.getMonth() + 1;
  const cal = c.req.query('cal') === 'j' ? 'j' : 'g';
  const monthStr = String(month).padStart(2, '0');
  const from = `${year}-${monthStr}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const to = `${year}-${monthStr}-${String(lastDay).padStart(2, '0')}`;
  const DB = (c.env as any).DB as D1Database;
  const { income, expense, daily } = await fetchMonthly(DB, activeAccount.id, year, month);
  const breakdown = await fetchBreakdown(DB, activeAccount.id, from, to);
  const trends = await fetchTrends(DB, activeAccount.id, year);
  return c.render(<ReportsView accounts={accounts} account={activeAccount} year={year} month={month} cal={cal} income={income} expense={expense} daily={daily} breakdown={breakdown} trends={trends} />);
});

app.get('/setup', async (c) => {
  const d = db(c);
  const accounts = await d.select().from(schema.accounts).all();
  if (accounts.length > 0) return c.redirect('/entries');
  return c.render(<SetupView />);
});

export default app;
