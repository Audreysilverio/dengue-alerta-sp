
const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:3001'
).replace(/\/$/, '');

export function apiUrl(endpoint) {
  return `${API_BASE_URL}${endpoint}`;
}
