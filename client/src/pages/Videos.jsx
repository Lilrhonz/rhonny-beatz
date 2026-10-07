import { useEffect, useState } from 'react';
import { API_URL } from '../config';
import SEO from '../components/SEO';

const CHANNEL_URL = 'https://www.youtube.com/@rhonnybeatz';

export default function Videos() {
  const [videos, setVideos] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    fetch(`${API_URL}/api/videos`)
      .then((res) => res.json())
      .then((data) => {
        setVideos(data);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  const shorts = videos.filter((v) => v.is_short);
  const standard = videos.filter((v) => !v.is_short);

  return (
    <main className="videos-page">
      <SEO title="Videos" description="Watch beat breakdowns and more from Rhonny Beatz on YouTube." />

      <div className="videos-head">
        <h1>Watch the beats come to life</h1>
        <p>Type beats, breakdowns, and more — straight from the YouTube channel.</p>
        <a href={CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="submit-btn yt-subscribe">
          ▶ Subscribe on YouTube
        </a>
      </div>

      {status === 'loading' && <p className="notice">Loading videos...</p>}
      {status === 'error' && <p className="notice">Couldn't load videos.</p>}
      {status === 'ready' && videos.length === 0 && <p className="notice">No videos added yet.</p>}

      {standard.length > 0 && (
        <section className="video-section">
          <h2 className="section-title">Full videos</h2>
          <div className="video-grid">
            {standard.map((v) => (
              <div key={v.id} className="video-embed">
                <iframe
                  src={`https://www.youtube.com/embed/${v.video_id}`}
                  title={v.title || `YouTube video ${v.video_id}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {shorts.length > 0 && (
        <section className="video-section">
          <h2 className="section-title">Shorts</h2>
          <div className="shorts-grid">
            {shorts.map((v) => (
              <div key={v.id} className="shorts-embed">
                <iframe
                  src={`https://www.youtube.com/embed/${v.video_id}`}
                  title={v.title || `YouTube Short ${v.video_id}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}