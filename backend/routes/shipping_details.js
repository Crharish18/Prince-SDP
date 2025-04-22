const express = require('express');
const router = express.Router();
const connection = require('../config/db'); // Database connection

// Get all shipping details
router.get('/', (req, res) => {
    const query = 'SELECT * FROM prince.shipping_details';

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching shipping details:', err);
            res.status(500).send('Error fetching shipping details');
        } else {
            res.json(results);
        }
    });
});

// Add a new shipping detail
router.post('/', (req, res) => {
    const { first_name, last_name, phone, address, city, province, postalcode, customer_id, Ship_method } = req.body;


    if (!first_name || !last_name || !phone || !address || !city || !province || !postalcode || !customer_id) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const query = `INSERT INTO prince.shipping_details 
  (first_name, last_name, phone, address, city, province, postalcode, customer_id, Ship_method) 
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    
connection.query(query, [first_name, last_name, phone, address, city, province, postalcode, customer_id, Ship_method], (err, results) => {
        if (err) {
            console.error('Error adding shipping detail:', err);
            res.status(500).send('Error adding shipping detail');
        } else {
            res.status(201).json({
                shipping_id: results.insertId, 
                first_name, 
                last_name, 
                phone, 
                address, 
                city, 
                province, 
                postalcode, 
                customer_id
            });
        }
    });
});

// Delete a shipping detail
router.delete('/:shipping_id', (req, res) => {
    const { shipping_id } = req.params;

    const query = 'DELETE FROM prince.shipping_details WHERE id = ?';

    connection.query(query, [shipping_id], (err, results) => {
        if (err) {
            console.error('Error deleting shipping detail:', err);
            res.status(500).send('Error deleting shipping detail');
        } else {
            res.status(200).json({ message: 'Shipping detail deleted successfully' });
        }
    });
});

// Update a shipping detail
router.put('/:shipping_id', (req, res) => {
    const { shipping_id } = req.params;
    const { first_name, last_name, phone, address, city, province, postalcode, customer_id } = req.body;

    if (!first_name || !last_name || !phone || !address || !city || !province || !postalcode || !customer_id) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const query = 'UPDATE prince.shipping_details SET first_name=?, last_name=?, phone=?, address=?, city=?, province=?, postalcode=?, customer_id=? WHERE id=?';

    connection.query(query, [first_name, last_name, phone, address, city, province, postalcode, customer_id, shipping_id], (err, results) => {
        if (err) {
            console.error('Error updating shipping detail:', err);
            res.status(500).send('Error updating shipping detail');
        } else {
            res.status(200).json({ message: 'Shipping detail updated successfully' });
        }
    });
});

// Export the router so it can be used in the server.js
module.exports = router;
