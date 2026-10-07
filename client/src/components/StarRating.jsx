export default function StarRating({ value, onChange, readOnly = false }) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className={`star-rating ${readOnly ? 'read-only' : ''}`}>
      {stars.map((n) => (
        <span
          key={n}
          className={n <= value ? 'star filled' : 'star'}
          onClick={readOnly ? undefined : () => onChange(n)}
        >
          ★
        </span>
      ))}
    </div>
  );
}