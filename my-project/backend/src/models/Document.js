/**
 * Modèle: Document
 * Documents générés (attestations, feuilles de présence)
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  stage_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('ATTESTATION_STAGE', 'FEUILLE_PRESENCE', 'RAPPORT_EVALUATION', 'CONVENTION'),
    allowNull: false
  },
  fichier_path: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Chemin du fichier PDF'
  },
  fichier_nom: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Nom du fichier'
  },
  periode_mois: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Mois pour les feuilles de présence'
  },
  periode_annee: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Année pour les feuilles de présence'
  },
  taille_fichier: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Taille du fichier en octets'
  },
  genere_par: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  archive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Document archivé'
  },
  date_archive: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date d\'archivage (10 ans après génération)'
  }
}, {
  tableName: 'documents',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['stage_id'] },
    { fields: ['type'] },
    { fields: ['archive'] }
  ]
});

// Méthode pour programmer l'archivage (10 ans)
Document.prototype.programmerArchivage = function() {
  const dateArchivage = new Date();
  dateArchivage.setFullYear(dateArchivage.getFullYear() + 10);
  this.date_archive = dateArchivage;
};

module.exports = Document;
