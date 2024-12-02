const { Sequelize } = require('sequelize');
const sequelize = require('../config/db'); // Assuming config/db.js exports a Sequelize instance

// Import models
const User = require('./User'); // User model
const Preference = require('./Preference'); // Preference model
const MovieEmbedding = require('./MovieEmbedding'); // MovieEmbedding model

// Define relationships
User.hasMany(Preference, { foreignKey: 'user_id', as: 'preferences' });
Preference.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Sync models
const syncModels = async () => {
  try {
    await sequelize.sync({ force: false }); // Set force to true for testing purposes to reset the DB
    console.log('Models synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing models:', error);
  }
};

module.exports = { User, Preference, MovieEmbedding, syncModels, sequelize };