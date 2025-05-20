const express = require('express');
const router = express.Router();
const connection = require('../config/db');
const multer = require('multer');
const cloudinary = require('../config/cloudinary'); // Make sure this path is correct
const upload = multer({ storage: multer.memoryStorage() });

// GET: Fetch all products
router.get('/', (req, res) => {
    const query = 'SELECT * FROM products';

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching products:', err);
            res.status(500).send('Error fetching products');
        } else {
            res.json(results);
        }
    });
});

// GET: Fetch all products sorted by stock quantity (low to high)
router.get('/sorted', (req, res) => {
    const query = 'SELECT * FROM products ORDER BY stock_qty ASC';

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching products:', err);
            res.status(500).send('Error fetching products');
        } else {
            res.json(results);
        }
    });
});

// GET: Fetch a single product by ID
router.get('/:product_id', (req, res) => {
    const { product_id } = req.params;
  
    const query = 'SELECT * FROM products WHERE product_id = ?';
  
    connection.query(query, [product_id], (err, results) => {
      if (err) {
        console.error('Error fetching product:', err);
        res.status(500).send('Error fetching product');
      } else {
        if (results.length === 0) {
          res.status(404).send('Product not found');
        } else {
          res.json(results[0]);
        }
      }
    });
});


// In your products.js route file

// GET: Fetch all products by category
router.get('/category/:category_id', (req, res) => {
    const { category_id } = req.params;
  
    const query = 'SELECT * FROM products WHERE category_id = ?';
  
    connection.query(query, [category_id], (err, results) => {
      if (err) {
        console.error('Error fetching products by category:', err);
        res.status(500).send('Error fetching products by category');
      } else {
        res.json(results);
      }
    });
});


// POST: Add a new product with image upload
router.post('/', upload.single('image'), (req, res) => {
    console.log("POST /api/products received");
    console.log("Request body:", req.body);
    console.log("File:", req.file ? `${req.file.originalname} (${req.file.size} bytes)` : "No file");

    const { name, description, price, stock_qty, category_id, discount_percentage, min_quantity, status } = req.body;
    const file = req.file;

    if (!name || !price || !stock_qty || !min_quantity) {
        return res.status(400).json({ error: 'Name, price, stock_qty, and min_quantity are required fields' });
    }

    if (!file) {
        return res.status(400).json({ error: 'Image file is required' });
    }

    // Upload image to Cloudinary
    cloudinary.uploader.upload_stream(
        { resource_type: 'auto' },
        (error, result) => {
            if (error) {
                console.error('Cloudinary upload error:', error);
                return res.status(500).json({ error: 'Error uploading image to Cloudinary' });
            }

            console.log("Cloudinary upload successful:", result.secure_url);

            // Save product with the Cloudinary URL
            const query = `INSERT INTO products (name, description, price, stock_qty, image_url, category_id, discount_percentage, min_quantity, status) 
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            connection.query(query, [
                name,
                description || '',
                price, 
                stock_qty, 
                result.secure_url,
                category_id || null, 
                discount_percentage || 0, 
                min_quantity,
                status || 'Active'
            ], (err, results) => {
                if (err) {
                    console.error('Error adding product:', err);
                    res.status(500).json({ error: 'Error adding product to database' });
                } else {
                    console.log("Product added to database, ID:", results.insertId);
                    res.status(201).json({ 
                        product_id: results.insertId, 
                        name,
                        description: description || '',
                        price, 
                        stock_qty, 
                        image_url: result.secure_url,
                        category_id: category_id || null, 
                        discount_percentage: discount_percentage || 0, 
                        min_quantity,
                        status: status || 'Active'
                    });
                }
            });
        }
    ).end(file.buffer);
});

// PUT: Update a product with image upload
router.put('/:product_id', upload.single('image'), (req, res) => {
    const { product_id } = req.params;
    const { name, description, price, stock_qty, category_id, discount_percentage, min_quantity, status } = req.body;
    const file = req.file;
  
    if (!name || !price || !stock_qty || !min_quantity) {
      return res.status(400).json({ error: 'Name, price, stock_qty, and min_quantity are required fields' });
    }
  
    // If there's a new image file, upload it to Cloudinary
    if (file) {
      cloudinary.uploader.upload_stream(
        { resource_type: 'auto' },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return res.status(500).json({ error: 'Error uploading image to Cloudinary' });
          }
  
          // Update product with new image URL
          const query = `UPDATE products SET name=?, description=?, price=?, stock_qty=?, image_url=?, category_id=?, discount_percentage=?, min_quantity=?, status=? WHERE product_id=?`;
  
          connection.query(query, [
            name,
            description || '',
            price, 
            stock_qty, 
            result.secure_url, 
            category_id, 
            discount_percentage || 0, 
            min_quantity,
            status || 'Active',
            product_id
          ], (err, results) => {
            if (err) {
              console.error('Error updating product:', err);
              res.status(500).send('Error updating product');
            } else {
              if (results.affectedRows === 0) {
                res.status(404).json({ error: 'Product not found' });
              } else {
                res.status(200).json({ 
                  message: 'Product updated successfully',
                  image_url: result.secure_url
                });
              }
            }
          });
        }
      ).end(file.buffer);
    } else {
      // No new image, just update the other fields
      const query = `UPDATE products SET name=?, description=?, price=?, stock_qty=?, category_id=?, discount_percentage=?, min_quantity=?, status=? WHERE product_id=?`;
  
      connection.query(query, [
        name, 
        description || '',
        price, 
        stock_qty, 
        category_id, 
        discount_percentage || 0, 
        min_quantity,
        status || 'Active',
        product_id
      ], (err, results) => {
        if (err) {
          console.error('Error updating product:', err);
          res.status(500).send('Error updating product');
        } else {
          if (results.affectedRows === 0) {
            res.status(404).json({ error: 'Product not found' });
          } else {
            res.status(200).json({ message: 'Product updated successfully' });
          }
        }
      });
    }
});

// Add this route to check stock availability
router.post('/check-stock', (req, res) => {
    const { product_id, quantity } = req.body;
    
    if (!product_id || !quantity) {
        return res.status(400).json({ message: 'Product ID and quantity are required' });
    }
    
    const query = 'SELECT stock_qty FROM products WHERE product_id = ?';
    
    connection.query(query, [product_id], (err, results) => {
        if (err) {
            console.error('Error checking stock:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        const availableStock = results[0].stock_qty;
        const isAvailable = quantity <= availableStock;
        
        res.json({
            available: isAvailable,
            requested: quantity,
            in_stock: availableStock
        });
    });
});
  
// DELETE: Remove a product
router.delete('/:product_id', (req, res) => {
    const { product_id } = req.params;

    const query = 'DELETE FROM products WHERE product_id = ?';
    connection.query(query, [product_id], (err, results) => {
        if (err) {
            console.error('Error deleting product:', err);
            
            // Check if the error is a foreign key constraint error
            if (err.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(400).json({ 
                    error: 'This product cannot be deleted because it is associated with inventory items or orders. Please delete those items first or disable the product instead.' 
                });
            }
            
            res.status(500).json({ error: 'Error deleting product' });
        } else {
            if (results.affectedRows === 0) {
                res.status(404).json({ error: 'Product not found' });
            } else {
                res.status(200).json({ message: 'Product deleted successfully' });
            }
        }
    });
});

module.exports = router;
