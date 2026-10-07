import { Link } from 'react-router-dom';
import { fileUrl, formatPrice } from '../config';

export default function FeaturedBeat({ beat, isPlaying, onToggle, onOpenLicenses }) {
  return (
    <section className="featured-section">
      <p className="featured-label">★ Beat of the Week</p>
      <div className="featured-card">
        <div className="featured-cover" onClick={() => onToggle(beat)}>
          <img src={fileUrl(beat.cover_art_path)} alt={beat.title} />
          <span className="featured-play">{isPlaying ? '❚❚' : '▶'}</span>
        </div>
        <div className="featured-info">
          <Link to={`/beat/${beat.slug}`} className="featured-title-link">
            <h3>{beat.title}</h3>
          </Link>
          <div className="chips">
            {beat.bpm && <span className="chip">{beat.bpm} BPM</span>}
            {beat.key_signature && <span className="chip">{beat.key_signature}</span>}
          </div>
          <button
            className="submit-btn featured-license-btn"
            onClick={() => onOpenLicenses(beat)}
            disabled={beat.min_price_cents == null}
          >
            {beat.min_price_cents == null
              ? 'Not priced'
              : `License from ${formatPrice(beat.min_price_cents, beat.currency)}`}
          </button>
        </div>
      </div>
    </section>
  );
}