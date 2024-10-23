const { DataTypes, Sequelize } = require('sequelize');
const config = require('../config/db');  // Reference to your Sequelize database connection

const sequelize = new Sequelize(config.development);

const Serie = sequelize.define('serie', {
  idserie: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  synopsis: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  genre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  platform: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'serie',  // Optional: defines the table name
  timestamps: true,     // Optional: adds `createdAt` and `updatedAt` fields
});

module.exports = {
  Serie,
  sequelize
};
