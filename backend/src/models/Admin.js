/**
 * Modèle Sequelize: Admin
 * Correspond à la table des administrateurs du système
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Admin = sequelize.define('Admin', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  utilisateur_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'utilisateur_id'
  },
  
  poste: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      len: [0, 255]
    }
  },
  
  service: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      len: [0, 255]
    }
  },
  
  permissions_level: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    field: 'permissions_level'
  }
}, {
  tableName: 'admins',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['utilisateur_id'] }
  ]
});

module.exports = Admin;
