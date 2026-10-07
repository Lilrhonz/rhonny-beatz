import { Link } from 'react-router-dom';
import { fileUrl, formatPrice } from '../config';
import ShareButton from './ShareButton';
import MiniWaveform from './MiniWaveform';

function isNew(createdAt) {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return new Date(createdAt).getTime() > sevenDaysAgo;
}

export default function BeatRow({ beat, isPlaying, onToggle, onOpenLicenses, isFavorite, onToggleFavorite }) {
  const tags = beat.tags ? beat.tags.split(',') : [];

  return (
    <div className={`beat-row ${isPlaying ? 'is-playing' : ''}`}>
            <div className="row-cover" onClick={() => onToggle(beat)}>
        <img src={fileUrl(beat.cover_art_path)} alt={beat.title} />
        <span className="row-play">{isPlaying ? '❚❚' : '▶'}</span>
        <div className="row-waveform-hover">
          <MiniWaveform seed={beat.id} />
        </div>
      </div>

        return (
    <div className={`beat-row ${isPlaying ? 'is-playing' : ''}`}>
      <div className="row-cover" onClick={() => onToggle(beat)}>
        <img src={fileUrl(beat.cover_art_path)} alt={beat.title} />
        <span className="row-play">{isPlaying ? '❚❚' : '▶'}</span>
        <div className="row-waveform-hover">
          <MiniWaveform seed={beat.id} />
        </div>
        {isNew(beat.created_at) && <span className="new-badge">NEW</span>}
      </div>

      <div className="row-main">
        <Link to={`/beat/${beat.slug}`} className="row-title-link">
          <h3>{beat.title}</h3>
        </Link>
        <div className="chips">
          {tags.map((t) => (
            <Link key={t} to={`/genre/${t}`} className="chip chip-link">#{t}</Link>
          ))}
        </div>
      </div>

      <div className="row-stat">
        <span>{beat.bpm ? `${beat.bpm} BPM` : '—'}</span>
        <span>{beat.key_signature || '—'}</span>
      </div>

      <ShareButton url={`/beat/${beat.slug}`} title={beat.title} />

      <button
        className={`heart-btn ${isFavorite ? 'is-favorite' : ''}`}
        onClick={() => onToggleFavorite(beat.id)}
        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        {isFavorite ? '♥' : '♡'}
      </button>

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

      <div className="row-main">
        <Link to={`/beat/${beat.slug}`} className="row-title-link">
          <h3>{beat.title}</h3>
        </Link>
                <div className="chips">
          {tags.map((t) => (
            <Link key={t} to={`/genre/${t}`} className="chip chip-link">#{t}</Link>
          ))}
        </div>
      </div>

      <div className="row-stat">
        <span>{beat.bpm ? `${beat.bpm} BPM` : '—'}</span>
        <span>{beat.key_signature || '—'}</span>
      </div>

      <ShareButton url={`/beat/${beat.slug}`} title={beat.title} />

      <button
        className={`heart-btn ${isFavorite ? 'is-favorite' : ''}`}
        onClick={() => onToggleFavorite(beat.id)}
        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        {isFavorite ? '♥' : '♡'}
      </button>

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