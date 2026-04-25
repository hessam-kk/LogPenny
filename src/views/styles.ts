// All CSS for the app, exported as a string for injection into the Layout <head>.
export const STYLES = `
:root {
  --bg: #eef0f5;
  --bg-grad: radial-gradient(ellipse at 20% 0%, #e0e7ff 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, #fae8ff 0%, transparent 50%), #eef0f5;
  --surface: rgba(255, 255, 255, 0.65);
  --surface-2: rgba(255, 255, 255, 0.45);
  --surface-solid: #ffffff;
  --border: rgba(0, 0, 0, 0.08);
  --border-strong: rgba(0, 0, 0, 0.12);
  --text: #1a1d29;
  --text-dim: #62677a;
  --accent: #6366f1;
  --accent-soft: rgba(99, 102, 241, 0.12);
  --income: #16a34a;
  --income-soft: rgba(22, 163, 74, 0.12);
  --expense: #e11d48;
  --expense-soft: rgba(225, 29, 72, 0.12);
  --shadow: 0 2px 8px rgba(0,0,0,.06), 0 1px 3px rgba(0,0,0,.04);
  --shadow-lg: 0 12px 40px rgba(0,0,0,.10), 0 4px 16px rgba(0,0,0,.06);
  --glass-blur: 16px;
  --glass-saturate: 180%;
  --radius: 16px;
  --radius-sm: 12px;
  --max-w: 1080px;
  --font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
[data-theme="dark"] {
  --bg: #080b11;
  --bg-grad: radial-gradient(ellipse at 20% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(225, 29, 72, 0.08) 0%, transparent 50%), #080b11;
  --surface: rgba(255, 255, 255, 0.06);
  --surface-2: rgba(255, 255, 255, 0.04);
  --surface-solid: #161a22;
  --border: rgba(255, 255, 255, 0.08);
  --border-strong: rgba(255, 255, 255, 0.12);
  --text: #e6e8ee;
  --text-dim: #8b8f9c;
  --accent: #818cf8;
  --accent-soft: rgba(129, 140, 248, 0.15);
  --income: #4ade80;
  --income-soft: rgba(74, 222, 128, 0.12);
  --expense: #fb7185;
  --expense-soft: rgba(251, 113, 133, 0.12);
  --shadow: 0 2px 8px rgba(0,0,0,.3);
  --shadow-lg: 0 12px 40px rgba(0,0,0,.5);
}
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  font-family: var(--font);
  background: var(--bg-grad);
  background-attachment: fixed;
  color: var(--text);
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
  font-size: 15px;
  line-height: 1.5;
}
a { color: inherit; text-decoration: none; }
button { font-family: inherit; cursor: pointer; border: none; background: none; color: inherit; }
input, textarea, select { font-family: inherit; font-size: inherit; }
:focus-visible { outline: 3px solid color-mix(in srgb, var(--accent) 65%, transparent); outline-offset: 3px; }
button, a, input, textarea, select { min-height: 44px; }

.app-shell { max-width: var(--max-w); margin: 0 auto; padding: 0 16px 120px; }
@media (min-width: 768px) { .app-shell { padding: 0 24px 80px; } }
`;

