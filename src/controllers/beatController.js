const db = require('../db/connection');
const storage = require('../services/storageService');

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

    if (tags) {
      const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);
      for (const tag of tagList) {
        await db.query('INSERT INTO beat_tags (beat_id, tag) VALUES (?, ?)', [beatId, tag]);
      }
    }

    res.status(201).json({ id: beatId, slug, message: 'Beat created as draft' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create beat' });
  }
}

function getExt(filename) {
  const parts = filename.split('.');
  return parts.length > 1 ? `.${parts[parts.length - 1]}` : '';
}

module.exports = { createBeat };