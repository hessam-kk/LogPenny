# LogPenny — Money Tracker

A personal money tracker that keeps logs of money spent and earned. Optimized for both
mobile and desktop, with bilingual (Persian/English) input support, a Jalali *and*
Gregorian calendar, dark/light themes, and a clean JSON API ready for a Telegram bot.

Deployed as a **Cloudflare Worker** with a **D1** (SQLite) database. The UI is
server-rendered on the edge via **Hono JSX** — no client-side framework.

## Features

- **Entries** — the core record: amount, direction (income/expense), currency (one
  default per account), title, date, and notes. Titles and notes accept Persian or
  English text (Vazirmatn font + RTL/LTR auto-detection per field).
- **Items** — containers that group child entries, e.g. *"Selling X product this
  month"*. Items roll up their own income/expense totals.
- **Categories** — optional flat grouping for entries and items (with a color).
- **Accounts** — multiple accounts (e.g. Personal, Business), each with an
  `IRR`/`USD`/etc. default currency and a starting balance.
- **Login / registration** — per-user accounts and sessions; every user only sees
  their own data. Registering auto-claims any pre-existing (unowned) accounts.
- **TTD quick-add** — paste multi-line text like `563 قسط سوم هدفون گلسا 30` and it
  is parsed into entries (see [TTD format](#ttd-text-parsing) below).
- **Excel import** — upload `.xlsx` files; rows are parsed (including Jalali dates,
  Persian digits, day ranges) and grouped into month buckets that you can
  **drag-and-drop** to fix wrong dates before importing.
- **Bulk actions** — select multiple entries and delete them in one go.
- **Reports** — monthly income/expense/net + running balance, daily breakdown,
  trends across months, and breakdown by item or category.
- **Jalali calendar** — switch the whole app between Gregorian and Persian
  (Jalali) months with one click.
- **Themes** — dark and light, with system preference detection, following a clean shadcn-inspired token system (frosted-glass detail on modals, flat cards elsewhere).
- Mobile- and desktop-optimized UI with entrance animations, count-ups, and reduced-motion support.

## Tech Stack

| Layer     | Choice                                                          |
| --------- | --------------------------------------------------------------- |
| Runtime   | Cloudflare Workers (Hono 4, TypeScript)                         |
| Database  | Cloudflare D1 (SQLite) with Drizzle ORM                         |
| Rendering | Hono JSX server-side rendering (edge)                           |
| Calendar  | [jalaali-js](https://www.npmjs.com/package/jalaali-js)          |
| Excel     | SheetJS (`xlsx`) — parsed client-side                           |

## Project Structure

```
src/
├── index.tsx              # Hono app: routes, auth guards, page rendering
├── env.ts                 # typed Worker bindings
├── db/
│   ├── index.ts           # D1 + Drizzle wiring
│   └── schema.ts          # users, sessions, accounts, categories, items, entries
├── lib/
│   ├── auth.ts            # sessions + HttpOnly session cookie helpers
│   ├── response.ts        # ok()/fail() JSON helpers
│   ├── validation.ts      # user/ownership helpers, input validators
│   ├── money.ts           # currency normalization and amount parsing
│   ├── ttd.ts             # TTD line parser
│   ├── excel-dates.ts     # server-side Jalali/Excel date parsing
│   ├── jalali.ts          # verified Jalali ↔ Gregorian conversion
│   ├── persian.ts         # Persian/RTL text detection
│   ├── reports-data.ts    # monthly / breakdown / trends SQL
│   └── ...
├── routes/
│   ├── auth.ts            # register, login, logout, me
│   ├── accounts.ts        # CRUD for accounts
│   ├── categories.ts      # CRUD for categories
│   ├── items.ts           # CRUD for item containers
│   ├── entries.ts         # entries, quick-add, bulk-delete, import
│   └── reports.ts         # monthly, breakdown, trends, balance
└── views/
    ├── layout.tsx         # shell, top bar, theme/calendar toggles
    ├── login.tsx          # login page
    ├── setup.tsx          # register page
    ├── entries.tsx        # entries page (+ import/bulk-select UI)
    ├── items.tsx          # items page
    ├── reports.tsx        # reports page
    ├── entries-script.ts  # client-side JS (inline script, no bundler)
    └── styles.ts          # the entire design system as an inline <style>
migrations/                # Drizzle SQL migrations for D1
public/                    # static assets (favicon)
```

Client-side JavaScript is authored inside `src/views/entries-script.ts` as a
TypeScript template literal that is inlined into the page — no bundler, no build
step beyond `tsc` type-checking.

## Getting Started

Requirements: Node.js 18+, a Cloudflare account, and [Wrangler](https://developers.cloudflare.com/workers/wrangler/)
(installed as a dev dependency).

```bash
npm install

# 1. Configure wrangler.jsonc with your own database_id, or create one:
npx wrangler d1 create money-tracker

# 2. Run migrations locally:
npm run db:migrate:local

# 3. Run the dev server:
npm run dev
# → http://localhost:8787  (register a user on /setup first)

# 4. Typecheck:
npm run typecheck

# 5. Deploy to production:
npm run db:migrate:remote
npm run deploy
```

### Database migrations

Generate a new migration after schema changes, then apply it:

```bash
npm run db:generate      # drizzle-kit generate
npm run db:migrate:remote
npm run deploy
```

## Pages

| Route      | Description                                                  |
| ---------- | ------------------------------------------------------------ |
| `/login`   | Log in                                                       |
| `/setup`   | Register (creates the user + default account)                |
| `/entries` | Month view of entries; add/edit/delete, bulk delete, TTD quick-add, Excel import |
| `/items`   | Item containers with per-item totals                         |
| `/reports` | Monthly summary, trends, and breakdowns                      |

All pages and API routes require a valid session; unauthenticated visitors are
redirected to `/login`.

## Database Schema

- **users** — `username` (unique), `password`.
- **sessions** — D1-backed login sessions behind an HttpOnly cookie.
- **accounts** — `user_id`, `name`, `default_currency`, `starting_balance`,
  `archived_at`.
- **categories** — `account_id`, `name`, `kind` (`income`/`expense`/`both`), `color`.
- **items** — `account_id`, `category_id`, `title`, `kind`, `notes`, start/end dates,
  `archived_at`. Parent of many entries.
- **entries** — `account_id`, `item_id`, `category_id`, `amount` (integer minor
  units), `direction` (`in`/`out`), `currency`, `title`, `date` (ISO `yyyy-mm-dd`),
  `notes`, `deleted_at` (soft delete), timestamps.

## API

Base URL: `https://<your-worker>.workers.dev` · All endpoints under `/api/v1`
(except `/api/v1/auth/*`) require the session cookie.

### Auth
| Method | Path                  | Body / Notes                                    |
| ------ | --------------------- | ----------------------------------------------- |
| POST   | `/api/v1/auth/register` | `{ username, password, defaultCurrency?, accountName? }` — claims unowned accounts, creates a default account, logs in |
| POST   | `/api/v1/auth/login`    | `{ username, password }`                        |
| POST   | `/api/v1/auth/logout`   | destroys the session                            |
| GET    | `/api/v1/auth/me`       | current user                                    |

### Money data
| Method | Path                     | Notes                                              |
| ------ | ------------------------ | -------------------------------------------------- |
| GET    | `/api/v1/accounts`       | the current user's accounts                        |
| POST   | `/api/v1/accounts`       | `{ name, defaultCurrency?, startingBalance? }`     |
| PATCH  | `/api/v1/accounts/:id`   | rename, change currency/balance, archive           |
| GET    | `/api/v1/categories?account_id=` | list categories                            |
| POST   | `/api/v1/categories`     | `{ accountId, name, kind?, color? }`               |
| GET    | `/api/v1/items?account_id=` | items with rolled-up totals                     |
| GET    | `/api/v1/items/:id?account_id=` | item + child entries                      |
| POST   | `/api/v1/items`          | `{ accountId, title, kind?, notes?, startDate?, endDate? }` |
| PATCH  | `/api/v1/items/:id`      | update / archive                                  |

### Entries
| Method | Path                        | Notes                                             |
| ------ | --------------------------- | ------------------------------------------------- |
| GET    | `/api/v1/entries`           | filters: `account_id`, `from`, `to`, `item_id`, `direction`, `q` |
| POST   | `/api/v1/entries`           | `{ accountId, amount, date, direction?, title?, notes?, itemId?, categoryId? }` |
| PATCH  | `/api/v1/entries/:id`       | update fields                                     |
| DELETE | `/api/v1/entries/:id?account_id=` | soft deletes                                |
| POST   | `/api/v1/entries/:id/restore?account_id=` | un-delete                            |
| POST   | `/api/v1/entries/bulk-delete` | `{ accountId, ids: number[] }`                    |
| POST   | `/api/v1/entries/quick/preview` | `{ accountId, text, year?, month? }` → parsed lines |
| POST   | `/api/v1/entries/quick`     | create entries from TTD text                      |
| POST   | `/api/v1/entries/import`    | `{ accountId, rows: [{ amount, title, date, direction?, notes? }] }` |

### Reports
| Method | Path                     | Notes                                       |
| ------ | ------------------------ | ------------------------------------------- |
| GET    | `/api/v1/reports/monthly`| `account_id`, `year?`, `month?` — income, expense, net, balance, daily |
| GET    | `/api/v1/reports/breakdown` | `account_id`, `from?`, `to?`, `group_by?` (`item`/`category`) |
| GET    | `/api/v1/reports/trends` | `account_id`, `from?`, `to?` — per-month series |
| GET    | `/api/v1/reports/balance`| `account_id` — starting balance + net       |

All endpoints verify that the target account belongs to the logged-in user
(404 on mismatch).

## TTD (Text-To-Data) Parsing

Quick-add accepts one entry per line. The amount token, title, and an optional
day-of-month are separated by a tab or 2+ spaces:

```text
563  قسط سوم هدفون گلسا  30
-400  جلسه سوم زبان (مصطفی) درآمد  28
=640+90  پاکاسکرین ۴۴۰ تومنی و 100 گرم قهوه 28 و 30
```

- Plain numbers are **expenses**; a leading `-` or `=` marks **income**
  (`=640+90` sums to 730T incoming).
- The trailing integer (1–31) is the day of the (current/selected) month.
- Persian digits and inline sums are supported.

## Excel Import

1. Open the entries page for the target month and tap **Import Excel**.
2. Choose an `.xlsx` file. Supported layouts: columns such as
   `amount | title | date [| notes]`, with dates written as:
   - Persian month blocks: `1 فروردین`, `۲ اردیبهشت`, or a bare day number that
     inherits the current month context (rows without a month name carry the last
     named month forward — e.g. the block `1 فروردین`, then `13` means 13 Farvardin).
   - Gregorian ISO dates: `2026-03-21`.
   - Plain Gregorian day numbers fall back to the imported month's context.
3. A preview groups the rows into **month buckets**. Buckets are labeled   in Jalali when the app calendar is in Jalali mode (e.g. `فروردین 1405`), Gregorian otherwise.
4. **Drag rows between buckets** (or use *Move all to…*) to correct any mis-grouped
   dates — the entry dates update to the target month.
5. Tap **Import rows** and confirm.

Notes: amounts of `0` or rows missing both amount and title are skipped (reported
in the preview). Missing dates default to the 1st of the context month.

## Security Notes

- **Passwords are intentionally stored in plaintext** (`users.password`) by explicit
  user request, so they can be reset manually via SQL:

  ```bash
  npx wrangler d1 execute money-tracker --remote --command \
    "UPDATE users SET password = 'newpass' WHERE username = 'yourname';"
  ```

  Anyone with database access can read passwords. Switching to salted hashing is a
  small change and manual resets still work.

- Sessions use HttpOnly cookies; there is no API-key auth yet (planned for the
  Telegram bot).

## Scripts

| Command                      | Purpose                          |
| ---------------------------- | -------------------------------- |
| `npm run dev`                | local dev server                 |
| `npm run deploy`             | deploy to Cloudflare Workers     |
| `npm run typecheck`          | `tsc --noEmit`                   |
| `npm run db:generate`        | generate a Drizzle migration     |
| `npm run db:migrate:local`   | apply migrations locally         |
| `npm run db:migrate:remote`  | apply migrations to production D1|
| `npm run cf-typegen`         | regenerate Worker type bindings  |

## Roadmap (natural next steps)

- Parse TTD amounts with thousands separators and mixed currencies.
- Deleted-entries history view with restore UI.
- Per-entry/account export (CSV/Excel) and a static backup download.
- Telegram bot integration using the existing JSON API.