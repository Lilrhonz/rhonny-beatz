const db = require('../db/connection');

const YT_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

async function listVideos(req, res) {
  try {
    const [videos] = await db.query(
      'SELECT id, video_id, title, is_short FROM youtube_videos ORDER BY created_at DESC'
    );
    res.json(videos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load videos' });
  }
}

async function addVideo(req, res) {
  const { video_id, title, is_short } = req.body;

  if (!video_id || !YT_ID_PATTERN.test(video_id)) {
    return res.status(400).json({ error: 'That doesn\'t look like a valid YouTube video ID' });
  }

  try {
    await db.query(
      'INSERT INTO youtube_videos (video_id, title, is_short) VALUES (?, ?, ?)',
      [video_id, title || null, !!is_short]
    );
    res.status(201).json({ message: 'Video added' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'That video is already on the site' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to add video' });
  }
}

async function removeVideo(req, res) {
  try {
    await db.query('DELETE FROM youtube_videos WHERE id = ?', [req.params.id]);
    res.json({ message: 'Video removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove video' });
  }
}

module.exports = { listVideos, addVideo, removeVideo };