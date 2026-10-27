// Set the theme before styles load to avoid a bright flash.
(() => {
  const key = 'hao-theme-v1';
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  let preference = null;
  try {
    const saved = localStorage.getItem(key);
    if (saved === 'light' || saved === 'dark') preference = saved;
  } catch { /* The theme still works when browser storage is blocked. */ }
  function apply() {
    const dark = preference ? preference === 'dark' : system.matches;
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    const button = document.getElementById('theme-toggle');
    if (button) {
      button.textContent = dark ? '☀' : '☾';
      button.setAttribute('aria-pressed', String(dark));
      button.setAttribute('aria-label', dark ? 'Hellmodus aktivieren' : 'Darkmode aktivieren');
      button.title = dark ? 'Zum hellen Design wechseln' : 'Zum dunklen Design wechseln';
    }
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#14221e' : '#173f37');
  }
  apply();
  system.addEventListener('change', () => { if (!preference) apply(); });
  document.addEventListener('DOMContentLoaded', () => {
    apply();
    document.getElementById('theme-toggle').addEventListener('click', () => {
      preference = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(key, preference); } catch { /* Session-only fallback. */ }
      apply();
    });
  });
})();
