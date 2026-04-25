import type { FC, PropsWithChildren } from 'hono/jsx';
import { ALL_STYLES } from './styles';

const THEME_INIT = `
(function(){
  try{
    var t=localStorage.getItem('theme');
    if(!t) t=matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';
    document.documentElement.setAttribute('data-theme',t);
  }catch(e){}
})();
`;

const CAL_INIT = `
(function(){
  try{
    var cal=localStorage.getItem('cal');
    if(cal==='j'){var u=new URL(window.location.href);if(!u.searchParams.get('cal')){u.searchParams.set('cal','j');window.location.replace(u.toString())}}
  }catch(e){}
})();
`;

const THEME_TOGGLE = `
window.toggleTheme=function(){
  var c=document.documentElement.getAttribute('data-theme');
  var n=c==='dark'?'light':'dark';
  document.documentElement.setAttribute('data-theme',n);
  try{localStorage.setItem('theme',n)}catch(e){}
};
window.toggleCalendar=function(){
  var c='g';
  try{c=localStorage.getItem('cal')||'g'}catch(e){}
  var n=c==='j'?'g':'j';
  try{localStorage.setItem('cal',n)}catch(e){}
  var u=new URL(window.location.href);
  u.searchParams.set('cal',n);
  window.location.href=u.toString();
};
`;

export const Layout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#1C1815" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#F9F5EF" media="(prefers-color-scheme: light)" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="alternate icon" href="/favicon.svg" />
        <title>LogPenny — Money Tracker</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
        />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css"
        />
        <script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
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