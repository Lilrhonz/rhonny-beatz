const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const upload = require('../middleware/upload');
const {
  createBeat,
  listPublishedBeats,
  getBeatBySlug,
  publishBeat
} = require('../controllers/beatController');

router.get('/', listPublishedBeats);
router.get('/:slug', getBeatBySlug);

router.post(
  '/',
  requireAuth,
  requireRole('admin'),
  upload.fields([
    { name: 'coverArt', maxCount: 1 },
    { name: 'wavFile', maxCount: 1 }
  ]),
  createBeat
);

router.patch('/:id/publish', requireAuth, requireRole('admin'), publishBeat);

module.exports = router;