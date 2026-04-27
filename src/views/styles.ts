export const STYLES = `
/*
╔══════════════════════════════════════════════════════╗
║  LogPenny · Ledger Book                              ║
║  Warm paper · ruled lines · ink precision            ║
║  Type: Fraunces (display) + Inter (body)              ║
║       + JetBrains Mono (amounts) + Vazirmatn (فارسی) ║
╚══════════════════════════════════════════════════════╝
*/

/* ── Tokens: Light (day ledger) ── */
:root {
  color-scheme: light;
  --paper:        #E8EEF9;
  --paper-card:   rgba(255,255,255,.52);
  --paper-inset:  rgba(255,255,255,.42);
  --ink:          #14213D;
  --ink-muted:    #667085;
  --ink-faint:    #98A2B3;
  --rule:         #DCE4EF;
  --accent:       #3158D8;
  --accent-text:  #FFFFFF;
  --accent-soft:  rgba(49,88,216,.08);
  --income:       #079669;
  --income-soft:  rgba(7,150,105,.09);
  --expense:      #E05252;
  --expense-soft: rgba(224,82,82,.09);
  --glass-border: rgba(255,255,255,.55);
  --glass-hi:     inset 0 1px 0 rgba(255,255,255,.55);
  --shadow-sm:   0 1px 2px rgba(20,33,61,.04);
  --shadow:      0 8px 32px rgba(20,33,61,.10);
  --shadow-lg:   0 24px 64px rgba(20,33,61,.16);
  --radius-sm:   10px;
  --radius:      16px;
  --radius-lg:   22px;
  --max-w:       896px;
  --font-display: 'Fraunces', 'Georgia', 'Times New Roman', serif;
  --font-body:    'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  --font-mono:    'JetBrains Mono', 'Cascadia Code', 'Fira Code', ui-monospace, monospace;
  --font-persian: 'Vazirmatn', var(--font-body);
  --tracking-tight: -.018em;
  --leading:      1.55;
  --ruling-size:  22px;
}

/* ── Tokens: Dark (night ledger) ── */
[data-theme="dark"] body{
  background-image:
    radial-gradient(circle at 12% -5%, rgba(49,88,216,.35), transparent 34rem),
    radial-gradient(circle at 88% 10%, rgba(78,213,170,.16), transparent 30rem),
    radial-gradient(circle at 15% 95%, rgba(255,133,133,.12), transparent 32rem),
    radial-gradient(circle at 85% 75%, rgba(123,150,255,.24), transparent 34rem);
}
[data-theme="dark"] {
  color-scheme: dark;
  --paper:        #070B16;
  --paper-card:   rgba(23,33,56,.40);
  --paper-inset:  rgba(255,255,255,.06);
  --ink:          #F5F8FF;
  --ink-muted:    #A7B2C7;
  --ink-faint:    #66738C;
  --rule:         #263653;
  --accent:       #7B96FF;
  --accent-text:  #08101F;
  --accent-soft:  rgba(123,150,255,.12);
  --income:       #4ED5AA;
  --income-soft:  rgba(78,213,170,.12);
  --expense:      #FF8585;
  --expense-soft: rgba(255,133,133,.12);
  --glass-border: rgba(255,255,255,.10);
  --glass-hi:     inset 0 1px 0 rgba(255,255,255,.12);
  --shadow-sm:   0 1px 2px rgba(0,0,0,.2);
  --shadow:      0 12px 32px rgba(0,0,0,.28);
  --shadow-lg:   0 24px 64px rgba(0,0,0,.45);
}

/* ── Reset & Base ── */
*,*::before,*::after{box-sizing:border-box}
html,body{margin:0;padding:0}
html{touch-action:manipulation;-webkit-tap-highlight-color:transparent}
body{
  font-family:var(--font-body);
  font-size:14px;line-height:var(--leading);
  background-color:var(--paper);
  background-image:
    radial-gradient(circle at 12% -5%, rgba(49,88,216,.40), transparent 34rem),
    radial-gradient(circle at 88% 10%, rgba(7,150,105,.28), transparent 30rem),
    radial-gradient(circle at 15% 95%, rgba(224,82,82,.18), transparent 32rem),
    radial-gradient(circle at 85% 75%, rgba(123,150,255,.26), transparent 34rem);
  background-attachment:fixed;
  background-size:100% 100%;
  color:var(--ink);
  -webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;
  min-height:100vh;min-height:100dvh;
}
a{color:inherit;text-decoration:none}
button{font-family:inherit;cursor:pointer;border:none;background:none;color:inherit;font-size:inherit}
input,textarea,select{font-family:inherit;font-size:inherit}
img{max-width:100%;height:auto}

/* ── Focus ── */
:focus-visible{
  outline:2px solid var(--accent);
  outline-offset:2px;border-radius:2px;
}

/* ── Layout Shell ── */
.app-shell{max-width:var(--max-w);margin:0 auto;padding:0 16px 120px}
@media(min-width:768px){.app-shell{padding:0 24px 96px}}
`;

