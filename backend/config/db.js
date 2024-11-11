const dotenv = require('dotenv');
const { Sequelize } = require('sequelize');

// Load environment variables from .env file
dotenv.config();

// Créer une instance Sequelize avec les informations de configuration
const sequelize = new Sequelize(
  process.env.PGDATABASE,
  process.env.PGUSERNAME,
  process.env.PGPASSWORD,
  {
    host: process.env.PGHOST,
    dialect: 'postgres',
    port: process.env.DB_PORT || 5432,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Utile pour le développement local
      },
    },
  }
);

// Tester la connexion
sequelize
  .authenticate()
  .then(() => console.log('Connexion réussie à PostgreSQL'))
  .catch(err => console.error('Impossible de se connecter à PostgreSQL', err));

module.exports = sequelize;
