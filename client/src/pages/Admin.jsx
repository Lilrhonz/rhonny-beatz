import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import SEO from '../components/SEO';
import BeatsTab from './admin/BeatsTab';
import VideosTab from './admin/VideosTab';
import PostsTab from './admin/PostsTab';
import PeopleTab from './admin/PeopleTab';

const TABS = [
  { id: 'beats', label: 'Beats', icon: '🎵' },
  { id: 'videos', label: 'Videos', icon: '▶️' },
  { id: 'posts', label: 'News', icon: '📰' },
  { id: 'people', label: 'People', icon: '👥' }
];

export default function Admin() {
  const { user } = useOutletContext();
  const [tab, setTab] = useState('beats');

  return (
    <div className="dashboard">
      <SEO title="Dashboard" noindex />

      <aside className="dash-sidebar">
        <div className="dash-brand">
          RHONNY<span>BEATZ</span>
          <small>Dashboard</small>
        </div>

        <nav className="dash-nav">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`dash-nav-item ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <span className="dash-nav-icon">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        <div className="dash-role-badge">
          {user?.role === 'developer' ? '🛠 Developer access' : '🎚 Admin access'}
        </div>
      </aside>

      <main className="dash-main">
        {tab === 'beats' && <BeatsTab />}
        {tab === 'videos' && <VideosTab />}
        {tab === 'posts' && <PostsTab />}
        {tab === 'people' && <PeopleTab />}
      </main>
    </div>
  );
}