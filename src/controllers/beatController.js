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
      `SELECT b.id, b.title, b.slug, b.bpm, b.key_signature, b.cover_art_path, b.preview_path, b.created_at, b.featured,
        (SELECT GROUP_CONCAT(tag) FROM beat_tags WHERE beat_id = b.id) AS tags,
        (SELECT MIN(price_cents) FROM beat_prices WHERE beat_id = b.id) AS min_price_cents,
        (SELECT currency FROM beat_prices WHERE beat_id = b.id ORDER BY price_cents ASC LIMIT 1) AS currency
       FROM beats b
       WHERE b.status = 'published'
       ORDER BY b.created_at DESC`
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

async function setBeatPrices(req, res) {
  try {
    const beatId = req.params.id;
    const { currency = 'USD', prices } = req.body;

    if (!Array.isArray(prices) || prices.length === 0) {
      return res.status(400).json({ error: 'prices must be a non-empty list' });
    }

    const [beats] = await db.query('SELECT id FROM beats WHERE id = ?', [beatId]);
    if (beats.length === 0) {
      return res.status(404).json({ error: 'Beat not found' });
    }

    for (const p of prices) {
      const amount = Number(p.price);
      if (!Number.isInteger(p.tier_id) || !(amount >= 0)) {
        return res.status(400).json({ error: 'Each price needs a tier_id and a valid price' });
      }
      await db.query(
        `INSERT INTO beat_prices (beat_id, tier_id, price_cents, currency)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE price_cents = VALUES(price_cents), currency = VALUES(currency)`,
        [beatId, p.tier_id, Math.round(amount * 100), currency]
      );
    }

    res.json({ message: 'Prices saved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save prices' });
  }
}

async function listAllBeatsAdmin(req, res) {
  try {
    const [beats] = await db.query(
      `SELECT b.id, b.title, b.slug, b.status, b.preview_failed, b.cover_art_path, b.preview_path, b.featured,
        b.bpm, b.key_signature, b.description,
        (SELECT COUNT(*) FROM beat_prices WHERE beat_id = b.id) AS price_count,
        (SELECT GROUP_CONCAT(tag) FROM beat_tags WHERE beat_id = b.id) AS tags
       FROM beats b
       ORDER BY b.created_at DESC`
    );
    res.json(beats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load beats' });
  }
}

async function setFeatured(req, res) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.query('SELECT id, featured FROM beats WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Beat not found' });
    }

    const makeFeatured = !rows[0].featured;

    if (makeFeatured) {
      await connection.query('UPDATE beats SET featured = FALSE WHERE featured = TRUE');
    }
    await connection.query('UPDATE beats SET featured = ? WHERE id = ?', [makeFeatured, req.params.id]);

    await connection.commit();
    res.json({ featured: makeFeatured });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: 'Failed to update featured beat' });
  } finally {
    connection.release();
  }
}

async function updateBeat(req, res) {
  try {
    const beatId = req.params.id;
    const { title, bpm, key_signature, description, tags } = req.body;

    const [rows] = await db.query('SELECT id FROM beats WHERE id = ?', [beatId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Beat not found' });
    }

    await db.query(
      `UPDATE beats SET title = ?, bpm = ?, key_signature = ?, description = ? WHERE id = ?`,
      [title, bpm || null, key_signature || null, description || null, beatId]
    );

    if (tags !== undefined) {
      await db.query('DELETE FROM beat_tags WHERE beat_id = ?', [beatId]);
      const tagList = (tags || '').split(',').map((t) => t.trim()).filter(Boolean);
      for (const tag of tagList) {
        await db.query('INSERT INTO beat_tags (beat_id, tag) VALUES (?, ?)', [beatId, tag]);
      }
    }

    res.json({ message: 'Beat updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update beat' });
  }
}

async function deleteBeat(req, res) {
  try {
    const beatId = req.params.id;

    const [rows] = await db.query(
      `SELECT b.id, b.cover_art_path, b.preview_path,
        (SELECT storage_path FROM beat_files WHERE beat_id = b.id AND file_type = 'wav' LIMIT 1) AS wav_path
       FROM beats b WHERE b.id = ?`,
      [beatId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Beat not found' });
    }
    const beat = rows[0];

    await db.query('DELETE FROM beats WHERE id = ?', [beatId]);

    // Best-effort file cleanup — if a file is already missing, that's fine.
    for (const key of [beat.cover_art_path, beat.preview_path, beat.wav_path]) {
      if (!key) continue;
      try {
        await storage.remove(key);
      } catch {
        // ignore — file may already be gone
      }
    }

    res.json({ message: 'Beat deleted' });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
      return res.status(409).json({ error: 'This beat has orders associated with it and cannot be deleted' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to delete beat' });
  }
}

function getExt(filename) {
  const parts = filename.split('.');
  return parts.length > 1 ? `.${parts[parts.length - 1]}` : '';
}

module.exports = {
  createBeat,
  listPublishedBeats,
  getBeatBySlug,
  publishBeat,
  setBeatPrices,
  listAllBeatsAdmin,
  setFeatured,
  updateBeat,
  deleteBeat
};