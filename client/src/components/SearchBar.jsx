import { useEffect, useState } from 'react';

export default function SearchBar({ onSearch, value = '' }) {
  const [input, setInput] = useState(value);
  useEffect(() => setInput(value), [value]);
  useEffect(() => {
    const timer = setTimeout(() => onSearch(input), 350);
    return () => clearTimeout(timer);
  }, [input, onSearch]);
  return <label className="search-box"><span className="search-icon" aria-hidden="true">⌕</span><input type="search" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Search by title or author..." aria-label="Search books by title or author" /><kbd>↵</kbd></label>;
}
