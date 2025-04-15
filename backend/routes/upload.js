const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary'); // Ensure this path is correct
const router = express.Router();

// Set up multer to store images in memory (important for Cloudinary)
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('image'), (req, res) => {
  const { name, price, stock_qty, category_id, discount_percentage, min_quantity } = req.body;
  const file = req.file; // Multer stores the file in req.file

  if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
  }

  if (!name || !price || !stock_qty || !min_quantity) {
      return res.status(400).json({ error: 'Name, price, stock_qty, and min_quantity are required fields' });
  }

  cloudinary.uploader.upload_stream(
      { resource_type: 'auto' }, 
      (error, result) => {
          if (error) {
              return res.status(500).json({ error: 'Error uploading image to Cloudinary' });
          }

          // Save the product in the database with the Cloudinary URL
          const query = `INSERT INTO products (name, price, stock_qty, image_url, category_id, discount_percentage, min_quantity) VALUES (?, ?, ?, ?, ?, ?, ?)`;

          connection.query(query, [
              name, 
              price, 
              stock_qty, 
              result.secure_url, // Save the Cloudinary URL here
              category_id, 
              discount_percentage || 0, 
              min_quantity
          ], (err, results) => {
              if (err) {
                  console.error('Error adding product:', err);
                  res.status(500).send('Error adding product');
              } else {
                  res.status(201).json({ 
                      product_id: results.insertId, 
                      name, 
                      price, 
                      stock_qty, 
                      image_url: result.secure_url, // The URL from Cloudinary
                      category_id, 
                      discount_percentage, 
                      min_quantity 
                  });
              }
          });
      }
  ).end(req.file.buffer);  // Send the file buffer to Cloudinary
});

module.exports = router;