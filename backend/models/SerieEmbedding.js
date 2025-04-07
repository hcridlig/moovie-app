const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Centralized Sequelize instance

const SerieEmbedding = sequelize.define(
  'serieembedding', 
  {
    serie_id: {
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
   tableName: 'serie_embeddings',
   timestamps: false, // Disable automatic timestamp fields
  });

module.exports = SerieEmbedding;