import { Link } from 'react-router-dom';
import { useReadingList } from '../context/ReadingListContext.jsx';

export default function ReadingListPage() {
  const { books, removeBook, clearList } = useReadingList();
  return <section className="reading-list-page"><div className="section-heading"><div><span className="eyebrow">SAVED FOR LATER</span><h1>Your reading list<span className="brand-period">.</span></h1></div>{books.length > 0 && <button className="clear-list-button" onClick={clearList}>Clear list</button>}</div>{books.length === 0 ? <div className="state-panel empty-state"><span className="state-symbol">✳</span><span className="eyebrow">A SHELF WAITING TO BE FILLED</span><h2>No saved books yet.</h2><p>Save a book from the catalog and it’ll be waiting here.</p><Link className="text-link" to="/">Browse the catalog <span>→</span></Link></div> : <div className="saved-books">{books.map((book) => <article className="saved-book" key={book.id}><div className="saved-book-initial">{(book.title || '?').slice(0, 1).toUpperCase()}</div><div className="saved-book-copy"><span className="eyebrow">{book.genre?.name || 'FROM THE COLLECTION'}</span><h2><Link to={`/books/${book.id}`}>{book.title}</Link></h2><p>{book.author}</p></div><button className="remove-book-button" onClick={() => removeBook(book.id)}>Remove</button></article>)}</div>}</section>;
}
