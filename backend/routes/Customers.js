const express = require('express');
const router = express.Router();
const connection = require('../config/db'); // Import database connection
const bcrypt = require('bcryptjs'); // For password hashing

// ✅ GET: Fetch all customers
router.get('/', (req, res) => {
    const query = 'SELECT customer_id, first_name, last_name, phone_num, address, national_id, dob, created_at, updated_at FROM customer';

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching customers:', err);
            res.status(500).send('Error fetching customers');
        } else {
            res.json(results);
        }
    });
});

// ✅ POST: Add a new customer with created_at and updated_at
router.post('/', async (req, res) => {
    const { first_name, last_name, phone_num, address, national_id, password, dob } = req.body;

    if (!first_name || !last_name || !phone_num || !national_id || !password || !dob) {
        return res.status(400).json({ error: 'First name, last name, phone number, national ID, password, and DOB are required fields' });
    }

    try {
        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = `INSERT INTO customer (first_name, last_name, phone_num, address, national_id, password, dob, created_at, updated_at) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;

        connection.query(query, [first_name, last_name, phone_num, address, national_id, hashedPassword, dob], (err, results) => {
            if (err) {
                console.error('Error adding customer:', err);
                res.status(500).send('Error adding customer');
            } else {
                res.status(201).json({ 
                    customer_id: results.insertId, 
                    first_name, 
                    last_name, 
                    phone_num, 
                    address, 
                    national_id, 
                    dob,
                    created_at: new Date(), // Return the timestamp
                    updated_at: new Date() // Return the timestamp
                });
            }
        });
    } catch (err) {
        console.error('Error hashing password:', err);
        res.status(500).send('Error hashing password');
    }
});

// ✅ PUT: Update a customer and set updated_at timestamp
router.put('/:customer_id', async (req, res) => {
    const { customer_id } = req.params;
    const { first_name, last_name, phone_num, address, national_id, password, dob } = req.body;

    if (!first_name || !last_name || !phone_num || !national_id || !dob) {
        return res.status(400).json({ error: 'First name, last name, phone number, national ID, and DOB are required fields' });
    }

    try {
        let query;
        let queryParams;

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            query = `UPDATE customer SET first_name=?, last_name=?, phone_num=?, address=?, national_id=?, password=?, dob=?, updated_at=NOW() WHERE customer_id=?`;
            queryParams = [first_name, last_name, phone_num, address, national_id, hashedPassword, dob, customer_id];
        } else {
            query = `UPDATE customer SET first_name=?, last_name=?, phone_num=?, address=?, national_id=?, dob=?, updated_at=NOW() WHERE customer_id=?`;
            queryParams = [first_name, last_name, phone_num, address, national_id, dob, customer_id];
        }

        connection.query(query, queryParams, (err, results) => {
            if (err) {
                console.error('Error updating customer:', err);
                res.status(500).send('Error updating customer');
            } else {
                if (results.affectedRows === 0) {
                    res.status(404).json({ error: 'Customer not found' });
                } else {
                    res.status(200).json({ message: 'Customer updated successfully', updated_at: new Date() });
                }
            }
        });
    } catch (err) {
        console.error('Error hashing password:', err);
        res.status(500).send('Error updating customer');
    }
});

// ✅ DELETE: Remove a customer
router.delete('/:customer_id', (req, res) => {
    const { customer_id } = req.params;

    const query = 'DELETE FROM customer WHERE customer_id = ?';

    connection.query(query, [customer_id], (err, results) => {
        if (err) {
            console.error('Error deleting customer:', err);
            res.status(500).send('Error deleting customer');
        } else {
            if (results.affectedRows === 0) {
                res.status(404).json({ error: 'Customer not found' });
            } else {
                res.status(200).json({ message: 'Customer deleted successfully' });
            }
        }
    });
});

// ✅ Export the router
module.exports = router;
