import { fileUrl } from '../config';
import AudioVisualizer from './AudioVisualizer';

function formatTime(seconds) {
  if (!isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function PlayerBar({
  beat, isPlaying, current, duration, repeatOne,
  onToggle, onSeek, onPrev, onNext, onToggleRepeat, audioRef
}) {
  if (!beat) return null;

  return (
    <div className="player-bar">
      <img src={fileUrl(beat.cover_art_path)} alt="" className="player-cover" />
      <div className="player-info">
        <strong>{beat.title}</strong>
        <span>Rhonny Beatz</span>
      </div>

      <div className="player-controls">
        <button className="player-side" onClick={onPrev} aria-label="Previous">⏮</button>
        <button className="player-toggle" onClick={() => onToggle(beat)}>
          {isPlaying ? '❚❚' : '▶'}
        </button>
        <button className="player-side" onClick={onNext} aria-label="Next">⏭</button>
      </div>

      <AudioVisualizer audioRef={audioRef} isPlaying={isPlaying} />

      <span className="time">{formatTime(current)}</span>
      <input
        className="seek"
        type="range"
        min="0"
        max={duration || 0}
        step="0.1"
        value={current}
        onChange={(e) => onSeek(Number(e.target.value))}
      />
      <span className="time">{formatTime(duration)}</span>

      <button
        className={`repeat-btn ${repeatOne ? 'active' : ''}`}
        onClick={onToggleRepeat}
        aria-label="Repeat one"
        title="Repeat"
      >
        ⟳
      </button>
    </div>
  );
}