export const STYLES_NAV = `
/* ═══════════ TopBar + Tabs ═══════════ */

.topbar{
  position:sticky;top:0;z-index:50;
  background:color-mix(in srgb,var(--paper-card) 72%,transparent);
  border-bottom:1px solid var(--glass-border);
  backdrop-filter:blur(20px) saturate(180%);
  -webkit-backdrop-filter:blur(20px) saturate(180%);
  box-shadow:var(--glass-hi);
}
.topbar-inner{
  max-width:var(--max-w);margin:0 auto;
  display:flex;align-items:center;gap:10px;
  padding:10px 16px;
}
@media(min-width:768px){.topbar-inner{padding:12px 24px}}

.brand{
  font-family:var(--font-display);font-weight:600;font-size:18px;
  letter-spacing:var(--tracking-tight);
  display:flex;align-items:center;gap:9px;color:var(--ink);
}
.brand-mark{
  width:26px;height:26px;border-radius:4px;
  background:var(--accent);
  display:grid;place-items:center;color:var(--accent-text);
  font-family:var(--font-mono);font-size:13px;font-weight:700;
}
.topbar-spacer{flex:1}

.account-switch{display:flex;gap:4px}
.account-chip{
  padding:4px 10px;border-radius:8px;font-size:11px;font-weight:500;
  background:var(--paper-inset);color:var(--ink-muted);
  border:1px solid var(--glass-border);
  backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
  transition:color .15s,background .15s,border-color .15s;
}
.account-chip.active{background:var(--accent);color:var(--accent-text);border-color:var(--accent)}

.icon-btn{
  width:34px;height:34px;border-radius:9px;display:grid;place-items:center;
  background:var(--paper-inset);color:var(--ink-muted);
  border:1px solid var(--glass-border);
  backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
  transition:color .15s,background .15s,border-color .15s;
}
.icon-btn:hover{color:var(--accent);background:var(--accent-soft);border-color:var(--accent)}
.icon-btn svg{width:16px;height:16px}

/* Tabs */
.tabs{
  display:flex;gap:0;padding:0 16px;max-width:var(--max-w);margin:0 auto;
  background:color-mix(in srgb,var(--paper-card) 70%,transparent);
  border-bottom:1px solid var(--glass-border);
  backdrop-filter:blur(20px) saturate(180%);
  -webkit-backdrop-filter:blur(20px) saturate(180%);
}
@media(min-width:768px){.tabs{padding:0 24px}}
.tab{
  padding:10px 16px;font-size:13px;font-weight:500;color:var(--ink-muted);
  border-bottom:2px solid transparent;transition:color .15s,border-color .15s;
}
.tab:hover{color:var(--ink)}
.tab.active{color:var(--accent);border-bottom-color:var(--accent)}
`;

