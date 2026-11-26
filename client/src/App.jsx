import { Link, Route, Routes } from 'react-router-dom';
import BookDetail from './pages/BookDetail.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ReadingListPage from './pages/ReadingListPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import SpaceBookingPage from './pages/SpaceBookingPage.jsx';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { ReadingListProvider } from './context/ReadingListContext.jsx';

export default function App() {
  return <ReadingListProvider><Navbar /><main><Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/books/:id" element={<BookDetail />} />
    <Route path="/reading-list" element={<ReadingListPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/spaces/book" element={<ProtectedRoute><SpaceBookingPage /></ProtectedRoute>} />
    <Route path="*" element={<div className="state-panel"><span className="eyebrow">404 / PAGE NOT FOUND</span><h1>That page isn’t on our shelves.</h1><Link className="text-link" to="/">Return to the catalog <span>→</span></Link></div>} />
  </Routes></main><footer className="site-footer"><span>Good books make good company.</span><span>YOUR NEIGHBORHOOD READING ROOM <i>✳</i></span></footer></ReadingListProvider>;
}
