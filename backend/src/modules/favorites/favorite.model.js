const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');
const User = require('../users/user.model');

const Favorite = sequelize.define('Favorite', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  type: {
    type: DataTypes.ENUM('CHARACTER', 'LOCATION', 'EPISODE'),
    allowNull: false
  },
  externalId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  name: DataTypes.STRING,
  image: DataTypes.STRING
}, {
  tableName: 'favorites',
  timestamps: true
});

Favorite.belongsTo(User, { foreignKey: 'userId' });

module.exports = Favorite;