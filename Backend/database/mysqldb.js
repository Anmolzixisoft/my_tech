const mysql = require('mysql');
require('dotenv').config();

const connection = mysql.createConnection({
  host:process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  port: 3306,
});

// Connect to MySQL
connection.connect((err) => {

  if (err) {
    console.error('Error connecting to MySQL:--------', err.message);
    return;
  }
  console.log('Connected to MySQL');
});

module.exports = connection;