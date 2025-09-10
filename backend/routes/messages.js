const express = require('express');
const router = express.Router();
const connection = require('../config/db'); // Database connection

// Get all messages
router.get('/', (req, res) => {
    const query = 'SELECT * FROM messages';

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching messages:', err);
            res.status(500).send('Error fetching messages');
        } else {
            res.json(results);
        }
    });
});

// Add a new message
router.post('/', (req, res) => {
    const { name, email, phone_num, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: 'Name, Email, Subject, and Message are required' });
    }

    const query = `INSERT INTO messages (name, email, phone_num, subject, message) 
                   VALUES (?, ?, ?, ?, ?)`;

    connection.query(query, [name, email, phone_num, subject, message], (err, results) => {
        if (err) {
            console.error('Error adding message:', err);
            res.status(500).send('Error adding message');
        } else {
            res.status(201).json({ message_id: results.insertId, name, email, phone_num, subject, message });
        }
    });
});

// Delete a message
router.delete('/:message_id', (req, res) => {
    const { message_id } = req.params;

    const query = 'DELETE FROM messages WHERE msg_id = ?';

    connection.query(query, [message_id], (err, results) => {
        if (err) {
            console.error('Error deleting message:', err);
            res.status(500).send('Error deleting message');
        } else {
            res.status(200).json({ message: 'Message deleted successfully' });
        }
    });
});

// Update a message
router.put('/:message_id', (req, res) => {
    const { message_id } = req.params;
    const { name, email, phone_num, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: 'Name, Email, Subject, and Message are required' });
    }

    const query = `UPDATE messages 
                   SET name=?, email=?, phone_num=?, subject=?, message=? 
                   WHERE msg_id=?`;

    connection.query(query, [name, email, phone_num, subject, message, message_id], (err, results) => {
        if (err) {
            console.error('Error updating message:', err);
            res.status(500).send('Error updating message');
        } else {
            res.status(200).json({ message: 'Message updated successfully' });
        }
    });
});

// Export the router so it can be used in the server.js
module.exports = router;
