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

// ✅ POST: Add a new product
router.post('/', (req, res) => {
    const { description, price, stock_qty, image_url, category_id } = req.body;

    if (!description || !price || !stock_qty) {
        return res.status(400).json({ error: 'Description, price, and stock_qty are required fields' });
    }

    const query = `INSERT INTO products (description, price, stock_qty, image_url, category_id) VALUES (?, ?, ?, ?, ?)`;

    connection.query(query, [description, price, stock_qty, image_url, category_id], (err, results) => {
        if (err) {
            console.error('Error adding product:', err);
            res.status(500).send('Error adding product');
        } else {
            res.status(201).json({ 
                product_id: results.insertId, 
                description, 
                price, 
                stock_qty, 
                image_url, 
                category_id 
            });
        }
    });
});

// ✅ PUT: Update a product
router.put('/:product_id', (req, res) => {
    const { product_id } = req.params;
    const { description, price, stock_qty, image_url, category_id } = req.body;

    if (!description || !price || !stock_qty) {
        return res.status(400).json({ error: 'Description, price, and stock_qty are required fields' });
    }

    const query = `UPDATE products SET description=?, price=?, stock_qty=?, image_url=?, category_id=? WHERE product_id=?`;

    connection.query(query, [description, price, stock_qty, image_url, category_id, product_id], (err, results) => {
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
