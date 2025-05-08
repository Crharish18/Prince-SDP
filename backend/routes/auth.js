// In auth.js
const express = require('express');
const { loginUser, getUserProfile, logoutUser, updateUserProfile } = require('../controllers/authControllers');
const { changePassword } = require('../controllers/authControllers');
const { customerLogin, getCustomerProfile, updateCustomerProfile, getCustomerOrders } = require('../controllers/CustomerauthController');


const router = express.Router();

// Login route
router.post('/login', loginUser);

// Logout route
router.post('/logout', logoutUser);

// Login route for customers
router.post('/Customerlogin', customerLogin);

// Profile routes
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);  // Add this line
router.post('/change-password', changePassword);

// Customer profile routes
router.get('/customer-profile', getCustomerProfile);
router.put('/customer-profile', updateCustomerProfile);
// Customer orders route
router.get('/customer-orders', getCustomerOrders);


module.exports = router;
