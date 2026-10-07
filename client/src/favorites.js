const KEY = 'rb_favorites';

export function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function saveFavorites(ids) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // storage unavailable: favorites just won't persist
  }
}