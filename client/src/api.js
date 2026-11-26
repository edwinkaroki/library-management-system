const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

async function request(path) {
  const response = await fetch(`${API_URL}${path}`, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try { const body = await response.json(); message = body.message || message; } catch { /* response may not contain JSON */ }
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }
  return response.json();
}

export function getBooks({ genreId = '', search = '' } = {}) {
  const params = new URLSearchParams();
  if (genreId) params.set('genreId', genreId);
  if (search.trim()) params.set('search', search.trim());
  return request(`/books${params.size ? `?${params}` : ''}`);
}
export function getBook(id) { return request(`/books/${encodeURIComponent(id)}`); }
export function getGenres() { return request('/genres'); }
