const express = require('express');
const router = express.Router();
const connection = require('../config/db'); // Import the database connection
const axios = require('axios'); // Add axios for internal API calls

// Fetch all orders
router.get('/', (req, res) => {
    const query = 'SELECT * FROM `order`';   // Correct

    connection.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching orders:', err);
        return res.status(500).send('Error fetching orders');
      } else {
        res.json(results); // Send inventory data back to the frontend
      }
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
router.get('/sold-this-month', (req, res) => {
    const query = `
        SELECT oi.product_id, p.name AS product_name, SUM(oi.qty) AS total_sales
        FROM order_item oi
        JOIN products p ON oi.product_id = p.product_id
        JOIN \`order\` o ON oi.order_id = o.order_id
        WHERE MONTH(o.created_at) = MONTH(CURRENT_DATE()) 
        AND YEAR(o.created_at) = YEAR(CURRENT_DATE())
        AND o.status <> 'Cancelled'  -- Exclude 'Cancelled' orders
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

// Helper function to handle inventory adjustments when order status changes
async function handleOrderStatusChange(orderId, oldStatus, newStatus) {
    // Get all order items for this order
    const getOrderItemsQuery = `
        SELECT oi.product_id, oi.qty, oi.inventory_id 
        FROM order_item oi
        WHERE oi.order_id = ?
    `;
    
    return new Promise((resolve, reject) => {
        connection.query(getOrderItemsQuery, [orderId], async (err, orderItems) => {
            if (err) {
                console.error('Error fetching order items:', err);
                return reject(new Error('Error fetching order items'));
            }
            
            try {
                // If changing from non-cancelled to cancelled, restore stock
                if (newStatus === 'Cancelled' && oldStatus !== 'Cancelled') {
                    console.log('Restoring stock for cancelled order:', orderId);
                    
                    // Update product stock quantities
                    for (const item of orderItems) {
                        // Update product stock
                        await new Promise((resolve, reject) => {
                            connection.query(
                                'UPDATE products SET stock_qty = stock_qty + ? WHERE product_id = ?',
                                [item.qty, item.product_id],
                                (err) => {
                                    if (err) reject(err);
                                    else resolve();
                                }
                            );
                        });
                        
                        // Update inventory quantities if inventory_id exists
                        if (item.inventory_id) {
                            // Convert inventory_id to string to safely handle any format
                            const inventoryIdStr = String(item.inventory_id);
                            
                            // Check if inventory_id contains the format "id1:qty1,id2:qty2,..."
                            if (inventoryIdStr.includes(':')) {
                                const inventoryEntries = inventoryIdStr.split(',');
                                
                                for (const entry of inventoryEntries) {
                                    const [invId, qtyUsed] = entry.split(':');
                                    
                                    if (!invId) continue;
                                    
                                    await new Promise((resolve, reject) => {
                                        connection.query(
                                            'UPDATE inventory SET qty_available = qty_available + ? WHERE inventory_id = ?',
                                            [parseInt(qtyUsed), parseInt(invId)],
                                            (err) => {
                                                if (err) reject(err);
                                                else resolve();
                                            }
                                        );
                                    });
                                }
                            } else {
                                // Handle old format (comma-separated IDs without quantities)
                                const inventoryIds = inventoryIdStr.split(',');
                                const qtyPerRecord = Math.ceil(item.qty / inventoryIds.length);
                                
                                for (const invId of inventoryIds) {
                                    if (!invId) continue;
                                    
                                    await new Promise((resolve, reject) => {
                                        connection.query(
                                            'UPDATE inventory SET qty_available = qty_available + ? WHERE inventory_id = ?',
                                            [qtyPerRecord, parseInt(invId)],
                                            (err) => {
                                                if (err) reject(err);
                                                else resolve();
                                            }
                                        );
                                    });
                                }
                            }
                        }
                    }
                }
                // If changing from cancelled to non-cancelled, reduce stock again
                else if (oldStatus === 'Cancelled' && newStatus !== 'Cancelled') {
                    console.log('Reducing stock for reactivated order:', orderId);
                    
                    // Update product stock quantities
                    for (const item of orderItems) {
                        // Update product stock
                        await new Promise((resolve, reject) => {
                            connection.query(
                                'UPDATE products SET stock_qty = stock_qty - ? WHERE product_id = ?',
                                [item.qty, item.product_id],
                                (err) => {
                                    if (err) reject(err);
                                    else resolve();
                                }
                            );
                        });
                        
                        // Update inventory quantities if inventory_id exists
                        if (item.inventory_id) {
                            // Convert inventory_id to string to safely handle any format
                            const inventoryIdStr = String(item.inventory_id);
                            
                            // Check if inventory_id contains the format "id1:qty1,id2:qty2,..."
                            if (inventoryIdStr.includes(':')) {
                                const inventoryEntries = inventoryIdStr.split(',');
                                
                                for (const entry of inventoryEntries) {
                                    const [invId, qtyUsed] = entry.split(':');
                                    
                                    if (!invId) continue;
                                    
                                    await new Promise((resolve, reject) => {
                                        connection.query(
                                            'UPDATE inventory SET qty_available = qty_available - ? WHERE inventory_id = ?',
                                            [parseInt(qtyUsed), parseInt(invId)],
                                            (err) => {
                                                if (err) reject(err);
                                                else resolve();
                                            }
                                        );
                                    });
                                }
                            } else {
                                // Handle old format (comma-separated IDs without quantities)
                                const inventoryIds = inventoryIdStr.split(',');
                                const qtyPerRecord = Math.ceil(item.qty / inventoryIds.length);
                                
                                for (const invId of inventoryIds) {
                                    if (!invId) continue;
                                    
                                    await new Promise((resolve, reject) => {
                                        connection.query(
                                            'UPDATE inventory SET qty_available = qty_available - ? WHERE inventory_id = ?',
                                            [qtyPerRecord, parseInt(invId)],
                                            (err) => {
                                                if (err) reject(err);
                                                else resolve();
                                            }
                                        );
                                    });
                                }
                            }
                        }
                    }
                }
                
                resolve();
            } catch (error) {
                console.error('Error adjusting inventory:', error);
                reject(error);
            }
        });
    });
}


// Create a new order
router.post('/', (req, res) => {
    const { customer_id, total_price, status, price, total_discount } = req.body;

    if (!customer_id || total_price === undefined || !status || price === undefined || total_discount === undefined) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const query = `INSERT INTO \`order\` (customer_id, total_price, status, price, total_discount, created_at, updated_at) 
                   VALUES (?, ?, ?, ?, ?, NOW(), NOW())`;

    connection.query(query, [customer_id, total_price, status, price, total_discount], (err, results) => {
        if (err) {
            console.error('❌ Error inserting order:', err);
            return res.status(500).json({ error: 'Error adding order', details: err.message });
        }
        res.status(201).json({ 
            order_id: results.insertId, 
            customer_id, 
            total_price, 
            status, 
            price, 
            total_discount,
            created_at: new Date(), 
            updated_at: new Date()
        });
    });
});


// Update an order by ID
router.put('/:order_id', (req, res) => {
    const { order_id } = req.params;
    const { customer_id, total_price, status, price, total_discount, quantity } = req.body;
    console.log("Received data for update:", req.body);

    if (!customer_id || !total_price || !status || !price || !total_discount) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // First get the current order to check if status is changing
    connection.query('SELECT status FROM `order` WHERE order_id = ?', [order_id], async (err, results) => {
        if (err) {
            console.error('❌ Error fetching order:', err);
            return res.status(500).json({ error: 'Error fetching order', details: err.message });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        const oldStatus = results[0].status;
        
        // If status is changing to or from Cancelled, handle stock adjustments
        if (oldStatus !== status && (oldStatus === 'Cancelled' || status === 'Cancelled')) {
            try {
                await handleOrderStatusChange(order_id, oldStatus, status);
            } catch (error) {
                return res.status(500).json({ error: 'Error adjusting stock', details: error.message });
            }
        }
        
        // Now update the order
        const query = `UPDATE \`order\` SET customer_id=?, total_price=?, status=?, price=?, total_discount=?, updated_at=NOW() WHERE order_id=?`;

        connection.query(query, [customer_id, total_price, status, price, total_discount, order_id], (err, results) => {
            if (err) {
                console.error('❌ Error updating order:', err);
                return res.status(500).json({ error: 'Error updating order', details: err.message });
            }
            res.status(200).json({ message: 'Order updated successfully' });
        });
    });
});

// Delete an order by ID
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
