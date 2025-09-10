const express = require('express');
require('dotenv').config();
const cors = require('cors');
const authRoutes = require('./routes/auth');
const employeesRoutes = require('./routes/employees'); 
const adminRoutes = require('./routes/admin'); 
const categoriesRoutes = require('./routes/categories');
const suppliersRoutes = require('./routes/suppliers');
const productsRoutes = require('./routes/products');
const customersRoutes = require('./routes/Customers');
const inventoryRoutes = require('./routes/inventory');
const ordersRoutes = require('./routes/orders'); 
const order_itemsRoutes = require('./routes/order_items'); 
const TransactionsRoutes = require('./routes/Transactions');
const activity_logRoutes = require('./routes/activitylog'); 
const cartRoutes = require('./routes/Cart');
const reviewsRoutes = require('./routes/review');
const shipping_detailsRoutes = require('./routes/shipping_details'); 
const ReportRoutes = require('./routes/report'); 
const MessagesRoutes = require('./routes/messages');
const order_addressRoutes = require('./routes/order_address'); 
const IMS_Reset_PasswordRoutes = require('./routes/IMS_Reset_Password'); 
const Expired_InventoriesRoutes = require('./routes/Expired_Inventories'); 
const app = express();
const port = process.env.PORT || 5000;
const uploadRoutes = require('./routes/upload');

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'], 
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Log requests for debugging
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  console.log("Request Body:", req.body);
  next();
});

// API Routes

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeesRoutes); 
app.use('/api/categories', categoriesRoutes); 
app.use('/api/admin', adminRoutes); 
app.use('/api/suppliers', suppliersRoutes); 
app.use('/api/products', productsRoutes);
app.use('/api/customers', customersRoutes); 
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/order_items', order_itemsRoutes); 
app.use('/api/transactions', TransactionsRoutes); 
app.use('/api/cart', cartRoutes); 
app.use('/api/activitylog', activity_logRoutes); 
app.use('/api/shipping_details', shipping_detailsRoutes); 
app.use('/api/reviews', reviewsRoutes); 
app.use('/api/reports', ReportRoutes); 
app.use('/api/messages', MessagesRoutes); 
app.use('/api/order_address', order_addressRoutes); 
app.use('/api/IMS_Reset_Password', IMS_Reset_PasswordRoutes); 
app.use('/api/Expired_Inventories', Expired_InventoriesRoutes); 
// Add the upload route for image uploads
console.log('Adding upload route...');
app.use('/api/upload', uploadRoutes);  // Register the upload route
console.log("Upload routes registered correctly");  



// 404 Handler
app.all('*', (req, res) => {
  console.log(`Route ${req.originalUrl} not found`);
  res.status(404).send('404 Not Found');
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});




