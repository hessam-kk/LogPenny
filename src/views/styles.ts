export const STYLES = `
/* ═══════════════════════════════════════════════
   LogPenny Design System — Dark-first, glass, data-dense
   ═══════════════════════════════════════════════ */

/* ── Tokens: Light (default) ── */
:root {
  color-scheme: light;
  --bg: #f1f5f9;
  --bg-alt: #e2e8f0;
  --surface: rgba(255,255,255,.72);
  --surface-raised: rgba(255,255,255,.88);
  --surface-inset: rgba(0,0,0,.04);
  --border: rgba(0,0,0,.065);
  --border-focus: rgba(0,0,0,.12);
  --text: #0f172a;
  --text-secondary: #475569;
  --text-muted: #94a3b8;
  --accent: #2563eb;
  --accent-text: #ffffff;
  --accent-soft: rgba(37,99,235,.10);
  --income: #059669;
  --income-soft: rgba(5,150,105,.10);
  --expense: #dc2626;
  --expense-soft: rgba(220,38,38,.10);
  --shadow-sm: 0 1px 2px rgba(0,0,0,.04);
  --shadow: 0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
  --shadow-lg: 0 10px 32px rgba(0,0,0,.08), 0 4px 8px rgba(0,0,0,.04);
  --glass-blur: 20px;
  --radius-sm: 10px;
  --radius: 14px;
  --radius-lg: 20px;
  --max-w: 960px;
  --font-sans: 'Fira Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  --font-mono: 'Fira Code', 'Cascadia Code', 'JetBrains Mono', ui-monospace, monospace;
  --tracking-tight: -.022em;
}

/* ── Tokens: Dark ── */
[data-theme="dark"] {
  color-scheme: dark;
  --bg: #020617;
  --bg-alt: #0f172a;
  --surface: rgba(255,255,255,.055);
  --surface-raised: rgba(255,255,255,.082);
  --surface-inset: rgba(255,255,255,.03);
  --border: rgba(255,255,255,.07);
  --border-focus: rgba(255,255,255,.13);
  --text: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #475569;
  --accent: #3b82f6;
  --accent-text: #ffffff;
  --accent-soft: rgba(59,130,246,.12);
  --income: #10b981;
  --income-soft: rgba(16,185,129,.12);
  --expense: #f43f5e;
  --expense-soft: rgba(244,63,94,.12);
  --shadow-sm: 0 1px 2px rgba(0,0,0,.25);
  --shadow: 0 1px 3px rgba(0,0,0,.35), 0 1px 2px rgba(0,0,0,.25);
  --shadow-lg: 0 10px 40px rgba(0,0,0,.45), 0 4px 12px rgba(0,0,0,.35);
}

/* ── Reset & Base ── */
*,*::before,*::after{box-sizing:border-box}
html,body{margin:0;padding:0}
html{touch-action:manipulation;-webkit-tap-highlight-color:transparent}
body{
  font-family:var(--font-sans);
  font-size:14px;line-height:1.55;
  background:var(--bg);color:var(--text);
  -webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;
  min-height:100vh;min-height:100dvh;
}
a{color:inherit;text-decoration:none}
button{font-family:inherit;cursor:pointer;border:none;background:none;color:inherit;font-size:inherit}
input,textarea,select{font-family:inherit;font-size:inherit}
img{max-width:100%;height:auto}

/* ── Focus ── */
:focus-visible{
  outline:2.5px solid var(--accent);
  outline-offset:2px;border-radius:2px;
}

/* ── Layout Shell ── */
.app-shell{max-width:var(--max-w);margin:0 auto;padding:0 16px 120px}
@media(min-width:768px){.app-shell{padding:0 24px 96px}}

/* ── Typography helpers ── */
.font-mono{font-family:var(--font-mono)}
.persian{font-family:"Vazirmatn",var(--font-sans)}
.text-balance{text-wrap:balance}
.tabular-nums{font-variant-numeric:tabular-nums}
`;

