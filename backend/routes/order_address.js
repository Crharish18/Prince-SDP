const express = require('express');
const router = express.Router();
const connection = require('../config/db'); // Database connection

// Get all order addresses
router.get('/', (req, res) => {
    const query = 'SELECT * FROM order_address';

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching order addresses:', err);
            res.status(500).send('Error fetching order addresses');
        } else {
            res.json(results);
        }
    });
});

// Get addresses for a specific order - THIS IS THE MISSING ENDPOINT
router.get('/:order_id', (req, res) => {
    const { order_id } = req.params;
    
    const query = 'SELECT * FROM order_address WHERE order_id = ?';
    
    connection.query(query, [order_id], (err, results) => {
        if (err) {
            console.error('Error fetching order addresses:', err);
            return res.status(500).json({ error: 'Error fetching order addresses' });
        }
        res.json(results);
    });
});

// Add a new order address
router.post('/', (req, res) => {
    const { order_id, fullname, street, apartment, city, province, postal_code, country, shipment_method, type } = req.body;

    if (!order_id || !fullname || !street || !city || !province || !postal_code || !country || !shipment_method || !type) {
        return res.status(400).json({ error: 'All fields except apartment are required' });
    }

    const query = `INSERT INTO order_address (order_id, fullname, street, apartment, city, province, postal_code, country, shipment_method, type) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    connection.query(query, [order_id, fullname, street, apartment, city, province, postal_code, country, shipment_method, type], (err, results) => {
        if (err) {
            console.error('Error adding order address:', err);
            return res.status(500).json({ error: 'Error adding order address', details: err.message });
        }
        res.status(201).json({
            order_address_id: results.insertId,
            order_id, fullname, street, apartment, city, province, postal_code, country, shipment_method, type
        });
    });
});


// Delete an order address
router.delete('/:order_address_id', (req, res) => {
    const { order_address_id } = req.params;

    const query = 'DELETE FROM order_address WHERE order_address_id = ?';

    connection.query(query, [order_address_id], (err, results) => {
        if (err) {
            console.error('Error deleting order address:', err);
            res.status(500).send('Error deleting order address');
        } else {
            res.status(200).json({ message: 'Order address deleted successfully' });
        }
    });
});

// Update an order address
router.put('/:order_address_id', (req, res) => {
    const { order_address_id } = req.params;
    const { order_id, fullname, street, apartment, city, province, postal_code, country, shipment_method, type } = req.body;

    if (!order_id || !fullname || !street || !city || !province || !postal_code || !country || !shipment_method || !type) {
        return res.status(400).json({ error: 'All fields except apartment are required' });
    }

    const query = `UPDATE order_address 
                   SET order_id=?, fullname=?, street=?, apartment=?, city=?, province=?, postal_code=?, country=?, shipment_method=?, type=? 
                   WHERE order_address_id=?`;

    connection.query(query, [order_id, fullname, street, apartment, city, province, postal_code, country, shipment_method, type, order_address_id], (err, results) => {
        if (err) {
            console.error('Error updating order address:', err);
            res.status(500).send('Error updating order address');
        } else {
            res.status(200).json({ message: 'Order address updated successfully' });
        }
    });
});

// Export the router so it can be used in the server.js
module.exports = router;
