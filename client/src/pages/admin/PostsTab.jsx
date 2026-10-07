import { useEffect, useState } from 'react';
import { API_URL } from '../../config';
import { getToken } from '../../auth';

export default function PostsTab() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  function loadPosts() {
    fetch(`${API_URL}/api/posts/admin/all`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then((res) => res.json())
      .then((data) => { setPosts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => { loadPosts(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setUploading(true);
    const form = e.target;
    const formData = new FormData();
    formData.append('title', form.title.value);
    formData.append('body', form.body.value);
    if (form.coverImage.files[0]) formData.append('coverImage', form.coverImage.files[0]);

    try {
      const res = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to create post'); return; }
      form.reset();
      loadPosts();
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setUploading(false);
    }
  }

  async function handlePublish(id) {
    await fetch(`${API_URL}/api/posts/${id}/publish`, { method: 'PATCH', headers: { Authorization: `Bearer ${getToken()}` } });
    loadPosts();
  }

  return (
    <div className="tab-content">
      <div className="dash-card">
        <h2>Write a post</h2>
        <form className="upload-form" onSubmit={handleSubmit}>
          <label className="field"><span>Title</span><input name="title" type="text" required /></label>
          <label className="field"><span>Body</span><textarea name="body" rows="5" required placeholder="Blank line = new paragraph" /></label>
          <label className="field"><span>Cover image (optional)</span><input name="coverImage" type="file" accept="image/*" /></label>
          {error && <p className="form-error">{error}</p>}
          <button className="submit-btn" type="submit" disabled={uploading}>{uploading ? 'Posting...' : 'Create post'}</button>
        </form>
      </div>

      <div className="dash-card">
        <h2>Posts {!loading && `(${posts.length})`}</h2>
        {!loading && (
          <div className="admin-table">
            {posts.map((p) => (
              <div key={p.id} className="admin-row">
                <div className="admin-row-main">
                  <h4>{p.title}</h4>
                  <span className={`status-badge status-${p.status}`}>{p.status}</span>
                </div>
                <div className="admin-row-actions">
                  <button className="admin-btn admin-btn-primary" onClick={() => handlePublish(p.id)} disabled={p.status === 'published'}>
                    {p.status === 'published' ? 'Published' : 'Publish'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}