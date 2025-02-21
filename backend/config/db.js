const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.stack);
    return;
  }
  console.log('Connected to MySQL as id ' + connection.threadId);

  // Add this query to check the database connection
  connection.query('SELECT 1 + 1 AS solution', (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
    } else {
      console.log('Database connected and query executed successfully:', result);
    }
  });
});

module.exports = connection;
