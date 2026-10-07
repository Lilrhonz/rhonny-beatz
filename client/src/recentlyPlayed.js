const KEY = 'rb_recently_played';
const MAX_ITEMS = 8;

export function loadRecentlyPlayed() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function recordPlay(beatId, currentList) {
  const withoutThisOne = currentList.filter((id) => id !== beatId);
  const next = [beatId, ...withoutThisOne].slice(0, MAX_ITEMS);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage unavailable: history just won't persist
  }
  return next;
}