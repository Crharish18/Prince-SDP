const express = require('express');
const router = express.Router();
const connection = require('../config/db'); // Database connection

router.get('/:customer_id', (req, res) => {
    const { customer_id } = req.params;
    const query = `
  SELECT 
    cart.cart_id, 
    cart.customer_id, 
    cart.product_id, 
    cart.quantity, 
    cart.price, 
    cart.discount, 
    cart.total_price, 
    cart.status, 
    products.name, 
    products.min_quantity, 
    products.discount_percentage 
  FROM cart 
  JOIN products ON cart.product_id = products.product_id 
  WHERE cart.customer_id = ? AND cart.status = 'active'`;

  
    connection.query(query, [customer_id], (err, results) => {
      if (err) {
        console.error('Error fetching cart items:', err);
        res.status(500).send('Error fetching cart items');
      } else {
        res.json(results);
      }
    });
  });
  
  

router.post('/', (req, res) => {
    const { customer_id, product_id, quantity, price, discount, status } = req.body;
  
    if (!customer_id || !product_id || !quantity || !price) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    const total_price = (price * quantity) - discount; // Calculate total price
  
    // Check if there's already an active cart for this customer and product
    const checkCartQuery = 'SELECT * FROM cart WHERE customer_id = ? AND product_id = ? AND status = "active" LIMIT 1';
  
    connection.query(checkCartQuery, [customer_id, product_id], (err, results) => {
      if (err) {
        console.error('Error checking active cart:', err);
        return res.status(500).send('Error checking active cart');
      }
  
      if (results.length > 0) {
        // If the customer already has this product in their active cart, update the quantity
        const updateCartQuery = 'UPDATE cart SET quantity = ?, total_price = ? WHERE cart_id = ?';
        const cart_id = results[0].cart_id;
  
        connection.query(updateCartQuery, [quantity, total_price, cart_id], (err, results) => {
          if (err) {
            console.error('Error updating cart item:', err);
            return res.status(500).send('Error updating cart item');
          }
  
          res.status(200).json({ message: 'Cart item updated successfully' });
        });
      } else {
        // If no active cart for this product, create a new cart entry
        const createCartQuery = 'INSERT INTO cart (customer_id, product_id, quantity, price, discount, total_price, status) VALUES (?, ?, ?, ?, ?, ?, "active")';
  
        connection.query(createCartQuery, [customer_id, product_id, quantity, price, discount, total_price], (err, results) => {
          if (err) {
            console.error('Error creating new cart:', err);
            return res.status(500).send('Error creating new cart');
          }
  
          res.status(201).json({ cart_id: results.insertId, customer_id, product_id, quantity, price, discount, total_price, status: 'active' });
        });
      }
    });
  });
  
  

// Delete a product from the cart
router.delete('/:cart_id', (req, res) => {
    const { cart_id } = req.params;

    const query = 'DELETE FROM cart WHERE cart_id = ?';

    connection.query(query, [cart_id], (err, results) => {
        if (err) {
            console.error('Error deleting product from cart:', err);
            res.status(500).send('Error deleting product from cart');
        } else {
            res.status(200).json({ message: 'Product removed from cart successfully' });
        }
    });
});

router.put('/:cart_id', (req, res) => {
  const { cart_id } = req.params;
  const { quantity } = req.body;

  if (!quantity) {
    return res.status(400).json({ error: 'Quantity is required' });
  }

  // Fetch the cart item
  const checkCartQuery = 'SELECT * FROM cart WHERE cart_id = ?';

  connection.query(checkCartQuery, [cart_id], (err, results) => {
    if (err) {
      console.error('Error checking cart item:', err);
      return res.status(500).send('Error checking cart item');
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    const item = results[0];
    const total_price = (item.price * quantity) - item.discount;

    // Update the cart item with the new quantity
    const updateCartQuery = `UPDATE cart 
                             SET quantity = ?, total_price = ? 
                             WHERE cart_id = ?`;

    connection.query(updateCartQuery, [quantity, total_price, cart_id], (err, results) => {
      if (err) {
        console.error('Error updating cart item:', err);
        return res.status(500).send('Error updating cart item');
      }

      res.status(200).json({ message: 'Cart item updated successfully' });
    });
  });
});

// Export the router so it can be used in the server.js
module.exports = router;
