const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const { subscribe, listSubscribers } = require('../controllers/subscriberController');

const subscribeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again later.' }
});

router.post('/', subscribeLimiter, subscribe);
router.get('/admin/all', requireAuth, requireRole('admin'), listSubscribers);

module.exports = router;