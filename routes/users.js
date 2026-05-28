const express = require('express');
const { getAllUsers, deleteUser } = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Admin user management routes
router.get('/admin/users', protect, admin, getAllUsers);
router.delete('/admin/users/:id', protect, admin, deleteUser);

module.exports = router;
