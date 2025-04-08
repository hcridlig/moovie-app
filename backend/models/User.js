const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Centralized Sequelize instance

const User = sequelize.define(
  'user',
  {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    user_embedding: {
      type: DataTypes.ARRAY(DataTypes.FLOAT),
      allowNull: true,
    },
  },
  {
    tableName: 'users',
    timestamps: false,
  }
);

module.exports = User;
