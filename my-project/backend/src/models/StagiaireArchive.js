/**
 * Modèle Sequelize: StagiaireArchive
 * Archive des stagiaires pour rétention de 10 ans
 * Copie de la table stagiaires pour l'archivage légal
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const STATUTS = ['actif', 'termine', 'archive'];
const ENTITIES = ['GIAS', 'CSM'];

const StagiaireArchive = sequelize.define('StagiaireArchive', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  original_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'original_id'
  },
  
  utilisateur_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'utilisateur_id'
  },
  
  etablissement: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  
  filiere: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  
  niveau_etude: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'niveau_etude'
  },
  
  annee_en_cours: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'annee_en_cours'
  },
  
  departement_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'departement_id'
  },
  
  tuteur_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'tuteur_id'
  },
  
  date_demarrage: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'date_demarrage'
  },
  
  date_fin: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'date_fin'
  },
  
  entity: {
    type: DataTypes.ENUM(...ENTITIES),
    allowNull: true,
    validate: {
      isIn: [ENTITIES]
    }
  },
  
  statut: {
    type: DataTypes.ENUM(...STATUTS),
    allowNull: false,
    defaultValue: 'archive'
  },
  
  date_archive: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'date_archive'
  },
  
  raison_archive: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'raison_archive'
  },
  
  archived_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'archived_at'
  },
  
  retention_end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'retention_end_date'
  }
}, {
  tableName: 'stagiaires_archive',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['original_id'] },
    { fields: ['utilisateur_id'] },
    { fields: ['date_archive'] },
    { fields: ['retention_end_date'] }
  ]
});

module.exports = StagiaireArchive;