// Append the rest of the CSS by reassigning.
export const STYLES2 = `
.topbar {
  position: sticky; top: 0; z-index: 50;
  background: var(--surface);
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  border-bottom: 1px solid var(--border);
}
.topbar-inner {
  max-width: var(--max-w); margin: 0 auto;
  display: flex; align-items: center; gap: 12px;
  padding: 12px 16px;
}
@media (min-width: 768px) { .topbar-inner { padding: 14px 24px; } }
.brand { font-weight: 700; font-size: 18px; letter-spacing: -.02em; display: flex; align-items: center; gap: 8px; }
.brand-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--accent); display: inline-block; }
.topbar-spacer { flex: 1; }
.account-switch { display: flex; gap: 4px; }
.account-chip {
  padding: 6px 12px; border-radius: 999px; font-size: 13px; font-weight: 500;
  background: var(--surface-2); backdrop-filter: blur(8px); color: var(--text-dim); transition: all .15s;
  border: 1px solid var(--border);
}
.account-chip.active { background: var(--accent); color: #fff; }
.theme-toggle {
  width: 38px; height: 38px; border-radius: 50%;
  display: grid; place-items: center;
  background: var(--surface-2); backdrop-filter: blur(8px); color: var(--text); transition: all .15s;
  border: 1px solid var(--border);
}
.theme-toggle:hover { background: var(--accent-soft); color: var(--accent); }
.tabs {
  display: flex; gap: 2px; padding: 0 16px;
  max-width: var(--max-w); margin: 0 auto;
  border-bottom: 1px solid var(--border); overflow-x: auto;
  background: var(--surface);
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
}
@media (min-width: 768px) { .tabs { padding: 0 24px; } }
.tab {
  padding: 12px 16px; font-size: 14px; font-weight: 500; color: var(--text-dim);
  border-bottom: 2px solid transparent; white-space: nowrap; transition: all .15s;
}
.tab:hover { color: var(--text); }
.tab.active { color: var(--accent); border-bottom-color: var(--accent); }
.card {
  position: relative;
  background: var(--surface);
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  border: 1px solid var(--border);
  border-radius: var(--radius); box-shadow: var(--shadow); padding: 20px;
  overflow: hidden;
}
.card::before {
  content: ""; position: absolute; inset: 0 0 auto; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.65), transparent);
  opacity: .7; pointer-events: none;
}
@media (min-width: 768px) { .card { padding: 24px; } }
.card-title { font-size: 13px; font-weight: 600; color: var(--text-dim); text-transform: uppercase; letter-spacing: .04em; margin: 0 0 16px; }
`;

export const STYLES3 = `
.stats { display: grid; grid-template-columns: 1fr; gap: 12px; margin: 16px 0; }
@media (min-width: 640px) { .stats { grid-template-columns: repeat(3, 1fr); } }
.stat {
  background: var(--surface);
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  border: 1px solid var(--border); border-radius: var(--radius-sm);
  padding: 16px; box-shadow: var(--shadow);
}
.stat-label { font-size: 12px; color: var(--text-dim); font-weight: 500; text-transform: uppercase; letter-spacing: .03em; }
.stat-value { font-size: 22px; font-weight: 700; margin-top: 4px; font-variant-numeric: tabular-nums; letter-spacing: -.02em; }
.stat-value.income { color: var(--income); }
.stat-value.expense { color: var(--expense); }
@media (min-width: 768px) { .stat-value { font-size: 26px; } }
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 10px 18px; border-radius: var(--radius-sm); font-size: 14px; font-weight: 600;
  background: var(--surface-2); backdrop-filter: blur(8px); color: var(--text); border: 1px solid var(--border); transition: all .15s;
}
.btn:hover { border-color: var(--accent); color: var(--accent); }
.btn-primary { background: var(--accent); color: #fff; border-color: var(--accent); }
.btn-primary:hover { filter: brightness(1.08); color: #fff; }
.btn-danger { color: var(--expense); }
.btn-danger-solid { background: var(--expense); color: #fff; border-color: var(--expense); }
.btn-danger-solid:hover { background: color-mix(in srgb, var(--expense) 88%, #000); color: #fff; }
.form-status { min-height: 20px; padding: 0 20px; color: var(--expense); font-size: 13px; font-weight: 500; }
.btn-danger:hover { background: var(--expense-soft); border-color: var(--expense); color: var(--expense); }
.btn-sm { padding: 6px 12px; font-size: 13px; }
.fab {
  position: fixed; bottom: 24px; right: 24px; z-index: 100;
  width: 56px; height: 56px; border-radius: 50%;
  background: var(--accent); color: #fff;
  display: grid; place-items: center; font-size: 28px; line-height: 1;
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.35), var(--shadow-lg);
  border: 1px solid rgba(255,255,255,0.15);
  transition: transform .15s, filter .15s, box-shadow .15s;
}
.fab:hover { transform: translateY(-2px); filter: brightness(1.08); box-shadow: 0 12px 40px rgba(99, 102, 241, 0.45), var(--shadow-lg); }
.fab:active { transform: scale(.94); }
@media (max-width: 639px) { .fab { right: 18px; bottom: calc(18px + env(safe-area-inset-bottom)); } }
`;

