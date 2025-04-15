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

// Fetch orders created today
router.get('/today', (req, res) => {
    const query = `
        SELECT COUNT(*) AS total_orders
        FROM \`order\`
        WHERE DATE(created_at) = DATE(NOW());`;   // Ensure we use NOW() to compare only the date part

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching today\'s orders:', err);
            return res.status(500).send('Error fetching today\'s orders');
        }
        res.json({ total_orders: results[0].total_orders });
    });
});

// Fetch today's total income
router.get('/today-income', (req, res) => {
    const query = `
        SELECT SUM(total_price) AS total_income
        FROM \`order\`
        WHERE DATE(created_at) = DATE(NOW());`;  // Sum the total_price for orders created today

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching today\'s total income:', err);
            return res.status(500).send('Error fetching today\'s total income');
        }
        res.json({ total_income: results[0].total_income || 0 });  // Return the total income
    });
});

// Fetch products sold in the ongoing month

// Fetch products sold in the ongoing month without considering the order status
router.get('/sold-this-month', (req, res) => {
    const query = `
        SELECT oi.product_id, p.name AS product_name, SUM(oi.qty) AS total_sales
        FROM order_item oi
        JOIN products p ON oi.product_id = p.product_id
        JOIN \`order\` o ON oi.order_id = o.order_id
        WHERE MONTH(o.created_at) = MONTH(CURRENT_DATE()) 
        AND YEAR(o.created_at) = YEAR(CURRENT_DATE())
        AND o.status <> 'Cancelled'  -- Exclude 'Delivered' orders
        GROUP BY oi.product_id
        ORDER BY total_sales DESC;
    `;
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching products sold this month:', err);
            return res.status(500).json({ error: 'Error fetching products sold this month' });
        }
        res.json(results);  // Return the results to the frontend
    });
});

// Fetch total pending orders (all-time)
router.get('/pending-all', (req, res) => {
    const query = `
        SELECT COUNT(*) AS pending_orders
        FROM \`order\`
        WHERE status = 'Pending';
    `;

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching pending orders:', err);
            return res.status(500).send('Error fetching pending orders');
        }
        res.json({ pending_orders: results[0].pending_orders });
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