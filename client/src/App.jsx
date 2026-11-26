import { Link, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import BookDetail from './pages/BookDetail.jsx';

export default function App() {
  return <><header className="site-header"><Link className="brand" to="/"><span className="brand-mark">S</span><span>stacks<span className="brand-period">.</span></span></Link><span className="header-note">A library for curious minds</span><a className="header-link" href="#catalog">Explore collection <span aria-hidden="true">↗</span></a></header><main><Routes><Route path="/" element={<HomePage />} /><Route path="/books/:id" element={<BookDetail />} /><Route path="*" element={<div className="state-panel"><span className="eyebrow">404 / PAGE NOT FOUND</span><h1>That page isn’t on our shelves.</h1><Link className="text-link" to="/">Return to the catalog <span>→</span></Link></div>} /></Routes></main><footer className="site-footer"><span>Good books make good company.</span><span>YOUR NEIGHBORHOOD READING ROOM <i>✳</i></span></footer></>;
}
