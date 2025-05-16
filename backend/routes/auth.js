const express = require('express');
const multer = require('multer');
const { 
  loginUser, 
  getUserProfile, 
  logoutUser, 
  updateUserProfile, 
  changePassword,
  uploadProfilePicture
} = require('../controllers/authControllers');
const { 
  customerLogin, 
  getCustomerProfile, 
  updateCustomerProfile, 
  getCustomerOrders,
  toggleWishlist,
  checkWishlist,
  getCustomerWishlist,
  getCustomerAddresses,
  addCustomerAddress,
  updateCustomerAddress,
  customerUploadProfilePicture
} = require('../controllers/CustomerAuthController');

const router = express.Router();

// Set up multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Login route
router.post('/login', loginUser);

// Logout route
router.post('/logout', logoutUser);

// Login route for customers
router.post('/Customerlogin', customerLogin);

// Profile routes
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.post('/change-password', changePassword);

// New route for profile picture upload
router.post('/upload-profile-picture', upload.single('profileImage'), uploadProfilePicture);

// Customer profile routes
router.get('/customer-profile', getCustomerProfile);
router.put('/customer-profile', updateCustomerProfile);

// Customer profile picture upload route
router.post('/customer-upload-profile-picture', upload.single('profileImage'), customerUploadProfilePicture);

// Customer orders route
router.get('/customer-orders', getCustomerOrders);

// Customer wishlist routes
router.post('/toggle-wishlist', toggleWishlist);
router.get('/check-wishlist/:productId', checkWishlist);
router.get('/customer-wishlist', getCustomerWishlist);

// Customer address routes
router.get('/customer-addresses', getCustomerAddresses);
router.post('/customer-addresses', addCustomerAddress);
router.put('/customer-addresses/:addressId', updateCustomerAddress);

module.exports = router;
