const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Instance centralisée de Sequelize

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

// Définition de l'association avec UserPlatform
User.associate = (models) => {
  // Un utilisateur peut avoir plusieurs plateformes associées via la table de jointure userplatforms
  User.hasMany(models.UserPlatform, {
    foreignKey: 'user_id',
    as: 'platforms'
  });
};

module.exports = User;
