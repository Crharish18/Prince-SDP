const express = require('express');
require('dotenv').config();
const cors = require('cors');
const authRoutes = require('./routes/auth');
const employeesRoutes = require('./routes/employees'); // Import the employees route
const categoriesRoutes = require('./routes/categories');
const suppliersRoutes = require('./routes/suppliers');
const productsRoutes = require('./routes/products');
const customersRoutes = require('./routes/Customers'); // Import the customers route
const inventoryRoutes =require('./routes/inventory');
const app = express();
const port = process.env.PORT || 5000;

// ✅ Fix CORS to allow requests from Vite (`http://localhost:5173`)
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'], // Add the missing port
  methods: 'GET,POST,PUT,DELETE', 
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
app.use('/api/suppliers', suppliersRoutes); 
app.use('/api/products', productsRoutes);
app.use('/api/customers', customersRoutes); // Add the customers route
app.use('/api/inventory', inventoryRoutes);


// ✅ 404 Handler
app.all('*', (req, res) => {
  console.log(`❌ Route ${req.originalUrl} not found`);
  res.status(404).send('404 Not Found');
});

// ✅ Start Server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});




