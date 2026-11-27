import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { apiRequest } from '../api.js';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  function update(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); }
  async function submit(event) {
    event.preventDefault(); setError(''); setSubmitting(true);
    try {
      const result = await apiRequest('/auth/login', { method: 'POST', body: form });
      const token = result.accessToken || result.access_token || result.token;
      if (!token) throw new Error('The server did not return an access token.');
      localStorage.setItem('token', token);
      localStorage.setItem('accessToken', token);
      if (result.user) localStorage.setItem('stacks-user', JSON.stringify(result.user));
      window.dispatchEvent(new Event('stacks-auth-changed'));
      const requestedPath = location.state?.from?.pathname;
      if (requestedPath) navigate(requestedPath, { replace: true });
      else {
        let resumePath = '/digital-library';
        try {
          const latest = await apiRequest('/reading-progress/latest', { token });
          if (latest?.progress?.bookSlug) resumePath = `/read/${latest.progress.bookSlug}`;
        } catch { /* A saved reading place is optional after sign-in. */ }
        navigate(resumePath, { replace: true });
      }
    } catch (cause) { setError(cause.message || 'Could not sign in. Please try again.'); }
    finally { setSubmitting(false); }
  }
  return <AuthShell eyebrow="WELCOME BACK" title="Your next chapter awaits."><form className="auth-form" onSubmit={submit}><label>Email address<input name="email" type="email" autoComplete="email" required value={form.email} onChange={update} placeholder="you@example.com" /></label><label>Password<input name="password" type="password" autoComplete="current-password" required value={form.password} onChange={update} placeholder="Your password" /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button-dark auth-submit" disabled={submitting}>{submitting ? 'Signing in…' : 'Sign in'} <span>→</span></button></form><p className="auth-switch">New to Stacks? <Link to="/register">Create an account</Link></p></AuthShell>;
}

export function AuthShell({ eyebrow, title, children }) {
  return <section className="auth-page"><div className="auth-art"><span className="auth-art-mark">✳</span><span className="eyebrow">A GOOD PLACE TO BEGIN</span><p>Make room<br />for a good story.</p><span className="auth-art-note">YOUR NEIGHBORHOOD READING ROOM</span></div><div className="auth-panel"><Link className="back-link" to="/">← BACK TO THE CATALOG</Link><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{children}</div></section>;
}