export const STYLES4 = `
.entry-list { display: flex; flex-direction: column; gap: 8px; }
.entry {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px; background: var(--surface);
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  border: 1px solid var(--border);
  border-radius: var(--radius-sm); box-shadow: var(--shadow); transition: border-color .15s, background .15s;
}
.entry:hover, .entry:focus-within { border-color: var(--accent); background: var(--accent-soft); }
.entry:active { transform: scale(.995); }
.entry-day {
  width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
  display: grid; place-items: center; font-weight: 700; font-size: 14px;
  background: var(--surface-2); color: var(--text-dim);
}
.entry-body { flex: 1; min-width: 0; }
.entry-title { font-weight: 600; font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.entry-meta { font-size: 12px; color: var(--text-dim); margin-top: 2px; }
.entry-amount { font-weight: 700; font-size: 15px; font-variant-numeric: tabular-nums; white-space: nowrap; }
.entry-amount.in { color: var(--income); }
.entry-amount.out { color: var(--expense); }
.form-group { margin-bottom: 16px; }
.form-label { display: block; font-size: 13px; font-weight: 500; color: var(--text-dim); margin-bottom: 6px; }
.form-control {
  width: 100%; padding: 10px 14px; border-radius: var(--radius-sm);
  background: var(--surface-2); backdrop-filter: blur(8px); border: 1px solid var(--border); color: var(--text);
  transition: border-color .15s, background .15s;
}
.form-control:focus { outline: none; border-color: var(--accent); }
textarea.form-control { resize: vertical; min-height: 80px; }
.form-row { display: grid; grid-template-columns: 1fr; gap: 12px; }
@media (min-width: 640px) { .form-row.two { grid-template-columns: 1fr 1fr; } }
.form-row.three { grid-template-columns: 1fr 1fr; }
@media (min-width: 640px) { .form-row.three { grid-template-columns: 1fr 1fr 1fr; } }
`;

export const STYLES5 = `
.modal-backdrop {
  position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,.3);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: grid; place-items: end center; padding: 0;
}
@media (min-width: 640px) { .modal-backdrop { place-items: center; padding: 24px; } }
.modal {
  width: 100%; max-width: 540px; max-height: 92vh; overflow-y: auto;
  background: var(--surface);
  backdrop-filter: blur(24px) saturate(var(--glass-saturate));
  -webkit-backdrop-filter: blur(24px) saturate(var(--glass-saturate));
  border-radius: 20px 20px 0 0;
  box-shadow: var(--shadow-lg); border: 1px solid var(--border-strong);
}
@media (min-width: 640px) { .modal { border-radius: var(--radius); } }
.modal-head { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px; border-bottom: 1px solid var(--border); position: sticky; top: 0; background: transparent; }
.modal-title { font-weight: 700; font-size: 16px; }
.modal-body { padding: 20px; }
.modal-foot { padding: 16px 20px; border-top: 1px solid var(--border); display: flex; gap: 8px; justify-content: flex-end; position: sticky; bottom: 0; background: transparent; }
.month-nav { display: flex; align-items: center; gap: 8px; justify-content: space-between; margin: 20px 0 8px; }
.month-nav-title { font-weight: 700; font-size: 18px; }
.month-nav-btn { padding: 6px 12px; border-radius: 8px; background: var(--surface-2); backdrop-filter: blur(8px); border: 1px solid var(--border); font-size: 13px; transition: all .15s; }
.month-nav-btn:hover { border-color: var(--accent); color: var(--accent); }
.empty { text-align: center; padding: 48px 20px; color: var(--text-dim); }
.empty-icon { font-size: 40px; margin-bottom: 12px; }
.empty-title { font-weight: 600; color: var(--text); margin-bottom: 4px; }
`;

