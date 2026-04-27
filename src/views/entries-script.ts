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
function hideTtd() { document.getElementById('ttd-section').hidden = true; clearTtdPreview(); }
function clearTtdPreview() { const preview = document.getElementById('ttd-preview'); preview.hidden = true; preview.innerHTML = ''; }
async function previewTtd() {
  const text = document.getElementById('ttd-text').value.trim();
  const preview = document.getElementById('ttd-preview');
  const status = document.getElementById('entry-status');
  if (!text) { status.textContent = 'Paste at least one line first.'; return; }
  preview.hidden = false;
  preview.textContent = 'Parsing…';
  try {
    const res = await fetch('/api/v1/entries/quick/preview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accountId: ACCOUNT_ID, text, year: YEAR, month: MONTH }) });
    const json = await res.json();
    if (!json.ok) { preview.textContent = json.error || 'Could not parse lines.'; return; }
    preview.innerHTML = json.data.lines.map(line => line.error
      ? '<div class="ttd-preview-row ttd-preview-error"><span>Skipped</span><span dir="auto">' + escapeHtml(line.raw) + '</span></div>'
      : '<div class="ttd-preview-row"><span class="' + (line.direction === 'in' ? 'income' : 'expense') + '">' + (line.direction === 'in' ? '+' : '−') + line.amount + '</span><span dir="auto">' + escapeHtml(line.title) + '</span><time>' + line.date + '</time></div>').join('');
    const valid = json.data.lines.filter(line => !line.error).length;
    status.textContent = valid + ' line' + (valid === 1 ? '' : 's') + ' ready to save.';
  } catch { preview.textContent = 'Network error. Please try again.'; }
}
function escapeHtml(value) { const div = document.createElement('div'); div.textContent = value; return div.innerHTML; }

async function submitEntry() {
  const submitButton = document.getElementById('submit-btn');
  const status = document.getElementById('entry-status');
  submitButton.disabled = true;
  submitButton.textContent = 'Saving…';
  status.textContent = '';
  const ttdText = document.getElementById('ttd-text').value.trim();
  if (ttdText) {
    try {
      const res = await fetch('/api/v1/entries/quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: ACCOUNT_ID, text: ttdText, year: YEAR, month: MONTH }),
      });
      const json = await res.json();
      if (json.ok) { window.location.reload(); }
      else { status.textContent = json.error || 'Could not save entries.'; submitButton.disabled = false; submitButton.textContent = 'Save'; }
    } catch {
      status.textContent = 'Network error. Please try again.';
      submitButton.disabled = false;
      submitButton.textContent = 'Save';
    }
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
    itemId: form.itemId.value || document.getElementById('context-item-id').value || undefined,
  };
  const url = id ? '/api/v1/entries/' + id : '/api/v1/entries';
  const method = id ? 'PATCH' : 'POST';
  try {
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const json = await res.json();
    if (json.ok) { window.location.reload(); }
    else { status.textContent = json.error || 'Could not save entry.'; submitButton.disabled = false; submitButton.textContent = id ? 'Update' : 'Save'; }
  } catch {
    status.textContent = 'Network error. Please try again.';
    submitButton.disabled = false;
    submitButton.textContent = id ? 'Update' : 'Save';
  }
}

async function deleteEntry() {
  const id = document.getElementById('entry-id').value;
  if (!id) return;
  if (!confirm('Delete this entry?')) return;
  const button = document.getElementById('delete-btn');
  button.disabled = true;
  button.textContent = 'Deleting…';
  try {
    const res = await fetch('/api/v1/entries/' + id + '?account_id=' + ACCOUNT_ID, { method: 'DELETE' });
    const json = await res.json();
    if (json.ok) { window.location.reload(); }
    else { document.getElementById('entry-status').textContent = json.error || 'Could not delete entry.'; button.disabled = false; button.textContent = 'Delete entry'; }
  } catch {
    document.getElementById('entry-status').textContent = 'Network error. Please try again.';
    button.disabled = false;
    button.textContent = 'Delete entry';
  }
}

document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

// Inline delete — no modal needed
async function deleteEntryById(id) {
  if (!id) return;
  if (!confirm('Delete this entry?')) return;
  try {
    const res = await fetch('/api/v1/entries/' + id + '?account_id=' + ACCOUNT_ID, { method: 'DELETE' });
    const json = await res.json();
    if (json.ok) { window.location.reload(); }
    else { alert(json.error || 'Could not delete entry.'); }
  } catch {
    alert('Network error. Please try again.');
  }
}
window.openEditModal = openEditModal;
window.openAddModal = openAddModal;
window.closeModal = closeModal;
window.toggleTtd = toggleTtd;
window.previewTtd = previewTtd;
window.clearTtdPreview = clearTtdPreview;

let importData = null;
function toggleImport() {
  const sec = document.getElementById('import-section');
  sec.hidden = !sec.hidden;
  if (!sec.hidden && typeof XLSX === 'undefined') {
    document.getElementById('entry-status').textContent = 'Loading Excel library…';
  }
}
function hideImport() { document.getElementById('import-section').hidden = true; }

function handleImportFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (typeof XLSX === 'undefined') {
    document.getElementById('entry-status').textContent = 'Excel library not loaded. Please wait and try again.';
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const wb = XLSX.read(e.target.result, { type: 'array' });
      const sheetSelect = document.getElementById('import-sheet');
      sheetSelect.innerHTML = wb.SheetNames.map(n => '<option value="' + n + '">' + n + '</option>').join('');
      parseImportSheet(wb, wb.SheetNames[0]);
    } catch(ex) {
      document.getElementById('entry-status').textContent = 'Could not read file: ' + ex.message;
    }
  };
  reader.readAsArrayBuffer(file);
}

function parseImportSheet(wb, sheetName) {
  const ws = wb.Sheets[sheetName];
  if (!ws) { document.getElementById('entry-status').textContent = 'Sheet not found.'; return; }
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
  if (!data || data.length < 2) { document.getElementById('entry-status').textContent = 'No data rows found.'; return; }

  // Detect Jalali year from sheet name
  const jalaliYear = /^\d{4}$/.test(sheetName) ? parseInt(sheetName, 10) : YEAR;

  const rows = [];
  let skipped = 0;
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length < 3) { skipped++; continue; }
    const amount = Number(row[0]);
    if (!isFinite(amount) || amount === 0) { skipped++; continue; }
    const title = String(row[1] || '').trim();
    if (!title) { skipped++; continue; }

    // Parse date: cell might be text like "1 فروردین" or a day number
    let date = null;
    const rawDate = row[2];
    if (rawDate != null && rawDate !== '') {
      date = guessDate(String(rawDate), jalaliYear, MONTH);
    }
    if (!date) {
      // Try to use current month with day=1 as fallback
      date = YEAR + '-' + String(MONTH).padStart(2,'0') + '-01';
    }

    const direction = amount < 0 ? 'in' : 'out';
    const absAmount = Math.round(Math.abs(amount));
    rows.push({ amount: absAmount, direction, title, date, notes: row[3] ? String(row[3]).trim() : null });
  }

  importData = rows;
  const preview = document.getElementById('import-preview');
  preview.hidden = rows.length === 0;
  preview.innerHTML = rows.map(r =>
    '<div class="ttd-preview-row"><span class="' + (r.direction === 'in' ? 'income' : 'expense') + '">' + (r.direction === 'in' ? '+' : '−') + r.amount + '</span><span dir="auto">' + escapeHtml(r.title) + '</span><time>' + r.date + '</time></div>'
  ).join('');
  document.getElementById('entry-status').textContent = rows.length + ' rows ready to import.' + (skipped > 0 ? ' (' + skipped + ' skipped)' : '');
}

function guessDate(str, jalaliYear, fallbackMonth) {
  // Simple Persian month parsing (duplicated from server for client preview)
  const months = { 'فروردین':1,'اردیبهشت':2,'خرداد':3,'تیر':4,'مرداد':5,'شهریور':6,'مهر':7,'آبان':8,'آذر':9,'دی':10,'بهمن':11,'اسفند':12 };
  const cleaned = str.trim();
  for (const [name, mNum] of Object.entries(months)) {
    const match = cleaned.match(new RegExp('^(\\d+)\\s*' + name + '$'));
    if (match) {
      const day = parseInt(match[1], 10);
      // Approximate: map Jalali month to Gregorian month offset
      // For preview purposes, just use current year + month offset
      const gMonth = ((mNum - 1 + 2) % 12) + 1; // rough offset
      return YEAR + '-' + String(gMonth).padStart(2,'0') + '-' + String(Math.min(day, 31)).padStart(2,'0');
    }
  }
  // Plain day number
  const dayNum = parseInt(cleaned.replace(/[^0-9]/g, ''), 10);
  if (dayNum >= 1 && dayNum <= 31) {
    return YEAR + '-' + String(fallbackMonth).padStart(2,'0') + '-' + String(Math.min(dayNum, 31)).padStart(2,'0');
  }
  // ISO date
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) return cleaned;
  return null;
}

async function doImport() {
  if (!importData || importData.length === 0) {
    document.getElementById('entry-status').textContent = 'No rows to import.';
    return;
  }
  if (!confirm('Import ' + importData.length + ' entries?')) return;
  const status = document.getElementById('entry-status');
  const itemId = document.getElementById('itemId').value || '';
  try {
    const res = await fetch('/api/v1/entries/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId: ACCOUNT_ID, rows: importData, itemId: itemId || undefined }),
    });
    const json = await res.json();
    if (json.ok) { window.location.reload(); }
    else { status.textContent = json.error || 'Import failed.'; }
  } catch {
    status.textContent = 'Network error. Please try again.';
  }
}

window.toggleImport = toggleImport;
window.handleImportFile = handleImportFile;
window.doImport = doImport;
window.deleteEntryById = deleteEntryById;
window.submitEntry = submitEntry;
window.deleteEntry = deleteEntry;
`;
}
