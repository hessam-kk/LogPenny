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

function openEntryFromButton(button) {
  try { openEditModal(JSON.parse(button.dataset.entry)); }
  catch { document.getElementById('entry-status').textContent = 'Could not open this entry.'; }
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
  if (!(await askConfirm('Delete this entry?'))) return;
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
  if (!(await askConfirm('Delete this entry?'))) return;
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
window.openEntryFromButton = openEntryFromButton;
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

  // Detect Jalali year from sheet name (e.g. "1405"); fall back to the viewed month's Jalali year
  const sheetJYear = /^\d{4}$/.test(sheetName) ? parseInt(sheetName, 10) : null;
  const jalaliYear = sheetJYear || jalaliDateOf(YEAR, MONTH, 1).jy;
  // Running Jalali month — rows without a month name inherit the most recent named month
  let currentJMonth = jalaliDateOf(YEAR, MONTH, 1).jm;

  const rows = [];
  let skipped = 0;
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row[0] === undefined || row[1] === undefined) { skipped++; continue; }
    const amount = Number(row[0]);
    if (!isFinite(amount) || amount === 0) { skipped++; continue; }
    const title = String(row[1] || '').trim();
    if (!title) { skipped++; continue; }

    // Parse date: "1 فروردین", "۲ اردیبهشت", plain day numbers, or ISO
    let date = null;
    const rawDate = row[2];
    if (rawDate != null && rawDate !== '') {
      const parsed = guessDate(String(rawDate), jalaliYear, currentJMonth);
      if (parsed) {
        if (parsed.month) currentJMonth = parsed.month;
        date = parsed.iso;
      }
    }
    if (!date) date = jalaliToIso(jalaliYear, currentJMonth, 1);

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

const PERSIAN_MONTHS = { 'فروردین':1,'اردیبهشت':2,'خرداد':3,'تیر':4,'مرداد':5,'شهریور':6,'مهر':7,'آبان':8,'آذر':9,'دی':10,'بهمن':11,'اسفند':12 };

function parseFaNum(str) {
  const s = String(str)
    .replace(/[\u06F0-\u06F9]/g, (c) => String(c.charCodeAt(0) - 0x06F0))
    .replace(/[\u0660-\u0669]/g, (c) => String(c.charCodeAt(0) - 0x0660));
  return parseInt(s, 10);
}

// Verified Jalali calendar math (jalaali-js Borkowski algorithm, inlined for the browser)
const J_BREAKS = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];
function jDiv(a, b) { return ~~(a / b); }
function jMod(a, b) { return a - ~~(a / b) * b; }
function jalCalCore(jy) {
  const gy = jy + 621;
  let leapJ = -14, jp = J_BREAKS[0], jm = 0, jump = 0;
  for (let i = 1; i < J_BREAKS.length; i += 1) {
    jm = J_BREAKS[i]; jump = jm - jp;
    if (jy < jm) break;
    leapJ = leapJ + jDiv(jump, 33) * 8 + jDiv(jMod(jump, 33), 4);
    jp = jm;
  }
  const n = jy - jp;
  leapJ = leapJ + jDiv(n, 33) * 8 + jDiv(jMod(n, 33) + 3, 4);
  if (jMod(jump, 33) === 4 && jump - n === 4) leapJ += 1;
  const leapG = jDiv(gy, 4) - jDiv((jDiv(gy, 100) + 1) * 3, 4) - 150;
  return { gy, march: 20 + leapJ - leapG, jump, n };
}
function leapFromCycle(jump, n) {
  let adjusted = n;
  if (jump - n < 6) adjusted = n - jump + jDiv(jump + 4, 33) * 33;
  let leap = jMod(jMod(adjusted + 1, 33) - 1, 4);
  if (leap === -1) leap = 4;
  return leap;
}
function j2d(jy, jm, jd) {
  const r = jalCalCore(jy);
  return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - jDiv(jm, 7) * (jm - 7) + jd - 1;
}
function g2d(gy, gm, gd) {
  let d = jDiv((gy + jDiv(gm - 8, 6) + 100100) * 1461, 4) + jDiv(153 * jMod(gm + 9, 12) + 2, 5) + gd - 34840408;
  d = d - jDiv(jDiv(gy + 100100 + jDiv(gm - 8, 6), 100) * 3, 4) + 752;
  return d;
}
function d2g(jdn) {
  let j = 4 * jdn + 139361631;
  j = j + jDiv(jDiv(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
  const i = jDiv(jMod(j, 1461), 4) * 5 + 308;
  const gd = jDiv(jMod(i, 153), 5) + 1;
  const gm = jMod(jDiv(i, 153), 12) + 1;
  const gy = jDiv(j, 1461) - 100100 + jDiv(8 - gm, 6);
  return { gy, gm, gd };
}
function d2j(jdn) {
  const gy = d2g(jdn).gy;
  let jy = Math.min(gy - 621, J_BREAKS[J_BREAKS.length - 1] - 1);
  const r = jalCalCore(jy);
  let k = jdn - g2d(r.gy, 3, r.march);
  if (k >= 0) {
    if (k <= 185) return { jy, jm: 1 + jDiv(k, 31), jd: jMod(k, 31) + 1 };
    k -= 186;
  } else {
    jy -= 1;
    k += 179;
    if (leapFromCycle(r.jump, r.n) === 1) k += 1;
  }
  return { jy, jm: 7 + jDiv(k, 30), jd: jMod(k, 30) + 1 };
}
function toGregorian(jy, jm, jd) { return d2g(j2d(jy, jm, jd)); }
function toJalali(gy, gm, gd) { return d2j(g2d(gy, gm, gd)); }
function jMonthLen(jy, jm) {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  const r = jalCalCore(jy);
  return leapFromCycle(r.jump, r.n) === 0 ? 30 : 29;
}
function jalaliToIso(jy, jm, jd) {
  const d = Math.max(1, Math.min(jd, jMonthLen(jy, jm)));
  const g = toGregorian(jy, jm, d);
  return String(g.gy).padStart(4, '0') + '-' + String(g.gm).padStart(2, '0') + '-' + String(g.gd).padStart(2, '0');
}
function jalaliDateOf(gy, gm, gd) { return toJalali(gy, gm, gd); }

// Returns { iso, month } where month is set only when the string names a Jalali month
function guessDate(str, jalaliYear, currentJMonth) {
  const cleaned = String(str).trim();

  // Gregorian ISO: "2026-03-21"
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) return { iso: cleaned, month: null };

  // "1 فروردین", "۲ اردیبهشت", or month-only "فروردین"
  for (const [name, mNum] of Object.entries(PERSIAN_MONTHS)) {
    const re = new RegExp('^(\\d+)\\s*' + name + '$');
    const withDay = cleaned.match(re);
    if (withDay) return { iso: jalaliToIso(jalaliYear, mNum, parseFaNum(withDay[1])), month: mNum };
    if (cleaned === name) return { iso: jalaliToIso(jalaliYear, mNum, 1), month: mNum };
  }

  // Plain day number or range like "24-26 , 28, 30, 31" / "2 و 5" — use the first day
  const firstNum = cleaned.match(/[0-9\u06F0-\u06F9\u0660-\u0669]+/);
  if (firstNum) {
    const day = parseFaNum(firstNum[0]);
    if (day >= 1 && day <= 31) return { iso: jalaliToIso(jalaliYear, currentJMonth, day), month: null };
  }

  return null;
}

async function doImport() {
  if (!importData || importData.length === 0) {
    document.getElementById('entry-status').textContent = 'No rows to import.';
    return;
  }
  if (!(await askConfirm('Import ' + importData.length + ' entries?'))) return;
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
