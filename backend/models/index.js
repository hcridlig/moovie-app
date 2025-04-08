const { Sequelize } = require('sequelize');
const sequelize = require('../config/db'); // Assuming config/db.js exports a Sequelize instance

// Import models
const User = require('./User'); // User model
const Preference = require('./Preference'); // Preference model
const MovieEmbedding = require('./MovieEmbedding'); // MovieEmbedding model
const SerieEmbedding = require('./SerieEmbedding'); // SerieEmbedding model
const UserPlatform = require('./UserPlatform'); // Ajout du modèle UserPlatform

// Define relationships

// Relations pour les préférences
User.hasMany(Preference, { foreignKey: 'user_id', as: 'preferences' });
Preference.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Relations pour les plateformes de streaming
User.hasMany(UserPlatform, { foreignKey: 'user_id', as: 'platforms' });
UserPlatform.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Vous pouvez ajouter ici des associations supplémentaires si vous créez un modèle "Platform"
// par exemple : Platform.hasMany(UserPlatform, { foreignKey: 'platform_id', as: 'userPlatforms' });


// Sync models
const syncModels = async () => {
  try {
    await sequelize.sync({ force: false }); // Set force to true for testing to reset the DB
    console.log('Models synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing models:', error);
  }
};

module.exports = { User, Preference, MovieEmbedding, SerieEmbedding, UserPlatform, syncModels, sequelize };
