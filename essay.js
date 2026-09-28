/* Theme switch. No analytics, network calls or required storage. */
(() => {
  'use strict';
  const root = document.documentElement, $ = id => document.getElementById(id);

  const themeButton = $('theme-button');
  const syncTheme = () => themeButton.setAttribute('aria-label', root.classList.contains('light') ? 'Switch to dark theme' : 'Switch to light theme');
  themeButton.addEventListener('click', () => {
    root.classList.toggle('light');
    try { localStorage.setItem('jev-explained-theme', root.classList.contains('light') ? 'light' : 'dark'); } catch (e) { /* optional */ }
    syncTheme();
  });
  syncTheme();

})();
