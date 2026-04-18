import type { FC } from 'hono/jsx';
import type { Account } from '../db/schema';
import { TopBar, Tabs, formatAmount, formatMonthYear, monthLabel } from './components/common';
import { hasPersian } from '../lib/persian';
import { shiftDisplayedMonth } from '../lib/jalali';

interface DailyPoint {
  date: string;
  day: number;
  income: number;
  expense: number;
  net: number;
}
interface BreakdownRow {
  label: string;
  income: number;
  expense: number;
}
interface TrendPoint {
  month: string;
  income: number;
  expense: number;
}

interface ReportsViewProps {
  accounts: Account[];
  account: Account;
  year: number;
  month: number;
  cal?: 'g' | 'j';
  income: number;
  expense: number;
  daily: DailyPoint[];
  breakdown: BreakdownRow[];
  trends: TrendPoint[];
}

export const ReportsView: FC<ReportsViewProps> = ({
  accounts, account, year, month, cal = 'g', income, expense, daily, breakdown, trends,
}) => {
  const currency = account.defaultCurrency;
  const net = income - expense;
  const maxDaily = Math.max(...daily.map((d) => Math.max(d.income, d.expense)), 1);
  const totalBreakdown = breakdown.reduce((s, r) => s + r.income + r.expense, 0) || 1;
  const maxTrend = Math.max(...trends.map((t) => Math.max(t.income, t.expense)), 1);

  const previous = shiftDisplayedMonth(year, month, -1, cal);
  const next = shiftDisplayedMonth(year, month, 1, cal);
  const calQ = cal === 'j' ? 'cal=j&' : '';
  const acctQ = `account_id=${account.id}&${calQ}`;

  // SVG dimensions for trend line chart
  const tw = 600, th = 180, pad = 30;
  const monthCount = trends.length || 1;
  const xStep = (tw - pad * 2) / Math.max(monthCount - 1, 1);
  const yScale = (v: number) => th - pad - (v / maxTrend) * (th - pad * 2);
  const linePath = (key: 'income' | 'expense') =>
    trends.map((t, i) => `${i === 0 ? 'M' : 'L'} ${pad + i * xStep} ${yScale(t[key])}`).join(' ');

  return (
    <>
      <TopBar accounts={accounts} activeAccount={account} cal={cal} basePath="/reports" />
      <Tabs active="reports" accountId={account.id} cal={cal} />

      <div class="app-shell">
        <div class="month-nav">
          <a class="month-nav-btn" href={`/reports?${acctQ}year=${previous.gy}&month=${previous.gm}`}>‹ {monthLabel(previous.gy, previous.gm, cal)}</a>
          <div class="month-nav-title">{formatMonthYear(year, month, cal)}</div>
          <a class="month-nav-btn" href={`/reports?${acctQ}year=${next.gy}&month=${next.gm}`}>{monthLabel(next.gy, next.gm, cal)} ›</a>
        </div>

        <div class="stats">
          <div class="stat">
            <div class="stat-label">Income</div>
            <div class="stat-value income">{formatAmount(income, currency)}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Expense</div>
            <div class="stat-value expense">{formatAmount(expense, currency)}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Net</div>
            <div class="stat-value" style={net >= 0 ? 'color: var(--income)' : 'color: var(--expense)'}>
              {net >= 0 ? '+' : '−'}{formatAmount(Math.abs(net), currency)}
            </div>
          </div>
        </div>

        {/* Daily bar chart */}
        <div class="card">
          <div class="card-title">Daily activity — {formatMonthYear(year, month, cal)}</div>
          <div class="chart-wrap">
            <div class="chart-row">
              {daily.map((d) => (
                <div class="chart-bar" title={`Day ${d.day}: +${d.income} / −${d.expense}`}>
                  {d.expense > 0 && (
                    <div class="chart-bar-out" style={`height: ${(d.expense / maxDaily) * 100}%;`}></div>
                  )}
                  {d.income > 0 && (
                    <div class="chart-bar-in" style={`height: ${(d.income / maxDaily) * 100}%;`}></div>
                  )}
                </div>
              ))}
            </div>
            <div class="chart-axis">
              <span>1</span><span>5</span><span>10</span><span>15</span><span>20</span><span>25</span><span>30</span>
            </div>
          </div>
          <div style="display:flex; gap:16px; margin-top:12px; font-size:12px; color:var(--text-dim);">
            <span><span style="display:inline-block;width:10px;height:10px;background:var(--income);border-radius:2px;margin-right:4px;"></span>Income</span>
            <span><span style="display:inline-block;width:10px;height:10px;background:var(--expense);border-radius:2px;margin-right:4px;"></span>Expense</span>
          </div>
        </div>

        {/* Breakdown */}
        <div class="card" style="margin-top:16px;">
          <div class="card-title">Breakdown by item</div>
          {breakdown.length === 0 ? (
            <div class="empty" style="padding:24px;">No data for this period.</div>
          ) : (
            breakdown.map((r) => {
              const share = ((r.income + r.expense) / totalBreakdown) * 100;
              return (
                <div class="breakdown-row">
                  <div class="breakdown-label"><span class={hasPersian(r.label) ? 'persian' : ''}>{r.label}</span></div>
                  <div class="breakdown-bar">
                    <div class="breakdown-bar-fill" style={`width: ${share}%;`}></div>
                  </div>
                  <div class="breakdown-amt">
                    {formatAmount(r.income + r.expense, currency)}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Trends line chart (SVG) */}
        <div class="card" style="margin-top:16px;">
          <div class="card-title">Trends — {year}</div>
          {trends.length === 0 ? (
            <div class="empty" style="padding:24px;">No data this year yet.</div>
          ) : (
            <>
              <div class="chart-wrap">
                <svg viewBox={`0 0 ${tw} ${th}`} style="width:100%; height:auto; display:block;" preserveAspectRatio="none">
                  {/* grid lines */}
                  <line x1={pad} y1={th - pad} x2={tw - pad} y2={th - pad} stroke="var(--border)" stroke-width="1" />
                  <line x1={pad} y1={pad} x2={pad} y2={th - pad} stroke="var(--border)" stroke-width="1" />
                  {/* income line */}
                  <path d={linePath('income')} fill="none" stroke="var(--income)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
                  {/* expense line */}
                  <path d={linePath('expense')} fill="none" stroke="var(--expense)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
                  {/* points */}
                  {trends.map((t, i) => (
                    <g key={t.month}>
                      <circle cx={pad + i * xStep} cy={yScale(t.income)} r="3" fill="var(--income)" />
                      <circle cx={pad + i * xStep} cy={yScale(t.expense)} r="3" fill="var(--expense)" />
                    </g>
                  ))}
                  {/* x labels */}
                  {trends.map((t, i) => (
                    <text x={pad + i * xStep} y={th - 10} font-size="9" text-anchor="middle" fill="var(--text-dim)">{t.month.slice(5)}</text>
                  ))}
                </svg>
              </div>
              <div style="display:flex; gap:16px; margin-top:12px; font-size:12px; color:var(--text-dim);">
                <span><span style="display:inline-block;width:10px;height:10px;background:var(--income);border-radius:2px;margin-right:4px;"></span>Income</span>
                <span><span style="display:inline-block;width:10px;height:10px;background:var(--expense);border-radius:2px;margin-right:4px;"></span>Expense</span>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};