export const STYLES_NAV = `
/* ═══════════════════════════════════════════════
   TopBar + Tabs
   ═══════════════════════════════════════════════ */

.topbar{
  position:sticky;top:0;z-index:50;
  background:var(--surface);
  backdrop-filter:blur(var(--glass-blur)) saturate(200%);
  -webkit-backdrop-filter:blur(var(--glass-blur)) saturate(200%);
  border-bottom:1px solid var(--border);
}
.topbar-inner{
  max-width:var(--max-w);margin:0 auto;
  display:flex;align-items:center;gap:10px;
  padding:10px 16px;
}
@media(min-width:768px){.topbar-inner{padding:12px 24px}}

.brand{
  font-weight:700;font-size:17px;letter-spacing:var(--tracking-tight);
  display:flex;align-items:center;gap:9px;color:var(--text);
}
.brand-dot{
  width:10px;height:10px;border-radius:50%;
  background:linear-gradient(135deg,var(--accent),var(--income));
}
.topbar-spacer{flex:1}

.account-switch{display:flex;gap:4px}
.account-chip{
  padding:5px 11px;border-radius:99px;font-size:12px;font-weight:500;
  background:var(--surface-inset);color:var(--text-secondary);
  border:1px solid var(--border);
  transition:color .15s,background .15s,border-color .15s;
}
.account-chip.active{background:var(--accent);color:var(--accent-text);border-color:var(--accent)}

.icon-btn{
  width:36px;height:36px;border-radius:50%;display:grid;place-items:center;
  background:var(--surface-inset);color:var(--text-secondary);
  border:1px solid var(--border);
  transition:color .15s,background .15s,border-color .15s;
}
.icon-btn:hover{color:var(--accent);background:var(--accent-soft);border-color:var(--accent)}
.icon-btn svg{width:17px;height:17px}

/* Tabs navigation */
.tabs{
  display:flex;gap:0;padding:0 16px;max-width:var(--max-w);margin:0 auto;
  border-bottom:1px solid var(--border);
  background:var(--surface);
  backdrop-filter:blur(var(--glass-blur)) saturate(200%);
  -webkit-backdrop-filter:blur(var(--glass-blur)) saturate(200%);
}
@media(min-width:768px){.tabs{padding:0 24px}}
.tab{
  padding:11px 18px;font-size:13px;font-weight:500;color:var(--text-muted);
  border-bottom:2px solid transparent;transition:color .15s,border-color .15s;
}
.tab:hover{color:var(--text)}
.tab.active{color:var(--accent);border-bottom-color:var(--accent)}
`;

