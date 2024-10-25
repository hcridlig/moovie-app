const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

module.exports = {
  development: {
    username: process.env.PGUSERNAME,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    host: process.env.PGHOST,
    dialect: 'postgres',
    port: process.env.DB_PORT || 5432,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // This line is crucial for local development
      },
    },
  },
};