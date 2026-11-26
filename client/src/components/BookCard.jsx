import { Link } from 'react-router-dom';
import { useReadingList } from '../context/ReadingListContext.jsx';

export default function BookCard({ book }) {
  const { addBook, removeBook, hasBook } = useReadingList();
  const saved = hasBook(book.id);
  const title = book.title || 'Untitled';
  const initials = title.split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase();
  return <article className="book-card">
    <Link className="book-card-main" to={`/books/${book.id}`} aria-label={`View ${title} by ${book.author}`}>
      <div className="book-cover" data-tone={Math.abs((title.charCodeAt(0) || 0) % 5)}>
        <span className="cover-stamp">STACKS <i>✳</i></span><span className="cover-initials">{initials}</span><span className="cover-rule" />
        <span className="cover-title">{title}</span><span className="cover-author">{book.author}</span>
        <span className="cover-year">{book.publishedYear || 'A GOOD READ'}</span>
      </div>
      <div className="book-card-info"><div><h3>{title}</h3><p>{book.author}</p></div><span className="card-arrow" aria-hidden="true">↗</span></div>
    </Link>
    <div className="book-card-meta"><span>{book.genre?.name || 'Uncategorized'}</span><span>{book.availableCopies > 0 ? 'Available' : 'On loan'}</span></div>
    <button className={`reading-toggle ${saved ? 'saved' : ''}`} aria-pressed={saved} onClick={() => saved ? removeBook(book.id) : addBook(book)}>{saved ? '✓ In your reading list' : '+ Save for later'}</button>
  </article>;
}