export const STYLES_CARDS = `
/* ═══════════ Cards, Stats, Entries ═══════════ */

.card{
  background:var(--paper-card);
  border:1px solid var(--glass-border);border-radius:var(--radius);
  box-shadow:var(--shadow),var(--glass-hi);padding:20px;
  backdrop-filter:blur(22px) saturate(160%);
  -webkit-backdrop-filter:blur(22px) saturate(160%);
}
@media(min-width:768px){.card{padding:24px}}

.card-title{
  font-family:var(--font-display);font-weight:600;font-size:14px;
  color:var(--ink-muted);margin:0 0 16px;letter-spacing:.02em;
}

/* Stats */
.stats{
  display:grid;grid-template-columns:1fr;gap:10px;
  margin:14px 0;
}
@media(min-width:640px){.stats{grid-template-columns:repeat(3,1fr)}}

.stat{
  background:var(--paper-card);
  border:1px solid var(--glass-border);border-radius:var(--radius);
  padding:18px;box-shadow:var(--shadow-sm),var(--glass-hi);
  backdrop-filter:blur(22px) saturate(160%);
  -webkit-backdrop-filter:blur(22px) saturate(160%);
}
.stat-label{
  font-family:var(--font-display);font-size:11px;font-weight:600;
  color:var(--ink-muted);text-transform:uppercase;letter-spacing:.06em;
}
.stat-value{
  font-family:var(--font-mono);font-size:22px;font-weight:600;
  margin-top:4px;font-variant-numeric:tabular-nums;letter-spacing:-.02em;
}
.stat-value.income{color:var(--income)}
.stat-value.expense{color:var(--expense)}

/* Entry list */
.entry-list{display:flex;flex-direction:column;gap:6px}

.entry{
  display:flex;align-items:center;gap:0;
  padding:4px 8px;
  background:var(--paper-card);
  border:1px solid var(--glass-border);border-radius:var(--radius-sm);
  box-shadow:var(--shadow-sm),var(--glass-hi);
  backdrop-filter:blur(16px) saturate(150%);
  -webkit-backdrop-filter:blur(16px) saturate(150%);
  transition:border-color .15s,background .15s,transform .1s;
  width:100%;text-align:left;
}
.entry:hover,.entry:focus-within{
  border-color:var(--accent);background:var(--accent-soft);
}
.entry-main{
  display:flex;align-items:center;gap:12px;flex:1;min-width:0;
  padding:9px 8px 9px 8px;border:0;background:transparent;
  color:inherit;text-align:left;cursor:pointer;
}
.entry-main:focus-visible{outline:2px solid var(--accent);outline-offset:-3px;border-radius:var(--radius-sm)}
.entry:active{transform:scale(.992)}

.entry-day{
  width:36px;height:36px;border-radius:10px;flex-shrink:0;
  display:grid;place-items:center;font-weight:600;font-size:12px;
  font-family:var(--font-mono);
  background:var(--paper-inset);color:var(--ink-muted);
  border:1px solid var(--glass-border);
  box-shadow:var(--glass-hi);
}
.entry-body{flex:1;min-width:0}
.entry-title{
  font-weight:600;font-size:13px;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
}
.entry-meta{
  font-size:11px;color:var(--ink-muted);margin-top:2px;
  display:flex;align-items:center;gap:4px;
}
.entry-meta-dot{opacity:.3;margin:0 1px}
.entry-amount{
  font-family:var(--font-mono);font-weight:600;font-size:15px;
  font-variant-numeric:tabular-nums;white-space:nowrap;letter-spacing:-.02em;
}
.entry-amount.in{color:var(--income)}
.entry-amount.out{color:var(--expense)}

.entry-income{border-left:3px solid var(--income)}
.entry-expense{border-left:3px solid var(--expense)}
.entry-actions{display:flex;gap:2px;margin-right:8px;flex-shrink:0;opacity:0;transition:opacity .15s}
.entry:hover .entry-actions,
.entry:focus-within .entry-actions{opacity:1}
@media(hover:none){.entry-actions{opacity:1}}
.entry-action-btn{
  width:36px;height:36px;display:flex;align-items:center;justify-content:center;
  border:none;background:transparent;color:var(--ink-muted);
  border-radius:50%;cursor:pointer;
  transition:color .15s,background .15s;
}
.entry-action-btn:hover{color:var(--ink);background:rgba(0,0,0,.06)}
.entry-action-btn svg{width:14px;height:14px}
.entry-action-del:hover{color:var(--expense);background:rgba(220,38,38,.08)}

/* Empty */
.empty{text-align:center;padding:40px 20px;color:var(--ink-muted)}
.empty-icon{display:block;width:40px;height:40px;margin:0 auto 12px;opacity:.3}
.empty-title{font-family:var(--font-display);font-weight:600;font-size:16px;color:var(--ink);margin-bottom:4px}
`;

