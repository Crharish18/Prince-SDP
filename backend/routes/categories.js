const express = require('express');
const router = express.Router();
const connection = require('../config/db'); // Import the database connection

// Route to fetch all categories
router.get('/', (req, res) => {
    const query = 'SELECT * FROM categories'; // Adjust this query based on your DB structure
    
    connection.query(query, (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Error fetching categories');
      } else {
        res.json(results); // Send category data back to the frontend
      }
    });
  });


// Route to fetch all categories (limit to 6)
router.get('/only6', (req, res) => {
  const query = 'SELECT * FROM categories LIMIT 6';  // Limiting the result to 6 categories
  
  connection.query(query, (err, results) => {
      if (err) {
          console.error('Error executing query:', err);
          res.status(500).send('Error fetching categories');
      } else {
          res.json(results); // Send category data back to the frontend
      }
  });
});


    router.post('/', (req, res) => {
      const { categoryName, status } = req.body;  // Changed from category_name to categoryName
      
      // Validate the category name
      if (!categoryName || categoryName.trim().length < 3) {
        return res.status(400).json({ error: 'Category name must be at least 3 characters long.' });
      }

      const query = `INSERT INTO categories (category_name, status) VALUES (?, ?)`;

      connection.query(query, [categoryName, status || 'Active'], (err, results) => {
        if (err) {
          console.error('Error adding category:', err);  // Add error logging
          return res.status(500).send('Error adding category');
        }
        res.status(201).json({
          category_id: results.insertId,
          category_name: categoryName,
          status: status || 'Active',
          created_at: new Date(),
        });
      });
    });

  // Update a category by ID
router.put('/:category_id', (req, res) => {
    const { category_id } = req.params;  // Get category_id from URL parameter
    const { category_name, status } = req.body;  // Get category_name from request body
  
    // Validate category_name
    if (!category_name || category_name.length < 3) {
      return res.status(400).json({ error: 'Category name must be at least 3 characters long.' });
    }
  
    const query = `UPDATE categories SET category_name = ?, status = ? WHERE category_id = ?`;
  
    connection.query(query, [category_name, status, category_id], (err, results) => {
      if (err) {
        console.error('Error updating category:', err);
        return res.status(500).send('Error updating category');
      }
  
      if (results.affectedRows === 0) {
        return res.status(404).send('Category not found');
      }
  
      res.status(200).send({ message: 'Category updated successfully' });
    });
  });
  

  // Delete a category by ID
router.delete('/:category_id', (req, res) => {
    const { category_id } = req.params;  // Get category_id from URL parameter
  
    const query = 'DELETE FROM categories WHERE category_id = ?';
  
    connection.query(query, [category_id], (err, results) => {
      if (err) {
        console.error('Error deleting category:', err);
        
        // Check if the error is a foreign key constraint error
        if (err.code === 'ER_ROW_IS_REFERENCED_2') {
          return res.status(400).json({ 
            error: 'This category cannot be deleted because it is associated with products. Please delete those products first or disable the category instead.' 
          });
        }
        
        return res.status(500).json({ error: 'Error deleting category' });
      }
  
      if (results.affectedRows === 0) {
        return res.status(404).send('Category not found');
      }
  
      res.status(200).send({ message: 'Category deleted successfully' });
    });
  });
  
  
// Export the router so it can be used in the server.js
module.exports = router;
