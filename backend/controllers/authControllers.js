const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');  // Ensure the database connection is correctly imported
const multer = require('multer');
const cloudinary = require('../config/cloudinary'); // Ensure this path is correct

const loginUser = (req, res) => {
  const { email, password } = req.body;

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
        { id: user.userid, email: user.email, role: user.role, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '12h' }
      );

      // Log the login activity
      db.query('INSERT INTO prince.activity_log (user_id, action) VALUES (?, "LOGGED IN")', [user.userid]);

      res.json({ token, role: user.role, username: user.username });
    });
  });
};


const logoutUser = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    console.log('No token provided for logout');
    return res.json({ message: 'Logout successful' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    
    // Use a direct query with string literals for the action value
    const query = "INSERT INTO prince.activity_log (user_id, action) VALUES (?, 'LOGGED OUT')";
    
    db.query(query, [userId], (err, result) => {
      if (err) {
        console.error('Error logging logout:', err);
        return res.status(500).json({ error: 'Failed to log logout activity' });
      }
      
      console.log('Logout recorded successfully for user:', userId);
      return res.json({ message: 'Logout successful' });
    });
  } catch (err) {
    console.error('JWT verification error:', err);
    return res.json({ message: 'Logout successful' });
  }
};


const getUserProfile = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    const userId = decoded.id;

    db.query('SELECT * FROM users WHERE userid = ?', [userId], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Send the user's data in the response
      res.json(result[0]);
    });
  });
};

const updateUserProfile = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    const userId = decoded.id;
    const { first_name, last_name, email, phonenum, address, natID, dob, profile_picture_path } = req.body;

    // Update the user's profile in the database, including profile_picture_path
    db.query(
      'UPDATE users SET first_name = ?, last_name = ?, email = ?, phonenum = ?, address = ?, natID = ?, dob = ?, profile_picture_path = ? WHERE userid = ?',
      [first_name, last_name, email, phonenum, address, natID, dob, profile_picture_path, userId],
      (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // Get the updated user data
        db.query('SELECT * FROM users WHERE userid = ?', [userId], (err, result) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          if (result.length === 0) {
            return res.status(404).json({ message: 'User not found' });
          }

          // Send the updated user data in the response
          res.json(result[0]);
        });
      }
    );
  });
};

// Upload profile picture to Cloudinary
const uploadProfilePicture = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    const userId = decoded.id;

    // Check if file exists in the request
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Upload to Cloudinary
    cloudinary.uploader.upload_stream(
      { 
        resource_type: 'image',
        folder: 'profile_pictures'
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({ message: 'Error uploading to Cloudinary' });
        }

        // Return the Cloudinary URL to the client
        res.json({ 
          secure_url: result.secure_url,
          message: 'Profile picture uploaded successfully'
        });
      }
    ).end(req.file.buffer);
  });
};


const changePassword = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });

    const userId = decoded.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New passwords do not match' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password should be at least 6 characters' });
    }

    // Get user
    db.query('SELECT * FROM users WHERE userid = ?', [userId], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.length === 0) return res.status(404).json({ message: 'User not found' });

      const user = result[0];
      // Compare current password
      bcrypt.compare(currentPassword, user.password, (err, isMatch) => {
        if (err) return res.status(500).json({ error: 'Error comparing password' });
        if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

        // Hash new password and update
        bcrypt.hash(newPassword, 10, (err, hash) => {
          if (err) return res.status(500).json({ error: 'Error hashing new password' });

          db.query('UPDATE users SET password = ? WHERE userid = ?', [hash, userId], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Password updated successfully' });
          });
        });
      });
    });
  });
};


module.exports = { 
  loginUser, 
  getUserProfile, 
  logoutUser, 
  updateUserProfile, 
  changePassword,
  uploadProfilePicture 
};
