// Inline client script for the entries view. Exported as a string.
export function entriesScript(accountId: number, year: number, month: number): string {
  return `
const ACCOUNT_ID = ${accountId};
const YEAR = ${year};
const MONTH = ${month};

function openAddModal() {
  document.getElementById('modal-title').textContent = 'New entry';
  document.getElementById('entry-form').reset();
  document.getElementById('entry-id').value = '';
  document.getElementById('delete-btn').hidden = true;
  const today = new Date();
  const ym = today.getFullYear() + '-' + String(today.getMonth()+1).padStart(2,'0');
  if (ym === YEAR + '-' + String(MONTH).padStart(2,'0')) {
    document.getElementById('date').value = today.toISOString().slice(0,10);
  } else {
    document.getElementById('date').value = YEAR + '-' + String(MONTH).padStart(2,'0') + '-01';
  }
  document.getElementById('submit-btn').textContent = 'Save';
  hideTtd();
  document.getElementById('add-modal').hidden = false;
}

function openEditModal(entry) {
  document.getElementById('modal-title').textContent = 'Edit entry';
  document.getElementById('entry-id').value = entry.id;
  document.getElementById('amount').value = entry.amount;
  document.getElementById('title').value = entry.title;
  document.getElementById('date').value = entry.date;
  document.getElementById('notes').value = entry.notes || '';
  document.getElementById('itemId').value = entry.itemId || '';
  const radios = document.querySelectorAll('input[name=direction]');
  radios.forEach(r => r.checked = (r.value === entry.direction));
  document.getElementById('delete-btn').hidden = false;
  document.getElementById('submit-btn').textContent = 'Update';
  hideTtd();
  document.getElementById('add-modal').hidden = false;
}

function closeModal() { document.getElementById('add-modal').hidden = true; }
function toggleTtd() { document.getElementById('ttd-section').hidden = !document.getElementById('ttd-section').hidden; }
function hideTtd() { document.getElementById('ttd-section').hidden = true; }

async function submitEntry() {
  const ttdText = document.getElementById('ttd-text').value.trim();
  if (ttdText) {
    const res = await fetch('/api/v1/entries/quick', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId: ACCOUNT_ID, text: ttdText, year: YEAR, month: MONTH }),
    });
    const json = await res.json();
    if (json.ok) { window.location.reload(); } else { alert(json.error || 'Failed'); }
    return;
  }
  const id = document.getElementById('entry-id').value;
  const form = document.getElementById('entry-form');
  const body = {
    accountId: ACCOUNT_ID,
    amount: form.amount.value,
    direction: form.querySelector('input[name=direction]:checked').value,
    title: form.title.value,
    date: form.date.value,
    notes: form.notes.value || undefined,
    itemId: form.itemId.value || undefined,
  };
  const url = id ? '/api/v1/entries/' + id : '/api/v1/entries';
  const method = id ? 'PATCH' : 'POST';
  const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const json = await res.json();
  if (json.ok) { window.location.reload(); } else { alert(json.error || 'Failed'); }
}

async function deleteEntry() {
  const id = document.getElementById('entry-id').value;
  if (!id) return;
  if (!confirm('Delete this entry?')) return;
  const res = await fetch('/api/v1/entries/' + id, { method: 'DELETE' });
  const json = await res.json();
  if (json.ok) { window.location.reload(); } else { alert(json.error || 'Failed'); }
}

document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
window.openEditModal = openEditModal;
window.openAddModal = openAddModal;
window.closeModal = closeModal;
window.toggleTtd = toggleTtd;
window.submitEntry = submitEntry;
window.deleteEntry = deleteEntry;
`;
}
