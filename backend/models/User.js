const { DataTypes, Sequelize } = require('sequelize');
const config = require('../config/db');  // Reference to your Sequelize database connection

const sequelize = new Sequelize(config.development);

const User = sequelize.define('user', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: true,  // Changed to true based on the provided schema
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,  // Changed to true based on the provided schema
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,  // Changed to true based on the provided schema
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.fn('NOW'),  // Default value based on your schema
  },
  last_login: {
    type: DataTypes.DATE,  // Adding last_login field
    allowNull: true,  // Allows null values
  },
}, {
  tableName: 'users',  // Changed to match the provided SQL table name
  timestamps: false,    // Disabled to avoid auto-generated createdAt and updatedAt fields
});

module.exports = {
  User, 
  sequelize,
};
