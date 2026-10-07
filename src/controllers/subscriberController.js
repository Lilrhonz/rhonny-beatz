const db = require('../db/connection');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function subscribe(req, res) {
  const email = (req.body.email || '').trim().toLowerCase();

  if (!EMAIL_PATTERN.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  try {
    await db.query('INSERT INTO subscribers (email) VALUES (?)', [email]);
    res.status(201).json({ message: 'Subscribed' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      // Already on the list — treat as success so no one can tell
      // whether an email is already subscribed (same privacy reasoning
      // as the login endpoint's identical error messages).
      return res.status(200).json({ message: 'Subscribed' });
    }
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function listSubscribers(req, res) {
  try {
    const [rows] = await db.query(
      'SELECT id, email, created_at FROM subscribers ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load subscribers' });
  }
}

module.exports = { subscribe, listSubscribers };