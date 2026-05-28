const express = require('express');
const {
  getCart,
  addToCart,
  updateCartItem,
  deleteCartItem,
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // Secure all cart routes

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/update', updateCartItem);
router.delete('/:id', deleteCartItem);

module.exports = router;
