import { useCallback, useEffect, useState } from 'react';
import { getGenres } from '../api.js';
import BookGrid from '../components/BookGrid.jsx';
import SearchBar from '../components/SearchBar.jsx';

export default function HomePage() {
  const [genreId, setGenreId] = useState('');
  const [search, setSearch] = useState('');
  const [genres, setGenres] = useState([]);
  const [genreError, setGenreError] = useState(false);
  const onSearch = useCallback((value) => setSearch(value), []);
  useEffect(() => { getGenres().then(setGenres).catch(() => setGenreError(true)); }, []);
  return <div className="catalog-page" id="catalog">
    <section className="hero"><div className="hero-copy"><span className="eyebrow"><span className="live-dot" /> THE NEIGHBORHOOD LIBRARY</span><h1>Find your next<br /><em>favorite</em> chapter.</h1><p>Thoughtful reads for wherever your mind wanders. Browse the collection and see what speaks to you.</p><div className="hero-note"><span>01</span><span>Good stories live here</span><span className="note-line" /></div></div><div className="hero-art" aria-label="Illustration of books"><div className="sun-disc" /><div className="art-caption">THE ART OF<br />GETTING LOST <i>✳</i></div><div className="book-stack"><div className="art-book art-book-one"><span>THE<br />QUIET<br />HOURS</span><i>✳</i></div><div className="art-book art-book-two"><span>WILD<br />PLACES</span><i>✳</i></div><div className="art-book art-book-three"><span>SMALL<br />WONDERS</span><i>✳</i></div><div className="art-book art-book-four"><span>NOTES<br />ON HOME</span><i>✳</i></div></div><div className="art-spark spark-one">✳</div><div className="art-spark spark-two">✦</div></div><div className="hero-index">VOL. 01 <span>—</span> EST. FOR READERS</div></section>
    <section className="collection"><div className="section-heading"><div><span className="eyebrow">A FEW GOOD STORIES</span><h2>The collection<span className="brand-period">.</span></h2></div><div className="heading-aside">A little something for every kind<br />of curious. Take a look around.</div></div>
      <div className="catalog-tools"><div className="genre-list" aria-label="Filter by genre"><button className={`genre-chip ${!genreId ? 'active' : ''}`} onClick={() => setGenreId('')}>All books</button>{genres.map((genre) => <button key={genre.id} className={`genre-chip ${genreId === genre.id ? 'active' : ''}`} onClick={() => setGenreId(genre.id)}>{genre.name}</button>)}</div><SearchBar onSearch={onSearch} /></div>
      {genreError && <p className="inline-note">Genre filters are temporarily unavailable.</p>}
      <BookGrid genreId={genreId} search={search} />
    </section>
    <section className="quote-strip"><span className="quote-mark">“</span><p>There is no such thing as too many stories.<br /><em>Only the next one waiting to be found.</em></p><span className="quote-credit">A NOTE FROM YOUR LIBRARY <i>✳</i></span></section>
  </div>;
}
