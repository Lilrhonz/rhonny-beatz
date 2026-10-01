const KEY = 'rb_token';

export function getToken() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    localStorage.setItem(KEY, token);
  } catch {
    // storage unavailable: the user will just need to log in again next visit
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // nothing to clear
  }
}