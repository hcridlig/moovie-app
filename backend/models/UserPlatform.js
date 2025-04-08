const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Utilise la même instance Sequelize

const UserPlatform = sequelize.define(
  'userplatform',
  {
    user_platform_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    platform_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'userplatforms', // Assurez-vous que ce nom correspond à votre table existante
    timestamps: false,
  }
);

// Définition des associations pour UserPlatform
UserPlatform.associate = (models) => {
  // Chaque enregistrement dans userplatforms appartient à un utilisateur
  UserPlatform.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user'
  });
  // Optionnel : si vous disposez d'un modèle Platform pour détailler les plateformes
  if (models.Platform) {
    UserPlatform.belongsTo(models.Platform, {
      foreignKey: 'platform_id',
      as: 'platform'
    });
  }
};

module.exports = UserPlatform;
