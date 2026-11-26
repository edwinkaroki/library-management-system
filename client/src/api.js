const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

export async function apiRequest(path, { method = 'GET', body, token, signal } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    ...(signal ? { signal } : {}),
  });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try { const data = await response.json(); message = data.message || message; } catch { /* response may have no JSON body */ }
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }
  if (response.status === 204) return null;
  return response.json();
}

export function getBooks({ genreId = '', search = '' } = {}) {
  const params = new URLSearchParams();
  if (genreId) params.set('genreId', genreId);
  if (search.trim()) params.set('search', search.trim());
  return apiRequest(`/books${params.size ? `?${params}` : ''}`);
}
export function getBook(id) { return apiRequest(`/books/${encodeURIComponent(id)}`); }
export function getGenres() { return apiRequest('/genres'); }
