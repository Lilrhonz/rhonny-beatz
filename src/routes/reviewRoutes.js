const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const {
  listApprovedReviews,
  submitReview,
  listAllReviewsAdmin,
  moderateReview
} = require('../controllers/reviewController');

router.get('/beat/:beatId', listApprovedReviews);
router.post('/beat/:beatId', requireAuth, submitReview);
router.get('/admin/all', requireAuth, requireRole('admin'), listAllReviewsAdmin);
router.patch('/:id/moderate', requireAuth, requireRole('admin'), moderateReview);

module.exports = router;