import { Link } from 'react-router-dom';
import { fileUrl, formatPrice } from '../config';

export default function BeatRow({ beat, isPlaying, onToggle, onOpenLicenses }) {
  const tags = beat.tags ? beat.tags.split(',') : [];

  return (
    <div className={`beat-row ${isPlaying ? 'is-playing' : ''}`}>
      <div className="row-cover" onClick={() => onToggle(beat)}>
        <img src={fileUrl(beat.cover_art_path)} alt={beat.title} />
        <span className="row-play">{isPlaying ? '❚❚' : '▶'}</span>
      </div>

      <div className="row-main">
        <Link to={`/beat/${beat.slug}`} className="row-title-link">
          <h3>{beat.title}</h3>
        </Link>
        <div className="chips">
          {tags.map((t) => (
            <span key={t} className="chip">#{t}</span>
          ))}
        </div>
      </div>

      <div className="row-stat">
        <span>{beat.bpm ? `${beat.bpm} BPM` : '—'}</span>
        <span>{beat.key_signature || '—'}</span>
      </div>

      <button
        className="price-btn"
        disabled={beat.min_price_cents == null}
        onClick={() => onOpenLicenses(beat)}
      >
        {beat.min_price_cents == null
          ? 'Not priced'
          : `From ${formatPrice(beat.min_price_cents, beat.currency)}`}
      </button>
    </div>
  );
}