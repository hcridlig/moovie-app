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
    preference_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    media_type: {  // Nouveau champ pour différencier film et série
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'preferences',
    timestamps: false,
  }
);

module.exports = Preference;
