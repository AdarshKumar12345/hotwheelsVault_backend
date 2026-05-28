const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Helper to populate cart items product details
const getPopulatedCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate({
    path: 'items.product',
    model: 'Product',
  });

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

// @desc    Get current user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res, next) => {
  try {
    const cart = await getPopulatedCart(req.user.id);
    res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity, color, size } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const qty = Number(quantity) || 1;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    // Check if item already exists in cart with same product and color/size
    const itemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.color === color &&
        item.size === size
    );

    if (itemIndex > -1) {
      // Product exists, increment quantity
      cart.items[itemIndex].quantity += qty;
    } else {
      // Product does not exist, add new item
      cart.items.push({
        product: productId,
        quantity: qty,
        color,
        size,
      });
    }

    await cart.save();
    const populatedCart = await getPopulatedCart(req.user.id);
    res.status(200).json(populatedCart);
  } catch (error) {
    next(error);
  }
};

// @desc    Update item quantity in cart
// @route   PUT /api/cart/update
// @access  Private
const updateCartItem = async (req, res, next) => {
  try {
    const { productId, quantity, color, size, itemId } = req.body;
    const qty = Number(quantity);

    if (qty < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    let itemIndex = -1;

    if (itemId) {
      itemIndex = cart.items.findIndex((item) => item.id === itemId);
    } else if (productId) {
      itemIndex = cart.items.findIndex(
        (item) =>
          item.product.toString() === productId &&
          (!color || item.color === color) &&
          (!size || item.size === size)
      );
    }

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = qty;
      await cart.save();
      const populatedCart = await getPopulatedCart(req.user.id);
      res.status(200).json(populatedCart);
    } else {
      res.status(404).json({ message: 'Item not found in cart' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:id
// @access  Private
const deleteCartItem = async (req, res, next) => {
  try {
    const itemIdOrProductId = req.params.id;
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Try finding by item unique ID first, then by product ID
    let initialLength = cart.items.length;
    cart.items = cart.items.filter(
      (item) =>
        item.id !== itemIdOrProductId &&
        item.product.toString() !== itemIdOrProductId
    );

    if (cart.items.length === initialLength) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    await cart.save();
    const populatedCart = await getPopulatedCart(req.user.id);
    res.status(200).json(populatedCart);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  deleteCartItem,
};
