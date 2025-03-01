const express = require('express');
const router = express.Router();
const connection = require('../config/db'); // Import the database connection
const bcrypt = require('bcryptjs'); // Import bcryptjs

// Fetch all employees (filter by role 'employee')
router.get('/', (req, res) => {
  const query = 'SELECT * FROM users WHERE role = "employee"'; // Adjust this query based on your DB structure
  
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).send('Error fetching employees');
    } else {
      res.json(results); // Send employee data back to the frontend
    }
  });
});



router.post('/', async (req, res) => {
  const { username, firstName, lastName, email, phoneNum, role, dob, nationalId, address, password } = req.body;

  
  try {
    // Hash the password using bcryptjs
    const hashedPassword = await bcrypt.hash(password, 10); // Await the hashing function to ensure it completes before moving forward

// Now use the hashed password in your SQL query
    const query = `INSERT INTO users (username, first_name, last_name, email, phonenum, role, dob, natID, address, password) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                   
 // Insert the data with the hashed password into the database
    connection.query(query, [username, firstName, lastName, email, phoneNum, role, dob, nationalId, address, hashedPassword], (err, results) => {
      if (err) {
        console.error('Error inserting employee:', err);
        res.status(500).send('Error adding employee');
      } else {
        // Log the result
        console.log('Employee added successfully:', results);

        // Send back the newly created employee data, excluding the password for security
        const newEmployee = { 
          userid: results.insertId, 
          username, 
          firstName, 
          lastName, 
          email, 
          phoneNum, 
          role, 
          dob, 
          nationalId, 
          address
        };
        res.status(201).json(newEmployee); // Respond with the new employee details
      }
    });
  } catch (err) {
    console.error('Error hashing password:', err);
    res.status(500).send('Error hashing password');
  }
});


// Delete an employee by ID
router.delete('/:userid', (req, res) => {
  const { userid } = req.params;

  const query = 'DELETE FROM users WHERE userid = ?';
  connection.query(query, [userid], (err, results) => {
    if (err) {
      console.error('Error deleting employee:', err);
      res.status(500).send('Error deleting employee');
    } else {
      res.status(200).send({ message: 'Employee deleted successfully' });
    }
  });
});


router.put('/:userid', (req, res) => {
  const { userid } = req.params;
  const { username, first_name, last_name, email, phonenum, role, dob, natID, address } = req.body;

  // Log the received data for debugging
  console.log("Received data for update:", req.body);

  // Check if any required fields are missing or empty (excluding password and created_at)
  if (!username || !first_name || !last_name || !email || !phonenum || !role || !dob || !natID || !address) {
    // Log which field is actually missing
    const missingFields = [];
    if (!username) missingFields.push("username");
    if (!first_name) missingFields.push("first_name");
    if (!last_name) missingFields.push("last_name");
    if (!email) missingFields.push("email");
    if (!phonenum) missingFields.push("phonenum");
    if (!role) missingFields.push("role");
    if (!dob) missingFields.push("dob");
    if (!natID) missingFields.push("natID");
    if (!address) missingFields.push("address");

    console.error('Missing required fields:', missingFields);

    return res.status(400).json({ error: 'All fields are required except password, created_at', missingFields });
  }

  const query = `UPDATE users SET username=?, first_name=?, last_name=?, email=?, phonenum=?, role=?, dob=?, natID=?, address=? WHERE userid=?`;

  connection.query(query, [username, first_name, last_name, email, phonenum, role, dob, natID, address, userid], (err, results) => {
    if (err) {
      console.error('Error updating employee:', err);
      return res.status(500).send('Error updating employee');
    }
    console.log('Employee updated successfully');
    res.status(200).send({ message: 'Employee updated successfully' });
  });
});

module.exports = router;
