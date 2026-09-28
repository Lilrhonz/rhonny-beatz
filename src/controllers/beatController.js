const db = require('../db/connection');
const storage = require('../services/storageService');
const { generatePreview } = require('../services/previewService');

function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function generateUniqueSlug(baseSlug) {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const [rows] = await db.query('SELECT id FROM beats WHERE slug = ?', [slug]);
    if (rows.length === 0) return slug;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

async function createBeat(req, res) {
  try {
    const { title, bpm, key_signature, description, tags } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!req.files || !req.files.coverArt || !req.files.wavFile) {
      return res.status(400).json({ error: 'Cover art and WAV file are required' });
    }

    const baseSlug = slugify(title);
    const slug = await generateUniqueSlug(baseSlug);

    const coverArtFile = req.files.coverArt[0];
    const wavFile = req.files.wavFile[0];

    const coverArtKey = await storage.save(
      coverArtFile.buffer,
      `${slug}-cover${getExt(coverArtFile.originalname)}`,
      'public'
    );

    const wavKey = await storage.save(
      wavFile.buffer,
      `${slug}${getExt(wavFile.originalname)}`,
      'private'
    );

    const [result] = await db.query(
      `INSERT INTO beats (title, slug, bpm, key_signature, description, cover_art_path, status)
       VALUES (?, ?, ?, ?, ?, ?, 'draft')`,
      [title, slug, bpm || null, key_signature || null, description || null, coverArtKey]
    );

    const beatId = result.insertId;

    await db.query(
      `INSERT INTO beat_files (beat_id, file_type, storage_path, file_size) VALUES (?, 'wav', ?, ?)`,
      [beatId, wavKey, wavFile.size]
    );
        let previewFailed = false;
    try {
      const previewKey = await generatePreview(wavKey, slug);
      await db.query('UPDATE beats SET preview_path = ? WHERE id = ?', [previewKey, beatId]);
    } catch (previewErr) {
      console.error('Preview generation failed:', previewErr.message);
      previewFailed = true;
      await db.query('UPDATE beats SET preview_failed = TRUE WHERE id = ?', [beatId]);
    }

    if (tags) {
      const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);
      for (const tag of tagList) {
        await db.query('INSERT INTO beat_tags (beat_id, tag) VALUES (?, ?)', [beatId, tag]);
      }
    }
        res.status(201).json({
      id: beatId,
      slug,
      preview_failed: previewFailed,
      message: 'Beat created as draft'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create beat' });
  }
}
async function listPublishedBeats(req, res) {
  try {
    const [beats] = await db.query(
      `SELECT id, title, slug, bpm, key_signature, cover_art_path, preview_path, created_at
       FROM beats
       WHERE status = 'published'
       ORDER BY created_at DESC`
    );
    res.json(beats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load beats' });
  }
}

async function getBeatBySlug(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT id, title, slug, bpm, key_signature, description, cover_art_path, preview_path, created_at
       FROM beats
       WHERE slug = ? AND status = 'published'`,
      [req.params.slug]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Beat not found' });
    }
    const beat = rows[0];

    const [tags] = await db.query('SELECT tag FROM beat_tags WHERE beat_id = ?', [beat.id]);
    const [prices] = await db.query(
      `SELECT lt.id AS tier_id, lt.name, lt.description, lt.is_exclusive, bp.price_cents, bp.currency
       FROM beat_prices bp
       JOIN license_tiers lt ON lt.id = bp.tier_id
       WHERE bp.beat_id = ?`,
      [beat.id]
    );

    res.json({ ...beat, tags: tags.map((t) => t.tag), prices });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load beat' });
  }
}

async function publishBeat(req, res) {
  try {
    const [rows] = await db.query('SELECT id, status, preview_path FROM beats WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Beat not found' });
    }
    if (!rows[0].preview_path) {
      return res.status(400).json({ error: 'Cannot publish a beat without a preview' });
    }
    await db.query("UPDATE beats SET status = 'published' WHERE id = ?", [req.params.id]);
    res.json({ message: 'Beat published' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to publish beat' });
  }
}

function getExt(filename) {
  const parts = filename.split('.');
  return parts.length > 1 ? `.${parts[parts.length - 1]}` : '';
}

module.exports = { createBeat, listPublishedBeats, getBeatBySlug, publishBeat };