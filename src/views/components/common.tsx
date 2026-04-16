import type { FC, PropsWithChildren } from 'hono/jsx';
import type { Account } from '../../db/schema';
import { hasPersian } from '../../lib/persian';
import { formatMonthYear as formatJalaliMonthYear, formatMonthLabel as formatJalaliMonthLabel } from '../../lib/jalali';

interface TopBarProps {
  accounts: Account[];
  activeAccount: Account | null;
  showAccountSwitch?: boolean;
  cal?: 'g' | 'j';
  calQuery?: string; // query string prefix to propagate
  basePath?: string;
}

export const TopBar: FC<TopBarProps> = ({ accounts, activeAccount, showAccountSwitch = true, cal = 'g', basePath = '/entries' }) => {
  const calLabel = cal === 'j' ? 'ج' : 'AD';
  const calendarSuffix = cal === 'j' ? '&cal=j' : '';
  const brandHref = activeAccount ? `${basePath}?account_id=${activeAccount.id}${calendarSuffix}` : basePath;
  const calTitle = cal === 'j' ? 'Switch to Gregorian calendar' : 'Switch to Persian calendar';
  return (
    <header class="topbar">
      <div class="topbar-inner">
        <a href={brandHref} class="brand">
          <span class="brand-dot"></span>
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
        <button class="theme-toggle" onclick="toggleTheme()" title="Toggle theme" aria-label="Toggle theme">
          <span id="theme-icon">◐</span>
        </button>
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

// Wrap text in a span that uses the Persian font when the content is Persian.
export const AutoText: FC<PropsWithChildren<{ text: string }>> = ({ text }) => {
  return <span class={hasPersian(text) ? 'persian' : ''}>{text}</span>;
};

export const formatAmount = (amount: number, currency: string): string => {
  const meta = currency === 'IRR' ? { symbol: 'T', minorDigits: 0 } : { symbol: currency, minorDigits: 0 };
  const value = amount;
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: meta.minorDigits,
    maximumFractionDigits: meta.minorDigits,
  }).format(value);
  return `${formatted} ${meta.symbol}`;
};

export const monthName = (m: number): string =>
  ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][m - 1] ?? '';

export const formatMonthYear = (year: number, month: number, cal: 'g' | 'j' = 'g'): string =>
  cal === 'j' ? formatJalaliMonthYear(year, month, cal) : `${monthName(month)} ${year}`;

export const monthLabel = (year: number, month: number, cal: 'g' | 'j' = 'g'): string =>
  cal === 'j' ? formatJalaliMonthLabel(year, month, cal) : monthName(month);
