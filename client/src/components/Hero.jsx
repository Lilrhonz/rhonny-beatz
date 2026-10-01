import heroBg from '../assets/hero-bg.jpg';

export default function Hero({ search, onSearch }) {
  return (
    <section className="hero" style={{ backgroundImage: `url(${heroBg})` }}>
      <div className="hero-scrim" />
      <div className="hero-content">
        <p className="eyebrow">Official beat store</p>
        <p className="sub">Stream every beat. License the ones you love.</p>
        <div className="hero-search">
          <input
            type="search"
            placeholder="What type of beat are you looking for?"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
          <a href="#beats" className="hero-search-btn">Search</a>
        </div>
      </div>
    </section>
  );
}