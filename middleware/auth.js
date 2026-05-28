const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token, excluding password
      const user = await User.findById(decoded.id).select('+password');

      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      if (user.status === 'Blocked') {
        return res.status(403).json({ message: 'User account is blocked. Please contact support.' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('JWT Auth Error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied: Admin authorization required' });
  }
};

module.exports = { protect, admin };
