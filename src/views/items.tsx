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
        <div style="display:flex; align-items:center; justify-content:space-between; margin: 20px 0 12px;">
          <h1 style="margin:0; font-size:20px; font-weight:700;">Items</h1>
          <button class="btn btn-primary btn-sm" onclick="openItemModal()">+ New item</button>
        </div>

        {items.length === 0 ? (
          <div class="card empty">
            <div class="empty-icon" aria-hidden="true">▦</div>
            <div class="empty-title">No items yet</div>
            <div>Items group related entries (e.g. "Coffee Sales — March").</div>
          </div>
        ) : (
          <div class="items-grid">
            {items.map((it) => {
              const t = it.totals;
              const net = t ? t.income - t.expense : 0;
              return (
                <div class="card item-card" style="display:block; text-decoration:none; color:inherit;">
                  <div class="item-card-title">
                    <span class={hasPersian(it.title) ? 'persian' : ''}>{it.title}</span>
                  </div>
                  {it.notes ? <div class="entry-meta" style="margin-bottom:4px;"><span class={hasPersian(it.notes) ? 'persian' : ''}>{it.notes}</span></div> : null}
                  <div class="entry-meta">
                    {it.kind} · {t ? t.entryCount : 0} entr{t && t.entryCount === 1 ? 'y' : 'ies'}
                  </div>
                  {t ? (
                    <div class="item-card-totals">
                      <span>In: <strong style="color:var(--income)">{formatAmount(t.income, currency)}</strong></span>
                      <span>Out: <strong style="color:var(--expense)">{formatAmount(t.expense, currency)}</strong></span>
                      <span class="item-card-net" style={net >= 0 ? 'color:var(--income)' : 'color:var(--expense)'}>
                        Net: {net >= 0 ? '+' : '−'}{formatAmount(Math.abs(net), currency)}
                      </span>
                    </div>
                  ) : (
                    <div class="item-card-totals"><span>No entries</span></div>
                  )}
                  <div class="item-card-actions">
                    <a class="btn btn-sm" href={`/entries?account_id=${account.id}&item_id=${it.id}${cal === 'j' ? '&cal=j' : ''}`} aria-label={`View entries for ${it.title}`}>View entries</a>
                    <button class="btn btn-sm" type="button" onclick={`openItemEdit(${it.id})`} aria-label={`Edit ${it.title}`}>Edit</button>
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
            <button class="btn btn-sm" onclick="closeItemModal()">✕</button>
          </div>
          <form id="item-form" class="modal-body">
            <input type="hidden" id="item-id" name="id" />
            <div class="form-group">
              <label class="form-label" for="item-title-field">Title</label>
              <input class="form-control" type="text" id="item-title-field" name="title" dir="auto" placeholder="Coffee Sales — March" required />
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
              <textarea class="form-control" id="item-notes" name="notes" dir="auto"></textarea>
            </div>
          </form>
          <div class="modal-foot">
            <button type="button" class="btn btn-danger btn-sm" id="item-delete-btn" hidden onclick="deleteItem()">Delete</button>
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
            const res = await fetch(url, {
              method,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...body, accountId: ACCOUNT_ID }),
            });
            const json = await res.json();
            if (json.ok) { window.location.reload(); }
            else { alert(json.error || 'Failed'); }
          }

          async function deleteItem() {
            const id = document.getElementById('item-id').value;
            if (!id) return;
            if (!confirm('Delete this item and all its entries?')) return;
            const res = await fetch('/api/v1/items/' + id, { method: 'DELETE' });
            const json = await res.json();
            if (json.ok) { window.location.reload(); }
            else { alert(json.error || 'Failed'); }
          }

          window.openItemModal = openItemModal;
          window.openItemEdit = openItemEdit;
          window.closeItemModal = closeItemModal;
          window.submitItem = submitItem;
          window.deleteItem = deleteItem;
        `,
      }} />
    </>
  );
};
