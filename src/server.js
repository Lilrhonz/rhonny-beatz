require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');


const authRoutes = require('./routes/authRoutes');
const beatRoutes = require('./routes/beatRoutes');
const contactRoutes = require('./routes/contactRoutes');
//const orderRoutes = require('./routes/orderRoutes');
const videoRoutes = require('./routes/videoRoutes');
const subscriberRoutes = require('./routes/subscriberRoutes');
const app = express();const reviewRoutes = require('./routes/reviewRoutes');const postRoutes = require('./routes/postRoutes');
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use('/api/subscribers', subscriberRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/contact', contactRoutes);
// Only the public folder is reachable over HTTP. storage/private is never exposed.
app.use('/storage/public', express.static(path.join(__dirname, '..', 'storage', 'public')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/beats', beatRoutes);
//app.use('/api/orders', orderRoutes);
app.use('/api/videos', videoRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});