export const STYLES_FORMS = `
/* ═══════════ Forms, Buttons, Modals ═══════════ */

.btn{
  display:inline-flex;align-items:center;justify-content:center;gap:6px;
  padding:8px 16px;border-radius:var(--radius-sm);font-size:12px;font-weight:600;
  font-family:var(--font-body);
  background:var(--paper-inset);color:var(--ink);
  border:1px solid var(--glass-border);
  box-shadow:var(--glass-hi);
  backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
  transition:color .15s,background .15s,border-color .15s,transform .1s;
}
.btn:hover{border-color:var(--accent);color:var(--accent)}
.btn:active{transform:scale(.97)}
.btn[disabled]{opacity:.45;pointer-events:none}

.btn-primary{background:var(--accent);color:var(--accent-text);border-color:var(--accent)}
.btn-primary:hover{filter:brightness(1.1);color:var(--accent-text)}

.btn-danger{color:var(--expense)}
.btn-danger:hover{background:var(--expense-soft);border-color:var(--expense);color:var(--expense)}
.btn-danger-solid{background:var(--expense);color:#fff;border-color:var(--expense)}
.btn-danger-solid:hover{filter:brightness(.92);color:#fff}

.btn-sm{padding:5px 12px;font-size:11px}

.form-status{min-height:20px;padding:4px 20px 0;color:var(--expense);font-size:11px;font-weight:500}

/* Controls */
.form-group{margin-bottom:14px}
.form-label{
  display:block;font-size:11px;font-weight:600;color:var(--ink-muted);
  margin-bottom:5px;text-transform:uppercase;letter-spacing:.04em;
  font-family:var(--font-body);
}
.form-control{
  width:100%;padding:9px 13px;border-radius:var(--radius-sm);
  background:var(--paper-inset);border:1px solid var(--glass-border);
  color:var(--ink);transition:border-color .15s,background .15s;
  backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
}
.form-control:focus{outline:none;border-color:var(--accent);background:var(--accent-soft)}
.form-control::placeholder{color:var(--ink-faint)}
textarea.form-control{resize:vertical;min-height:80px}
select.form-control{
  appearance:none;
  background-image:url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%2378736C%27 stroke-width=%272%27%3E%3Cpath d=%27M6 9l6 6 6-6%27/%3E%3C/svg%3E');
  background-repeat:no-repeat;background-position:right 12px center;padding-right:32px;
}

.form-row{display:grid;grid-template-columns:1fr;gap:12px}
@media(min-width:640px){.form-row.two{grid-template-columns:1fr 1fr}}

/* Radio */
.radio-group{display:flex;gap:6px}
.radio-pill{
  flex:1;display:flex;align-items:center;justify-content:center;gap:6px;
  padding:10px 12px;border:1px solid var(--glass-border);border-radius:var(--radius-sm);
  cursor:pointer;font-size:12px;font-weight:500;color:var(--ink-muted);
  transition:color .15s,background .15s,border-color .15s;
  backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
}
.radio-pill:has(input:checked){background:var(--accent-soft);border-color:var(--accent);color:var(--accent)}
.radio-pill input[type=radio]{accent-color:var(--accent)}

/* FAB */
.fab{
  position:fixed;bottom:24px;right:24px;z-index:100;
  width:52px;height:52px;border-radius:50%;
  background:color-mix(in srgb,var(--accent) 82%,transparent);
  color:var(--accent-text);
  display:grid;place-items:center;
  box-shadow:0 8px 28px rgba(49,88,216,.45),var(--shadow-lg),var(--glass-hi);
  border:1px solid var(--glass-border);
  backdrop-filter:blur(12px) saturate(160%);
  -webkit-backdrop-filter:blur(12px) saturate(160%);
  transition:transform .15s,box-shadow .15s,filter .15s;
}
.fab:hover{transform:translateY(-2px);filter:brightness(1.06)}
.fab:active{transform:scale(.94)}
@media(max-width:639px){.fab{right:18px;bottom:calc(18px + env(safe-area-inset-bottom))}}

/* Modals */
.modal-backdrop{
  position:fixed;inset:0;z-index:200;
  background:color-mix(in srgb,var(--ink) 30%,transparent);
  backdrop-filter:blur(8px);
  -webkit-backdrop-filter:blur(8px);
  display:grid;place-items:end center;
  overscroll-behavior:contain;
}
@media(min-width:640px){.modal-backdrop{place-items:center;padding:24px}}

.modal{
  position:relative;
  width:100%;max-width:520px;max-height:90dvh;overflow-y:auto;
  overscroll-behavior:contain;
  background:linear-gradient(165deg,
    color-mix(in srgb,var(--paper-card) 62%,transparent),
    color-mix(in srgb,var(--paper-card) 38%,color-mix(in srgb,var(--accent) 6%,transparent)));
  border-radius:var(--radius-lg) var(--radius-lg) 0 0;
  box-shadow:var(--shadow-lg),var(--glass-hi);border:1px solid var(--glass-border);
  backdrop-filter:blur(44px) saturate(190%);
  -webkit-backdrop-filter:blur(44px) saturate(190%);
}
.modal::before{
  content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;
  background:
    radial-gradient(circle at 18% -12%, color-mix(in srgb,var(--accent) 9%,transparent), transparent 46%),
    radial-gradient(circle at 88% 108%, color-mix(in srgb,var(--income) 6%,transparent), transparent 44%);
  z-index:0;
}
.modal>*{position:relative;z-index:1}
@media(min-width:640px){.modal{border-radius:var(--radius-lg)}}

.modal-head{
  display:flex;align-items:center;justify-content:space-between;
  padding:16px 20px;border-bottom:1px solid var(--glass-border);
  position:sticky;top:0;z-index:2;
  background:linear-gradient(180deg,color-mix(in srgb,var(--paper-card) 80%,transparent),color-mix(in srgb,var(--paper-card) 35%,transparent));
  backdrop-filter:blur(24px) saturate(180%);
  -webkit-backdrop-filter:blur(24px) saturate(180%);
  box-shadow:var(--glass-hi);
}
.modal-title{
  font-family:var(--font-display);font-weight:600;font-size:16px;letter-spacing:var(--tracking-tight);
  display:flex;align-items:center;gap:8px;
}
.modal-title::before{
  content:'';width:4px;height:16px;border-radius:2px;
  background:linear-gradient(180deg,var(--accent),color-mix(in srgb,var(--accent) 40%,transparent));
  box-shadow:0 0 12px color-mix(in srgb,var(--accent) 60%,transparent);
}

.modal-body{padding:20px}

.modal-foot{
  padding:14px 20px;border-top:1px solid var(--glass-border);
  display:flex;gap:8px;justify-content:flex-end;
  position:sticky;bottom:0;z-index:2;
  background:linear-gradient(0deg,color-mix(in srgb,var(--paper-card) 80%,transparent),color-mix(in srgb,var(--paper-card) 35%,transparent));
  backdrop-filter:blur(24px) saturate(180%);
  -webkit-backdrop-filter:blur(24px) saturate(180%);
  box-shadow:0 -1px 0 var(--glass-border);
}

/* Month nav */
.month-nav{display:flex;align-items:center;gap:8px;justify-content:space-between;margin:18px 0 10px}
.month-nav-title{
  font-family:var(--font-display);font-weight:600;font-size:18px;
  letter-spacing:var(--tracking-tight);
}
.month-nav-btn{
  padding:5px 11px;border-radius:8px;font-size:12px;
  background:var(--paper-inset);border:1px solid var(--glass-border);
  backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
  box-shadow:var(--glass-hi);
  transition:color .15s,border-color .15s;
}
.month-nav-btn:hover{border-color:var(--accent);color:var(--accent)}

/* TTD */
.ttd-help{
  font-size:11px;color:var(--ink-muted);margin-top:6px;line-height:1.65;
}
.ttd-help code{
  background:var(--paper-inset);padding:1px 5px;border-radius:4px;
  font-family:var(--font-mono);font-size:10px;border:1px solid var(--glass-border);
  font-weight:500;
}
.ttd-preview{
  margin-top:10px;padding:8px;border:1px solid var(--glass-border);
  border-radius:var(--radius-sm);background:var(--paper-inset);
  backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
}
.ttd-preview-row{
  display:grid;grid-template-columns:80px 1fr auto;gap:8px;
  align-items:center;padding:6px 4px;border-bottom:1px solid var(--rule);
  font-size:11px;
}
.ttd-preview-row:last-child{border-bottom:0}
.ttd-preview-row .income{color:var(--income)}
.ttd-preview-row .expense{color:var(--expense)}
.ttd-preview-row time{color:var(--ink-muted);font-size:10px}
.ttd-preview-error{color:var(--expense)}
@media(max-width:560px){.ttd-preview-row{grid-template-columns:60px 1fr}.ttd-preview-row time{grid-column:2}}
`;