export const STYLES_CARDS = `
/* ═══════════════════════════════════════════════
   Cards, Stats, Entries
   ═══════════════════════════════════════════════ */

.card{
  position:relative;
  background:var(--surface);
  backdrop-filter:blur(var(--glass-blur)) saturate(200%);
  -webkit-backdrop-filter:blur(var(--glass-blur)) saturate(200%);
  border:1px solid var(--border);border-radius:var(--radius);
  box-shadow:var(--shadow);padding:20px;
}
@media(min-width:768px){.card{padding:24px}}

.card::before{
  content:"";position:absolute;inset:0 0 auto;height:1px;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.5),transparent);
  opacity:.5;pointer-events:none;
}

.card-title{
  font-size:12px;font-weight:600;color:var(--text-muted);
  text-transform:uppercase;letter-spacing:.05em;margin:0 0 16px;
}

/* Stat cards (income/expense/net) */
.stats{
  display:grid;grid-template-columns:1fr;gap:12px;
  margin:16px 0;
}
@media(min-width:640px){.stats{grid-template-columns:repeat(3,1fr)}}

.stat{
  background:var(--surface);
  backdrop-filter:blur(var(--glass-blur)) saturate(200%);
  -webkit-backdrop-filter:blur(var(--glass-blur)) saturate(200%);
  border:1px solid var(--border);border-radius:var(--radius-sm);
  padding:16px;box-shadow:var(--shadow);
}
.stat-label{
  font-size:11px;color:var(--text-muted);font-weight:500;
  text-transform:uppercase;letter-spacing:.04em;
}
.stat-value{
  font-size:24px;font-weight:700;margin-top:4px;
  font-variant-numeric:tabular-nums;letter-spacing:var(--tracking-tight);
}
.stat-value.income{color:var(--income)}
.stat-value.expense{color:var(--expense)}

/* Entry list */
.entry-list{display:flex;flex-direction:column;gap:6px}

.entry{
  display:flex;align-items:center;gap:12px;
  padding:14px 16px;
  background:var(--surface);
  backdrop-filter:blur(var(--glass-blur)) saturate(200%);
  -webkit-backdrop-filter:blur(var(--glass-blur)) saturate(200%);
  border:1px solid var(--border);border-radius:var(--radius-sm);
  box-shadow:var(--shadow-sm);
  transition:border-color .15s,background .15s,transform .1s;
}
.entry:hover,.entry:focus-within{
  border-color:var(--accent);background:var(--accent-soft);
}
.entry:active{transform:scale(.992)}

.entry-day{
  width:38px;height:38px;border-radius:10px;flex-shrink:0;
  display:grid;place-items:center;font-weight:700;font-size:13px;
  font-family:var(--font-mono);
  background:var(--surface-inset);color:var(--text-secondary);
}
.entry-body{flex:1;min-width:0}
.entry-title{
  font-weight:600;font-size:13px;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
}
.entry-meta{font-size:11px;color:var(--text-muted);margin-top:2px;display:flex;align-items:center;gap:4px}
.entry-meta-icon{width:12px;height:12px;opacity:.5}
.entry-amount{
  font-weight:700;font-size:14px;font-variant-numeric:tabular-nums;
  white-space:nowrap;letter-spacing:var(--tracking-tight);
}
.entry-amount.in{color:var(--income)}
.entry-amount.out{color:var(--expense)}

/* Empty states */
.empty{text-align:center;padding:40px 20px;color:var(--text-muted)}
.empty-icon{display:block;width:48px;height:48px;margin:0 auto 16px;opacity:.35}
.empty-title{font-weight:600;font-size:15px;color:var(--text);margin-bottom:4px}
`;

