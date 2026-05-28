const express = require('express');
const { createRazorpayOrder, verifyRazorpayPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// POST /api/payment/create-order — Step 1: create Razorpay order & get order_id
router.post('/payment/create-order', protect, createRazorpayOrder);

// POST /api/payment/verify — Step 2: verify payment signature & place DB order
router.post('/payment/verify', protect, verifyRazorpayPayment);

module.exports = router;
