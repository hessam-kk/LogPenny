import type { FC, PropsWithChildren } from 'hono/jsx';
import type { Account } from '../../db/schema';
import { hasPersian } from '../../lib/persian';
import { formatMonthYear as formatJalaliMonthYear, formatMonthLabel as formatJalaliMonthLabel } from '../../lib/jalali';

interface TopBarProps {
  accounts: Account[];
  activeAccount: Account | null;
  showAccountSwitch?: boolean;
  cal?: 'g' | 'j';
  calQuery?: string;
  basePath?: string;
  user?: { id: number; username: string } | null;
}

export const TopBar: FC<TopBarProps> = ({ accounts, activeAccount, showAccountSwitch = true, cal = 'g', basePath = '/entries', user = null }) => {
  const calLabel = cal === 'j' ? 'ج' : 'AD';
  const calendarSuffix = cal === 'j' ? '&cal=j' : '';
  const brandHref = activeAccount ? `${basePath}?account_id=${activeAccount.id}${calendarSuffix}` : basePath;
  const calTitle = cal === 'j' ? 'Switch to Gregorian calendar' : 'Switch to Persian calendar';
  return (
    <header class="topbar">
      <div class="topbar-inner">
        <a href={brandHref} class="brand" translate="no">
          <span class="brand-mark">L</span>
          LogPenny
        </a>
        <div class="topbar-spacer"></div>
        {showAccountSwitch && accounts.length > 1 && (
          <div class="account-switch">
            {accounts.map((a) => (
              <a
                key={a.id}
                href={`${basePath}?account_id=${a.id}${calendarSuffix}`}
                class={`account-chip${activeAccount && a.id === activeAccount.id ? ' active' : ''}`}
              >
                {a.name}
              </a>
            ))}
          </div>
        )}
        <button
          class="cal-toggle"
          onclick="toggleCalendar()"
          title={calTitle}
          aria-label={calTitle}
        >
          {calLabel}
        </button>
        <button class="icon-btn" onclick="toggleTheme()" title="Toggle theme" aria-label="Toggle theme">
          <svg class="theme-icon-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
          <svg class="theme-icon-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>
        {user ? (
          <a class="icon-btn" href="/logout" title="Log out" aria-label="Log out">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </a>
        ) : null}
      </div>
    </header>
  );
};

interface TabsProps {
  active: 'entries' | 'items' | 'reports';
  accountId?: number;
  cal?: 'g' | 'j';
}

export const Tabs: FC<TabsProps> = ({ active, accountId, cal }) => {
  const parts: string[] = [];
  if (accountId) parts.push(`account_id=${accountId}`);
  if (cal === 'j') parts.push('cal=j');
  const q = parts.length ? `?${parts.join('&')}` : '';
  return (
    <nav class="tabs">
      <a href={`/entries${q}`} class={`tab${active === 'entries' ? ' active' : ''}`}>Entries</a>
      <a href={`/items${q}`} class={`tab${active === 'items' ? ' active' : ''}`}>Items</a>
      <a href={`/reports${q}`} class={`tab${active === 'reports' ? ' active' : ''}`}>Reports</a>
    </nav>
  );
};

export const AutoText: FC<PropsWithChildren<{ text: string }>> = ({ text }) => {
  return <span class={hasPersian(text) ? 'persian' : ''}>{text}</span>;
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  IRR: 'T', USD: '$', EUR: '\u20AC', GBP: '\u00A3',
};

export const formatAmount = (amount: number, currency: string): string => {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(amount);
  return `${formatted} ${symbol}`;
};

export const monthName = (m: number): string =>
  ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][m - 1] ?? '';

export const formatMonthYear = (year: number, month: number, cal: 'g' | 'j' = 'g'): string =>
  cal === 'j' ? formatJalaliMonthYear(year, month, cal) : `${monthName(month)} ${year}`;

export const monthLabel = (year: number, month: number, cal: 'g' | 'j' = 'g'): string =>
  cal === 'j' ? formatJalaliMonthLabel(year, month, cal) : monthName(month);