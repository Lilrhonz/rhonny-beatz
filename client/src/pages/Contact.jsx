import { useState } from 'react';
import { API_URL } from '../config';
import SEO from '../components/SEO';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        setStatus('idle');
        return;
      }
      setStatus('done');
    } catch {
      setError("Couldn't reach the server.");
      setStatus('idle');
    }
  }

  return (
    <main className="contact-page">
      <SEO title="Contact" description="Get in touch with Rhonny Beatz." />
      <h1 className="section-title">Get in touch</h1>
      <p className="notice" style={{ padding: '0 0 24px' }}>
        Questions about a beat, a custom license, or a collab? Send a message below.
      </p>

      {status === 'done' ? (
        <p className="newsletter-done">✓ Message sent — you'll hear back soon.</p>
      ) : (
        <form className="contact-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Name</span>
            <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} required />
          </label>
          <label className="field">
            <span>Email</span>
            <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
          </label>
          <label className="field">
            <span>Message</span>
            <textarea rows="5" value={form.message} onChange={(e) => update('message', e.target.value)} required />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="submit-btn" type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Sending...' : 'Send message'}
          </button>
        </form>
      )}
    </main>
  );
}