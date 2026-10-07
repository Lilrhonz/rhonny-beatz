import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_URL, fileUrl } from '../config';
import SEO from '../components/SEO';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    fetch(`${API_URL}/api/posts`)
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  return (
    <main className="blog-page">
      <SEO title="News" description="Updates, drops, and announcements from Rhonny Beatz." />
      <h1 className="section-title">News & Updates</h1>

      {status === 'loading' && <p className="notice">Loading...</p>}
      {status === 'error' && <p className="notice">Couldn't load posts.</p>}
      {status === 'ready' && posts.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">📰</span>
          <p className="empty-title">Nothing posted yet</p>
          <p className="empty-sub">Check back soon for updates.</p>
        </div>
      )}

      <div className="blog-list">
        {posts.map((p) => (
          <Link key={p.id} to={`/news/${p.slug}`} className="blog-card">
            {p.cover_image_path && (
              <div className="blog-card-cover">
                <img src={fileUrl(p.cover_image_path)} alt={p.title} />
              </div>
            )}
            <div className="blog-card-body">
              <h3>{p.title}</h3>
              <span className="blog-card-date">{new Date(p.created_at).toLocaleDateString()}</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}