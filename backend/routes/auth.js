// In auth.js
const express = require('express');
const { loginUser, getUserProfile } = require('../controllers/authControllers');
const { customerLogin } = require('../controllers/CustomerauthController'); // Import the customer login controller

const router = express.Router();

// Login route
router.post('/login', loginUser);

// Login route for customers
router.post('/Customerlogin', customerLogin);

// Profile route
router.get('/profile', getUserProfile); // Make sure this route exists

module.exports = router;
