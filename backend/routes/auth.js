// In auth.js
const express = require('express');
const { loginUser, getUserProfile } = require('../controllers/authControllers');

const router = express.Router();

// Login route
router.post('/login', loginUser);

// Profile route
router.get('/profile', getUserProfile); // Make sure this route exists

module.exports = router;
