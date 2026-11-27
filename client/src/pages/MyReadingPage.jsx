import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api.js';
import { digitalCollection } from '../data/digitalCollection.js';

export default function MyReadingPage() {
  const [progress, setProgress] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    apiRequest('/reading-progress', { token: localStorage.getItem('token') || localStorage.getItem('accessToken') })
      .then(setProgress)
      .catch((cause) => setError(cause.message || 'Could not load your reading progress.'));
  }, []);
  const items = progress.map((item) => ({ ...item, book: digitalCollection.find((book) => book.slug === item.bookSlug) })).filter((item) => item.book);
  return <section className="my-reading-page">
    <span className="eyebrow">YOUR BOOKMARKS, RIGHT WHERE YOU LEFT THEM</span>
    <h1>My reading<span className="brand-period">.</span></h1>
    <p className="my-reading-intro">Your place is saved as you read, so picking up again is easy.</p>
    {error && <div className="state-panel"><p>{error}</p></div>}
    {!error && !items.length && <div className="state-panel"><span className="eyebrow">NOTHING IN PROGRESS</span><h2>Your next chapter is waiting.</h2><Link to="/digital-library" className="text-link">Browse the digital shelf →</Link></div>}
    <div className="my-reading-list">{items.map((item) => <article className="my-reading-card" key={item.id}>
      <div><span className="eyebrow">{item.book.author}</span><h2>{item.book.title}</h2><p className="my-reading-location">{item.chapterTitle || 'Ready to begin'}{item.lineText ? ` · “${item.lineText}”` : ''}</p><div className="progress-track" role="progressbar" aria-valuenow={Math.round(item.progressPercent)} aria-valuemin="0" aria-valuemax="100"><span style={{ width: `${item.progressPercent}%` }} /></div><span className="my-reading-percent">{Math.round(item.progressPercent)}% read · saved {new Date(item.updatedAt).toLocaleDateString()}</span></div>
      <Link className="button-dark" to={`/read/${item.bookSlug}`}>Continue reading <span>→</span></Link>
    </article>)}</div>
  </section>;
}
