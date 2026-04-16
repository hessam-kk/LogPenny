import type { FC } from 'hono/jsx';

export const SetupView: FC = () => {
  return (
    <div class="app-shell" style="padding-top: 60px; max-width: 460px;">
      <div class="card">
        <div style="text-align:center; margin-bottom: 24px;">
          <div style="font-size: 40px; margin-bottom: 8px;">💰</div>
          <h1 style="margin: 0; font-size: 22px; font-weight: 700;">Welcome to LogPenny</h1>
          <p style="margin: 8px 0 0; color: var(--text-dim); font-size: 14px;">
            Create your first account to start tracking money.
          </p>
        </div>
        <form id="setup-form">
          <div class="form-group">
            <label class="form-label" for="name">Account name</label>
            <input class="form-control" type="text" id="name" name="name" placeholder="Personal" required autofocus />
          </div>
          <div class="form-group">
            <label class="form-label" for="defaultCurrency">Default currency</label>
            <select class="form-control" id="defaultCurrency" name="defaultCurrency">
              <option value="IRR" selected>IRR — Iranian Toman (تومن)</option>
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
              <option value="GBP">GBP — Pound Sterling</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="startingBalance">Starting balance</label>
            <input class="form-control" type="number" id="startingBalance" name="startingBalance" placeholder="0" step="any" />
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%; margin-top: 8px;">Create account</button>
        </form>
      </div>
      <script dangerouslySetInnerHTML={{
        __html: `
          document.getElementById('setup-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const body = {
              name: form.name.value,
              defaultCurrency: form.defaultCurrency.value,
              startingBalance: form.startingBalance.value ? Number(form.startingBalance.value) : 0,
            };
            const res = await fetch('/api/v1/accounts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
            });
            const json = await res.json();
            if (json.ok) { window.location.href = '/entries'; }
            else { alert(json.error || 'Failed'); }
          });
        `,
      }} />
    </div>
  );
};
