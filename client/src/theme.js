const KEY = 'rb_theme';

export function getTheme() {
  try {
    return localStorage.getItem(KEY) || 'dark';
  } catch {
    return 'dark';
  }
}

export function setTheme(theme) {
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    // ignore
  }
  document.documentElement.setAttribute('data-theme', theme);
}