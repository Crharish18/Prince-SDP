const express = require('express');
const router = express.Router();
const connection = require('../config/db'); // Database connection

// Get all transactions
router.get('/', (req, res) => {
    const query = 'SELECT * FROM expired_inventory_log';

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching logs:', err);
            res.status(500).send('Error fetching logs');
        } else {
            res.json(results);
        }
    });
});


module.exports = router;