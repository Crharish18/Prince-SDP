const express = require('express');
const router = express.Router();
const connection = require('../config/db'); // Import the database connection
const multer = require('multer');
const cloudinary = require('../config/cloudinary'); // Adjust path if needed
const upload = multer({ storage: multer.memoryStorage() });


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

// Function to update product stock based on expired inventory
function updateStockForExpiredInventory() {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

  // Query to find expired inventory with remaining quantity
  const findExpiredInventoryQuery = `
    SELECT i.inventory_id, i.product_id, i.qty_added, p.stock_qty
    FROM inventory i
    JOIN products p ON i.product_id = p.product_id
    WHERE i.expiry_date < ? 
    AND i.expiry_date IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM expired_inventory_log e 
      WHERE e.inventory_id = i.inventory_id
    )
  `;

  connection.query(findExpiredInventoryQuery, [todayStr], (err, results) => {
    if (err) {
      console.error('Error fetching expired inventory:', err);
      return;
    }

    if (results.length === 0) {
      console.log('No newly expired inventory found.');
      return;
    }

    console.log(`Found ${results.length} expired inventory items to process.`);

    // For each expired inventory, update product stock but keep inventory qty_added unchanged
    results.forEach((inventory) => {
      const { inventory_id, product_id, qty_added, stock_qty } = inventory;

      // Calculate the new stock quantity (don't go below 0)
      const newStockQty = Math.max(stock_qty - qty_added, 0);

      // Update product stock
      const updateProductStockQuery = `
        UPDATE products
        SET stock_qty = ?
        WHERE product_id = ?
      `;

      connection.query(updateProductStockQuery, [newStockQty, product_id], (err) => {
        if (err) {
          console.error(`Error updating stock for product_id ${product_id}:`, err);
          return;
        }

        // Log the expired inventory to prevent processing it again
        const logExpiredInventoryQuery = `
          INSERT INTO expired_inventory_log (inventory_id, product_id, qty_expired, expiry_date)
          SELECT inventory_id, product_id, qty_added, expiry_date
          FROM inventory
          WHERE inventory_id = ?
        `;

        connection.query(logExpiredInventoryQuery, [inventory_id], (err) => {
          if (err) {
            console.error(`Error logging expired inventory for inventory_id ${inventory_id}:`, err);
          } else {
            console.log(`Updated stock for product_id ${product_id}. Reduced by ${qty_added} units due to expiration.`);
          }
        });
      });
    });
  });
}

