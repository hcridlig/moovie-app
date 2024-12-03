const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Centralized Sequelize instance

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
  },
  {
    tableName: 'preferences',
    timestamps: false,
  }
);

module.exports = Preference;
