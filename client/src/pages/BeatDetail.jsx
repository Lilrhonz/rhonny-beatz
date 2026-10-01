import { useEffect, useState } from 'react';
import { useParams, useOutletContext, Link } from 'react-router-dom';
import { API_URL, fileUrl, formatPrice } from '../config';

export default function BeatDetail() {
  const { slug } = useParams();
  const { currentBeat, isPlaying, togglePlay, openLicense } = useOutletContext();
  const [beat, setBeat] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    setStatus('loading');
    fetch(`${API_URL}/api/beats/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => {
        setBeat(data);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, [slug]);

  if (status === 'loading') return <main className="detail-page"><p className="notice">Loading...</p></main>;
  if (status === 'error') {
    return (
      <main className="detail-page">
        <p className="notice">Couldn't find that beat.</p>
        <Link to="/" className="back-link">← Back to all beats</Link>
      </main>
    );
  }

  const playing = currentBeat?.id === beat.id && isPlaying;
  const prices = [...beat.prices].sort((a, b) => a.price_cents - b.price_cents);
  const tags = beat.tags || [];

  return (
    <main className="detail-page">
      <Link to="/" className="back-link">← Back to all beats</Link>

      <div className="detail-head">
        <div className="detail-cover" onClick={() => togglePlay(beat)}>
          <img src={fileUrl(beat.cover_art_path)} alt={beat.title} />
          <span className="detail-play">{playing ? '❚❚' : '▶'}</span>
        </div>

        <div className="detail-info">
          <h1>{beat.title}</h1>
          <div className="chips">
            {beat.bpm && <span className="chip">{beat.bpm} BPM</span>}
            {beat.key_signature && <span className="chip">{beat.key_signature}</span>}
            {tags.map((t) => (
              <span key={t} className="chip">#{t}</span>
            ))}
          </div>
          {beat.description && <p className="detail-desc">{beat.description}</p>}

          <button
            className="submit-btn detail-license-btn"
            onClick={() => openLicense(beat.slug)}
            disabled={prices.length === 0}
          >
            {prices.length === 0
              ? 'Not priced yet'
              : `License this beat — from ${formatPrice(prices[0].price_cents, prices[0].currency)}`}
          </button>
        </div>
      </div>
    </main>
  );
}