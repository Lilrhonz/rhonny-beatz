const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const { checkout, createStripeSession } = require('../controllers/orderController');

router.post('/checkout', requireAuth, checkout);
router.post('/:orderId/pay', requireAuth, createStripeSession);

module.exports = router;