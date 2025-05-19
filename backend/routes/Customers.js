const express = require('express');
const router = express.Router();
const connection = require('../config/db'); // Import database connection
const bcrypt = require('bcryptjs'); // For password hashing
const nodemailer = require('nodemailer'); // For sending emails
const crypto = require('crypto'); // For generating random verification codes

// Store verification codes temporarily (in production, use a database or Redis)
const verificationCodes = {};

// Configure nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail', // Replace with your email service
    auth: {
        user: process.env.EMAIL_USER, // Use environment variables
        pass: process.env.EMAIL_PASSWORD
    }
});

// Helper function to format ISO date string to MySQL date format
const formatDateForMySQL = (dateString) => {
    if (!dateString) return null;
    try {
        // Parse the ISO string to a Date object
        const date = new Date(dateString);
        // Format to MySQL date format (YYYY-MM-DD)
        return date.toISOString().split('T')[0];
    } catch (error) {
        console.error('Error formatting date:', error);
        return null;
    }
};

// ✅ GET: Fetch all customers
router.get('/', (req, res) => {
    const query = 'SELECT customer_id, first_name, last_name, phone_num, address, national_id, dob, created_at, updated_at, status FROM customer';

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching customers:', err);
            res.status(500).send('Error fetching customers');
        } else {
            res.json(results);
        }
    });
});

router.post('/', async (req, res) => {
    const { first_name, last_name, phone_num, address, national_id, password, dob, email, status } = req.body;

    if (!first_name || !last_name || !phone_num || !national_id || !password || !dob || !email) {
        return res.status(400).json({ error: 'All fields (first name, last name, phone number, national ID, password, dob, and email) are required' });
    }

    try {
        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Format the date for MySQL
        const formattedDob = formatDateForMySQL(dob);
        if (!formattedDob) {
            return res.status(400).json({ error: 'Invalid date format for date of birth' });
        }

        const query = `INSERT INTO customer (first_name, last_name, phone_num, address, national_id, password, dob, email, status, created_at, updated_at) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
        
        connection.query(query, [first_name, last_name, phone_num, address, national_id, hashedPassword, formattedDob, email, status || 'active'], (err, results) => {
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
                    dob: formattedDob,
                    email,
                    status: status || 'active',
                    created_at: new Date(),
                    updated_at: new Date()
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
    const { first_name, last_name, phone_num, address, national_id, password, dob, status } = req.body;

    if (!first_name || !last_name || !phone_num || !national_id || !dob) {
        return res.status(400).json({ error: 'First name, last name, phone number, national ID, and DOB are required fields' });
    }

    try {
        // Format the date for MySQL
        const formattedDob = formatDateForMySQL(dob);
        if (!formattedDob) {
            return res.status(400).json({ error: 'Invalid date format for date of birth' });
        }

        let query;
        let queryParams;

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            query = `UPDATE customer SET first_name=?, last_name=?, phone_num=?, address=?, national_id=?, password=?, dob=?, status=?, updated_at=NOW() WHERE customer_id=?`;
            queryParams = [first_name, last_name, phone_num, address, national_id, hashedPassword, formattedDob, status || 'active', customer_id];
        } else {
            query = `UPDATE customer SET first_name=?, last_name=?, phone_num=?, address=?, national_id=?, dob=?, status=?, updated_at=NOW() WHERE customer_id=?`;
            queryParams = [first_name, last_name, phone_num, address, national_id, formattedDob, status || 'active', customer_id];
        }

        connection.query(query, queryParams, (err, results) => {
            if (err) {
                console.error('Error updating customer:', err);
                res.status(500).send('Error updating customer');
            } else {
                if (results.affectedRows === 0) {
                    res.status(404).json({ error: 'Customer not found' });
                } else {
                    res.status(200).json({ 
                        message: 'Customer updated successfully', 
                        updated_at: new Date(),
                        status: status || 'active'
                    });
                }
            }
        });
    } catch (err) {
        console.error('Error in customer update:', err);
        res.status(500).send('Error updating customer');
    }
});

// ✅ DELETE: Update customer status to 'disable' instead of deleting
router.delete('/:customer_id', (req, res) => {
    const { customer_id } = req.params;

    // Instead of deleting, update status to 'disable'
    const query = 'UPDATE customer SET status = ?, updated_at = NOW() WHERE customer_id = ?';

    connection.query(query, ['disable', customer_id], (err, results) => {
        if (err) {
            console.error('Error disabling customer:', err);
            res.status(500).send('Error disabling customer');
        } else {
            if (results.affectedRows === 0) {
                res.status(404).json({ error: 'Customer not found' });
            } else {
                res.status(200).json({ message: 'Customer disabled successfully' });
            }
        }
    });
});

// ✅ NEW: Check if email exists
router.post('/check-email', (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }
    
    const query = 'SELECT customer_id, email FROM customer WHERE email = ?';
    
    connection.query(query, [email], (err, results) => {
        if (err) {
            console.error('Error checking email:', err);
            return res.status(500).json({ error: 'Error checking email' });
        }
        
        const emailExists = results.length > 0;
        
        res.json({ 
            exists: emailExists,
            customer_id: emailExists ? results[0].customer_id : null
        });
    });
});

// ✅ NEW: Send verification code
router.post('/send-verification-code', (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }
    
    // Check if email exists in the database
    const query = 'SELECT customer_id, first_name FROM customer WHERE email = ?';
    
    connection.query(query, [email], (err, results) => {
        if (err) {
            console.error('Error checking email:', err);
            return res.status(500).json({ error: 'Error checking email' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Email not found' });
        }
        
        const customer = results[0];
        
        // Generate a 4-digit verification code
        const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
        
        // Store the code with the customer ID (with 10-minute expiration)
        verificationCodes[email] = {
            code: verificationCode,
            customer_id: customer.customer_id,
            expires: Date.now() + 10 * 60 * 1000 // 10 minutes
        };
        
        // Send the verification code via email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Verification Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <h2 style="color: #2e7d32;">Password Reset Request</h2>
                    <p>Hello ${customer.first_name || 'there'},</p>
                    <p>We received a request to reset your password. Please use the following verification code to continue:</p>
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                        <h1 style="margin: 0; color: #2e7d32; letter-spacing: 5px;">${verificationCode}</h1>
                    </div>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you didn't request a password reset, please ignore this email.</p>
                    <p>Thank you,<br>Prince Lanka Agencies</p>
                </div>
            `
        };
        
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).json({ error: 'Error sending verification code' });
            }
            
            res.json({ message: 'Verification code sent successfully' });
        });
    });
});

