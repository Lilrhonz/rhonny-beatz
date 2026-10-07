const db = require('../db/connection');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function submitMessage(req, res) {
  const name = (req.body.name || '').trim();
  const email = (req.body.email || '').trim().toLowerCase();
  const message = (req.body.message || '').trim();

  if (!name || !EMAIL_PATTERN.test(email) || !message) {
    return res.status(400).json({ error: 'Please fill in your name, a valid email, and a message' });
  }
  if (message.length > 2000) {
    return res.status(400).json({ error: 'Message is too long' });
  }

  try {
    await db.query('INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)', [name, email, message]);
    res.status(201).json({ message: 'Sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function listMessages(req, res) {
  try {
    const [rows] = await db.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load messages' });
  }
}

module.exports = { submitMessage, listMessages };