import { useEffect, useMemo, useState } from 'react';
import { useParams, useOutletContext, Link } from 'react-router-dom';
import { API_URL, fileUrl, formatPrice } from '../config';
import SEO from '../components/SEO';
import ShareButton from '../components/ShareButton';
import BeatRow from '../components/BeatRow';
import ReviewsSection from '../components/ReviewsSection';

export default function BeatDetail() {
  const { slug } = useParams();
  const {
    beats, currentBeat, isPlaying, togglePlay, openLicense,
    favorites, toggleFavorite, user, openAuth
  } = useOutletContext();
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

  const relatedBeats = useMemo(() => {
    if (!beat) return [];
    const myTags = beat.tags || [];
    if (myTags.length === 0) return [];

    return beats
      .filter((b) => b.id !== beat.id)
      .map((b) => {
        const theirTags = b.tags ? b.tags.split(',') : [];
        const sharedCount = theirTags.filter((t) => myTags.includes(t)).length;
        return { beat: b, sharedCount };
      })
      .filter((entry) => entry.sharedCount > 0)
      .sort((a, b) => b.sharedCount - a.sharedCount)
      .slice(0, 4)
      .map((entry) => entry.beat);
  }, [beat, beats]);

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
      <SEO
        title={beat.title}
        description={beat.description || `Stream and license "${beat.title}" — ${beat.bpm ? beat.bpm + ' BPM' : ''} ${beat.key_signature || ''}`.trim()}
      />
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

          <div className="detail-actions">
            <button
              className="submit-btn detail-license-btn"
              onClick={() => openLicense(beat.slug)}
              disabled={prices.length === 0}
            >
              {prices.length === 0
                ? 'Not priced yet'
                : `License this beat — from ${formatPrice(prices[0].price_cents, prices[0].currency)}`}
            </button>
            <ShareButton url={`/beat/${beat.slug}`} title={beat.title} className="share-btn share-btn-large" />
          </div>
        </div>
      </div>

      <ReviewsSection beatId={beat.id} user={user} onRequireLogin={openAuth} />

      {relatedBeats.length > 0 && (
        <section className="related-section">
          <h2 className="section-title">You might also like</h2>
          <div className="tracklist">
            {relatedBeats.map((rb) => (
              <BeatRow
                key={rb.id}
                beat={rb}
                isPlaying={currentBeat?.id === rb.id && isPlaying}
                onToggle={togglePlay}
                onOpenLicenses={(b) => openLicense(b.slug)}
                isFavorite={favorites.includes(rb.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}