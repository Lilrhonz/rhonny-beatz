import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Hero from '../components/Hero';
import BeatRow from '../components/BeatRow';
import BeatRowSkeleton from '../components/BeatRowSkeleton';
import FilterBar from '../components/FilterBar';
import RecentCard from '../components/RecentCard';
import FeaturedBeat from '../components/FeaturedBeat';
import StatsBar from '../components/StatsBar';
import SEO from '../components/SEO';

export default function Home() {
  const {
    beats, status, currentBeat, isPlaying, togglePlay, openLicense,
    favorites, toggleFavorite, recentlyPlayed
  } = useOutletContext();
  const [search, setSearch] = useState('');
  const [activeTags, setActiveTags] = useState([]);
  const [sort, setSort] = useState('newest');

  const featuredBeat = useMemo(() => beats.find((b) => b.featured === 1), [beats]);

  const allTags = useMemo(() => {
    const set = new Set();
    beats.forEach((b) => {
      (b.tags ? b.tags.split(',') : []).forEach((t) => set.add(t));
    });
    return Array.from(set).sort();
  }, [beats]);

  function toggleTag(tag) {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  const visibleBeats = useMemo(() => {
    let list = beats.filter((b) => b.title.toLowerCase().includes(search.toLowerCase()));

    if (activeTags.length > 0) {
      list = list.filter((b) => {
        const beatTags = b.tags ? b.tags.split(',') : [];
        return activeTags.every((t) => beatTags.includes(t));
      });
    }

    const sorted = [...list];
    if (sort === 'newest') {
      sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sort === 'oldest') {
      sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (sort === 'price_low') {
      sorted.sort((a, b) => (a.min_price_cents ?? Infinity) - (b.min_price_cents ?? Infinity));
    } else if (sort === 'price_high') {
      sorted.sort((a, b) => (b.min_price_cents ?? -1) - (a.min_price_cents ?? -1));
    }
    return sorted;
  }, [beats, search, activeTags, sort]);

  return (
    <>
      <SEO
        title="Home"
        description="Browse and stream original beats from Rhonny Beatz. License instantly in MP3, WAV, or trackout format."
      />
      <Hero search={search} onSearch={setSearch} />
      <StatsBar beats={beats} />

      {featuredBeat && (
        <FeaturedBeat
          beat={featuredBeat}
          isPlaying={currentBeat?.id === featuredBeat.id && isPlaying}
          onToggle={togglePlay}
          onOpenLicenses={(b) => openLicense(b.slug)}
        />
      )}

      {recentlyPlayed.length > 0 && (
        <section className="recent-section">
          <h2 className="section-title">Recently played</h2>
          <div className="recent-shelf">
            {recentlyPlayed.map((beat) => (
              <RecentCard
                key={beat.id}
                beat={beat}
                isPlaying={currentBeat?.id === beat.id && isPlaying}
                onToggle={togglePlay}
              />
            ))}
          </div>
        </section>
      )}

      <main id="beats">
        <h2 className="section-title">Latest beats</h2>

        {status === 'ready' && allTags.length > 0 && (
          <FilterBar
            tags={allTags}
            activeTags={activeTags}
            onToggleTag={toggleTag}
            onClearTags={() => setActiveTags([])}
            sort={sort}
            onSortChange={setSort}
          />
        )}

        {status === 'loading' && (
          <div className="tracklist">
            {Array.from({ length: 5 }).map((_, i) => (
              <BeatRowSkeleton key={i} />
            ))}
          </div>
        )}

        {status === 'error' && (
          <div className="empty-state">
            <span className="empty-icon">⚠️</span>
            <p className="empty-title">Couldn't load beats</p>
            <p className="empty-sub">Check that the server is running, then refresh.</p>
          </div>
        )}

        {status === 'ready' && beats.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">🎧</span>
            <p className="empty-title">No beats yet</p>
            <p className="empty-sub">New beats are on the way. Check back soon.</p>
          </div>
        )}

        {status === 'ready' && beats.length > 0 && visibleBeats.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">🔍</span>
            <p className="empty-title">No beats match your filters</p>
            <p className="empty-sub">Try a different search or clear the tag filters.</p>
          </div>
        )}

        {status === 'ready' && visibleBeats.length > 0 && (
          <div className="tracklist">
            {visibleBeats.map((beat, i) => (
              <div
                key={beat.id}
                className="tracklist-item-enter"
                style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
              >
                <BeatRow
                  beat={beat}
                  isPlaying={currentBeat?.id === beat.id && isPlaying}
                  onToggle={togglePlay}
                  onOpenLicenses={(b) => openLicense(b.slug)}
                  isFavorite={favorites.includes(beat.id)}
                  onToggleFavorite={toggleFavorite}
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}