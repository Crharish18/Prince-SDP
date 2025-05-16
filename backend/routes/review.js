const express = require('express');
const router = express.Router();
const connection = require('../config/db'); // Database connection
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const cloudinary = require('../config/cloudinary'); // Make sure this path is correct

// Get all reviews with their images
router.get('/', (req, res) => {
    const productId = req.query.product_id;
    let query = `
        SELECT reviews.*, review_images.image_url
        FROM reviews
        LEFT JOIN review_images ON reviews.review_id = review_images.review_id
    `;

    // If product_id is provided, filter by it
    if (productId) {
        query += ` WHERE reviews.product_id = ${connection.escape(productId)}`;
    }

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching reviews:', err);
            res.status(500).send('Error fetching reviews');
        } else {
            // Group reviews by review_id and associate their images
            const groupedReviews = results.reduce((acc, row) => {
                const { review_id, order_id, product_id, rating, review_text, created_at, image_url } = row;

                if (!acc[review_id]) {
                    acc[review_id] = {
                        review_id,
                        order_id,
                        product_id,
                        rating,
                        review_text,
                        created_at,
                        images: []
                    };
                }

                if (image_url) {
                    acc[review_id].images.push(image_url);
                }

                return acc;
            }, {});

            // Convert grouped reviews object back to an array
            const reviewsWithImages = Object.values(groupedReviews);
            res.json(reviewsWithImages);
        }
    });
});

// Get reviews for a specific product with customer information
router.get('/product/:productId', (req, res) => {
    const { productId } = req.params;
    
    const query = `
        SELECT r.*, c.first_name, c.last_name, c.profile_pic, ri.image_url
        FROM reviews r
        JOIN \`order\` o ON r.order_id = o.order_id
        JOIN customer c ON o.customer_id = c.customer_id
        LEFT JOIN review_images ri ON r.review_id = ri.review_id
        WHERE r.product_id = ?
    `;

    connection.query(query, [productId], (err, results) => {
        if (err) {
            console.error('Error fetching reviews with customer info:', err);
            return res.status(500).json({ error: err.message });
        }
        
        // Group reviews by review_id and associate their images
        const groupedReviews = results.reduce((acc, row) => {
            const { 
                review_id, order_id, product_id, rating, review_text, created_at,
                first_name, last_name, profile_pic, image_url 
            } = row;

            if (!acc[review_id]) {
                acc[review_id] = {
                    review_id,
                    order_id,
                    product_id,
                    rating,
                    review_text,
                    created_at,
                    first_name,
                    last_name,
                    profile_pic,
                    images: []
                };
            }

            if (image_url) {
                acc[review_id].images.push(image_url);
            }

            return acc;
        }, {});

        // Convert grouped reviews object back to an array
        const reviewsWithCustomerInfo = Object.values(groupedReviews);
        res.json(reviewsWithCustomerInfo);
    });
});

// Check if a review exists for a product in an order
router.get('/check/:order_id/:product_id', (req, res) => {
    const { order_id, product_id } = req.params;
    
    const query = `
        SELECT r.*, ri.image_url 
        FROM reviews r
        LEFT JOIN review_images ri ON r.review_id = ri.review_id
        WHERE r.order_id = ? AND r.product_id = ?
    `;
    
    connection.query(query, [order_id, product_id], (err, results) => {
        if (err) {
            console.error('Error checking review:', err);
            return res.status(500).json({ error: err.message });
        }
        
        if (results.length === 0) {
            return res.json({ exists: false });
        }
        
        // Group images with the review
        const review = {
            review_id: results[0].review_id,
            order_id: results[0].order_id,
            product_id: results[0].product_id,
            rating: results[0].rating,
            review_text: results[0].review_text,
            images: []
        };
        
        // Add images if they exist
        results.forEach(row => {
            if (row.image_url) {
                review.images.push(row.image_url);
            }
        });
        
        res.json({ exists: true, review });
    });
});

// Add a new review
router.post('/', (req, res) => {
    const { order_id, product_id, rating, review_text } = req.body;

    if (!order_id || !product_id || !rating || !review_text) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const query = `INSERT INTO reviews (order_id, product_id, rating, review_text) 
                   VALUES (?, ?, ?, ?)`;

    connection.query(query, [order_id, product_id, rating, review_text], (err, results) => {
        if (err) {
            console.error('Error adding review:', err);
            res.status(500).send('Error adding review');
        } else {
            res.status(201).json({ review_id: results.insertId, order_id, product_id, rating, review_text });
        }
    });
});

// Delete a review
router.delete('/:review_id', (req, res) => {
    const { review_id } = req.params;

    // First delete associated images
    const deleteImagesQuery = 'DELETE FROM review_images WHERE review_id = ?';
    connection.query(deleteImagesQuery, [review_id], (imgErr) => {
        if (imgErr) {
            console.error('Error deleting review images:', imgErr);
            return res.status(500).send('Error deleting review images');
        }
        
        // Then delete the review
        const deleteReviewQuery = 'DELETE FROM reviews WHERE review_id = ?';
        connection.query(deleteReviewQuery, [review_id], (err, results) => {
            if (err) {
                console.error('Error deleting review:', err);
                return res.status(500).send('Error deleting review');
            }
            
            res.status(200).json({ message: 'Review deleted successfully' });
        });
    });
});

// Update a review
router.put('/:review_id', (req, res) => {
    const { review_id } = req.params;
    const { order_id, product_id, rating, review_text } = req.body;

    if (!order_id || !product_id || !rating || !review_text) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const query = `UPDATE reviews 
                   SET order_id=?, product_id=?, rating=?, review_text=? 
                   WHERE review_id=?`;

    connection.query(query, [order_id, product_id, rating, review_text, review_id], (err, results) => {
        if (err) {
            console.error('Error updating review:', err);
            res.status(500).send('Error updating review');
        } else {
            res.status(200).json({ message: 'Review updated successfully' });
        }
    });
});

// Add review images
router.post('/images', (req, res) => {
    const { review_id, image_url } = req.body;

    if (!review_id || !image_url) {
        return res.status(400).json({ error: 'Review ID and Image URL are required' });
    }

    const query = `INSERT INTO review_images (review_id, image_url) 
                   VALUES (?, ?)`;

    connection.query(query, [review_id, image_url], (err, results) => {
        if (err) {
            console.error('Error adding review image:', err);
            res.status(500).send('Error adding review image');
        } else {
            res.status(201).json({ image_id: results.insertId, review_id, image_url });
        }
    });
});

// Upload image to Cloudinary
router.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
    }

    cloudinary.uploader.upload_stream(
        { resource_type: 'auto' },
        (error, result) => {
            if (error) {
                console.error('Cloudinary upload error:', error);
                return res.status(500).json({ error: 'Error uploading image to Cloudinary' });
            }
            
            res.json({ image_url: result.secure_url });
        }
    ).end(req.file.buffer);
});

// Delete review image
router.delete('/images/:image_id', (req, res) => {
    const { image_id } = req.params;

    const query = 'DELETE FROM review_images WHERE image_id = ?';

    connection.query(query, [image_id], (err, results) => {
        if (err) {
            console.error('Error deleting review image:', err);
            res.status(500).send('Error deleting review image');
        } else {
            res.status(200).json({ message: 'Review image deleted successfully' });
        }
    });
});

module.exports = router;
