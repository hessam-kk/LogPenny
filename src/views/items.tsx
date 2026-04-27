import type { FC } from 'hono/jsx';
import type { Account, Item } from '../db/schema';
import { TopBar, Tabs, formatAmount } from './components/common';
import { hasPersian } from '../lib/persian';

interface ItemWithTotals extends Item {
  totals: { income: number; expense: number; entryCount: number } | null;
}

interface ItemsViewProps {
  accounts: Account[];
  account: Account;
  cal?: 'g' | 'j';
  items: ItemWithTotals[];
}

export const ItemsView: FC<ItemsViewProps> = ({ accounts, account, cal = 'g', items }) => {
  const currency = account.defaultCurrency;
  return (
    <>
      <TopBar accounts={accounts} activeAccount={account} cal={cal} basePath="/items" />
      <Tabs active="items" accountId={account.id} cal={cal} />

      <div class="app-shell">
        <div style="display:flex;align-items:center;justify-content:space-between;margin:20px 0 12px">
          <h1 style="margin:0;font-size:20px;font-weight:700;letter-spacing:var(--tracking-tight)">Items</h1>
          <button class="btn btn-primary btn-sm anim-stat" onclick="openItemModal()">+ New item</button>
        </div>

        {items.length === 0 ? (
          <div class="card empty anim-card-up">
            <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
            </svg>
            <div class="empty-title">No items yet</div>
            <div>Items group related entries (e.g. &ldquo;Coffee Sales &mdash; March&rdquo;).</div>
          </div>
        ) : (
          <div class="items-grid">
            {items.map((it) => {
              const t = it.totals;
              const net = t ? t.income - t.expense : 0;
              return (
                <div class="card item-card anim-item-card" style="display:block;color:inherit">
                  <div class="item-card-title">
                    <span class={hasPersian(it.title) ? 'persian' : ''}>{it.title}</span>
                  </div>
                  {it.notes ? <div class="item-card-meta" style="margin-bottom:4px"><span class={hasPersian(it.notes) ? 'persian' : ''}>{it.notes}</span></div> : null}
                  <div class="item-card-meta">
                    {it.kind} &middot; {t ? t.entryCount : 0} entr{t && t.entryCount === 1 ? 'y' : 'ies'}
                  </div>
                  {t ? (
                    <div class="item-card-totals">
                      <span>In: <strong style="color:var(--income)">{formatAmount(t.income, currency)}</strong></span>
                      <span>Out: <strong style="color:var(--expense)">{formatAmount(t.expense, currency)}</strong></span>
                      <span class="item-card-net" style={net >= 0 ? 'color:var(--income)' : 'color:var(--expense)'}>
                        Net: {net >= 0 ? '+' : '\u2212'}{formatAmount(Math.abs(net), currency)}
                      </span>
                    </div>
                  ) : (
                    <div class="item-card-totals"><span>No entries</span></div>
                  )}
                  <div class="item-card-actions">
                    <a class="btn btn-sm" href={`/entries?account_id=${account.id}&item_id=${it.id}${cal === 'j' ? '&cal=j' : ''}`}>View entries</a>
                    <button class="btn btn-sm" type="button" onclick={`openItemEdit(${it.id})`}>Edit</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div id="item-modal" class="modal-backdrop" hidden onclick="if(event.target===this)closeItemModal()">
        <div class="modal">
          <div class="modal-head">
            <div class="modal-title" id="item-modal-title">New item</div>
            <button class="icon-btn" onclick="closeItemModal()" aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <form id="item-form" class="modal-body">
            <input type="hidden" id="item-id" name="id" />
            <div class="form-group">
              <label class="form-label" for="item-title-field">Title</label>
              <input class="form-control" type="text" id="item-title-field" name="title" dir="auto" placeholder="Coffee Sales &mdash; March" required />
            </div>
            <div class="form-row two">
              <div class="form-group">
                <label class="form-label" for="item-kind">Kind</label>
                <select class="form-control" id="item-kind" name="kind">
                  <option value="both" selected>Both</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="item-start">Start date</label>
                <input class="form-control" type="date" id="item-start" name="startDate" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label" for="item-end">End date</label>
              <input class="form-control" type="date" id="item-end" name="endDate" />
            </div>
            <div class="form-group">
              <label class="form-label" for="item-notes">Notes</label>
              <textarea class="form-control" id="item-notes" name="notes" dir="auto" placeholder="Optional details\u2026"></textarea>
            </div>
          </form>
          <div id="item-status" class="form-status" role="status" aria-live="polite"></div>
          <div class="modal-foot">
            <button type="button" class="btn btn-danger btn-sm" id="item-delete-btn" hidden onclick="deleteItem()">Archive</button>
            <button type="button" class="btn" onclick="closeItemModal()">Cancel</button>
            <button type="button" class="btn btn-primary" onclick="submitItem()">Save</button>
          </div>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{
        __html: `
          const ACCOUNT_ID = ${account.id};
          const CAL = '${cal}';
          const ITEMS = ${JSON.stringify(items.map((i) => ({ id: i.id, title: i.title, kind: i.kind, notes: i.notes, startDate: i.startDate, endDate: i.endDate })))};

          function openItemModal() {
            document.getElementById('item-modal-title').textContent = 'New item';
            document.getElementById('item-form').reset();
            document.getElementById('item-id').value = '';
            document.getElementById('item-delete-btn').hidden = true;
            document.getElementById('item-modal').hidden = false;
          }
          function closeItemModal() { document.getElementById('item-modal').hidden = true; }

          function openItemEdit(id) {
            const item = ITEMS.find(i => i.id === id);
            if (!item) return;
            document.getElementById('item-modal-title').textContent = 'Edit item';
            document.getElementById('item-id').value = item.id;
            document.getElementById('item-title-field').value = item.title;
            document.getElementById('item-kind').value = item.kind;
            document.getElementById('item-start').value = item.startDate || '';
            document.getElementById('item-end').value = item.endDate || '';
            document.getElementById('item-notes').value = item.notes || '';
            document.getElementById('item-delete-btn').hidden = false;
            document.getElementById('item-modal').hidden = false;
          }

          async function submitItem() {
            const saveButton = document.querySelector('#item-modal .btn-primary');
            const status = document.getElementById('item-status');
            saveButton.disabled = true;
            saveButton.textContent = 'Saving\\u2026';
            status.textContent = '';
            const id = document.getElementById('item-id').value;
            const form = document.getElementById('item-form');
            const body = {
              title: form.title.value,
              kind: form.kind.value,
              startDate: form.startDate.value || undefined,
              endDate: form.endDate.value || undefined,
              notes: form.notes.value || undefined,
            };
            const url = id ? '/api/v1/items/' + id : '/api/v1/items';
            const method = id ? 'PATCH' : 'POST';
            try {
              const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...body, accountId: ACCOUNT_ID }),
              });
              const json = await res.json();
              if (json.ok) { window.location.reload(); }
              else { status.textContent = json.error || 'Could not save item.'; saveButton.disabled = false; saveButton.textContent = 'Save'; }
            } catch {
              status.textContent = 'Network error. Please try again.';
              saveButton.disabled = false;
              saveButton.textContent = 'Save';
            }
          }

          async function deleteItem() {
            const id = document.getElementById('item-id').value;
            if (!id) return;
            if (!confirm('Archive this item? Its entries will be kept.')) return;
            const button = document.getElementById('item-delete-btn');
            button.disabled = true;
            button.textContent = 'Archiving\\u2026';
            try {
              const res = await fetch('/api/v1/items/' + id, { method: 'DELETE' });
              const json = await res.json();
              if (json.ok) { window.location.reload(); }
              else { document.getElementById('item-status').textContent = json.error || 'Could not archive item.'; button.disabled = false; button.textContent = 'Archive'; }
            } catch {
              document.getElementById('item-status').textContent = 'Network error. Please try again.';
              button.disabled = false;
              button.textContent = 'Archive';
            }
          }

          window.openItemModal = openItemModal;
          window.openItemEdit = openItemEdit;
          window.closeItemModal = closeItemModal;
          window.submitItem = submitItem;
          window.deleteItem = deleteItem;
          document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeItemModal(); });
        `,
      }} />
    </>
  );
};