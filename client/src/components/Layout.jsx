import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import PlayerBar from './PlayerBar';
import LicenseModal from './LicenseModal';
import CartDrawer from './CartDrawer';
import AuthModal from './AuthModal';
import { API_URL, fileUrl } from '../config';
import { getToken, setToken, clearToken } from '../auth';
import { loadFavorites, saveFavorites } from '../favorites';
import { loadRecentlyPlayed, recordPlay } from '../recentlyPlayed';
import ScrollToTop from './ScrollToTop';

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem('rb_cart')) || [];
  } catch {
    return [];
  }
}

export default function Layout() {
  const [beats, setBeats] = useState([]);
  const [status, setStatus] = useState('loading');
  const [currentBeat, setCurrentBeat] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [repeatOne, setRepeatOne] = useState(false);
  const [modalSlug, setModalSlug] = useState(null);
  const [cart, setCart] = useState(loadCart);
  const [cartOpen, setCartOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [favorites, setFavorites] = useState(loadFavorites);
  const [recentIds, setRecentIds] = useState(loadRecentlyPlayed);
  const audioRef = useRef(null);
  const location = useLocation();

  function refreshBeats() {
    fetch(`${API_URL}/api/beats`)
      .then((res) => {
        if (!res.ok) throw new Error('Request failed');
        return res.json();
      })
      .then((data) => {
        setBeats(data);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }

  useEffect(() => {
    refreshBeats();
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Session expired');
        return res.json();
      })
      .then((data) => setUser(data.user))
      .catch(() => clearToken());
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('rb_cart', JSON.stringify(cart));
    } catch {
      // storage unavailable: the cart just won't persist
    }
  }, [cart]);

    useEffect(() => {
    function handleKeyDown(e) {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return; // don't hijack typing

      if (e.code === 'Space') {
        e.preventDefault();
        if (currentBeat) togglePlay(currentBeat);
      } else if (e.code === 'ArrowRight') {
        playOffset(1);
      } else if (e.code === 'ArrowLeft') {
        playOffset(-1);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentBeat, beats]);

  function playBeat(beat) {
    const audio = audioRef.current;
    setCurrentBeat(beat);
    audio.src = fileUrl(beat.preview_path);
    audio.play();
    setRecentIds(recordPlay(beat.id, recentIds));
  }

  function togglePlay(beat) {
    const audio = audioRef.current;
    if (currentBeat?.id === beat.id) {
      audio.paused ? audio.play() : audio.pause();
      return;
    }
    playBeat(beat);
  }

  function playOffset(offset) {
    if (!currentBeat || beats.length === 0) return;
    const idx = beats.findIndex((b) => b.id === currentBeat.id);
    const nextIdx = (idx + offset + beats.length) % beats.length;
    playBeat(beats[nextIdx]);
  }

  function handleEnded() {
    if (repeatOne) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      return;
    }
    if (currentBeat) {
      playOffset(1);
    } else {
      setIsPlaying(false);
    }
  }

  function seek(time) {
    audioRef.current.currentTime = time;
    setCurrent(time);
  }

  function addToCart(item) {
    setCart((prev) => [...prev.filter((i) => i.beatId !== item.beatId), item]);
  }

  function removeFromCart(beatId) {
    setCart((prev) => prev.filter((i) => i.beatId !== beatId));
  }

  function toggleFavorite(beatId) {
    setFavorites((prev) => {
      const next = prev.includes(beatId)
        ? prev.filter((id) => id !== beatId)
        : [...prev, beatId];
      saveFavorites(next);
      return next;
    });
  }

  function handleAuth({ token, user }) {
    setToken(token);
    setUser(user);
    setAuthOpen(false);
  }

  function handleLogout() {
    clearToken();
    setUser(null);
  }

  const recentlyPlayed = recentIds
    .map((id) => beats.find((b) => b.id === id))
    .filter(Boolean);

  const context = {
    beats,
    status,
    currentBeat,
    isPlaying,
    togglePlay,
    openLicense: setModalSlug,
    cart,
    user,
    refreshBeats,
    favorites,
    toggleFavorite,
    recentlyPlayed,
    openAuth: () => setAuthOpen(true)
  };

  return (
    <div className="app">
      <Header
        cartCount={cart.length}
        onOpenCart={() => setCartOpen(true)}
        user={user}
        onOpenAuth={() => setAuthOpen(true)}
        onLogout={handleLogout}
      />

      <div key={location.pathname} className="page-fade">
        <Outlet context={context} />

        
      </div>

      <Footer />

      {modalSlug && (
        <LicenseModal
          beatSlug={modalSlug}
          cart={cart}
          onAdd={addToCart}
          onClose={() => setModalSlug(null)}
        />
      )}

      {cartOpen && (
        <CartDrawer
          cart={cart}
          onRemove={removeFromCart}
          onClear={() => setCart([])}
          onClose={() => setCartOpen(false)}
        />
      )}

      {authOpen && <AuthModal onAuth={handleAuth} onClose={() => setAuthOpen(false)} />}

      <PlayerBar
        beat={currentBeat}
        isPlaying={isPlaying}
        current={current}
        duration={duration}
        repeatOne={repeatOne}
        onToggle={togglePlay}
        onSeek={seek}
        onPrev={() => playOffset(-1)}
        onNext={() => playOffset(1)}
        onToggleRepeat={() => setRepeatOne((v) => !v)}
        audioRef={audioRef}
      />

      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(e) => setCurrent(e.target.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        onEnded={handleEnded}
      />
       <ScrollToTop />
    </div>
  );
}