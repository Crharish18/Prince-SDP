const express = require('express');
const router = express.Router();
const connection = require('../config/db'); // Database connection

router.get('/', (req, res) => {
    const query = 'SELECT * FROM suppliers';
  
    connection.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching suppliers:', err);
        res.status(500).send('Error fetching suppliers');
      } else {
        res.json(results);
      }
    });
  });

  router.post('/', (req, res) => {
    const { name, phone, email, address } = req.body;
  
    if (!name || !phone || !email) {
      return res.status(400).json({ error: 'Name, phone, and email are required fields' });
    }
  
    const query = `INSERT INTO suppliers (name, phone, email, address) VALUES (?, ?, ?, ?)`;
  
    connection.query(query, [name, phone, email, address], (err, results) => {
      if (err) {
        console.error('Error adding supplier:', err);
        res.status(500).send('Error adding supplier');
      } else {
        res.status(201).json({ supplier_id: results.insertId, name, phone, email, address });
      }
    });
  });
  
  router.delete('/:supplier_id', (req, res) => {
    const { supplier_id } = req.params;
  
    const query = 'DELETE FROM suppliers WHERE supplier_id = ?';
  
    connection.query(query, [supplier_id], (err, results) => {
      if (err) {
        console.error('Error deleting supplier:', err);
        res.status(500).send('Error deleting supplier');
      } else {
        res.status(200).json({ message: 'Supplier deleted successfully' });
      }
    });
  });
  
  router.put('/:supplier_id', (req, res) => {
    const { supplier_id } = req.params;
    const { name, phone, email, address } = req.body;
  
    if (!name || !phone || !email) {
      return res.status(400).json({ error: 'Name, phone, and email are required fields' });
    }
  
    const query = `UPDATE suppliers SET name=?, phone=?, email=?, address=? WHERE supplier_id=?`;
  
    connection.query(query, [name, phone, email, address, supplier_id], (err, results) => {
      if (err) {
        console.error('Error updating supplier:', err);
        res.status(500).send('Error updating supplier');
      } else {
        res.status(200).json({ message: 'Supplier updated successfully' });
      }
    });
  });
  

  // Export the router so it can be used in the server.js
module.exports = router;