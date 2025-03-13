const express = require('express');
const router = express.Router();
const connection = require('../config/db'); // Import the database connection

// Route to fetch all inventory records
router.get('/', (req, res) => {
    const query = 'SELECT * FROM inventory'; // Adjust this query based on your DB structure
    
    connection.query(query, (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Error fetching inventory');
      } else {
        res.json(results); // Send inventory data back to the frontend
      }
    });
  });

// Route to fetch today's total expense
router.get('/today-expense', (req, res) => {
    const query = `
        SELECT SUM(buying_price_per_unit * qty_added) AS total_expense
        FROM \`inventory\`
        WHERE DATE(added_on) = DATE(NOW());`;  // Sum the expense for items added today

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching today\'s total expense:', err);
            return res.status(500).send('Error fetching today\'s total expense');
        }
        res.json({ total_expense: results[0].total_expense || 0 });  // Return the total expense
    });
});


// Route to add a new inventory record
router.post('/', (req, res) => {
    const { qty_added, user_id, supplier_id, product_id, buying_price_per_unit } = req.body;
  
    const query = `INSERT INTO inventory (qty_added, user_id, supplier_id, product_id, buying_price_per_unit) 
                   VALUES (?, ?, ?, ?, ?)`;
  
    connection.query(query, [qty_added, user_id, supplier_id, product_id, buying_price_per_unit], (err, results) => {
      if (err) {
        return res.status(500).send('Error adding inventory record');
      }
      res.status(201).json({
        inventory_id: results.insertId,
        qty_added,
        user_id,
        supplier_id,
        product_id,
        buying_price_per_unit,
        added_on: new Date(), // Automatically generated timestamp
      });
    });
  });

// Route to update an inventory record by ID
router.put('/:inventory_id', (req, res) => {
    const { inventory_id } = req.params;  // Get inventory_id from URL parameter
    const { qty_added, user_id, supplier_id, product_id, buying_price_per_unit } = req.body;  // Get fields from request body
  
    // Validate inputs
    if (!qty_added || !user_id || !supplier_id || !product_id || !buying_price_per_unit) {
      return res.status(400).json({ error: 'All fields are required to update inventory.' });
    }
  
    const query = `UPDATE inventory 
                   SET qty_added = ?, user_id = ?, supplier_id = ?, product_id = ?, buying_price_per_unit = ? 
                   WHERE inventory_id = ?`;
  
    connection.query(query, [qty_added, user_id, supplier_id, product_id, buying_price_per_unit, inventory_id], (err, results) => {
      if (err) {
        console.error('Error updating inventory record:', err);
        return res.status(500).send('Error updating inventory');
      }
  
      if (results.affectedRows === 0) {
        return res.status(404).send('Inventory record not found');
      }
  
      res.status(200).send({ message: 'Inventory updated successfully' });
    });
  });
  

// Route to delete an inventory record by ID
router.delete('/:inventory_id', (req, res) => {
    const { inventory_id } = req.params;  // Get inventory_id from URL parameter
  
    const query = 'DELETE FROM inventory WHERE inventory_id = ?';
  
    connection.query(query, [inventory_id], (err, results) => {
      if (err) {
        console.error('Error deleting inventory record:', err);
        return res.status(500).send('Error deleting inventory record');
      }
  
      if (results.affectedRows === 0) {
        return res.status(404).send('Inventory record not found');
      }
  
      res.status(200).send({ message: 'Inventory record deleted successfully' });
    });
  });
  

// Export the router so it can be used in the server.js
module.exports = router;
