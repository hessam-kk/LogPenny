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
  --paper:        #F9F5EF;
  --paper-card:   #FFFCF7;
  --paper-inset:  #F3EFE8;
  --ink:          #1E1A17;
  --ink-muted:    #78736C;
  --ink-faint:    #B8B3AA;
  --rule:         #E4DED4;
  --accent:       #4A5A90;
  --accent-text:  #FFFFFF;
  --accent-soft:  rgba(74,90,144,.08);
  --income:       #1B7A5D;
  --income-soft:  rgba(27,122,93,.08);
  --expense:      #C43E3E;
  --expense-soft: rgba(196,62,62,.08);
  --shadow-sm:   0 1px 2px rgba(30,26,23,.04);
  --shadow:      0 1px 3px rgba(30,26,23,.05), 0 2px 8px rgba(30,26,23,.04);
  --shadow-lg:   0 4px 24px rgba(30,26,23,.07), 0 8px 32px rgba(30,26,23,.05);
  --radius-sm:   8px;
  --radius:      12px;
  --radius-lg:   16px;
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
[data-theme="dark"] {
  color-scheme: dark;
  --paper:        #1C1815;
  --paper-card:   #25221E;
  --paper-inset:  #1F1C19;
  --ink:          #EFE9E0;
  --ink-muted:    #928D86;
  --ink-faint:    #5C5853;
  --rule:         #2E2B26;
  --accent:       #8AA0D4;
  --accent-text:  #1C1815;
  --accent-soft:  rgba(138,160,212,.10);
  --income:       #5BB89B;
  --income-soft:  rgba(91,184,155,.10);
  --expense:      #E07070;
  --expense-soft: rgba(224,112,112,.10);
  --shadow-sm:   0 1px 2px rgba(0,0,0,.20);
  --shadow:      0 1px 3px rgba(0,0,0,.25), 0 2px 8px rgba(0,0,0,.20);
  --shadow-lg:   0 4px 24px rgba(0,0,0,.35), 0 8px 32px rgba(0,0,0,.25);
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
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent calc(var(--ruling-size) - 1px),
      var(--rule) calc(var(--ruling-size) - 1px),
      var(--rule) var(--ruling-size)
    );
  background-attachment:fixed;
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
  background:var(--paper-card);
  border-bottom:1px solid var(--rule);
  backdrop-filter:blur(12px);
  -webkit-backdrop-filter:blur(12px);
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
  padding:4px 10px;border-radius:6px;font-size:11px;font-weight:500;
  background:var(--paper-inset);color:var(--ink-muted);
  border:1px solid var(--rule);
  transition:color .15s,background .15s,border-color .15s;
}
.account-chip.active{background:var(--accent);color:var(--accent-text);border-color:var(--accent)}

.icon-btn{
  width:34px;height:34px;border-radius:6px;display:grid;place-items:center;
  background:var(--paper-inset);color:var(--ink-muted);
  border:1px solid var(--rule);
  transition:color .15s,background .15s,border-color .15s;
}
.icon-btn:hover{color:var(--accent);background:var(--accent-soft);border-color:var(--accent)}
.icon-btn svg{width:16px;height:16px}

/* Tabs */
.tabs{
  display:flex;gap:0;padding:0 16px;max-width:var(--max-w);margin:0 auto;
  background:var(--paper-card);
  border-bottom:1px solid var(--rule);
  backdrop-filter:blur(12px);
  -webkit-backdrop-filter:blur(12px);
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
  border:1px solid var(--rule);border-radius:var(--radius);
  box-shadow:var(--shadow);padding:20px;
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
  border:1px solid var(--rule);border-radius:var(--radius-sm);
  padding:16px;box-shadow:var(--shadow-sm);
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
  display:flex;align-items:center;gap:12px;
  padding:13px 16px;
  background:var(--paper-card);
  border:1px solid var(--rule);border-radius:var(--radius-sm);
  box-shadow:var(--shadow-sm);
  transition:border-color .15s,background .15s,transform .1s;
  width:100%;text-align:left;
}
.entry:hover,.entry:focus-visible{
  border-color:var(--accent);background:var(--accent-soft);
}
.entry:active{transform:scale(.992)}

