import { useState } from 'react';
import { API_URL } from '../config';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch(`${API_URL}/api/subscribers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Something went wrong');
        setStatus('error');
        return;
      }
      setStatus('done');
    } catch {
      setErrorMsg("Couldn't reach the server.");
      setStatus('error');
    }
  }

  if (status === 'done') {
    return <p className="newsletter-done">✓ You're on the list — new drops land in your inbox first.</p>;
  }

  return (
    <form className="newsletter-form" onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        disabled={status === 'loading'}
      />
      <button type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? '...' : 'Notify me'}
      </button>
      {status === 'error' && <p className="form-error newsletter-error">{errorMsg}</p>}
    </form>
  );
}