// Check if expired_inventory_log table exists, create if it doesn't
function ensureExpiredInventoryLogTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS expired_inventory_log (
      log_id INT AUTO_INCREMENT PRIMARY KEY,
      inventory_id INT NOT NULL,
      product_id INT NOT NULL,
      qty_expired INT NOT NULL,
      expiry_date DATE NOT NULL,
      processed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (inventory_id) REFERENCES inventory(inventory_id),
      FOREIGN KEY (product_id) REFERENCES products(product_id)
    )
  `;

  connection.query(createTableQuery, (err) => {
    if (err) {
      console.error('Error creating expired_inventory_log table:', err);
    } else {
      console.log('Expired inventory log table is ready');
      // Run initial check for expired inventory
      updateStockForExpiredInventory();
    }
  });
}

// Initialize the expired inventory log table when the server starts
ensureExpiredInventoryLogTable();

// Route to manually trigger the expired inventory check
router.post('/check-expired', (req, res) => {
  updateStockForExpiredInventory();
  res.status(200).json({ message: 'Expired inventory check initiated' });
});

// Route to get expired inventory log
router.get('/expired-log', (req, res) => {
  const query = `
    SELECT l.*, p.name as product_name 
    FROM expired_inventory_log l
    JOIN products p ON l.product_id = p.product_id
    ORDER BY l.processed_date DESC
  `;
  
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching expired inventory log:', err);
      return res.status(500).send('Error fetching expired inventory log');
    }
    res.json(results);
  });
});

router.post('/add-entity', upload.single('image'), (req, res) => {
  // Get product and inventory fields from req.body
  const {
    name, price, category_id, discount_percentage, min_quantity, description,
    qty_added, user_id, supplier_id, buying_price_per_unit, product_id, expiry_date
  } = req.body;
  const file = req.file;

  // Format the expiry date properly for MySQL
  let formattedExpiryDate = null;
  if (expiry_date) {
    // Convert to YYYY-MM-DD format for MySQL
    formattedExpiryDate = new Date(expiry_date).toISOString().split('T')[0];
  }

  console.log('Original expiry date:', expiry_date);
  console.log('Formatted expiry date:', formattedExpiryDate);

  // Begin transaction
  connection.beginTransaction(err => {
    if (err) return res.status(500).send('Transaction error');

    // Check if we're adding inventory for an existing product
    if (product_id) {
      // First update the product if any fields have changed
      const updateProduct = `
        UPDATE products 
        SET name=?, description=?, price=?, category_id=?, 
        discount_percentage=?, min_quantity=? 
        WHERE product_id=?`;
      
      connection.query(
        updateProduct,
        [name, description || '', price, category_id, discount_percentage || 0, min_quantity || 1, product_id],
        (err) => {
          if (err) return connection.rollback(() => res.status(500).send('Error updating product'));
          
          // If there's a new image, upload and update the image_url
          if (file) {
            cloudinary.uploader.upload_stream(
              { resource_type: 'auto' },
              (error, result) => {
                if (error) {
                  console.error('Cloudinary upload error:', error);
                  return connection.rollback(() => res.status(500).send('Error uploading image'));
                }
                
                // Update the image URL
                connection.query(
                  'UPDATE products SET image_url=? WHERE product_id=?',
                  [result.secure_url, product_id],
                  (err) => {
                    if (err) return connection.rollback(() => res.status(500).send('Error updating product image'));
                    
                    // Now insert into inventory
                    insertInventoryRecord(product_id);
                  }
                );
              }
            ).end(file.buffer);
          } else {
            // No new image, just insert into inventory
            insertInventoryRecord(product_id);
          }
        }
      );
    } else {
      // For new products, require an image
      if (!file) {
        return connection.rollback(() => res.status(400).json({ error: 'Image file is required for new products' }));
      }

      // Upload image to Cloudinary and create new product
      cloudinary.uploader.upload_stream(
        { resource_type: 'auto' },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return connection.rollback(() => res.status(500).json({ error: 'Error uploading image to Cloudinary' }));
          }

          const image_url = result.secure_url;

          // Insert into products
          const insertProduct = `
            INSERT INTO products
            (name, price, stock_qty, image_url, category_id, discount_percentage, min_quantity, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
          connection.query(
            insertProduct,
            [name, price, qty_added, image_url, category_id, discount_percentage || 0, min_quantity || 1, description || ''],
            (err, productResults) => {
              if (err) return connection.rollback(() => res.status(500).send('Error adding product'));

              const newProductId = productResults.insertId;
              
              // Insert into inventory
              insertInventoryRecord(newProductId);
            }
          );
        }
      ).end(file.buffer);
    }

    // Helper function to insert inventory record
    function insertInventoryRecord(productId) {
      const insertInventory = `
        INSERT INTO inventory
        (qty_added, qty_available, user_id, supplier_id, product_id, buying_price_per_unit, expiry_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)`;
      
      connection.query(
        insertInventory,
        [qty_added, qty_added, user_id, supplier_id, productId, buying_price_per_unit, formattedExpiryDate],
        (err, inventoryResults) => {
          if (err) {
            console.error('Error adding inventory:', err);
            return connection.rollback(() => res.status(500).send('Error adding inventory'));
          }
          
          // Update product stock quantity
          connection.query(
            'UPDATE products SET stock_qty = stock_qty + ? WHERE product_id = ?',
            [qty_added, productId],
            (err) => {
              if (err) return connection.rollback(() => res.status(500).send('Error updating product stock'));
              
              connection.commit(err => {
                if (err) return connection.rollback(() => res.status(500).send('Transaction commit error'));
                res.status(201).json({
                  product_id: productId,
                  inventory_id: inventoryResults.insertId,
                  message: "Product and inventory added successfully"
                });
              });
            }
          );
        }
      );
    }
  });
});

