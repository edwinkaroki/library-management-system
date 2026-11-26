import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useReadingList } from '../context/ReadingListContext.jsx';

export default function Navbar() {
  const { count } = useReadingList();
  const [signedIn, setSignedIn] = useState(() => Boolean(localStorage.getItem('token') || localStorage.getItem('accessToken')));
  const navigate = useNavigate();
  useEffect(() => {
    const update = () => setSignedIn(Boolean(localStorage.getItem('token') || localStorage.getItem('accessToken')));
    window.addEventListener('storage', update);
    window.addEventListener('stacks-auth-changed', update);
    return () => { window.removeEventListener('storage', update); window.removeEventListener('stacks-auth-changed', update); };
  }, []);
  function signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('stacks-user');
    window.dispatchEvent(new Event('stacks-auth-changed'));
    navigate('/');
  }
  return <header className="site-header"><Link className="brand" to="/"><span className="brand-mark">S</span><span>stacks<span className="brand-period">.</span></span></Link><span className="header-note">A library for curious minds</span><nav className="site-nav" aria-label="Main navigation"><NavLink to="/" end>Catalog</NavLink><NavLink to="/spaces/book">Book a space</NavLink><Link className="reading-count" to="/reading-list">Reading list <span>{count}</span></Link>{signedIn ? <button className="nav-auth-button" onClick={signOut}>Sign out</button> : <NavLink to="/login">Sign in</NavLink>}</nav></header>;
}
