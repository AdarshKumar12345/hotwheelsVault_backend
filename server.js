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

// ─── CORS Configuration ───────────────────────────────────────────────────────
// Whitelist containing:
// 1. CLIENT_URL from environment variables (your deployed Vercel URL)
// 2. http://localhost:3000 (Next.js local development)
// 3. http://127.0.0.1:3000 (Alternative local loopback)
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000'
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error(`CORS: Origin '${origin}' not allowed`));
      }
    },
    credentials: true, // Allow cookies / Authorization header to be passed
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 204 // Response status for preflight OPTIONS requests (legacy browsers support)
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
