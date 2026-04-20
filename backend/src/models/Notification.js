/**
 * Modèle: Notification
 * Notifications automatiques et alertes
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  utilisateur_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  titre: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM(
      'CANDIDATURE_NOUVELLE',
      'CANDIDATURE_ACCEPTEE',
      'CANDIDATURE_REFUSEE',
      'ABSENCE',
      'EVALUATION',
      'DOCUMENT',
      'CONVENTION',
      'PRESENCE',
      'SYSTEM'
    ),
    allowNull: false,
    defaultValue: 'SYSTEM'
  },
  lien: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'URL vers la ressource concernée'
  },
  lue: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  date_lecture: {
    type: DataTypes.DATE,
    allowNull: true
  },
  donnees_extra: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Données additionnelles en JSON'
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['utilisateur_id'] },
    { fields: ['lue'] },
    { fields: ['type'] }
  ]
});

module.exports = Notification;
