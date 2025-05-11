const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');  // Ensure the database connection is correctly imported

// Customer login route
const customerLogin = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  db.query('SELECT * FROM customer WHERE email = ?', [email], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const customer = result[0];

    bcrypt.compare(password, customer.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ error: 'Error comparing password' });
      }
      if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect password' });
      }

      const token = jwt.sign(
        { id: customer.customer_id, email: customer.email, role: 'customer' },
        process.env.JWT_SECRET,
        { expiresIn: '12h' }
      );
      
      // Send token and customer data in the response
      res.json({
        token, 
        role: 'customer', 
        username: customer.first_name,
        userId: customer.customer_id,  // Added userId
        email: customer.email          // Added email if needed
      });
      
    });
  });
};

// Get customer profile data
const getCustomerProfile = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const customerId = decoded.id;
    
    db.query('SELECT customer_id, first_name, last_name, email, phone_num, national_id, dob, address FROM customer WHERE customer_id = ?', 
      [customerId], 
      (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        if (result.length === 0) {
          return res.status(404).json({ message: 'Customer not found' });
        }
        
        res.json(result[0]);
      }
    );
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Update customer profile
const updateCustomerProfile = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const customerId = decoded.id;
    
    const { firstName, lastName, email, phone, nationalId, dob } = req.body;
    
    // Check if email is already in use by another customer
    if (email) {
      db.query('SELECT customer_id FROM customer WHERE email = ? AND customer_id != ?', 
        [email, customerId], 
        (err, result) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          
          if (result.length > 0) {
            return res.status(400).json({ message: 'Email is already in use by another account' });
          }
          
          // If email is not in use, proceed with update
          updateCustomer();
        }
      );
    } else {
      // If no email provided, proceed with update
      updateCustomer();
    }
    
    function updateCustomer() {
      const updateQuery = `
        UPDATE customer 
        SET 
          first_name = ?,
          last_name = ?,
          email = ?,
          phone_num = ?,
          national_id = ?,
          dob = ?
        WHERE customer_id = ?
      `;
      
      db.query(updateQuery, 
        [firstName, lastName, email, phone, nationalId, dob, customerId], 
        (err, result) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          
          if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Customer not found or no changes made' });
          }
          
          res.json({ message: 'Profile updated successfully' });
        }
      );
    }
    
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Get customer orders with product details
const getCustomerOrders = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const customerId = decoded.id;
    
    // Join orders with order_items and products to get complete details
    const query = `
      SELECT o.order_id, o.total_price, o.price as order_original_price, o.total_discount, o.status, o.created_at,
             oi.order_item_id, oi.product_id, oi.qty, oi.price as item_price, oi.discount as item_discount, oi.final_price as item_final_price,
             p.name as product_name, p.image_url
      FROM \`order\` o
      LEFT JOIN order_item oi ON o.order_id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.product_id
      WHERE o.customer_id = ?
      ORDER BY o.created_at DESC
    `;
    
    db.query(query, [customerId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: err.message });
      }
      
      // Group order items by order
      const orders = [];
      const orderMap = new Map();
      
      results.forEach(row => {
        if (!orderMap.has(row.order_id)) {
          const order = {
            order_id: row.order_id,
            total_price: row.total_price,
            original_price: row.order_original_price,
            total_discount: row.total_discount,
            status: row.status,
            created_at: row.created_at,
            items: []
          };
          
          orderMap.set(row.order_id, orders.length);
          orders.push(order);
        }
        
        if (row.order_item_id) {
          const orderIndex = orderMap.get(row.order_id);
          orders[orderIndex].items.push({
            order_item_id: row.order_item_id,
            product_id: row.product_id,
            product_name: row.product_name,
            image_url: row.image_url,
            qty: row.qty,
            price: row.item_price / row.qty, // Unit price
            total_price: row.item_price, // Total price before discount
            discount: row.item_discount,
            final_price: row.item_final_price
          });
        }
      });
      
      res.json(orders);
    });
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Toggle product in wishlist (add if not exists, remove if exists)
const toggleWishlist = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const customerId = decoded.id;
    const { product_id } = req.body;
    
    if (!product_id) {
      return res.status(400).json({ message: 'Product ID is required' });
    }
    
    // Check if the product is already in the wishlist
    db.query('SELECT * FROM wishlist WHERE customer_id = ? AND product_id = ?', 
      [customerId, product_id], 
      (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        // If product is already in wishlist, remove it
        if (result.length > 0) {
          db.query('DELETE FROM wishlist WHERE customer_id = ? AND product_id = ?', 
            [customerId, product_id], 
            (err, deleteResult) => {
              if (err) {
                return res.status(500).json({ error: err.message });
              }
              
              return res.json({ 
                message: 'Product removed from wishlist',
                inWishlist: false
              });
            }
          );
        } else {
          // If product is not in wishlist, add it
          db.query('INSERT INTO wishlist (customer_id, product_id) VALUES (?, ?)', 
            [customerId, product_id], 
            (err, insertResult) => {
              if (err) {
                return res.status(500).json({ error: err.message });
              }
              
              return res.json({ 
                message: 'Product added to wishlist',
                inWishlist: true
              });
            }
          );
        }
      }
    );
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Check if a product is in the customer's wishlist
const checkWishlist = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const productId = req.params.productId;
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const customerId = decoded.id;
    
    db.query('SELECT * FROM wishlist WHERE customer_id = ? AND product_id = ?', 
      [customerId, productId], 
      (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        return res.json({ inWishlist: result.length > 0 });
      }
    );
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Get customer wishlist with product details
const getCustomerWishlist = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const customerId = decoded.id;
    
    const query = `
      SELECT w.wishlist_id, w.product_id, w.customer_id, 
             p.name, p.description, p.price, p.image_url, p.discount_percentage
      FROM wishlist w
      JOIN products p ON w.product_id = p.product_id
      WHERE w.customer_id = ?
    `;
    
    db.query(query, [customerId], (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.json(results);
    });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};


