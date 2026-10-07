export default function BeatRowSkeleton() {
  return (
    <div className="beat-row skeleton-row">
      <div className="row-cover skeleton-block" />
      <div className="row-main">
        <div className="skeleton-line skeleton-title" />
        <div className="skeleton-line skeleton-chip" />
      </div>
      <div className="row-stat">
        <div className="skeleton-line skeleton-stat" />
        <div className="skeleton-line skeleton-stat" />
      </div>
      <div className="skeleton-block skeleton-price" />
    </div>
  );
}