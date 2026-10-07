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
    const [rows] = await db.query('SELECT id FROM posts WHERE slug = ?', [slug]);
    if (rows.length === 0) return slug;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

async function listPublishedPosts(req, res) {
  try {
    const [posts] = await db.query(
      `SELECT id, title, slug, cover_image_path, created_at
       FROM posts WHERE status = 'published' ORDER BY created_at DESC`
    );
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load posts' });
  }
}

async function getPostBySlug(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT id, title, slug, body, cover_image_path, created_at
       FROM posts WHERE slug = ? AND status = 'published'`,
      [req.params.slug]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load post' });
  }
}

async function listAllPostsAdmin(req, res) {
  try {
    const [posts] = await db.query(
      `SELECT id, title, slug, status, created_at FROM posts ORDER BY created_at DESC`
    );
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load posts' });
  }
}

async function createPost(req, res) {
  try {
    const { title, body } = req.body;
    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    const slug = await generateUniqueSlug(slugify(title));

    let coverPath = null;
    if (req.file) {
      coverPath = await storage.save(req.file.buffer, `${slug}-cover${req.file.originalname.match(/\.\w+$/)?.[0] || ''}`, 'public');
    }

    const [result] = await db.query(
      `INSERT INTO posts (title, slug, body, cover_image_path, status) VALUES (?, ?, ?, ?, 'draft')`,
      [title, slug, body, coverPath]
    );

    res.status(201).json({ id: result.insertId, slug, message: 'Post created as draft' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create post' });
  }
}

async function publishPost(req, res) {
  try {
    const [result] = await db.query("UPDATE posts SET status = 'published' WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ message: 'Post published' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to publish post' });
  }
}

module.exports = { listPublishedPosts, getPostBySlug, listAllPostsAdmin, createPost, publishPost };