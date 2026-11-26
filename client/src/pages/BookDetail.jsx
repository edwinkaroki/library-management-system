import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getBook } from '../api.js';
import { useReadingList } from '../context/ReadingListContext.jsx';

export default function BookDetail() {
  const { id } = useParams();
  const { addBook, removeBook, hasBook } = useReadingList();
  const [book, setBook] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  useEffect(() => { let active = true; setStatus('loading'); getBook(id).then((data) => { if (active) { setBook(data); setStatus('success'); } }).catch((cause) => { if (active) { setError(cause.message); setStatus('error'); } }); return () => { active = false; }; }, [id]);
  if (status === 'loading') return <div className="state-panel detail-state"><div className="detail-skeleton shimmer" /><span className="eyebrow">OPENING THE BOOK...</span></div>;
  if (status === 'error') return <div className="state-panel detail-state"><span className="state-symbol">!</span><span className="eyebrow">BOOK NOT FOUND</span><h1>We couldn’t find that one.</h1><p>{error}</p><Link to="/" className="text-link">Back to the collection <span>→</span></Link></div>;
  const title = book.title || 'Untitled';
  const saved = hasBook(book.id);
  return <section className="detail-page"><Link to="/" className="back-link"><span>←</span> BACK TO THE COLLECTION</Link><div className="detail-layout"><div className="detail-cover book-cover" data-tone={Math.abs((title.charCodeAt(0) || 0) % 5)}><span className="cover-stamp">STACKS <i>✳</i></span><span className="cover-initials">{title.split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase()}</span><span className="cover-rule" /><span className="cover-title">{title}</span><span className="cover-author">{book.author}</span><span className="cover-year">{book.publishedYear || 'A GOOD READ'}</span></div><div className="detail-copy"><span className="eyebrow">{book.genre?.name || 'FROM THE COLLECTION'}</span><h1>{title}<span className="brand-period">.</span></h1><p className="detail-author">A book by <strong>{book.author}</strong></p><div className="detail-divider" /><div className="detail-facts"><div><span className="eyebrow">GENRE</span><strong>{book.genre?.name || 'Uncategorized'}</strong></div><div><span className="eyebrow">PUBLISHED</span><strong>{book.publishedYear || '—'}</strong></div><div><span className="eyebrow">ISBN</span><strong>{book.isbn || '—'}</strong></div></div><div className={`availability ${book.availableCopies > 0 ? 'available' : 'unavailable'}`}><span className="availability-dot" /><span>{book.availableCopies > 0 ? `${book.availableCopies} ${book.availableCopies === 1 ? 'copy' : 'copies'} available` : 'Currently on loan'}</span><span className="availability-total">{book.totalCopies ?? 0} total</span></div><p className="detail-note">Some stories find you at just the right time. Ask our team about borrowing this one.</p><div className="detail-actions"><button className="button-dark" onClick={() => saved ? removeBook(book.id) : addBook(book)}>{saved ? '✓ Saved to reading list' : '+ Save to reading list'}</button><Link to="/spaces/book" className="text-link">Book a library space <span>→</span></Link></div><div className="detail-flourish">✳ <span>HAPPY READING</span></div></div></div></section>;
}
