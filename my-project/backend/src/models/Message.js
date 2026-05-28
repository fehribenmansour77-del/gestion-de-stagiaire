/**
 * Modèle: Message
 * Messagerie interne entre utilisateurs
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  expediteur_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  destinataire_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  stage_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  sujet: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  contenu: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  lu: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  date_lecture: {
    type: DataTypes.DATE,
    allowNull: true
  },
  piece_jointe_nom: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Nom du fichier joint'
  },
  piece_jointe_chemin: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Chemin du fichier'
  },
  piece_jointe_taille: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Taille en octets (max 5MB)'
  }
}, {
  tableName: 'messages',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['expediteur_id'] },
    { fields: ['destinataire_id'] },
    { fields: ['lu'] }
  ]
});

module.exports = Message;
