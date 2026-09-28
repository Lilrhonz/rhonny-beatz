const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const upload = require('../middleware/upload');
const { createBeat } = require('../controllers/beatController');

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

module.exports = router;