export const STYLES_CHARTS = `
/* ═══════════ Charts, Items ═══════════ */

/* Items */
.items-grid{display:grid;grid-template-columns:1fr;gap:12px}
@media(min-width:640px){.items-grid{grid-template-columns:repeat(2,1fr)}}
@media(min-width:900px){.items-grid{grid-template-columns:repeat(3,1fr)}}

.item-card{padding:18px;position:relative;backdrop-filter:blur(22px) saturate(160%);-webkit-backdrop-filter:blur(22px) saturate(160%)}
.item-card-close{
  position:absolute;top:12px;right:12px;
  width:28px;height:28px;display:flex;align-items:center;justify-content:center;
  border:none;background:transparent;color:var(--ink-muted);
  border-radius:50%;cursor:pointer;opacity:.4;
  transition:opacity .15s,color .15s,background .15s;
}
.item-card-close:hover{opacity:1;color:var(--expense);background:rgba(220,38,38,.08)}
.item-card-close svg{width:14px;height:14px}
.item-card-title{font-weight:600;font-size:15px;margin-bottom:2px}
.item-card-meta{font-size:12px;color:var(--ink-muted)}

.item-card-totals{display:flex;gap:14px;margin-top:12px;font-size:12px}
.item-card-totals strong{font-variant-numeric:tabular-nums;font-family:var(--font-mono);font-weight:600}
.item-card-net{font-weight:600;font-family:var(--font-mono);font-variant-numeric:tabular-nums}

.item-card-actions{display:flex;gap:8px;margin-top:14px}
.item-card-actions .btn{flex:1}

/* Daily bar chart */
.chart-wrap{width:100%;overflow:visible}
.chart-row{display:flex;align-items:flex-end;gap:2px;height:140px}
.chart-bar{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px;justify-content:flex-end}
.chart-bar-in,.chart-bar-out{width:55%;border-radius:2px 2px 0 0;transition:opacity .15s}
.chart-bar-in{background:var(--income)}
.chart-bar-out{background:var(--expense)}
.chart-axis{display:flex;justify-content:space-between;margin-top:4px;font-size:10px;color:var(--ink-muted);font-family:var(--font-mono)}

/* Breakdown */
.breakdown-row{
  display:flex;align-items:center;gap:12px;
  padding:9px 0;border-bottom:1px solid var(--rule);
}
.breakdown-row:last-child{border-bottom:none}
.breakdown-label{
  flex:1;font-weight:500;font-size:13px;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
}
.breakdown-bar{
  height:6px;border-radius:3px;background:var(--paper-inset);
  border:1px solid var(--glass-border);
  overflow:hidden;flex:1;min-width:50px;
}
.breakdown-bar-fill{height:100%;background:var(--accent);border-radius:3px;transition:width .4s ease}
.breakdown-amt{
  font-family:var(--font-mono);font-variant-numeric:tabular-nums;
  font-size:12px;font-weight:600;white-space:nowrap;
}

/* Legend */
.legend-inline{display:flex;gap:14px;margin-top:10px;font-size:11px;color:var(--ink-muted)}
.legend-dot{display:inline-block;width:8px;height:8px;border-radius:2px;margin-right:5px;vertical-align:middle}

.section-title{
  font-family:var(--font-display);font-weight:600;font-size:16px;
  margin:24px 0 10px;letter-spacing:var(--tracking-tight);
}
`;