// Route to reduce inventory using FIFO method when an order is placed
router.post('/reduce-stock', (req, res) => {
  const { items } = req.body; // Array of {product_id, qty}
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Invalid items data. Expected array of {product_id, qty}' });
  }

  // Begin transaction
  connection.beginTransaction(err => {
    if (err) {
      console.error('Error starting transaction:', err);
      return res.status(500).json({ error: 'Transaction error' });
    }

    // Process each item in the order
    const processItems = async () => {
      try {
        const inventoryUsage = []; // To track which inventory records were used
        
        for (const item of items) {
          const { product_id, qty } = item;
          
          // First update the products table - THIS IS THE KEY CHANGE
          // We only update the product stock here, not in the checkout.jsx
          const updateProductQuery = 'UPDATE products SET stock_qty = stock_qty - ? WHERE product_id = ?';
          await new Promise((resolve, reject) => {
            connection.query(updateProductQuery, [qty, product_id], (err, results) => {
              if (err) reject(err);
              else resolve(results);
            });
          });
          
          // Now handle FIFO inventory reduction
          let remainingQty = qty;
          const itemInventoryIds = []; // Track inventory IDs used for this item
          
          // Get inventory records for this product ordered by expiry_date (oldest first)
          const getInventoryQuery = `
            SELECT inventory_id, qty_available 
            FROM inventory 
            WHERE product_id = ? AND qty_available > 0
            ORDER BY expiry_date ASC, added_on ASC`;
            
          const inventoryRecords = await new Promise((resolve, reject) => {
            connection.query(getInventoryQuery, [product_id], (err, results) => {
              if (err) reject(err);
              else resolve(results);
            });
          });
          
          // Reduce quantities from oldest inventory records first
          for (const record of inventoryRecords) {
            if (remainingQty <= 0) break;
            
            const qtyToReduce = Math.min(remainingQty, record.qty_available);
            remainingQty -= qtyToReduce;
            
            // Update this inventory record - reduce from qty_available instead of qty_added
            const updateInventoryQuery = 'UPDATE inventory SET qty_available = qty_available - ? WHERE inventory_id = ?';
            await new Promise((resolve, reject) => {
              connection.query(updateInventoryQuery, [qtyToReduce, record.inventory_id], (err, results) => {
                if (err) reject(err);
                else resolve(results);
              });
            });
            
            // Add this inventory record to the usage list
            itemInventoryIds.push({
              inventory_id: record.inventory_id,
              qty_used: qtyToReduce
            });
          }
          
          // If we couldn't reduce all the quantity, it means we don't have enough inventory
          if (remainingQty > 0) {
            throw new Error(`Insufficient inventory for product ID ${product_id}`);
          }
          
          // Add the inventory usage for this item
          inventoryUsage.push({
            product_id,
            inventory_ids: itemInventoryIds
          });
        }
        
        // If we get here, all items were processed successfully
        connection.commit(err => {
          if (err) {
            console.error('Error committing transaction:', err);
            connection.rollback(() => {
              res.status(500).json({ error: 'Transaction commit error' });
            });
          } else {
            res.status(200).json({ 
              message: 'Inventory updated successfully using FIFO method',
              inventoryUsage: inventoryUsage
            });
          }
        });
      } catch (error) {
        console.error('Error processing items:', error);
        connection.rollback(() => {
          res.status(400).json({ error: error.message });
        });
      }
    };
    
    processItems();
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

// Route to get expired inventory items
router.get('/expired', (req, res) => {
  const query = `
    SELECT i.*, p.name as product_name 
    FROM inventory i
    JOIN products p ON i.product_id = p.product_id
    WHERE i.expiry_date < CURDATE()
    ORDER BY i.expiry_date ASC`;
  
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching expired inventory:', err);
      return res.status(500).send('Error fetching expired inventory');
    }
    res.json(results);
  });
});

// Route to get soon-to-expire inventory (within next 30 days)
router.get('/expiring-soon', (req, res) => {
  const query = `
    SELECT i.*, p.name as product_name 
    FROM inventory i
    JOIN products p ON i.product_id = p.product_id
    WHERE i.expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
    ORDER BY i.expiry_date ASC`;
  
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching soon-to-expire inventory:', err);
      return res.status(500).send('Error fetching soon-to-expire inventory');
    }
    res.json(results);
  });
});

// Set up a daily check for expired inventory (runs at midnight)
const scheduleExpiryCheck = () => {
  const now = new Date();
  const night = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1, // tomorrow
    0, 0, 0 // midnight
  );
  const timeToMidnight = night.getTime() - now.getTime();
  
  // Schedule first run at next midnight
  setTimeout(() => {
    updateStockForExpiredInventory();
    
    // Then schedule to run daily
    setInterval(updateStockForExpiredInventory, 24 * 60 * 60 * 1000);
  }, timeToMidnight);
};

// Start the scheduler
scheduleExpiryCheck();

// Export the router so it can be used in the server.js
module.exports = router;
