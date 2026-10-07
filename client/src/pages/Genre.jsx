import { useMemo } from 'react';
import { useParams, useOutletContext, Link } from 'react-router-dom';
import BeatRow from '../components/BeatRow';
import SEO from '../components/SEO';

export default function Genre() {
  const { tag } = useParams();
  const { beats, status, currentBeat, isPlaying, togglePlay, openLicense, favorites, toggleFavorite } = useOutletContext();

  const matching = useMemo(() => {
    return beats.filter((b) => (b.tags ? b.tags.split(',') : []).includes(tag));
  }, [beats, tag]);

  return (
    <main className="genre-page">
      <SEO title={`#${tag} beats`} description={`Browse all beats tagged #${tag} from Rhonny Beatz.`} />
      <Link to="/" className="back-link">← Back to all beats</Link>
      <h1 className="section-title">#{tag} beats</h1>

      {status === 'ready' && matching.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">🔍</span>
          <p className="empty-title">No beats tagged #{tag}</p>
        </div>
      )}

      <div className="tracklist">
        {matching.map((beat) => (
          <BeatRow
            key={beat.id}
            beat={beat}
            isPlaying={currentBeat?.id === beat.id && isPlaying}
            onToggle={togglePlay}
            onOpenLicenses={(b) => openLicense(b.slug)}
            isFavorite={favorites.includes(beat.id)}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </div>
    </main>
  );
}