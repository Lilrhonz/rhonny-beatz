const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'price_low', label: 'Price: low to high' },
  { value: 'price_high', label: 'Price: high to low' }
];

export default function FilterBar({ tags, activeTags, onToggleTag, onClearTags, sort, onSortChange }) {
  return (
    <div className="filter-bar">
      <div className="filter-tags">
        {tags.map((tag) => (
          <button
            key={tag}
            className={`filter-chip ${activeTags.includes(tag) ? 'active' : ''}`}
            onClick={() => onToggleTag(tag)}
          >
            #{tag}
          </button>
        ))}
        {activeTags.length > 0 && (
          <button className="filter-chip filter-chip-clear" onClick={onClearTags}>
            Clear ✕
          </button>
        )}
      </div>

      <select
        className="sort-select"
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
        aria-label="Sort beats"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}