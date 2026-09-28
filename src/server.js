require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const beatRoutes = require('./routes/beatRoutes');

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Only the public folder is reachable over HTTP. storage/private is never exposed.
app.use('/storage/public', express.static(path.join(__dirname, '..', 'storage', 'public')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/beats', beatRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});