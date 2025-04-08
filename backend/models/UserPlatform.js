const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Use the same Sequelize instance

const UserPlatform = sequelize.define(
  'UserPlatform',
  {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    platform_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    tableName: 'userplatforms',
    timestamps: false,
  }
);

// Associations
UserPlatform.associate = (models) => {
  UserPlatform.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  if (models.Platform) {
    UserPlatform.belongsTo(models.Platform, {
      foreignKey: 'platform_id',
      as: 'platform'
    });
  }
};

module.exports = UserPlatform;