export const STYLES_FORMS = `
/* ═══════════════════════════════════════════════
   Forms, Buttons, Modals
   ═══════════════════════════════════════════════ */

.btn{
  display:inline-flex;align-items:center;justify-content:center;gap:6px;
  padding:8px 16px;border-radius:var(--radius-sm);font-size:13px;font-weight:600;
  background:var(--surface-inset);color:var(--text);
  border:1px solid var(--border);
  transition:color .15s,background .15s,border-color .15s,transform .1s;
}
.btn:hover{border-color:var(--accent);color:var(--accent)}
.btn:active{transform:scale(.97)}
.btn[disabled]{opacity:.5;pointer-events:none}

.btn-primary{background:var(--accent);color:var(--accent-text);border-color:var(--accent)}
.btn-primary:hover{filter:brightness(1.12);color:var(--accent-text)}

.btn-danger{color:var(--expense)}
.btn-danger:hover{background:var(--expense-soft);border-color:var(--expense);color:var(--expense)}
.btn-danger-solid{background:var(--expense);color:#fff;border-color:var(--expense)}
.btn-danger-solid:hover{background:color-mix(in srgb,var(--expense) 85%,#000);color:#fff}

.btn-sm{padding:5px 12px;font-size:12px}

.form-status{min-height:20px;padding:4px 20px 0;color:var(--expense);font-size:12px;font-weight:500}

/* Form controls */
.form-group{margin-bottom:14px}
.form-label{display:block;font-size:12px;font-weight:500;color:var(--text-secondary);margin-bottom:5px}
.form-control{
  width:100%;padding:9px 13px;border-radius:var(--radius-sm);
  background:var(--surface-inset);border:1px solid var(--border);
  color:var(--text);transition:border-color .15s,background .15s;
}
.form-control:focus{outline:none;border-color:var(--accent);background:var(--accent-soft)}
.form-control::placeholder{color:var(--text-muted)}
textarea.form-control{resize:vertical;min-height:80px}
select.form-control{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:32px}

.form-row{display:grid;grid-template-columns:1fr;gap:12px}
@media(min-width:640px){.form-row.two{grid-template-columns:1fr 1fr}}

/* Radio group */
.radio-group{display:flex;gap:8px}
.radio-pill{
  flex:1;display:flex;align-items:center;justify-content:center;gap:6px;
  padding:10px 12px;border:1px solid var(--border);border-radius:var(--radius-sm);
  cursor:pointer;font-size:13px;font-weight:500;color:var(--text-secondary);
  transition:color .15s,background .15s,border-color .15s;
}
.radio-pill:has(input:checked){background:var(--accent-soft);border-color:var(--accent);color:var(--accent)}
.radio-pill input[type=radio]{accent-color:var(--accent)}

/* FAB */
.fab{
  position:fixed;bottom:24px;right:24px;z-index:100;
  width:52px;height:52px;border-radius:50%;
  background:var(--accent);color:var(--accent-text);
  display:grid;place-items:center;font-size:24px;line-height:1;
  box-shadow:0 8px 28px rgba(37,99,235,.35),var(--shadow-lg);
  border:1px solid rgba(255,255,255,.12);
  transition:transform .15s,box-shadow .15s,filter .15s;
}
.fab:hover{transform:translateY(-2px);filter:brightness(1.08)}
.fab:active{transform:scale(.94)}
@media(max-width:639px){.fab{right:18px;bottom:calc(18px + env(safe-area-inset-bottom))}}

/* Modals */
.modal-backdrop{
  position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.45);
  backdrop-filter:blur(6px);
  -webkit-backdrop-filter:blur(6px);
  display:grid;place-items:end center;
  overscroll-behavior:contain;
}
@media(min-width:640px){.modal-backdrop{place-items:center;padding:24px}}

.modal{
  width:100%;max-width:520px;max-height:90dvh;overflow-y:auto;
  overscroll-behavior:contain;
  background:var(--surface-raised);
  backdrop-filter:blur(28px) saturate(200%);
  -webkit-backdrop-filter:blur(28px) saturate(200%);
  border-radius:var(--radius-lg) var(--radius-lg) 0 0;
  box-shadow:var(--shadow-lg);border:1px solid var(--border-focus);
}
@media(min-width:640px){.modal{border-radius:var(--radius-lg)}}

.modal-head{
  display:flex;align-items:center;justify-content:space-between;
  padding:16px 20px;border-bottom:1px solid var(--border);
  position:sticky;top:0;background:inherit;z-index:1;
}
.modal-title{font-weight:700;font-size:15px;letter-spacing:var(--tracking-tight)}

.modal-body{padding:20px}

.modal-foot{
  padding:14px 20px;border-top:1px solid var(--border);
  display:flex;gap:8px;justify-content:flex-end;
  position:sticky;bottom:0;background:inherit;z-index:1;
}

/* Month nav */
.month-nav{display:flex;align-items:center;gap:8px;justify-content:space-between;margin:18px 0 10px}
.month-nav-title{font-weight:700;font-size:17px;letter-spacing:var(--tracking-tight)}
.month-nav-btn{
  padding:5px 11px;border-radius:8px;font-size:12px;
  background:var(--surface-inset);border:1px solid var(--border);
  transition:color .15s,background .15s,border-color .15s;
}
.month-nav-btn:hover{border-color:var(--accent);color:var(--accent)}

/* TTD */
.ttd-help{
  font-size:11px;color:var(--text-muted);margin-top:6px;
  line-height:1.65;
}
.ttd-help code{
  background:var(--surface-inset);padding:1px 5px;border-radius:3px;
  font-family:var(--font-mono);font-size:10px;
  border:1px solid var(--border);
}
.ttd-preview{
  margin-top:10px;padding:8px;border:1px solid var(--border);
  border-radius:var(--radius-sm);background:var(--surface-inset);
}
.ttd-preview-row{
  display:grid;grid-template-columns:80px 1fr auto;gap:8px;
  align-items:center;padding:6px 4px;border-bottom:1px solid var(--border);
  font-size:11px;
}
.ttd-preview-row:last-child{border-bottom:0}
.ttd-preview-row .income{color:var(--income)}
.ttd-preview-row .expense{color:var(--expense)}
.ttd-preview-row time{color:var(--text-muted);font-size:10px}
.ttd-preview-error{color:var(--expense)}
@media(max-width:560px){.ttd-preview-row{grid-template-columns:60px 1fr}.ttd-preview-row time{grid-column:2}}
`;

