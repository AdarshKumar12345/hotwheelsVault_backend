const express = require('express');
const {
  placeOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Customer order routes
router.post('/orders', protect, placeOrder);
router.get('/orders/my-orders', protect, getMyOrders);

// Admin order routes (mounted separately or matching path)
router.get('/admin/orders', protect, admin, getAllOrders);
router.put('/admin/orders/:id', protect, admin, updateOrderStatus);

module.exports = router;
