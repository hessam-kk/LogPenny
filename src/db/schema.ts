import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Accounts: a money account (e.g. "Personal", "Business") with a default currency.
export const accounts = sqliteTable('accounts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  defaultCurrency: text('default_currency').notNull().default('IRR'),
  startingBalance: integer('starting_balance').notNull().default(0),
  archivedAt: integer('archived_at', { mode: 'timestamp_ms' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

// Categories: flat optional grouping for entries/items (e.g. "Rent", "Salary").
export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  accountId: integer('account_id')
    .notNull()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  kind: text('kind').notNull().default('both'), // 'income' | 'expense' | 'both'
  color: text('color').default('#6366f1'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

// Items: a container that holds child entries (e.g. "Coffee Sales — March").
export const items = sqliteTable('items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  accountId: integer('account_id')
    .notNull()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id').references(() => categories.id, {
    onDelete: 'set null',
  }),
  title: text('title').notNull(),
  kind: text('kind').notNull().default('both'), // 'income' | 'expense' | 'both'
  notes: text('notes'),
  startDate: text('start_date'), // ISO date yyyy-mm-dd, optional
  endDate: text('end_date'), // ISO date yyyy-mm-dd, optional
  archivedAt: integer('archived_at', { mode: 'timestamp_ms' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

// Entries: the core money record.
export const entries = sqliteTable('entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  accountId: integer('account_id')
    .notNull()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  itemId: integer('item_id').references(() => items.id, {
    onDelete: 'cascade',
  }),
  categoryId: integer('category_id').references(() => categories.id, {
    onDelete: 'set null',
  }),
  // Amount stored as integer minor units. For IRR/Toman, 1 Toman = 1 unit.
  amount: integer('amount').notNull(),
  direction: text('direction').notNull(), // 'in' | 'out'
  currency: text('currency').notNull().default('IRR'),
  title: text('title').notNull(),
  date: text('date').notNull(), // ISO date yyyy-mm-dd (the day this happened)
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  deletedAt: integer('deleted_at', { mode: 'timestamp_ms' }),
});

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;
export type Entry = typeof entries.$inferSelect;
export type NewEntry = typeof entries.$inferInsert;
