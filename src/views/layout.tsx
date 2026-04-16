import type { FC, PropsWithChildren } from 'hono/jsx';
import { ALL_STYLES } from './styles';

const THEME_INIT = `
(function() {
  try {
    var t = localStorage.getItem('theme');
    if (!t) t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', t);
  } catch(e) {}
})();
`;

const CAL_INIT = `
(function() {
  try {
    var cal = localStorage.getItem('cal');
    if (cal === 'j') {
      var url = new URL(window.location.href);
      if (!url.searchParams.get('cal')) {
        url.searchParams.set('cal', 'j');
        window.location.replace(url.toString());
      }
    }
  } catch(e) {}
})();
`;

const THEME_TOGGLE = `
window.toggleTheme = function() {
  var cur = document.documentElement.getAttribute('data-theme');
  var next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem('theme', next); } catch(e) {}
};

// Calendar toggle: switches between Gregorian ('g') and Persian/Jalali ('j').
// Persists the choice in localStorage and reloads with the new query param.
window.toggleCalendar = function() {
  var cur = 'g';
  try { cur = localStorage.getItem('cal') || 'g'; } catch(e) {}
  var next = cur === 'j' ? 'g' : 'j';
  try { localStorage.setItem('cal', next); } catch(e) {}
  // Reload the page with the new cal param, preserving other query params.
  var url = new URL(window.location.href);
  url.searchParams.set('cal', next);
  window.location.href = url.toString();
};
`;

export const Layout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#6366f1" />
        <title>LogPenny — Money Tracker</title>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css"
        />
        <style dangerouslySetInnerHTML={{ __html: ALL_STYLES }} />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        <script dangerouslySetInnerHTML={{ __html: CAL_INIT }} />
      </head>
      <body>
        {children}
        <script dangerouslySetInnerHTML={{ __html: THEME_TOGGLE }} />
      </body>
    </html>
  );
};
