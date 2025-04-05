const express = require('express');
const router = express.Router();
const connection = require('../config/db'); // Import database connection

// ✅ GET: Fetch all products
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

// ✅ GET: Fetch all products sorted by stock quantity (low to high)
router.get('/sorted', (req, res) => {
    const query = 'SELECT * FROM products ORDER BY stock_qty ASC'; // Sort by stock_qty in ascending order

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching products:', err);
            res.status(500).send('Error fetching products');
        } else {
            res.json(results);
        }
    });
});

// ✅ GET: Fetch a single product by ID
router.get('/:product_id', (req, res) => {
    const { product_id } = req.params; // Get product_id from URL params
  
    const query = 'SELECT * FROM products WHERE product_id = ?';
  
    connection.query(query, [product_id], (err, results) => {
      if (err) {
        console.error('Error fetching product:', err);
        res.status(500).send('Error fetching product');
      } else {
        if (results.length === 0) {
          res.status(404).send('Product not found');
        } else {
          res.json(results[0]);  // Return the product
        }
      }
    });
  });
  


// ✅ POST: Add a new product
router.post('/', (req, res) => {
    const { name, price, stock_qty, image_url, category_id, discount_percentage, min_quantity } = req.body;

    if (!name || !price || !stock_qty || !min_quantity) {
        return res.status(400).json({ error: 'Name, price, stock_qty, and min_quantity are required fields' });
    }

    const query = `INSERT INTO products (name, price, stock_qty, image_url, category_id, discount_percentage, min_quantity) VALUES (?, ?, ?, ?, ?, ?, ?)`;

    connection.query(query, [name, price, stock_qty, image_url, category_id, discount_percentage || 0, min_quantity], (err, results) => {
        if (err) {
            console.error('Error adding product:', err);
            res.status(500).send('Error adding product');
        } else {
            res.status(201).json({ 
                product_id: results.insertId, 
                name, 
                price, 
                stock_qty, 
                image_url, 
                category_id, 
                discount_percentage, 
                min_quantity 
            });
        }
    });
});

// ✅ PUT: Update a product
router.put('/:product_id', (req, res) => {
    const { product_id } = req.params;
    const { name, price, stock_qty, image_url, category_id, discount_percentage, min_quantity } = req.body;

    if (!name || !price || !stock_qty || !min_quantity) {
        return res.status(400).json({ error: 'Name, price, stock_qty, and min_quantity are required fields' });
    }

    const query = `UPDATE products SET name=?, price=?, stock_qty=?, image_url=?, category_id=?, discount_percentage=?, min_quantity=? WHERE product_id=?`;

    connection.query(query, [name, price, stock_qty, image_url, category_id, discount_percentage || 0, min_quantity, product_id], (err, results) => {
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
});

// ✅ DELETE: Remove a product
router.delete('/:product_id', (req, res) => {
    const { product_id } = req.params;

    const query = 'DELETE FROM products WHERE product_id = ?';

    connection.query(query, [product_id], (err, results) => {
        if (err) {
            console.error('Error deleting product:', err);
            res.status(500).send('Error deleting product');
        } else {
            if (results.affectedRows === 0) {
                res.status(404).json({ error: 'Product not found' });
            } else {
                res.status(200).json({ message: 'Product deleted successfully' });
            }
        }
    });
});

// ✅ Export the router
module.exports = router;
