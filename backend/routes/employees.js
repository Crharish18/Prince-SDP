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


module.exports = router;
