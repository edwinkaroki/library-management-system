import { Link } from 'react-router-dom';
import { digitalCollection } from '../data/digitalCollection.js';

export default function DigitalLibraryPage() {
  return <section className="digital-library-page">
    <Link to="/" className="back-link">← BACK TO THE CATALOG</Link>
    <div className="digital-library-intro">
      <span className="eyebrow">READ HERE · KEEP A COPY</span>
      <h1>The reading<br /><em>room.</em></h1>
      <p>A small, carefully sourced digital shelf. Open supported classics right here, or visit the author and publisher for the licensed editions.</p>
    </div>
    <div className="digital-book-grid">
      {digitalCollection.map((book) => <article className="digital-book-card" key={book.slug}>
        <div className="digital-book-cover" data-tone={Math.abs(book.title.charCodeAt(0) % 5)}><span>STACKS ✳</span><strong>{book.title}</strong><small>{book.author}</small></div>
        <div className="digital-book-copy"><span className="eyebrow">{book.genre} · {book.year}</span><h2>{book.title}</h2><p className="digital-author">{book.author}</p>
          <p className="digital-license"><strong>{book.license}</strong><br />{book.rights}</p>
          <div className="digital-actions">{book.reader ? <><Link className="button-dark" to={`/read/${book.slug}`}>Read in Stacks <span>→</span></Link><a className="text-link" href={`${(import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')}/digital-library/${book.slug}/download`}>Download text <span>↓</span></a></> : <><a className="button-dark" href={book.readerUrl} target="_blank" rel="noreferrer">Read online <span>↗</span></a><a className="text-link" href={book.source} target="_blank" rel="noreferrer">Official downloads <span>↗</span></a></>}</div>
          <a className="source-note" href={book.source} target="_blank" rel="noreferrer">Edition and rights source ↗</a>
        </div>
      </article>)}
    </div>
    <p className="digital-library-note">Rights statements describe these specific editions and may differ by country. The three Creative Commons titles are licensed for noncommercial sharing under their stated terms.</p>
  </section>;
}
