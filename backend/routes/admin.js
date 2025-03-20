const express = require('express');
const router = express.Router();
const connection = require('../config/db'); // Import the database connection
const bcrypt = require('bcryptjs'); // Import bcryptjs

router.get('/', (req, res) => {
    const query = 'SELECT * FROM users WHERE role = "admin"'; // Adjust this query based on your DB structure
    
    connection.query(query, (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Error fetching admin');
      } else {
        res.json(results); // Send employee data back to the frontend
      }
    });
  });


  module.exports = router;