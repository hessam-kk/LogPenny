import type { FC } from 'hono/jsx';

export const SetupView: FC = () => {
  return (
    <div class="app-shell" style="padding-top:60px;max-width:460px">
      <div class="card">
        <div style="text-align:center;margin-bottom:24px">
          <svg style="display:block;width:48px;height:48px;margin:0 auto 12px;color:var(--accent)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          <h1 style="margin:0;font-size:22px;font-weight:700;letter-spacing:var(--tracking-tight)">Welcome to LogPenny</h1>
          <p style="margin:8px 0 0;color:var(--text-secondary);font-size:14px">
            Create your first account to start tracking money.
          </p>
        </div>
        <form id="setup-form">
          <div class="form-group">
            <label class="form-label" for="name">Account name</label>
            <input class="form-control" type="text" id="name" name="name" placeholder="Personal" required autofocus autocomplete="off" />
          </div>
          <div class="form-group">
            <label class="form-label" for="defaultCurrency">Default currency</label>
            <select class="form-control" id="defaultCurrency" name="defaultCurrency">
              <option value="IRR" selected>IRR &mdash; Iranian Toman (&#x62A;&#x648;&#x645;&#x646;)</option>
              <option value="USD">USD &mdash; US Dollar</option>
              <option value="EUR">EUR &mdash; Euro</option>
              <option value="GBP">GBP &mdash; Pound Sterling</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="startingBalance">Starting balance</label>
            <input class="form-control" type="number" id="startingBalance" name="startingBalance" placeholder="0" step="any" />
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;margin-top:8px">Create account</button>
        </form>
      </div>
      <script dangerouslySetInnerHTML={{
        __html: `
          document.getElementById('setup-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const submitBtn = form.querySelector('button[type=submit]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating\\u2026';
            const body = {
              name: form.name.value,
              defaultCurrency: form.defaultCurrency.value,
              startingBalance: form.startingBalance.value ? Number(form.startingBalance.value) : 0,
            };
            try {
              const res = await fetch('/api/v1/accounts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
              });
              const json = await res.json();
              if (json.ok) { window.location.href = '/entries'; }
              else { alert(json.error || 'Failed'); submitBtn.disabled = false; submitBtn.textContent = 'Create account'; }
            } catch {
              alert('Network error. Please try again.');
              submitBtn.disabled = false;
              submitBtn.textContent = 'Create account';
            }
          });
        `,
      }} />
    </div>
  );
};