// ✅ NEW: Verify code
router.post('/verify-code', (req, res) => {
    const { email, code } = req.body;
    
    if (!email || !code) {
        return res.status(400).json({ error: 'Email and verification code are required' });
    }
    
    const storedData = verificationCodes[email];
    
    if (!storedData) {
        return res.status(400).json({ error: 'No verification code found for this email' });
    }
    
    if (Date.now() > storedData.expires) {
        delete verificationCodes[email];
        return res.status(400).json({ error: 'Verification code has expired' });
    }
    
    if (storedData.code !== code) {
        return res.status(400).json({ error: 'Invalid verification code' });
    }
    
    // Code is valid, generate a temporary token for password reset
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Store the token with the customer ID (with 30-minute expiration)
    verificationCodes[email].resetToken = resetToken;
    verificationCodes[email].expires = Date.now() + 30 * 60 * 1000; // 30 minutes
    
    res.json({ 
        message: 'Verification successful',
        resetToken,
        customer_id: storedData.customer_id
    });
});

// ✅ NEW: Reset password
router.post('/reset-password', async (req, res) => {
    const { email, resetToken, newPassword } = req.body;
    
    if (!email || !resetToken || !newPassword) {
        return res.status(400).json({ error: 'Email, reset token, and new password are required' });
    }
    
    const storedData = verificationCodes[email];
    
    if (!storedData || storedData.resetToken !== resetToken) {
        return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    
    if (Date.now() > storedData.expires) {
        delete verificationCodes[email];
        return res.status(400).json({ error: 'Reset token has expired' });
    }
    
    try {
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update the password in the database
        const query = 'UPDATE customer SET password = ?, updated_at = NOW() WHERE customer_id = ?';
        
        connection.query(query, [hashedPassword, storedData.customer_id], (err, results) => {
            if (err) {
                console.error('Error resetting password:', err);
                return res.status(500).json({ error: 'Error resetting password' });
            }
            
            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Customer not found' });
            }
            
            // Clean up the verification code
            delete verificationCodes[email];
            
            res.json({ message: 'Password reset successful' });
        });
    } catch (err) {
        console.error('Error hashing password:', err);
        res.status(500).json({ error: 'Error resetting password' });
    }
});

// ✅ Export the router
module.exports = router;
