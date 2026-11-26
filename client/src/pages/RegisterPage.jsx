import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../api.js';
import { AuthShell } from './LoginPage.jsx';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  function update(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); }
  async function submit(event) {
    event.preventDefault(); setError(''); setSubmitting(true);
    try {
      const result = await apiRequest('/auth/register', { method: 'POST', body: form });
      const token = result.accessToken || result.access_token || result.token;
      if (!token) throw new Error('The server did not return an access token.');
      localStorage.setItem('token', token);
      localStorage.setItem('accessToken', token);
      if (result.user) localStorage.setItem('stacks-user', JSON.stringify(result.user));
      window.dispatchEvent(new Event('stacks-auth-changed'));
      navigate('/spaces/book', { replace: true });
    } catch (cause) { setError(cause.message || 'Could not create your account. Please try again.'); }
    finally { setSubmitting(false); }
  }
  return <AuthShell eyebrow="JOIN THE READING ROOM" title="A little more room for stories."><form className="auth-form" onSubmit={submit}><label>Your name<input name="name" type="text" autoComplete="name" value={form.name} onChange={update} placeholder="How should we call you?" /></label><label>Email address<input name="email" type="email" autoComplete="email" required value={form.email} onChange={update} placeholder="you@example.com" /></label><label>Password<input name="password" type="password" autoComplete="new-password" minLength={6} required value={form.password} onChange={update} placeholder="At least 6 characters" /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button-dark auth-submit" disabled={submitting}>{submitting ? 'Creating account…' : 'Create account'} <span>→</span></button></form><p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p></AuthShell>;
}
