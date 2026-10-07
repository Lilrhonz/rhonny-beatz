const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const upload = require('../middleware/upload');
const {
  listPublishedPosts,
  getPostBySlug,
  listAllPostsAdmin,
  createPost,
  publishPost
} = require('../controllers/postController');

router.get('/admin/all', requireAuth, requireRole('admin'), listAllPostsAdmin);
router.get('/', listPublishedPosts);
router.get('/:slug', getPostBySlug);
router.post('/', requireAuth, requireRole('admin'), upload.single('coverImage'), createPost);
router.patch('/:id/publish', requireAuth, requireRole('admin'), publishPost);

module.exports = router;