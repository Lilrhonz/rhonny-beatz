const db = require('../db/connection');

async function listApprovedReviews(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.email AS reviewer_email
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       WHERE r.beat_id = ? AND r.status = 'approved'
       ORDER BY r.created_at DESC`,
      [req.params.beatId]
    );
    // Only show the part of the email before @, so reviewers aren't fully exposed
    const safe = rows.map((r) => ({
      ...r,
      reviewer_name: r.reviewer_email.split('@')[0],
      reviewer_email: undefined
    }));
    res.json(safe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load reviews' });
  }
}

async function submitReview(req, res) {
  const { rating, comment } = req.body;
  const beatId = req.params.beatId;

  const ratingNum = Number(rating);
  if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ error: 'Rating must be a whole number from 1 to 5' });
  }

  try {
    const [beatRows] = await db.query('SELECT id FROM beats WHERE id = ?', [beatId]);
    if (beatRows.length === 0) {
      return res.status(404).json({ error: 'Beat not found' });
    }

    await db.query(
      'INSERT INTO reviews (beat_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
      [beatId, req.user.id, ratingNum, (comment || '').trim() || null]
    );
    res.status(201).json({ message: 'Review submitted and awaiting approval' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: "You've already reviewed this beat" });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to submit review' });
  }
}

async function listAllReviewsAdmin(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT r.id, r.rating, r.comment, r.status, r.created_at, u.email AS reviewer_email, b.title AS beat_title
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       JOIN beats b ON b.id = r.beat_id
       ORDER BY r.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load reviews' });
  }
}

async function moderateReview(req, res) {
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Status must be approved or rejected' });
  }

  try {
    await db.query('UPDATE reviews SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: `Review ${status}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update review' });
  }
}

module.exports = { listApprovedReviews, submitReview, listAllReviewsAdmin, moderateReview };