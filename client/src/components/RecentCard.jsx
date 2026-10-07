import { Link } from 'react-router-dom';
import { fileUrl } from '../config';

export default function RecentCard({ beat, isPlaying, onToggle }) {
  return (
    <div className="recent-card">
      <div className="recent-cover" onClick={() => onToggle(beat)}>
        <img src={fileUrl(beat.cover_art_path)} alt={beat.title} />
        <span className="recent-play">{isPlaying ? '❚❚' : '▶'}</span>
      </div>
      <Link to={`/beat/${beat.slug}`} className="recent-title">{beat.title}</Link>
    </div>
  );
}