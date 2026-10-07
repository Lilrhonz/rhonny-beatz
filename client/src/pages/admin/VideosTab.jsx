import { useEffect, useState } from 'react';
import { API_URL } from '../../config';
import { getToken } from '../../auth';

function extractYouTubeId(input) {
  const trimmed = input.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed;
  try {
    const url = new URL(trimmed);
    if (url.hostname.includes('youtu.be')) return url.pathname.slice(1).split('/')[0];
    if (url.searchParams.has('v')) return url.searchParams.get('v');
    if (url.pathname.includes('/embed/')) return url.pathname.split('/embed/')[1].split('/')[0];
  } catch {
    // fall through
  }
  return trimmed;
}

export default function VideosTab() {
  const [videos, setVideos] = useState([]);
  const [videoId, setVideoId] = useState('');
  const [title, setTitle] = useState('');
  const [isShort, setIsShort] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  function loadVideos() {
    fetch(`${API_URL}/api/videos`)
      .then((res) => res.json())
      .then((data) => { setVideos(data); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => { loadVideos(); }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ video_id: extractYouTubeId(videoId), title: title.trim(), is_short: isShort })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to add video'); return; }
      setVideoId(''); setTitle(''); setIsShort(false);
      loadVideos();
    } catch {
      setError("Couldn't reach the server.");
    }
  }

  async function handleRemove(id) {
    await fetch(`${API_URL}/api/videos/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } });
    loadVideos();
  }

  return (
    <div className="tab-content">
      <div className="dash-card">
        <h2>Add a YouTube video</h2>
        <form className="upload-form" onSubmit={handleAdd}>
          <div className="form-row">
            <label className="field">
              <span>Video ID or link</span>
              <input type="text" value={videoId} onChange={(e) => setVideoId(e.target.value)} placeholder="e.g. https://youtu.be/dQw4w9WgXcQ" required />
            </label>
            <label className="field">
              <span>Title (optional)</span>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New beat breakdown" />
            </label>
          </div>
          <label className="checkbox-field">
            <input type="checkbox" checked={isShort} onChange={(e) => setIsShort(e.target.checked)} />
            <span>This is a vertical video / Short</span>
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="submit-btn" type="submit">Add video</button>
        </form>
      </div>

      <div className="dash-card">
        <h2>Videos {!loading && `(${videos.length})`}</h2>
        {!loading && (
          <div className="admin-table">
            {videos.map((v) => (
              <div key={v.id} className="admin-row">
                <div className="admin-row-main">
                  <h4>{v.title || v.video_id}</h4>
                  <span className="status-badge">{v.video_id}{v.is_short ? ' · Short' : ''}</span>
                </div>
                <div className="admin-row-actions">
                  <button className="admin-btn" onClick={() => handleRemove(v.id)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}