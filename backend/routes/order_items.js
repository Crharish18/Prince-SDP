const express = require('express');
const router = express.Router();
const connection = require('../config/db'); // Database connection
const axios = require('axios'); // Add this import for axios

// Fetch order items for a specific order
router.get('/:order_id/items', (req, res) => {
    const { order_id } = req.params;

    const query = `
    SELECT oi.order_item_id, oi.order_id, oi.product_id, oi.qty, oi.price, oi.discount, oi.final_price, oi.inventory_id, p.name AS product_name
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

// Fetch top-selling products (top 7 based on sales)
router.get('/top-sellers', (req, res) => {
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

// Add new order items (including discount, final_price, and inventory_id)
router.post('/', (req, res) => {
    const orderItems = req.body; // The array of order items
  
    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ error: 'Invalid order items data' });
    }
  
    // First, reduce inventory using FIFO method
    const inventoryItems = orderItems.map(item => ({
        product_id: item.product_id,
        qty: item.qty
    }));
    
    // Track inventory usage for each product
    const processInventory = async () => {
        try {
            // Call the inventory API to reduce stock
            const response = await axios.post('http://localhost:5000/api/inventory/reduce-stock', { items: inventoryItems });
            
            // Process each order item
            const allOrderItemValues = [];
            const inventoryUsageMap = {};
            
            // Process each order item and prepare for database insertion
            for (const item of orderItems) {
                const { product_id, order_id, qty, price, discount, final_price } = item;
                
                // Get inventory records for this product ordered by added_on (oldest first)
                const [inventoryRecords] = await connection.promise().query(
                    `SELECT inventory_id, qty_added 
                     FROM inventory 
                     WHERE product_id = ? AND qty_added > 0
                     ORDER BY added_on ASC`,
                    [product_id]
                );
                
                if (inventoryRecords.length === 0) {
                    // No inventory records found, create order item with null inventory_id
                    allOrderItemValues.push([
                        order_id,
                        product_id,
                        qty,
                        price,
                        discount,
                        final_price,
                        null
                    ]);
                    continue;
                }
                
                // Track which inventory records were used
                let remainingQty = qty;
                const usedInventory = [];
                
                // Use FIFO to determine which inventory records to use
                for (const record of inventoryRecords) {
                    if (remainingQty <= 0) break;
                    
                    const qtyToUse = Math.min(remainingQty, record.qty_added);
                    remainingQty -= qtyToUse;
                    
                    usedInventory.push({
                        inventory_id: record.inventory_id,
                        qty_used: qtyToUse
                    });
                }
                
                // Store inventory usage for this product
                if (!inventoryUsageMap[product_id]) {
                    inventoryUsageMap[product_id] = [];
                }
                
                // Create separate order items for each inventory record used
                for (const inv of usedInventory) {
                    // Calculate the price portion for this inventory unit
                    const portionRatio = inv.qty_used / qty;
                    const portionPrice = price * portionRatio;
                    const portionDiscount = discount * portionRatio;
                    const portionFinalPrice = final_price * portionRatio;
                    
                    allOrderItemValues.push([
                        order_id,
                        product_id,
                        inv.qty_used,
                        portionPrice,
                        portionDiscount,
                        portionFinalPrice,
                        inv.inventory_id // Store as integer, not string
                    ]);
                    
                    // Track inventory usage for this product
                    inventoryUsageMap[product_id].push({
                        inventory_id: inv.inventory_id,
                        qty_used: inv.qty_used
                    });
                }
            }
            
            // Insert all order items
            if (allOrderItemValues.length > 0) {
                const query = 'INSERT INTO order_item (order_id, product_id, qty, price, discount, final_price, inventory_id) VALUES ?';
                
                const [results] = await connection.promise().query(query, [allOrderItemValues]);
                
                return res.status(201).json({ 
                    message: 'Order items added successfully',
                    inventoryUsage: Object.keys(inventoryUsageMap).map(productId => ({
                        product_id: parseInt(productId),
                        inventory_ids: inventoryUsageMap[productId]
                    }))
                });
            } else {
                return res.status(400).json({ error: 'No valid order items to insert' });
            }
        } catch (error) {
            console.error('Error processing order items:', error);
            return res.status(500).json({ 
                error: 'Error processing order items', 
                details: error.message 
            });
        }
    };
    
    processInventory();
});

module.exports = router;