export const STYLES_CHARTS = `
/* ═══════════════════════════════════════════════
   Charts, Items, Misc
   ═══════════════════════════════════════════════ */

/* Items grid */
.items-grid{display:grid;grid-template-columns:1fr;gap:12px}
@media(min-width:640px){.items-grid{grid-template-columns:repeat(2,1fr)}}
@media(min-width:900px){.items-grid{grid-template-columns:repeat(3,1fr)}}

.item-card{padding:18px}
.item-card-title{font-weight:700;font-size:15px;margin-bottom:2px;letter-spacing:var(--tracking-tight)}
.item-card-meta{font-size:12px;color:var(--text-muted)}

.item-card-totals{display:flex;gap:14px;margin-top:12px;font-size:12px}
.item-card-totals strong{font-variant-numeric:tabular-nums}
.item-card-net{font-weight:700;font-variant-numeric:tabular-nums}

.item-card-actions{display:flex;gap:8px;margin-top:14px}
.item-card-actions .btn{flex:1}

/* Daily bar chart */
.chart-wrap{width:100%;overflow:visible}
.chart-row{display:flex;align-items:flex-end;gap:2px;height:140px}
.chart-bar{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px;justify-content:flex-end}
.chart-bar-in,.chart-bar-out{width:55%;border-radius:3px 3px 0 0;transition:opacity .15s}
.chart-bar-in{background:var(--income)}
.chart-bar-out{background:var(--expense)}
.chart-axis{display:flex;justify-content:space-between;margin-top:4px;font-size:10px;color:var(--text-muted)}

/* Breakdown */
.breakdown-row{
  display:flex;align-items:center;gap:12px;
  padding:9px 0;border-bottom:1px solid var(--border);
}
.breakdown-row:last-child{border-bottom:none}
.breakdown-label{
  flex:1;font-weight:500;font-size:13px;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
}
.breakdown-bar{
  height:7px;border-radius:4px;background:var(--surface-inset);
  overflow:hidden;flex:1;min-width:50px;
}
.breakdown-bar-fill{height:100%;background:var(--accent);border-radius:4px;transition:width .35s ease}
.breakdown-amt{font-variant-numeric:tabular-nums;font-size:12px;font-weight:600;white-space:nowrap}

/* Legend inline */
.legend-inline{display:flex;gap:14px;margin-top:10px;font-size:11px;color:var(--text-muted)}
.legend-dot{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:5px;vertical-align:middle}

/* Section heading */
.section-title{font-size:15px;font-weight:700;margin:24px 0 10px;letter-spacing:var(--tracking-tight)}
`;

export const STYLES_UTILS = `
/* ═══════════════════════════════════════════════
   Utilities & Accessibility
   ═══════════════════════════════════════════════ */

/* Theme toggle SVG icon */
.theme-icon-light{display:inline}
.theme-icon-dark{display:none}
[data-theme="dark"] .theme-icon-light{display:none}
[data-theme="dark"] .theme-icon-dark{display:inline}

/* Calendar toggle */
.cal-toggle{
  width:36px;height:36px;border-radius:50%;
  display:grid;place-items:center;font-size:11px;font-weight:700;
  font-family:var(--font-mono);
  background:var(--surface-inset);color:var(--text-secondary);
  border:1px solid var(--border);
  transition:color .15s,background .15s,border-color .15s;
}
.cal-toggle:hover{color:var(--accent);background:var(--accent-soft);border-color:var(--accent)}

/* Motion */
@media(prefers-reduced-motion:reduce){
  *,*::before,*::after{
    animation-duration:.01ms !important;animation-iteration-count:1 !important;
    scroll-behavior:auto !important;transition-duration:.01ms !important;
  }
}

/* Glass fallback */
@supports not (backdrop-filter:blur(1px)){
  .topbar,.tabs,.card,.stat,.entry,.modal{background:var(--surface)}
}

[hidden]{display:none !important}
`;

export const ALL_STYLES = STYLES + STYLES_NAV + STYLES_CARDS + STYLES_FORMS + STYLES_CHARTS + STYLES_UTILS;