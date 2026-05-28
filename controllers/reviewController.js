const Review = require('../models/Review');
const Product = require('../models/Product');

// Helper: recalculate and save product's average rating
const recalcProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(stats[0].avgRating * 10) / 10, // Round to 1 decimal
      totalReviews: stats[0].count,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      rating: 0,
      totalReviews: 0,
    });
  }
};

// @desc    Get all reviews for a product
// @route   GET /api/products/:id/reviews
// @access  Public
const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
};

// @desc    Add or update a review for a product
// @route   POST /api/products/:id/reviews
// @access  Private
const addOrUpdateReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;

    // Validate inputs
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }
    if (!comment || comment.trim().length < 5) {
      return res.status(400).json({ message: 'Please write at least 5 characters for your review.' });
    }

    // Check product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Upsert review (insert or update if same user reviews same product again)
    const review = await Review.findOneAndUpdate(
      { product: productId, user: req.user.id },
      {
        product: productId,
        user: req.user.id,
        userName: req.user.name,
        rating: Number(rating),
        comment: comment.trim(),
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );

    // Recalculate product's average rating
    await recalcProductRating(product._id);

    res.status(201).json({ success: true, review });
  } catch (error) {
    // Duplicate key on unique index — should not happen with findOneAndUpdate upsert, but guard anyway
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this product.' });
    }
    next(error);
  }
};

// @desc    Delete own review
// @route   DELETE /api/products/:id/reviews
// @access  Private
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findOneAndDelete({
      product: req.params.id,
      user: req.user.id,
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    // Recalculate product's average rating after deletion
    await recalcProductRating(review.product);

    res.status(200).json({ success: true, message: 'Review deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProductReviews, addOrUpdateReview, deleteReview };
