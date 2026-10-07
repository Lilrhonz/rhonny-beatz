import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { API_URL, fileUrl, formatPrice } from '../../config';
import { getToken } from '../../auth';

const TIERS = [
  { id: 1, name: 'MP3 Lease' },
  { id: 2, name: 'WAV Lease' },
  { id: 3, name: 'Trackout' },
  { id: 4, name: 'Exclusive' }
];

export default function BeatsTab() {
  const { refreshBeats, user } = useOutletContext();
  const [beats, setBeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [openRowId, setOpenRowId] = useState(null); // which row's price/edit panel is open
  const [panelMode, setPanelMode] = useState(null); // 'prices' | 'edit'
  const isDeveloper = user?.role === 'developer';

  function loadAdminBeats() {
    setLoading(true);
    fetch(`${API_URL}/api/beats/admin/all`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
      .then((res) => res.json())
      .then((data) => {
        setBeats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    loadAdminBeats();
  }, []);

  async function handleUpload(e) {
    e.preventDefault();
    setUploadError('');
    setUploading(true);

    const form = e.target;
    const formData = new FormData();
    formData.append('title', form.title.value);
    formData.append('bpm', form.bpm.value);
    formData.append('key_signature', form.key_signature.value);
    formData.append('tags', form.tags.value);
    formData.append('description', form.description.value);
    formData.append('coverArt', form.coverArt.files[0]);
    formData.append('wavFile', form.wavFile.files[0]);

    try {
      const res = await fetch(`${API_URL}/api/beats`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || 'Upload failed');
        return;
      }
      form.reset();
      loadAdminBeats();
      refreshBeats();
    } catch {
      setUploadError("Couldn't reach the server.");
    } finally {
      setUploading(false);
    }
  }

  async function handlePublish(id) {
    const res = await fetch(`${API_URL}/api/beats/${id}/publish`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error);
    loadAdminBeats();
    refreshBeats();
  }

  async function handleToggleFeatured(id) {
    const res = await fetch(`${API_URL}/api/beats/${id}/featured`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error);
    loadAdminBeats();
    refreshBeats();
  }

  async function handleDelete(id, title) {
    if (!window.confirm(`Permanently delete "${title}"? This cannot be undone.`)) return;
    const res = await fetch(`${API_URL}/api/beats/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error);
    loadAdminBeats();
    refreshBeats();
  }

  function openPanel(id, mode) {
    if (openRowId === id && panelMode === mode) {
      setOpenRowId(null);
      setPanelMode(null);
    } else {
      setOpenRowId(id);
      setPanelMode(mode);
    }
  }

  return (
    <div className="tab-content">
      <div className="dash-card">
        <h2>Upload a new beat</h2>
        <form className="upload-form" onSubmit={handleUpload}>
          <div className="form-row">
            <label className="field">
              <span>Title</span>
              <input name="title" type="text" required />
            </label>
            <label className="field">
              <span>BPM</span>
              <input name="bpm" type="number" />
            </label>
            <label className="field">
              <span>Key</span>
              <input name="key_signature" type="text" placeholder="e.g. C minor" />
            </label>
          </div>
          <label className="field">
            <span>Tags (comma separated)</span>
            <input name="tags" type="text" placeholder="trap, dark, 808" />
          </label>
          <label className="field">
            <span>Description</span>
            <textarea name="description" rows="3" />
          </label>
          <div className="form-row">
            <label className="field">
              <span>Cover art (jpg/png)</span>
              <input name="coverArt" type="file" accept="image/*" required />
            </label>
            <label className="field">
              <span>WAV file</span>
              <input name="wavFile" type="file" accept="audio/wav" required />
            </label>
          </div>
          {uploadError && <p className="form-error">{uploadError}</p>}
          <button className="submit-btn" type="submit" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload beat'}
          </button>
        </form>
      </div>

      <div className="dash-card">
        <h2>Your beats {!loading && `(${beats.length})`}</h2>

        {!loading && beats.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">📀</span>
            <p className="empty-title">No beats uploaded yet</p>
          </div>
        )}

        <div className="admin-table">
          {beats.map((beat) => (
            <div key={beat.id} className="admin-row">
              <img src={fileUrl(beat.cover_art_path)} alt="" className="admin-row-cover" />
              <div className="admin-row-main">
                <h4>{beat.title}</h4>
                <div className="admin-row-badges">
                  <span className={`status-badge status-${beat.status}`}>{beat.status.replace('_', ' ')}</span>
                  {beat.preview_failed === 1 && <span className="status-badge status-error">preview failed</span>}
                  <span className="status-badge">{beat.price_count} price{beat.price_count === 1 ? '' : 's'} set</span>
                  {beat.featured === 1 && <span className="status-badge status-featured">★ Featured</span>}
                </div>
              </div>
              <div className="admin-row-actions">
                <button
                  className={`admin-btn ${beat.featured === 1 ? 'admin-btn-star-active' : ''}`}
                  onClick={() => handleToggleFeatured(beat.id)}
                  disabled={beat.status !== 'published'}
                  title={beat.status !== 'published' ? 'Publish first' : ''}
                >
                  {beat.featured === 1 ? '★' : '☆'}
                </button>
                <button className="admin-btn" onClick={() => openPanel(beat.id, 'edit')}>Edit</button>
                <button className="admin-btn" onClick={() => openPanel(beat.id, 'prices')}>Prices</button>
                <button
                  className="admin-btn admin-btn-primary"
                  onClick={() => handlePublish(beat.id)}
                  disabled={beat.status === 'published' || beat.status === 'sold_exclusive' || !beat.preview_path}
                >
                  {beat.status === 'published' ? 'Published' : 'Publish'}
                </button>
                {isDeveloper && (
                  <button className="admin-btn admin-btn-danger" onClick={() => handleDelete(beat.id, beat.title)}>
                    Delete
                  </button>
                )}
              </div>

              {openRowId === beat.id && panelMode === 'edit' && (
                <EditBeatPanel
                  beat={beat}
                  onSaved={() => {
                    setOpenRowId(null);
                    loadAdminBeats();
                    refreshBeats();
                  }}
                />
              )}
              {openRowId === beat.id && panelMode === 'prices' && (
                <PriceEditor
                  beatId={beat.id}
                  onSaved={() => {
                    setOpenRowId(null);
                    loadAdminBeats();
                    refreshBeats();
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EditBeatPanel({ beat, onSaved }) {
  const [title, setTitle] = useState(beat.title);
  const [bpm, setBpm] = useState(beat.bpm || '');
  const [key, setKey] = useState(beat.key_signature || '');
  const [description, setDescription] = useState(beat.description || '');
  const [tags, setTags] = useState(beat.tags || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/beats/${beat.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ title, bpm, key_signature: key, description, tags })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to save');
        return;
      }
      onSaved();
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="inline-panel">
      <div className="form-row">
        <label className="field"><span>Title</span><input value={title} onChange={(e) => setTitle(e.target.value)} /></label>
        <label className="field"><span>BPM</span><input type="number" value={bpm} onChange={(e) => setBpm(e.target.value)} /></label>
        <label className="field"><span>Key</span><input value={key} onChange={(e) => setKey(e.target.value)} /></label>
      </div>
      <label className="field"><span>Tags</span><input value={tags} onChange={(e) => setTags(e.target.value)} /></label>
      <label className="field"><span>Description</span><textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)} /></label>
      {error && <p className="form-error">{error}</p>}
      <button className="submit-btn" onClick={handleSave} disabled={saving} style={{ width: 'auto', padding: '10px 24px' }}>
        {saving ? 'Saving...' : 'Save changes'}
      </button>
    </div>
  );
}

function PriceEditor({ beatId, onSaved }) {
  const [prices, setPrices] = useState({ 1: '', 2: '', 3: '', 4: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    setSaving(true);
    setError('');
    const payload = {
      currency: 'USD',
      prices: TIERS.filter((t) => prices[t.id] !== '').map((t) => ({ tier_id: t.id, price: Number(prices[t.id]) }))
    };
    if (payload.prices.length === 0) {
      setError('Enter at least one price.');
      setSaving(false);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/beats/${beatId}/prices`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to save prices');
        return;
      }
      onSaved();
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="inline-panel price-editor">
      {TIERS.map((tier) => (
        <label className="field price-field" key={tier.id}>
          <span>{tier.name} (USD)</span>
          <input type="number" min="0" step="0.01" value={prices[tier.id]} onChange={(e) => setPrices({ ...prices, [tier.id]: e.target.value })} />
        </label>
      ))}
      {error && <p className="form-error">{error}</p>}
      <button className="submit-btn" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save prices'}
      </button>
    </div>
  );
}