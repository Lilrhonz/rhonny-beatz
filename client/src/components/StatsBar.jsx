export default function StatsBar({ beats }) {
  const beatCount = beats.length;
  const genreCount = new Set(
    beats.flatMap((b) => (b.tags ? b.tags.split(',') : []))
  ).size;

  if (beatCount === 0) return null;

  return (
    <div className="stats-bar">
      <div className="stat-item">
        <strong>{beatCount}</strong>
        <span>beat{beatCount === 1 ? '' : 's'}</span>
      </div>
      <div className="stat-divider" />
      <div className="stat-item">
        <strong>{genreCount}</strong>
        <span>genre{genreCount === 1 ? '' : 's'}</span>
      </div>
      <div className="stat-divider" />
      <div className="stat-item">
        <strong>USD</strong>
        <span>instant licensing</span>
      </div>
    </div>
  );
}