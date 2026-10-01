export const API_URL = 'http://localhost:4000';

export function fileUrl(key) {
  return `${API_URL}/storage/${key.replace(/\\/g, '/')}`;
}
export function formatPrice(cents, currency) {
  return new Intl.NumberFormat('en', { style: 'currency', currency }).format(cents / 100);
}