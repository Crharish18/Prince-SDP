const express = require('express');
require('dotenv').config();
const cors = require('cors');
const authRoutes = require('./routes/auth');
const employeesRoutes = require('./routes/employees'); // Import the employees route
const adminRoutes = require('./routes/admin'); // Import the admin route
const categoriesRoutes = require('./routes/categories');
const suppliersRoutes = require('./routes/suppliers');
const productsRoutes = require('./routes/products');
const customersRoutes = require('./routes/Customers'); // Import the customers route
const inventoryRoutes = require('./routes/inventory');
const ordersRoutes = require('./routes/orders'); // Import the orders route
const order_itemsRoutes = require('./routes/order_items'); // Import the order_items route
const TransactionsRoutes = require('./routes/Transactions'); // Import the transactions route
const activity_logRoutes = require('./routes/activitylog'); // Import the activity log route
const cartRoutes = require('./routes/Cart'); // Import the cart route
const reviewsRoutes = require('./routes/review'); // Import the reviews route
const shipping_detailsRoutes = require('./routes/shipping_details'); // Import the shipping details route
const ReportRoutes = require('./routes/report'); // Import the report route
const MessagesRoutes = require('./routes/messages'); // Import the messages route
const order_addressRoutes = require('./routes/order_address'); // Import the order address route
const app = express();
const port = process.env.PORT || 5000;
const uploadRoutes = require('./routes/upload'); // Import the upload route

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'], // ✅ Added 5175
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// ✅ Log requests for debugging
app.use((req, res, next) => {
  console.log(`📢 [${req.method}] ${req.originalUrl}`);
  console.log("Request Body:", req.body);
  next();
});

// ✅ API Routes

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeesRoutes); 
app.use('/api/categories', categoriesRoutes); // Add the categories route
app.use('/api/admin', adminRoutes); // Add the admin route
app.use('/api/suppliers', suppliersRoutes); 
app.use('/api/products', productsRoutes);
app.use('/api/customers', customersRoutes); // Add the customers route
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', ordersRoutes); // Add the orders route
app.use('/api/order_items', order_itemsRoutes); // Add the order_items route
app.use('/api/transactions', TransactionsRoutes); // Add the transactions route
app.use('/api/cart', cartRoutes); // Add the cart route
app.use('/api/activitylog', activity_logRoutes); // Add the activity log route
app.use('/api/shipping_details', shipping_detailsRoutes); // Add the shipping details route
app.use('/api/reviews', reviewsRoutes); // Add the reviews route
app.use('/api/reports', ReportRoutes); // Add the report route
app.use('/api/messages', MessagesRoutes); // Add the messages route
app.use('/api/order_address', order_addressRoutes); // Add the order address route
// Add the upload route for image uploads
console.log('Adding upload route...');
app.use('/api/upload', uploadRoutes);  // Register the upload route
console.log("Upload routes registered correctly");



// ✅ 404 Handler
app.all('*', (req, res) => {
  console.log(`❌ Route ${req.originalUrl} not found`);
  res.status(404).send('404 Not Found');
});

// ✅ Start Server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});




