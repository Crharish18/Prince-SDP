const express = require('express');
const router = express.Router();
const connection = require('../config/db'); // Database connection

// Fetch order items for a specific order
router.get('/:order_id/items', (req, res) => {
    const { order_id } = req.params;

    const query = `
    SELECT oi.order_item_id, oi.order_id, oi.product_id, oi.qty, oi.price, p.name AS product_name
    FROM order_item oi
    JOIN products p ON oi.product_id = p.product_id
    WHERE oi.order_id = ?`;


    connection.query(query, [order_id], (err, results) => {
        if (err) {
            console.error('Error fetching order items:', err);
            return res.status(500).json({ error: 'Error fetching order items' });
        }
        res.json(results);
    });
});


router.get('/top-sellers', (req, res) => {
    // Your logic to fetch top-selling products and return them
    const query = `
        SELECT oi.product_id, p.name AS product_name, SUM(oi.qty) AS total_sales
        FROM order_item oi
        JOIN products p ON oi.product_id = p.product_id
        GROUP BY oi.product_id
        ORDER BY total_sales DESC
        LIMIT 7;
    `;

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching top-selling products:', err);
            return res.status(500).json({ error: 'Error fetching data' });
        }
        res.json(results); // Send the top-selling products data
    });
});


// Fetch order items for a specific product// Add a POST route to insert order items
router.post('/', (req, res) => {
    const orderItems = req.body; // The array of order items
  
    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ error: 'Invalid order items data' });
    }
  
    const query = 'INSERT INTO prince.order_item (order_id, product_id, qty, price) VALUES ?';
    const values = orderItems.map(item => [item.order_id, item.product_id, item.qty, item.price]);
  
    connection.query(query, [values], (err, results) => {
      if (err) {
        console.error('Error inserting order items:', err);
        return res.status(500).send('Error adding order items');
      }
      res.status(201).json({ message: 'Order items added successfully' });
    });
  });
  

module.exports = router;
