const { DataTypes, Sequelize } = require('sequelize');
const config = require('../config/db');  // Reference to your Sequelize database connection

const sequelize = new Sequelize(config.development);

const User = sequelize.define('user', {
  iduser: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'user',  // e.g. 'admin', 'user', etc.
  },
}, {
  tableName: 'users',  // Optional: defines the table name
  timestamps: true,    // Adds `createdAt` and `updatedAt` fields
});

module.exports = {
  User, 
  sequelize
 };
