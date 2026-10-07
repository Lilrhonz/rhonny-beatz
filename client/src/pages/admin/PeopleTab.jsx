import { useEffect, useState } from 'react';
import { API_URL } from '../../config';
import { getToken } from '../../auth';

export default function PeopleTab() {
  return (
    <div className="tab-content">
      <SubscribersCard />
      <ReviewsCard />
      <MessagesCard />
    </div>
  );
}

function SubscribersCard() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/subscribers/admin/all`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then((res) => res.json())
      .then((data) => { setSubscribers(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function downloadCsv() {
    const header = 'email,joined\n';
    const rows = subscribers.map((s) => `${s.email},${s.created_at}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rhonny-beatz-subscribers.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="dash-card">
      <h2>Email subscribers {!loading && `(${subscribers.length})`}</h2>
      {!loading && subscribers.length > 0 && (
        <button className="admin-btn" onClick={downloadCsv} style={{ marginBottom: 14 }}>Download CSV</button>
      )}
      {!loading && subscribers.length === 0 && <p className="notice">No subscribers yet.</p>}
      {!loading && subscribers.length > 0 && (
        <div className="admin-table">
          {subscribers.slice(0, 8).map((s) => (
            <div key={s.id} className="admin-row">
              <div className="admin-row-main">
                <h4>{s.email}</h4>
                <span className="status-badge">{new Date(s.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
          {subscribers.length > 8 && <p className="notice">+ {subscribers.length - 8} more in the CSV.</p>}
        </div>
      )}
    </div>
  );
}

function ReviewsCard() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    fetch(`${API_URL}/api/reviews/admin/all`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then((res) => res.json())
      .then((data) => { setReviews(data); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleModerate(id, status) {
    await fetch(`${API_URL}/api/reviews/${id}/moderate`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ status })
    });
    load();
  }

  const pending = reviews.filter((r) => r.status === 'pending');

  return (
    <div className="dash-card">
      <h2>Reviews to moderate {!loading && `(${pending.length})`}</h2>
      {!loading && pending.length === 0 && <p className="notice">Nothing waiting.</p>}
      {!loading && pending.length > 0 && (
        <div className="admin-table">
          {pending.map((r) => (
            <div key={r.id} className="admin-row review-moderate-row">
              <div className="admin-row-main">
                <h4>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)} — {r.beat_title}</h4>
                <p className="review-moderate-comment">{r.comment || '(no comment)'}</p>
                <span className="status-badge">{r.reviewer_email}</span>
              </div>
              <div className="admin-row-actions">
                <button className="admin-btn" onClick={() => handleModerate(r.id, 'rejected')}>Reject</button>
                <button className="admin-btn admin-btn-primary" onClick={() => handleModerate(r.id, 'approved')}>Approve</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MessagesCard() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/contact/admin/all`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then((res) => res.json())
      .then((data) => { setMessages(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="dash-card">
      <h2>Contact messages {!loading && `(${messages.length})`}</h2>
      {!loading && messages.length === 0 && <p className="notice">No messages yet.</p>}
      {!loading && messages.length > 0 && (
        <div className="admin-table">
          {messages.map((m) => (
            <div key={m.id} className="admin-row review-moderate-row">
              <div className="admin-row-main">
                <h4>{m.name} — <a href={`mailto:${m.email}`}>{m.email}</a></h4>
                <p className="review-moderate-comment">{m.message}</p>
                <span className="status-badge">{new Date(m.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}