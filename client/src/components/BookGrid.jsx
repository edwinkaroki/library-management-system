import { useEffect, useState } from 'react';
import { getBooks } from '../api.js';
import BookCard from './BookCard.jsx';

function SkeletonCard() { return <div className="skeleton-card" aria-hidden="true"><div className="skeleton-cover shimmer" /><div className="skeleton-line shimmer" /><div className="skeleton-line short shimmer" /><div className="skeleton-line tiny shimmer" /></div>; }

export default function BookGrid({ genreId, search }) {
  const [books, setBooks] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading'); setError('');
    const params = new URLSearchParams();
    if (genreId) params.set('genreId', genreId);
    if (search.trim()) params.set('search', search.trim());
    const url = `${(import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')}/books${params.size ? `?${params}` : ''}`;
    fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } })
      .then(async (response) => { if (!response.ok) { let message = `Request failed (${response.status})`; try { const body = await response.json(); message = body.message || message; } catch { /* no JSON body */ } throw new Error(Array.isArray(message) ? message.join(', ') : message); } return response.json(); })
      .then((data) => { setBooks(Array.isArray(data) ? data : []); setStatus('success'); })
      .catch((cause) => { if (cause.name !== 'AbortError') { setError(cause.message || 'Could not load books.'); setStatus('error'); } });
    return () => controller.abort();
  }, [genreId, search, attempt]);
  if (status === 'loading') return <div className="book-grid" aria-label="Loading books">{Array.from({ length: 8 }, (_, index) => <SkeletonCard key={index} />)}</div>;
  if (status === 'error') return <div className="state-panel"><span className="state-symbol">!</span><span className="eyebrow">A LITTLE HICCUP</span><h2>We couldn’t reach the shelves.</h2><p>{error}</p><button className="button-dark" onClick={() => setAttempt((current) => current + 1)}>Try again</button></div>;
  if (books.length === 0) return <div className="state-panel empty-state"><span className="state-symbol">⌕</span><span className="eyebrow">NOTHING ON THIS SHELF</span><h2>No books found.</h2><p>Try another title, author, or genre to keep looking.</p></div>;
  return <div className="book-grid">{books.map((book) => <BookCard key={book.id} book={book} />)}</div>;
}

