const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');  // Ensure the database connection is correctly imported

const loginUser = (req, res) => {
  const { email, password } = req.body;

  // Log incoming data to verify correct parsing
  console.log('Login request:', req.body);

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // Query the database for user with the provided email
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = result[0];

    // Compare the provided password with the hashed password in the database
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ error: 'Error comparing password' });
      }
      if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect password' });
      }

      // Generate JWT token if password matches
      const token = jwt.sign(
        { id: user.userid, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.json({ token, role: user.role });
    });
  });
};



module.exports = { loginUser};