import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Hero from '../components/Hero';
import BeatRow from '../components/BeatRow';

export default function Home() {
  const { beats, status, currentBeat, isPlaying, togglePlay, openLicense } = useOutletContext();
  const [search, setSearch] = useState('');

  const visibleBeats = beats.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Hero search={search} onSearch={setSearch} />

      <main id="beats">
        <h2 className="section-title">Latest beats</h2>

        {status === 'loading' && <p className="notice">Loading beats...</p>}
        {status === 'error' && <p className="notice">Couldn't load beats. Is the API running?</p>}
        {status === 'ready' && beats.length === 0 && <p className="notice">No beats yet. Check back soon.</p>}
        {status === 'ready' && beats.length > 0 && visibleBeats.length === 0 && (
          <p className="notice">No beats match "{search}".</p>
        )}

        <div className="tracklist">
          {visibleBeats.map((beat) => (
            <BeatRow
              key={beat.id}
              beat={beat}
              isPlaying={currentBeat?.id === beat.id && isPlaying}
              onToggle={togglePlay}
              onOpenLicenses={(b) => openLicense(b.slug)}
            />
          ))}
        </div>
      </main>
    </>
  );
}