export const STYLES_UTILS = `
/* ═══════════ Utilities ═══════════ */

.theme-icon-light{display:inline}
.theme-icon-dark{display:none}
[data-theme="dark"] .theme-icon-light{display:none}
[data-theme="dark"] .theme-icon-dark{display:inline}

.cal-toggle{
  width:34px;height:34px;border-radius:9px;
  display:grid;place-items:center;font-size:11px;font-weight:700;
  font-family:var(--font-mono);
  background:var(--paper-inset);color:var(--ink-muted);
  border:1px solid var(--glass-border);
  backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
  transition:color .15s,background .15s,border-color .15s;
}
.cal-toggle:hover{color:var(--accent);background:var(--accent-soft);border-color:var(--accent)}

.persian{font-family:var(--font-persian)}

[hidden]{display:none !important}

/* ═══════════ Animation System ═══════════ */

/* ── Entry stagger reveal ── */
.anim-entry{
  opacity:0;transform:translateY(12px);
  animation:entry-in .35s cubic-bezier(.22,.61,.36,1) forwards;
}
@keyframes entry-in{
  to{opacity:1;transform:translateY(0)}
}

/* ── Stat card reveal ── */
.anim-stat{
  opacity:0;transform:translateY(8px);
  animation:stat-in .3s .08s cubic-bezier(.22,.61,.36,1) forwards;
}
.anim-stat:nth-child(2){animation-delay:.14s}
.anim-stat:nth-child(3){animation-delay:.20s}
@keyframes stat-in{
  to{opacity:1;transform:translateY(0)}
}

/* ── Card reveal ── */
.anim-card-up{
  opacity:0;transform:translateY(16px);
  animation:card-up .45s .25s cubic-bezier(.22,.61,.36,1) forwards;
}
@keyframes card-up{
  to{opacity:1;transform:translateY(0)}
}

/* ── Item card reveal ── */
.anim-item-card{
  opacity:0;transform:translateY(10px);
  animation:item-in .3s calc(var(--i,0)*.06s + .15s) cubic-bezier(.22,.61,.36,1) forwards;
}
@keyframes item-in{
  to{opacity:1;transform:translateY(0)}
}

/* ── Card hover lift ── */
.card,.stat,.item-card,.entry{
  transition:transform .2s cubic-bezier(.22,.61,.36,1),
             box-shadow .2s cubic-bezier(.22,.61,.36,1),
             border-color .15s,background .15s;
}
.card:hover,.stat:hover{
  transform:translateY(-2px);
  box-shadow:0 4px 20px rgba(30,26,23,.12),var(--shadow);
}

/* ── Chart bar grow ── */
.chart-bar-in,.chart-bar-out{
  animation:bar-grow .5s .3s cubic-bezier(.22,.61,.36,1) backwards;
  transform-origin:bottom;
}
@keyframes bar-grow{
  from{transform:scaleY(0)}
  to{transform:scaleY(1)}
}

/* ── Breakdown row reveal ── */
.breakdown-row{
  opacity:0;transform:translateX(-8px);
  animation:breakdown-in .3s calc(var(--br-i,0)*.05s + .3s) cubic-bezier(.22,.61,.36,1) forwards;
}
@keyframes breakdown-in{
  to{opacity:1;transform:translateX(0)}
}

/* ── Modal: backdrop fade + slide up ── */
.modal-backdrop:not([hidden]){
  animation:backdrop-in .2s cubic-bezier(.22,.61,.36,1) forwards;
}
.modal-backdrop:not([hidden]) .modal{
  animation:modal-up .3s .05s cubic-bezier(.22,.61,.36,1) forwards;
}
@keyframes backdrop-in{
  from{opacity:0}
  to{opacity:1}
}
@keyframes modal-up{
  from{opacity:0;transform:translateY(40px)}
  to{opacity:1;transform:translateY(0)}
}
@media(min-width:640px){
  @keyframes modal-up{
    from{opacity:0;transform:translateY(20px) scale(.97)}
    to{opacity:1;transform:translateY(0) scale(1)}
  }
}

/* ── FAB entrance + pulse ── */
.fab{
  animation:fab-in .35s .4s cubic-bezier(.22,.61,.36,1) backwards;
}
@keyframes fab-in{
  from{opacity:0;transform:scale(.7) translateY(12px)}
  to{opacity:1;transform:scale(1) translateY(0)}
}
.fab::after{
  content:'';position:absolute;inset:-4px;border-radius:50%;
  border:2px solid var(--accent);opacity:0;
  animation:fab-pulse 2.5s 1.5s ease-out infinite;
  pointer-events:none;
}
@keyframes fab-pulse{
  0%{opacity:.4;transform:scale(1)}
  100%{opacity:0;transform:scale(1.5)}
}

/* ── Theme transition ── */
html{
  transition:background-color .4s ease,color .3s ease;
}
*,*::before,*::after{
  transition-timing-function:cubic-bezier(.22,.61,.36,1);
}

/* ── Ruled-line parallax on scroll ── */
body{
  background-attachment:fixed;
  animation:rule-drift 120s linear infinite;
}
@keyframes rule-drift{
  0%,100%{background-position-y:0}
  50%{background-position-y:calc(var(--ruling-size) * 0.5)}
}

/* ── Button ink press ── */
.btn:active:not([disabled]){
  animation:ink-press .25s cubic-bezier(.22,.61,.36,1);
}
@keyframes ink-press{
  0%{transform:scale(1)}
  30%{transform:scale(.94)}
  100%{transform:scale(.97)}
}

/* ── Empty state ── */
.empty-icon{
  animation:empty-float 3s ease-in-out infinite;
}
@keyframes empty-float{
  0%,100%{transform:translateY(0)}
  50%{transform:translateY(-6px)}
}

/* ── Brand mark shimmer ── */
.brand-mark{
  position:relative;overflow:hidden;
}
.brand-mark::after{
  content:'';position:absolute;top:0;left:-100%;width:60%;height:100%;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.3),transparent);
  animation:shimmer 3s 2s ease-in-out infinite;
}
@keyframes shimmer{
  0%{left:-100%}
  40%{left:120%}
  100%{left:120%}
}

/* ── Section slide-in (for items page header) ── */
.slide-in{
  opacity:0;transform:translateY(-6px);
  animation:slide-in .3s .1s cubic-bezier(.22,.61,.36,1) forwards;
}
@keyframes slide-in{
  to{opacity:1;transform:translateY(0)}
}

/* ── Motion reduction ── */
@media(prefers-reduced-motion:reduce){
  *,*::before,*::after{
    animation-duration:.01ms !important;animation-iteration-count:1 !important;
    scroll-behavior:auto !important;transition-duration:.01ms !important;
  }
  .anim-entry,.anim-stat,.anim-card-up,.anim-item-card,
  .breakdown-row,.chart-bar-in,.chart-bar-out,
  .modal-backdrop:not([hidden]) .modal,
  .fab,.slide-in{
    opacity:1;transform:none;
  }
}
`;

export const ALL_STYLES = STYLES + STYLES_NAV + STYLES_CARDS + STYLES_FORMS + STYLES_CHARTS + STYLES_UTILS;