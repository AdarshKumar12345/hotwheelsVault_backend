const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = async () => {
  const dbConnect = require('./config/db');
  await dbConnect();
};

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const paymentRoutes = require('./routes/payment');
const errorHandler = require('./middleware/errorHandler');

// Connect to Database
connectDB();

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
// In production: only allow requests from the CLIENT_URL (Vercel domain).
// In development: allow localhost:3000 as well.
const allowedOrigins = [
  process.env.CLIENT_URL,         // e.g. https://your-app.vercel.app
  'http://localhost:3000',         // Next.js dev server
  'http://localhost:3001',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, mobile apps)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS: Origin '${origin}' not allowed`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api', orderRoutes);   // Mounts /orders, /orders/my-orders, /admin/orders, /admin/orders/:id
app.use('/api', userRoutes);    // Mounts /admin/users, /admin/users/:id
app.use('/api', paymentRoutes); // Mounts /payment/create-order, /payment/verify

// Default route for health checks
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'E-commerce API is running' });
});

// Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
