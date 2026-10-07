const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const { submitMessage, listMessages } = require('../controllers/contactController');

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many messages sent. Please try again later.' }
});

router.post('/', contactLimiter, submitMessage);
router.get('/admin/all', requireAuth, requireRole('admin'), listMessages);

module.exports = router;