const express = require('express');
const router = express.Router();
const connection = require('../config/db'); // Database connection

// Get all activity logs
router.get('/', (req, res) => {
    const query = 'SELECT * FROM prince.activity_log';

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching activity logs:', err);
            res.status(500).send('Error fetching activity logs');
        } else {
            res.json(results);
        }
    });
});

// Add a new activity log
router.post('/', (req, res) => {
    const { user_id, action } = req.body;

    if (!user_id || !action) {
        return res.status(400).json({ error: 'User ID and action are required' });
    }

    const query = `INSERT INTO prince.activity_log (user_id, action) 
                   VALUES (?, ?)`;

    connection.query(query, [user_id, action], (err, results) => {
        if (err) {
            console.error('Error adding activity log:', err);
            res.status(500).send('Error adding activity log');
        } else {
            res.status(201).json({
                log_id: results.insertId,
                user_id,
                action
            });
        }
    });
});

// Delete an activity log
router.delete('/:log_id', (req, res) => {
    const { log_id } = req.params;

    const query = 'DELETE FROM prince.activity_log WHERE log_id = ?';

    connection.query(query, [log_id], (err, results) => {
        if (err) {
            console.error('Error deleting activity log:', err);
            res.status(500).send('Error deleting activity log');
        } else {
            res.status(200).json({ message: 'Activity log deleted successfully' });
        }
    });
});

// Update an activity log
router.put('/:log_id', (req, res) => {
    const { log_id } = req.params;
    const { user_id, action } = req.body;

    if (!user_id || !action) {
        return res.status(400).json({ error: 'User ID and action are required' });
    }

    const query = `UPDATE prince.activity_log 
                   SET user_id=?, action=? 
                   WHERE log_id=?`;

    connection.query(query, [user_id, action, log_id], (err, results) => {
        if (err) {
            console.error('Error updating activity log:', err);
            res.status(500).send('Error updating activity log');
        } else {
            res.status(200).json({ message: 'Activity log updated successfully' });
        }
    });
});

// Export the router so it can be used in the server.js
module.exports = router;
