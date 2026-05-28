const express = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { getProductReviews, addOrUpdateReview, deleteReview } = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);

router.post('/', protect, admin, upload.array('images', 10), createProduct);
router.put('/:id', protect, admin, upload.array('images', 10), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

// Review routes
router.get('/:id/reviews', getProductReviews);
router.post('/:id/reviews', protect, addOrUpdateReview);
router.delete('/:id/reviews', protect, deleteReview);

module.exports = router;
