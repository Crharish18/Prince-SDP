const express = require('express');
const router = express.Router();
const connection = require('../config/db'); // Import database connection

// ✅ GET: Fetch all inventory records
router.get('/', (req, res) => {
    const query = `SELECT * FROM inventory`;

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching inventory:', err);
            res.status(500).send('Error fetching inventory');
        } else {
            res.json(results);
        }
    });
});

// ✅ POST: Add a new inventory record
router.post('/', (req, res) => {
    const { qty_added, user_id, supplier_id, product_id } = req.body;

    if (!qty_added || !user_id || !supplier_id || !product_id) {
        return res.status(400).json({ error: 'qty_added, user_id, supplier_id, and product_id are required fields' });
    }

    const query = `INSERT INTO inventory (qty_added, user_id, supplier_id, product_id, added_on) 
                   VALUES (?, ?, ?, ?, NOW())`;

    connection.query(query, [qty_added, user_id, supplier_id, product_id], (err, results) => {
        if (err) {
            console.error('Error adding inventory:', err);
            res.status(500).send('Error adding inventory');
        } else {
            res.status(201).json({ 
                inventory_id: results.insertId, 
                qty_added, 
                user_id, 
                supplier_id, 
                product_id,
                added_on: new Date() // Return the timestamp
            });
        }
    });
});

// ✅ PUT: Update an inventory record
router.put('/:inventory_id', (req, res) => {
    const { inventory_id } = req.params;
    const { qty_added, user_id, supplier_id, product_id } = req.body;

    if (!qty_added || !user_id || !supplier_id || !product_id) {
        return res.status(400).json({ error: 'qty_added, user_id, supplier_id, and product_id are required fields' });
    }

    const query = `UPDATE inventory SET qty_added=?, user_id=?, supplier_id=?, product_id=?, added_on=NOW() WHERE inventory_id=?`;

    connection.query(query, [qty_added, user_id, supplier_id, product_id, inventory_id], (err, results) => {
        if (err) {
            console.error('Error updating inventory record:', err);
            res.status(500).send('Error updating inventory record');
        } else {
            if (results.affectedRows === 0) {
                res.status(404).json({ error: 'Inventory record not found' });
            } else {
                res.status(200).json({ message: 'Inventory record updated successfully', updated_at: new Date() });
            }
        }
    });
});

// ✅ DELETE: Remove an inventory record
router.delete('/:inventory_id', (req, res) => {
    const { inventory_id } = req.params;

    const query = 'DELETE FROM inventory WHERE inventory_id = ?';

    connection.query(query, [inventory_id], (err, results) => {
        if (err) {
            console.error('Error deleting inventory record:', err);
            res.status(500).send('Error deleting inventory record');
        } else {
            if (results.affectedRows === 0) {
                res.status(404).json({ error: 'Inventory record not found' });
            } else {
                res.status(200).json({ message: 'Inventory record deleted successfully' });
            }
        }
    });
});

// ✅ Export the router
module.exports = router;