export const STYLES6 = `
.items-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
@media (min-width: 640px) { .items-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 900px) { .items-grid { grid-template-columns: repeat(3, 1fr); } }
.item-card { padding: 18px; }
.item-card-title { font-weight: 700; font-size: 15px; margin-bottom: 4px; }
.item-card-actions { display: flex; gap: 8px; margin-top: 16px; }
.item-card-actions .btn { flex: 1; }

.item-card-totals { display: flex; gap: 16px; margin-top: 12px; font-size: 13px; }
.item-card-totals span { color: var(--text-dim); }
.item-card-net { font-weight: 700; font-variant-numeric: tabular-nums; }
.chart-wrap { width: 100%; overflow: visible; }
.chart-row { display: flex; align-items: flex-end; gap: 2px; height: 160px; padding-top: 20px; }
.chart-bar { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; align-items: center; height: 100%; justify-content: flex-end; }
.chart-bar-in, .chart-bar-out { width: 60%; border-radius: 3px 3px 0 0; transition: opacity .15s; }
.chart-bar-in { background: var(--income); }
.chart-bar-out { background: var(--expense); }
.chart-axis { display: flex; justify-content: space-between; margin-top: 6px; font-size: 10px; color: var(--text-dim); }
.breakdown-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); }
.breakdown-row:last-child { border-bottom: none; }
.breakdown-label { flex: 1; font-weight: 500; font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.breakdown-bar { height: 8px; border-radius: 4px; background: var(--surface-2); backdrop-filter: blur(4px); overflow: hidden; flex: 1; min-width: 60px; }
.breakdown-bar-fill { height: 100%; background: var(--accent); border-radius: 4px; }
.breakdown-amt { font-variant-numeric: tabular-nums; font-size: 13px; font-weight: 600; white-space: nowrap; }
.persian { font-family: "Vazirmatn", var(--font); }
.section-title { font-size: 16px; font-weight: 700; margin: 24px 0 12px; }
.ttd-help { font-size: 12px; color: var(--text-dim); margin-top: 6px; line-height: 1.6; }
.ttd-preview { margin-top: 10px; padding: 8px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--surface-2); }
.ttd-preview-row { display: grid; grid-template-columns: 80px 1fr auto; gap: 8px; align-items: center; padding: 7px 4px; border-bottom: 1px solid var(--border); font-size: 12px; }
.ttd-preview-row:last-child { border-bottom: 0; }
.ttd-preview-row time { color: var(--text-dim); font-size: 11px; }
.ttd-preview-error { color: var(--expense); }
@media (max-width: 560px) { .ttd-preview-row { grid-template-columns: 64px 1fr; } .ttd-preview-row time { grid-column: 2; } }
.ttd-help code { background: var(--surface-2); backdrop-filter: blur(4px); padding: 1px 5px; border-radius: 4px; font-family: ui-monospace, monospace; font-size: 11px; border: 1px solid var(--border); }
.cal-toggle {
  width: 38px; height: 38px; border-radius: 50%;
  display: grid; place-items: center; font-size: 12px; font-weight: 700;
  background: var(--surface-2); backdrop-filter: blur(8px); color: var(--text); transition: all .15s;
  border: 1px solid var(--border);
}
.cal-toggle:hover { background: var(--accent-soft); color: var(--accent); border-color: var(--accent); }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; transition-duration: .01ms !important; }
}
@supports not (backdrop-filter: blur(1px)) {
  .card, .stat, .entry, .modal, .topbar, .tabs { background: var(--surface-solid); }
}
[hidden] { display: none !important; }
`;

export const ALL_STYLES = STYLES + STYLES2 + STYLES3 + STYLES4 + STYLES5 + STYLES6;