.entry-day{
  width:36px;height:36px;border-radius:6px;flex-shrink:0;
  display:grid;place-items:center;font-weight:600;font-size:12px;
  font-family:var(--font-mono);
  background:var(--paper-inset);color:var(--ink-muted);
  border:1px solid var(--rule);
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
  border:1px solid var(--rule);
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
  background:var(--paper-inset);border:1px solid var(--rule);
  color:var(--ink);transition:border-color .15s,background .15s;
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
  padding:10px 12px;border:1px solid var(--rule);border-radius:var(--radius-sm);
  cursor:pointer;font-size:12px;font-weight:500;color:var(--ink-muted);
  transition:color .15s,background .15s,border-color .15s;
}
.radio-pill:has(input:checked){background:var(--accent-soft);border-color:var(--accent);color:var(--accent)}
.radio-pill input[type=radio]{accent-color:var(--accent)}

/* FAB */
.fab{
  position:fixed;bottom:24px;right:24px;z-index:100;
  width:48px;height:48px;border-radius:50%;
  background:var(--accent);color:var(--accent-text);
  display:grid;place-items:center;
  box-shadow:0 6px 20px rgba(74,90,144,.35),var(--shadow-lg);
  border:1px solid rgba(255,255,255,.15);
  transition:transform .15s,box-shadow .15s,filter .15s;
}
.fab:hover{transform:translateY(-2px);filter:brightness(1.06)}
.fab:active{transform:scale(.94)}
@media(max-width:639px){.fab{right:18px;bottom:calc(18px + env(safe-area-inset-bottom))}}

/* Modals */
.modal-backdrop{
  position:fixed;inset:0;z-index:200;background:rgba(30,26,23,.45);
  display:grid;place-items:end center;
  overscroll-behavior:contain;
}
@media(min-width:640px){.modal-backdrop{place-items:center;padding:24px}}

.modal{
  width:100%;max-width:520px;max-height:90dvh;overflow-y:auto;
  overscroll-behavior:contain;
  background:var(--paper-card);
  border-radius:var(--radius-lg) var(--radius-lg) 0 0;
  box-shadow:var(--shadow-lg);border:1px solid var(--rule);
}
@media(min-width:640px){.modal{border-radius:var(--radius-lg)}}

.modal-head{
  display:flex;align-items:center;justify-content:space-between;
  padding:16px 20px;border-bottom:1px solid var(--rule);
  position:sticky;top:0;background:var(--paper-card);z-index:1;
}
.modal-title{font-family:var(--font-display);font-weight:600;font-size:15px;letter-spacing:var(--tracking-tight)}

.modal-body{padding:20px}

.modal-foot{
  padding:14px 20px;border-top:1px solid var(--rule);
  display:flex;gap:8px;justify-content:flex-end;
  position:sticky;bottom:0;background:var(--paper-card);z-index:1;
}

/* Month nav */
.month-nav{display:flex;align-items:center;gap:8px;justify-content:space-between;margin:18px 0 10px}
.month-nav-title{
  font-family:var(--font-display);font-weight:600;font-size:18px;
  letter-spacing:var(--tracking-tight);
}
.month-nav-btn{
  padding:5px 11px;border-radius:6px;font-size:12px;
  background:var(--paper-inset);border:1px solid var(--rule);
  transition:color .15s,border-color .15s;
}
.month-nav-btn:hover{border-color:var(--accent);color:var(--accent)}

/* TTD */
.ttd-help{
  font-size:11px;color:var(--ink-muted);margin-top:6px;line-height:1.65;
}
.ttd-help code{
  background:var(--paper-inset);padding:1px 5px;border-radius:3px;
  font-family:var(--font-mono);font-size:10px;border:1px solid var(--rule);
  font-weight:500;
}
.ttd-preview{
  margin-top:10px;padding:8px;border:1px solid var(--rule);
  border-radius:var(--radius-sm);background:var(--paper-inset);
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

.item-card{padding:18px;position:relative}
.item-card-close{
  position:absolute;top:10px;right:10px;
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
  width:34px;height:34px;border-radius:6px;
  display:grid;place-items:center;font-size:11px;font-weight:700;
  font-family:var(--font-mono);
  background:var(--paper-inset);color:var(--ink-muted);
  border:1px solid var(--rule);
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