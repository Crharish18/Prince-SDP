const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');  // Ensure the database connection is correctly imported

// Customer login route
const customerLogin = (req, res) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // Query the customer table for the user with the provided email
  db.query('SELECT * FROM customer WHERE email = ?', [email], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const customer = result[0];

    // Compare the provided password with the hashed password in the database
    bcrypt.compare(password, customer.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ error: 'Error comparing password' });
      }
      if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect password' });
      }

      // Create JWT token for customer
      const token = jwt.sign(
        { id: customer.customer_id, email: customer.email, role: 'customer' },
        process.env.JWT_SECRET,  // Use your secret key
        { expiresIn: '12h' }  // Set token expiration time
      );

      // Send the token and customer data in the response
      res.json({ token, role: 'customer', username: customer.first_name });
    });
  });
};


module.exports = { customerLogin };

