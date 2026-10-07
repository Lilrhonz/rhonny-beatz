const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const { listVideos, addVideo, removeVideo } = require('../controllers/videoController');

router.get('/', listVideos);
router.post('/', requireAuth, requireRole('admin'), addVideo);
router.delete('/:id', requireAuth, requireRole('admin'), removeVideo);

module.exports = router;