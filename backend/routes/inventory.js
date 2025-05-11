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
        (qty_added, user_id, supplier_id, product_id, buying_price_per_unit, expiry_date)
        VALUES (?, ?, ?, ?, ?, ?)`;
      
      connection.query(
        insertInventory,
        [qty_added, user_id, supplier_id, productId, buying_price_per_unit, formattedExpiryDate],
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
        for (const item of items) {
          const { product_id, qty } = item;
          
          // First update the products table
          const updateProductQuery = 'UPDATE products SET stock_qty = stock_qty - ? WHERE product_id = ?';
          await new Promise((resolve, reject) => {
            connection.query(updateProductQuery, [qty, product_id], (err, results) => {
              if (err) reject(err);
              else resolve(results);
            });
          });
          
          // Now handle FIFO inventory reduction
          let remainingQty = qty;
          
          // Get inventory records for this product ordered by added_on (oldest first)
          const getInventoryQuery = `
            SELECT inventory_id, qty_added 
            FROM inventory 
            WHERE product_id = ? AND qty_added > 0
            ORDER BY added_on ASC`;
            
          const inventoryRecords = await new Promise((resolve, reject) => {
            connection.query(getInventoryQuery, [product_id], (err, results) => {
              if (err) reject(err);
              else resolve(results);
            });
          });
          
          // Reduce quantities from oldest inventory records first
          for (const record of inventoryRecords) {
            if (remainingQty <= 0) break;
            
            const qtyToReduce = Math.min(remainingQty, record.qty_added);
            remainingQty -= qtyToReduce;
            
            // Update this inventory record
            const updateInventoryQuery = 'UPDATE inventory SET qty_added = qty_added - ? WHERE inventory_id = ?';
            await new Promise((resolve, reject) => {
              connection.query(updateInventoryQuery, [qtyToReduce, record.inventory_id], (err, results) => {
                if (err) reject(err);
                else resolve(results);
              });
            });
          }
          
          // If we couldn't reduce all the quantity, it means we don't have enough inventory
          if (remainingQty > 0) {
            throw new Error(`Insufficient inventory for product ID ${product_id}`);
          }
        }
        
        // If we get here, all items were processed successfully
        connection.commit(err => {
          if (err) {
            console.error('Error committing transaction:', err);
            connection.rollback(() => {
              res.status(500).json({ error: 'Transaction commit error' });
            });
          } else {
            res.status(200).json({ message: 'Inventory updated successfully using FIFO method' });
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

// Export the router so it can be used in the server.js
module.exports = router;
