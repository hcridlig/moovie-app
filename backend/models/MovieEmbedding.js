const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Centralized Sequelize instance

const MovieEmbedding = sequelize.define(
  'movieembedding', 
  {
    movie_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    embeddings: {
      type: DataTypes.ARRAY(DataTypes.FLOAT),
      allowNull: false,
    },
  }, 
  {
   tableName: 'movie_embeddings',
   timestamps: false, // Disable automatic timestamp fields
  });

module.exports = MovieEmbedding;