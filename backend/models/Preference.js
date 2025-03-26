// Preference.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Preference = sequelize.define(
  'preference',
  {
    preference_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    movie_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    liked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    media_type: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  },
  {
    tableName: 'preferences',
    timestamps: false,
  }
);

module.exports = Preference;
