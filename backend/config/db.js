const dotenv = require('dotenv');
const { Sequelize } = require('sequelize');

// Load environment variables from .env file
dotenv.config();

const sequelize = new Sequelize(
  process.env.PGDATABASE,  // Database name
  process.env.PGUSERNAME, // Username
  process.env.PGPASSWORD, // Password
  {
    host: process.env.PGHOST,
    dialect: 'postgres',
    port: process.env.DB_PORT || 5432,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Needed for local development with SSL
      },
    },
  }
);

module.exports = sequelize;