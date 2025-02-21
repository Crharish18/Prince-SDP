const express = require('express');
const { loginUser } = require('../controllers/authControllers');  // Ensure this points to the correct controller

const router = express.Router();

// POST route for login
router.post('/login', loginUser);  // This should handle POST requests to /api/auth/login

module.exports = router;
