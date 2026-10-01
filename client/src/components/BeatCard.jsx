import { fileUrl } from '../config';

export default function BeatCard({ beat, isPlaying, onToggle }) {
  return (
    <div className={`beat-card ${isPlaying ? 'is-playing' : ''}`}>
      <div className="cover-wrap" onClick={() => onToggle(beat)}>
        <img src={fileUrl(beat.cover_art_path)} alt={beat.title} />
        <div className="overlay">
          <button className="play-btn" aria-label={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? '❚❚' : '▶'}
          </button>
        </div>
      </div>
      <h3>{beat.title}</h3>
      <div className="chips">
        {beat.bpm && <span className="chip">{beat.bpm} BPM</span>}
        {beat.key_signature && <span className="chip">{beat.key_signature}</span>}
      </div>
    </div>
  );
}