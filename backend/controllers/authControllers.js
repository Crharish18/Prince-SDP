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

    // Add the username to the response along with the token
const token = jwt.sign(
  { id: user.userid, email: user.email, role: user.role, username: user.username },  // Add username
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

res.json({ token, role: user.role, username: user.username });  // Include username

    });
  });
};

// Get logged-in user's profile based on the JWT token
const getUserProfile = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];  // Extract the token from the Authorization header
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // Verify the JWT token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    const userId = decoded.id;  // Extract user ID from the decoded token

    // Query the database to get the user's profile data
    db.query('SELECT * FROM users WHERE userid = ?', [userId], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Send the user's data in the response
      res.json(result[0]);  // Send all user data from the database
    });
  });
};



module.exports = { loginUser, getUserProfile};