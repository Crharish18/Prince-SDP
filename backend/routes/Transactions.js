const express = require('express');
const router = express.Router();
const connection = require('../config/db'); // Database connection

// Get all transactions
router.get('/', (req, res) => {
    const query = 'SELECT * FROM transactions';

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching transactions:', err);
            res.status(500).send('Error fetching transactions');
        } else {
            res.json(results);
        }
    });
});

// Add a new transaction
router.post('/', (req, res) => {
    const { order_id, amount_paid, status } = req.body;

    if (!order_id || !amount_paid || !status) {
        return res.status(400).json({ error: 'order_id, amount_paid, and status are required' });
    }

    const query = `INSERT INTO transactions (order_id, amount_paid, status) 
                   VALUES (?, ?, ?)`;

    connection.query(query, [order_id, amount_paid, status], (err, results) => {
        if (err) {
            console.error('Error adding transaction:', err);
            res.status(500).send('Error adding transaction');
        } else {
            res.status(201).json({ transaction_id: results.insertId, order_id, amount_paid, status });
        }
    });
});

// Delete a transaction
router.delete('/:transaction_id', (req, res) => {
    const { transaction_id } = req.params;

    const query = 'DELETE FROM transactions WHERE transaction_id = ?';

    connection.query(query, [transaction_id], (err, results) => {
        if (err) {
            console.error('Error deleting transaction:', err);
            res.status(500).send('Error deleting transaction');
        } else {
            res.status(200).json({ message: 'Transaction deleted successfully' });
        }
    });
});

// Update a transaction
router.put('/:transaction_id', (req, res) => {
    const { transaction_id } = req.params;
    const { order_id, amount_paid, status } = req.body;

    if (!order_id || !amount_paid || !status) {
        return res.status(400).json({ error: 'order_id, amount_paid, and status are required' });
    }

    const query = `UPDATE transactions 
                   SET order_id=?, amount_paid=?, status=? 
                   WHERE transaction_id=?`;

    connection.query(query, [order_id, amount_paid, status, transaction_id], (err, results) => {
        if (err) {
            console.error('Error updating transaction:', err);
            res.status(500).send('Error updating transaction');
        } else {
            res.status(200).json({ message: 'Transaction updated successfully' });
        }
    });
});

module.exports = router;
