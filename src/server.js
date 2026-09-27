require('dotenv').config();
const express = require('express');

const app = express();
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const path = require('path');
app.use('/storage/public', express.static(path.join(__dirname, '..', 'storage', 'public')));
const requireAuth = require('./middleware/requireAuth');
const requireRole = require('./middleware/requireRole');

app.get('/api/admin-only', requireAuth, requireRole('admin'), (req, res) => {
  res.json({ message: `Welcome, admin ${req.user.email}` });
});

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const db = require('./db/connection');

app.get('/api/db-check', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS result');
    res.json({ connected: true, result: rows[0].result });
  } catch (err) {
    res.status(500).json({ connected: false, error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});