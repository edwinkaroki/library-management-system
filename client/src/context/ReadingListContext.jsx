import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';

const STORAGE_KEY = 'stacks-reading-list';
const ReadingListContext = createContext(null);

function readInitialList() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved.filter((book) => book && book.id) : [];
  } catch {
    return [];
  }
}

export function readingListReducer(state, action) {
  switch (action.type) {
    case 'ADD_BOOK':
      if (!action.book?.id || state.some((book) => book.id === action.book.id)) return state;
      return [...state, action.book];
    case 'REMOVE_BOOK':
      return state.filter((book) => book.id !== action.id);
    case 'CLEAR_LIST':
      return [];
    default:
      return state;
  }
}

export function ReadingListProvider({ children }) {
  const [books, dispatch] = useReducer(readingListReducer, undefined, readInitialList);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(books)); } catch { /* storage can be unavailable in private browsing */ }
  }, [books]);
  const value = useMemo(() => ({
    books,
    count: books.length,
    addBook: (book) => dispatch({ type: 'ADD_BOOK', book }),
    removeBook: (id) => dispatch({ type: 'REMOVE_BOOK', id }),
    clearList: () => dispatch({ type: 'CLEAR_LIST' }),
    hasBook: (id) => books.some((book) => book.id === id),
  }), [books]);
  return <ReadingListContext.Provider value={value}>{children}</ReadingListContext.Provider>;
}

export function useReadingList() {
  const context = useContext(ReadingListContext);
  if (!context) throw new Error('useReadingList must be used inside ReadingListProvider');
  return context;
}
