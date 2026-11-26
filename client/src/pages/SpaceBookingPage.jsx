import { useState } from 'react';

const SPACES = ['Quiet study room', 'Collaboration room', 'Community table'];

export default function SpaceBookingPage() {
  const [form, setForm] = useState({ space: '', date: '', startTime: '', endTime: '' });
  const [message, setMessage] = useState('');
  function update(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); setMessage(''); }
  function submit(event) {
    event.preventDefault();
    if (form.startTime >= form.endTime) { setMessage('Choose an end time that comes after your start time.'); return; }
    setMessage('Your booking details are ready. Space booking requests are not connected to the library API yet, so nothing has been submitted.');
  }
  return <section className="booking-page"><div className="booking-intro"><span className="eyebrow">A LITTLE SPACE TO THINK</span><h1>Make room<br /><em>for focus.</em></h1><p>Choose a spot, pick a time, and save a little space for what matters.</p><div className="booking-decoration">✳ <span>YOUR TIME, YOUR SPACE</span></div></div><form className="booking-form" onSubmit={submit}><span className="eyebrow">SPACE BOOKING REQUEST</span><h2>Plan your visit<span className="brand-period">.</span></h2><label>Choose a space<select name="space" required value={form.space} onChange={update}><option value="" disabled>Select a space</option>{SPACES.map((space) => <option key={space} value={space}>{space}</option>)}</select></label><label>Date<input name="date" type="date" required value={form.date} min={new Date().toISOString().slice(0, 10)} onChange={update} /></label><div className="time-fields"><label>Start time<input name="startTime" type="time" required value={form.startTime} onChange={update} /></label><label>End time<input name="endTime" type="time" required value={form.endTime} onChange={update} /></label></div>{message && <p className={message.startsWith('Choose') ? 'form-error' : 'form-note'} role="status">{message}</p>}<button className="button-dark auth-submit">Review booking request <span>→</span></button><p className="booking-footnote">Booking requests will be saved once the library booking service is connected.</p></form></section>;
}
