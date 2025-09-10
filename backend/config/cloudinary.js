const cloudinary = require('cloudinary').v2;
require('dotenv').config();  // Add this line to load environment variables

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,  // Load cloud name from .env
  api_key: process.env.CLOUD_API_KEY,  // Load API key from .env
  api_secret: process.env.CLOUD_API_SECRET  // Load API secret from .env
});

module.exports = cloudinary;
