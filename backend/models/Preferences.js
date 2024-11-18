const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Preference = sequelize.define('preference', {
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
    allowNull: false, // ID du film provenant de l'API TMDB
  },
  preference_type: {
    type: DataTypes.STRING,
    allowNull: false, // Types possibles : 'liked', 'disliked', 'watchlist'
  },
}, {
  tableName: 'preferences',
  timestamps: false,
});

module.exports = Preference;
