const express = require('express');
const router = express.Router();
const connection = require('../config/db'); // Import the database connection

// Fetch all orders
router.get('/', (req, res) => {
    const query = 'SELECT * FROM `order`';   // Correct

    
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching orders:', err);
            return res.status(500).send('Error fetching orders');
        }
        res.json(results);
    });
});

// ✅ Create a new order
router.post('/', (req, res) => {
    const { customer_id, total_price, status } = req.body;

    if (!customer_id || !total_price || !status) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const query = `INSERT INTO \`order\` (customer_id, total_price, status, created_at, updated_at) 
                   VALUES (?, ?, ?, NOW(), NOW())`;

    connection.query(query, [customer_id, total_price, status], (err, results) => {
        if (err) {
            console.error('❌ Error inserting order:', err);
            return res.status(500).json({ error: 'Error adding order', details: err.message });
        }
        res.status(201).json({ 
            order_id: results.insertId, 
            customer_id, 
            total_price, 
            status, 
            created_at: new Date(), 
            updated_at: new Date()
        });
    });
});

// ✅ Update an order by ID
router.put('/:order_id', (req, res) => {
    const { order_id } = req.params;
    const { customer_id, total_price, status } = req.body;

    if (!customer_id || !total_price || !status) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const query = `UPDATE \`order\` SET customer_id=?, total_price=?, status=?, updated_at=NOW() WHERE order_id=?`;

    connection.query(query, [customer_id, total_price, status, order_id], (err, results) => {
        if (err) {
            console.error('❌ Error updating order:', err);
            return res.status(500).json({ error: 'Error updating order', details: err.message });
        }
        res.status(200).json({ message: 'Order updated successfully' });
    });
});

router.delete('/:order_id', (req, res) => {
    const { order_id } = req.params;

    // Step 1: Delete related order items first
    const deleteOrderItemsQuery = 'DELETE FROM `order_item` WHERE order_id = ?';

    connection.query(deleteOrderItemsQuery, [order_id], (err, results) => {
        if (err) {
            console.error('❌ Error deleting order items:', err);
            return res.status(500).json({ error: 'Error deleting order items', details: err.message });
        }

        // Step 2: Now delete the order itself
        const deleteOrderQuery = 'DELETE FROM `order` WHERE order_id = ?';

        connection.query(deleteOrderQuery, [order_id], (err, results) => {
            if (err) {
                console.error('❌ Error deleting order:', err);
                return res.status(500).json({ error: 'Error deleting order', details: err.message });
            }

            res.status(200).json({ message: 'Order deleted successfully' });
        });
    });
});

module.exports = router;