// Get customer addresses
const getCustomerAddresses = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const customerId = decoded.id;
    
    db.query('SELECT * FROM address WHERE customer_id = ?', [customerId], (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.json(results);
    });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Add a new address
const addCustomerAddress = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const customerId = decoded.id;
    
    const { fullname, street, apartment, city, province, postal_code, country, type } = req.body;
    
    if (!street || !city || !province || !postal_code || !country || !type) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }
    
    const query = `
      INSERT INTO address 
      (customer_id, fullname, street, apartment, city, province, postal_code, country, type) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(
      query, 
      [customerId, fullname, street, apartment, city, province, postal_code, country, type],
      (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        // Return the newly created address
        db.query('SELECT * FROM address WHERE address_id = ?', [result.insertId], (err, addressResult) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          
          res.status(201).json(addressResult[0]);
        });
      }
    );
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Update an existing address
const updateCustomerAddress = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const addressId = req.params.addressId;
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const customerId = decoded.id;
    
    const { fullname, street, apartment, city, province, postal_code, country, type } = req.body;
    
    if (!street || !city || !province || !postal_code || !country || !type) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }
    
    // First verify that this address belongs to the customer
    db.query(
      'SELECT * FROM address WHERE address_id = ? AND customer_id = ?',
      [addressId, customerId],
      (err, results) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        if (results.length === 0) {
          return res.status(404).json({ message: 'Address not found or does not belong to this customer' });
        }
        
        // Update the address
        const query = `
          UPDATE address 
          SET fullname = ?, street = ?, apartment = ?, city = ?, province = ?, 
              postal_code = ?, country = ?, type = ?
          WHERE address_id = ? AND customer_id = ?
        `;
        
        db.query(
          query,
          [fullname, street, apartment, city, province, postal_code, country, type, addressId, customerId],
          (err, updateResult) => {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            
            // Return the updated address
            db.query('SELECT * FROM address WHERE address_id = ?', [addressId], (err, addressResult) => {
              if (err) {
                return res.status(500).json({ error: err.message });
              }
              
              res.json(addressResult[0]);
            });
          }
        );
      }
    );
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};




module.exports = { 
  customerLogin, 
  getCustomerProfile, 
  updateCustomerProfile, 
  getCustomerOrders,
  toggleWishlist,
  checkWishlist,
  getCustomerWishlist,
  getCustomerAddresses,
  addCustomerAddress,
  updateCustomerAddress
};
