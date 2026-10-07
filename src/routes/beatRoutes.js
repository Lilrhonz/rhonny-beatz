const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const requireAnyRole = require('../middleware/requireAnyRole');
const upload = require('../middleware/upload');
const {
  createBeat,
  listPublishedBeats,
  getBeatBySlug,
  publishBeat,
  setBeatPrices,
  listAllBeatsAdmin,
  setFeatured,
  updateBeat,
  deleteBeat
} = require('../controllers/beatController');

router.get('/admin/all', requireAuth, requireAnyRole('admin', 'developer'), listAllBeatsAdmin);
router.get('/', listPublishedBeats);
router.get('/:slug', getBeatBySlug);

router.post(
  '/',
  requireAuth,
  requireAnyRole('admin', 'developer'),
  upload.fields([
    { name: 'coverArt', maxCount: 1 },
    { name: 'wavFile', maxCount: 1 }
  ]),
  createBeat
);

router.patch('/:id/publish', requireAuth, requireAnyRole('admin', 'developer'), publishBeat);
router.put('/:id/prices', requireAuth, requireAnyRole('admin', 'developer'), setBeatPrices);
router.patch('/:id/featured', requireAuth, requireAnyRole('admin', 'developer'), setFeatured);
router.patch('/:id', requireAuth, requireAnyRole('admin', 'developer'), updateBeat);
router.delete('/:id', requireAuth, requireAnyRole('developer'), deleteBeat);

module.exports = router;