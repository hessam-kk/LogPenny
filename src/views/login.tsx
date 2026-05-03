import type { FC } from 'hono/jsx';

export const LoginView: FC = () => {
  return (
    <div class="app-shell" style="padding-top:60px;max-width:420px">
      <div class="card anim-card-up" style="animation-delay:.05s">
        <div style="text-align:center;margin-bottom:24px">
          <span class="brand-mark" style="display:inline-grid;width:44px;height:44px;border-radius:10px;font-size:20px;margin:0 auto 12px">L</span>
          <h1 style="margin:0;font-size:22px;font-weight:700;letter-spacing:var(--tracking-tight)">Log in to LogPenny</h1>
          <p style="margin:8px 0 0;color:var(--ink-muted);font-size:14px">
            Enter your username and password to open your ledger.
          </p>
        </div>
        <form id="login-form">
          <div class="form-group">
            <label class="form-label" for="username">Username</label>
            <input class="form-control" type="text" id="username" name="username" placeholder="username" required autofocus autocomplete="username" />
          </div>
          <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <input class="form-control" type="password" id="password" name="password" placeholder="••••••••" required autocomplete="current-password" />
          </div>
          <div id="login-status" class="form-status" role="status" aria-live="polite"></div>
          <button type="submit" class="btn btn-primary" style="width:100%;margin-top:8px">Log in</button>
        </form>
        <p style="margin:16px 0 0;text-align:center;font-size:13px;color:var(--ink-muted)">
          No account yet? <a href="/setup" style="color:var(--accent);font-weight:600">Create one</a>
        </p>
      </div>
      <script dangerouslySetInnerHTML={{
        __html: `
          document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const submitBtn = form.querySelector('button[type=submit]');
            const status = document.getElementById('login-status');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Logging in\\u2026';
            status.textContent = '';
            try {
              const res = await fetch('/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: form.username.value.trim(), password: form.password.value }),
              });
              const json = await res.json();
              if (json.ok) { window.location.href = '/entries'; }
              else { status.textContent = json.error || 'Could not log in.'; submitBtn.disabled = false; submitBtn.textContent = 'Log in'; }
            } catch {
              status.textContent = 'Network error. Please try again.';
              submitBtn.disabled = false;
              submitBtn.textContent = 'Log in';
            }
          });
        `,
      }} />
    </div>
  );
};
