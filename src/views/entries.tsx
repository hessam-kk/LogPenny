import type { FC } from 'hono/jsx';
import type { Account, Entry, Item } from '../db/schema';
import { TopBar, Tabs, formatAmount, formatMonthYear, monthLabel } from './components/common';
import { shiftDisplayedMonth } from '../lib/jalali';
import { hasPersian } from '../lib/persian';
import { entriesScript } from './entries-script';

interface EntriesViewProps {
  accounts: Account[];
  account: Account;
  items: Item[];
  entries: Entry[];
  year: number;
  month: number;
  cal?: 'g' | 'j';
  itemId?: number | null;
}

export const EntriesView: FC<EntriesViewProps> = ({ accounts, account, items, entries, year, month, cal = 'g', itemId = null }) => {
  const currency = account.defaultCurrency;
  const income = entries.filter((e) => e.direction === 'in').reduce((s, e) => s + e.amount, 0);
  const expense = entries.filter((e) => e.direction === 'out').reduce((s, e) => s + e.amount, 0);
  const net = income - expense;
  const previous = shiftDisplayedMonth(year, month, -1, cal);
  const next = shiftDisplayedMonth(year, month, 1, cal);
  const calQ = cal === 'j' ? 'cal=j&' : '';
  const itemQ = itemId ? `item_id=${itemId}&` : '';
  const acctQ = `account_id=${account.id}&${itemQ}${calQ}`;

  return (
    <>
      <TopBar accounts={accounts} activeAccount={account} cal={cal} basePath="/entries" />
      <Tabs active="entries" accountId={account.id} cal={cal} />
      <div class="app-shell">
        <div class="month-nav">
          <a class="month-nav-btn" href={`/entries?${acctQ}year=${previous.gy}&month=${previous.gm}`}>‹ {monthLabel(previous.gy, previous.gm, cal)}</a>
          <div class="month-nav-title">{formatMonthYear(year, month, cal)}</div>
          <a class="month-nav-btn" href={`/entries?${acctQ}year=${next.gy}&month=${next.gm}`}>{monthLabel(next.gy, next.gm, cal)} ›</a>
        </div>
        <div class="stats">
          <div class="stat">
            <div class="stat-label">Income</div>
            <div class="stat-value income">{formatAmount(income, currency)}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Expense</div>
            <div class="stat-value expense">{formatAmount(expense, currency)}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Net</div>
            <div class="stat-value" style={net >= 0 ? 'color: var(--income)' : 'color: var(--expense)'}>
              {net >= 0 ? '+' : '−'}{formatAmount(Math.abs(net), currency)}
            </div>
          </div>
        </div>
        {entries.length === 0 ? (
          <div class="card empty">
            <div class="empty-icon" aria-hidden="true">＋</div>
            <div class="empty-title">No entries yet</div>
            <div>Tap the + button to add your first entry for {formatMonthYear(year, month, cal)}.</div>
          </div>
        ) : (
          <div class="entry-list">
            {entries.map((e) => <EntryRow key={e.id} entry={e} currency={currency} items={items} />)}
          </div>
        )}
      </div>
      <button class="fab" onclick="openAddModal()" aria-label="Add entry">+</button>
      <div id="add-modal" class="modal-backdrop" hidden onclick="if(event.target===this)closeModal()">
        <div class="modal">
          <div class="modal-head">
            <div class="modal-title" id="modal-title">New entry</div>
            <button class="btn btn-sm" onclick="closeModal()" aria-label="Close">✕</button>
          </div>
          <form id="entry-form" class="modal-body">
            <input type="hidden" id="entry-id" name="id" />
            <input type="hidden" id="context-item-id" value={itemId ?? ''} />
            <div class="form-group">
              <label class="form-label" for="amount">Amount</label>
              <input class="form-control" type="text" id="amount" name="amount" placeholder="640" inputmode="decimal" required />
            </div>
            <div class="form-group">
              <label class="form-label">Direction</label>
              <div style="display:flex; gap:8px;">
                <label style="flex:1; display:flex; align-items:center; gap:6px; justify-content:center; padding:10px; border:1px solid var(--border); border-radius:var(--radius-sm); cursor:pointer;">
                  <input type="radio" name="direction" value="out" checked /> Expense
                </label>
                <label style="flex:1; display:flex; align-items:center; gap:6px; justify-content:center; padding:10px; border:1px solid var(--border); border-radius:var(--radius-sm); cursor:pointer;">
                  <input type="radio" name="direction" value="in" /> Income
                </label>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label" for="title">Title</label>
              <input class="form-control" type="text" id="title" name="title" placeholder="What is this for?" dir="auto" required />
            </div>
            <div class="form-row two">
              <div class="form-group">
                <label class="form-label" for="date">Date</label>
                <input class="form-control" type="date" id="date" name="date" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="itemId">Item (optional)</label>
                <select class="form-control" id="itemId" name="itemId">
                  <option value="">— Standalone —</option>
                  {items.map((it) => <option value={it.id}>{it.title}</option>)}
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label" for="notes">Notes</label>
              <textarea class="form-control" id="notes" name="notes" dir="auto" placeholder="Optional details"></textarea>
            </div>
            <div style="margin-top: 8px;">
              <button type="button" class="btn btn-sm" onclick="toggleTtd()">⌨ Quick add (TTD)</button>
            </div>
            <div id="ttd-section" hidden style="margin-top: 12px;">
              <div class="form-group">
                <label class="form-label" for="ttd-text">Paste lines</label>
                <textarea class="form-control" id="ttd-text" rows={6} dir="auto" oninput="clearTtdPreview()"></textarea>
              <div id="ttd-preview" class="ttd-preview" hidden></div>
                <div class="ttd-help">
                  One entry per line. Use <code>=640+90</code> or <code>-400</code> for income, plain numbers for expense.
                  Separate with <code>Tab</code> or <code>2+ spaces</code>. Trailing day-of-month optional.
                </div>
                <button type="button" class="btn btn-sm" onclick="previewTtd()">Preview lines</button>
              </div>
            </div>
          </form>
          <div id="entry-status" class="form-status" role="status" aria-live="polite"></div>
          <div class="modal-foot">
            <button type="button" class="btn btn-danger-solid btn-sm" id="delete-btn" hidden onclick="deleteEntry()">Delete entry</button>
            <button type="button" class="btn" onclick="closeModal()">Cancel</button>
            <button type="button" class="btn btn-primary" onclick="submitEntry()" id="submit-btn">Save</button>
          </div>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: entriesScript(account.id, year, month) }} />
    </>
  );
};

interface EntryRowProps { entry: Entry; currency: string; items: Item[] }

const EntryRow: FC<EntryRowProps> = ({ entry, currency, items }) => {
  const day = entry.date.slice(8, 10);
  const item = items.find((i) => i.id === entry.itemId);
  const esc = JSON.stringify(entry).replace(/"/g, '&quot;');
  return (
    <div class="entry" onclick={`openEditModal(${esc})`} style="cursor:pointer;">
      <div class="entry-day">{Number(day)}</div>
      <div class="entry-body">
        <div class="entry-title">
          <span class={hasPersian(entry.title) ? 'persian' : ''}>{entry.title}</span>
        </div>
        <div class="entry-meta">
          {entry.direction === 'in' ? 'Income' : 'Expense'}
          {item ? <> · <span class={hasPersian(item.title) ? 'persian' : ''}>{item.title}</span></> : null}
          {entry.notes ? <> · 📝</> : null}
        </div>
      </div>
      <div class={`entry-amount ${entry.direction === 'in' ? 'in' : 'out'}`}>
        {entry.direction === 'in' ? '+' : '−'}{formatAmount(entry.amount, currency)}
      </div>
    </div>
  );
};
