const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create a Razorpay order (step 1 of payment flow)
// @route   POST /api/payment/create-order
// @access  Private
const createRazorpayOrder = async (req, res, next) => {
  try {
    // Fetch cart to get total amount
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty.' });
    }

    let subtotal = 0;
    for (const item of cart.items) {
      if (!item.product) {
        return res.status(404).json({ message: 'A product in your cart is no longer available.' });
      }
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${item.product.name}. Only ${item.product.stock} left.`,
        });
      }
      subtotal += item.product.price * item.quantity;
    }

    // Apply same shipping logic as orderController
    const shippingPrice = subtotal >= 1000 ? 0 : 99;
    const totalAmount = subtotal + shippingPrice;

    // Razorpay expects amount in PAISE (1 INR = 100 paise)
    const options = {
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      receipt: `receipt_${req.user.id}_${Date.now()}`,
      notes: {
        userId: req.user.id.toString(),
      },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.status(200).json({
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay payment & place the order (step 2 of payment flow)
// @route   POST /api/payment/verify
// @access  Private
const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      shippingAddress,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !shippingAddress) {
      return res.status(400).json({ message: 'Missing payment verification fields.' });
    }

    // ---- SIGNATURE VERIFICATION ----
    // Razorpay signs: order_id + "|" + payment_id using Key Secret
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed. Invalid signature.' });
    }

    // ---- PLACE THE ORDER ----
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty — cannot place order.' });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const item of cart.items) {
      const product = item.product;
      if (!product) {
        return res.status(404).json({ message: 'A product in your cart is no longer available.' });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
      });
    }

    // Apply shipping fee
    const shippingPrice = totalAmount >= 1000 ? 0 : 99;
    totalAmount += shippingPrice;

    // Create order in DB with Paid status and Razorpay transaction ID
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      paymentMethod: 'Razorpay',
      paymentStatus: 'Paid',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      totalAmount,
      status: 'processing', // Paid orders go straight to processing
    });

    // Deduct stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

module.exports = { createRazorpayOrder, verifyRazorpayPayment };
