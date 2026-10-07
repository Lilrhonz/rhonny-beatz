import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_URL, fileUrl } from '../config';
import SEO from '../components/SEO';

export default function PostDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    setStatus('loading');
    fetch(`${API_URL}/api/posts/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => {
        setPost(data);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, [slug]);

  if (status === 'loading') return <main className="blog-page"><p className="notice">Loading...</p></main>;
  if (status === 'error') {
    return (
      <main className="blog-page">
        <p className="notice">Couldn't find that post.</p>
        <Link to="/news" className="back-link">← Back to news</Link>
      </main>
    );
  }

  return (
    <main className="blog-page">
      <SEO title={post.title} description={post.body.slice(0, 150)} />
      <Link to="/news" className="back-link">← Back to news</Link>

      {post.cover_image_path && (
        <div className="post-cover">
          <img src={fileUrl(post.cover_image_path)} alt={post.title} />
        </div>
      )}

      <h1>{post.title}</h1>
      <p className="post-date">{new Date(post.created_at).toLocaleDateString()}</p>
      <div className="post-body">
        {post.body.split('\n').map((para, i) => para.trim() && <p key={i}>{para}</p>)}
      </div>
    </main>
  );
}