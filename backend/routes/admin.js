const express = require('express');
const router = express.Router();
const connection = require('../config/db'); // Import the database connection
const bcrypt = require('bcryptjs'); // Import bcryptjs

// GET all admins
router.get('/', (req, res) => {
  const query = 'SELECT * FROM users WHERE role = "admin"';
  
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).send('Error fetching admins');
    } else {
      res.json(results);
    }
  });
});

// GET a single admin by ID
router.get('/:id', (req, res) => {
  const adminId = req.params.id;
  const query = 'SELECT * FROM users WHERE userid = ? AND role = "admin"';
  
  connection.query(query, [adminId], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).send('Error fetching admin');
    } else if (results.length === 0) {
      res.status(404).send('Admin not found');
    } else {
      res.json(results[0]);
    }
  });
});

// POST - Create a new admin
router.post('/', async (req, res) => {
  try {
    const { username, firstName, lastName, email, phoneNum, dob, nationalId, address, password, status } = req.body;
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const query = `
      INSERT INTO users 
      (username, first_name, last_name, email, phonenum, role, dob, natID, address, password, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    connection.query(
      query, 
      [username, firstName, lastName, email, phoneNum, 'admin', dob, nationalId, address, hashedPassword, status || 'Active'],
      (err, result) => {
        if (err) {
          console.error('Error creating admin:', err);
          res.status(500).send('Error creating admin');
        } else {
          // Fetch the newly created admin to return
          connection.query(
            'SELECT * FROM users WHERE userid = ?',
            [result.insertId],
            (err, results) => {
              if (err) {
                console.error('Error fetching created admin:', err);
                res.status(201).send({ message: 'Admin created successfully', id: result.insertId });
              } else {
                res.status(201).json(results[0]);
              }
            }
          );
        }
      }
    );
  } catch (error) {
    console.error('Error in admin creation:', error);
    res.status(500).send('Server error');
  }
});

// PUT - Update an admin
router.put('/:id', async (req, res) => {
  try {
    const adminId = req.params.id;
    const { username, first_name, last_name, email, phonenum, dob, natID, address, status } = req.body;
    
    // First check if the admin exists
    connection.query(
      'SELECT * FROM users WHERE userid = ? AND role = "admin"',
      [adminId],
      (err, results) => {
        if (err) {
          console.error('Error checking admin existence:', err);
          return res.status(500).send('Server error');
        }
        
        if (results.length === 0) {
          return res.status(404).send('Admin not found');
        }
        
        // Admin exists, proceed with update
        const updateQuery = `
          UPDATE users 
          SET username = ?, first_name = ?, last_name = ?, email = ?, 
              phonenum = ?, dob = ?, natID = ?, address = ?, status = ?, updated_at = CURRENT_TIMESTAMP
          WHERE userid = ?
        `;
        
        connection.query(
          updateQuery,
          [username, first_name, last_name, email, phonenum, dob, natID, address, status, adminId],
          (err, result) => {
            if (err) {
              console.error('Error updating admin:', err);
              res.status(500).send('Error updating admin');
            } else {
              // Fetch the updated admin to return
              connection.query(
                'SELECT * FROM users WHERE userid = ?',
                [adminId],
                (err, results) => {
                  if (err) {
                    console.error('Error fetching updated admin:', err);
                    res.status(200).send({ message: 'Admin updated successfully' });
                  } else {
                    res.json(results[0]);
                  }
                }
              );
            }
          }
        );
      }
    );
  } catch (error) {
    console.error('Error in admin update:', error);
    res.status(500).send('Server error');
  }
});

// Modified DELETE route to update status instead of deleting
router.delete('/:id', (req, res) => {
  const adminId = req.params.id;
  
  // First check if the admin exists
  connection.query(
    'SELECT * FROM users WHERE userid = ? AND role = "admin"',
    [adminId],
    (err, results) => {
      if (err) {
        console.error('Error checking admin existence:', err);
        return res.status(500).send('Server error');
      }
      
      if (results.length === 0) {
        return res.status(404).send('Admin not found');
      }
      
      // Admin exists, update status to "Disable" instead of deleting
      connection.query(
        'UPDATE users SET status = "Disable", updated_at = CURRENT_TIMESTAMP WHERE userid = ?',
        [adminId],
        (err, result) => {
          if (err) {
            console.error('Error disabling admin:', err);
            res.status(500).send('Error disabling admin');
          } else {
            // Fetch the updated admin to return
            connection.query(
              'SELECT * FROM users WHERE userid = ?',
              [adminId],
              (err, updatedAdmin) => {
                if (err) {
                  console.error('Error fetching updated admin:', err);
                  res.status(200).json({ message: 'Admin disabled successfully', id: adminId });
                } else {
                  res.json({ 
                    message: 'Admin disabled successfully', 
                    id: adminId,
                    admin: updatedAdmin[0]
                  });
                }
              }
            );
          }
        }
      );
    }
  );
});

module.exports = router;
