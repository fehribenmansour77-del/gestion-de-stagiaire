/**
 * Modèle Sequelize: Stagiaire
 * Correspond à la table des stagiaires du système
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const STATUTS = ['actif', 'termine', 'archive'];
const ENTITIES = ['GIAS', 'CSM', 'SHARED'];

const Stagiaire = sequelize.define('Stagiaire', {
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
  
  etablissement: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      len: [0, 255]
    }
  },
  
  filiere: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      len: [0, 255]
    }
  },
  
  niveau_etude: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'niveau_etude',
    validate: {
      len: [0, 100]
    }
  },
  
  annee_en_cours: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'annee_en_cours',
    validate: {
      min: 2000,
      max: 2100
    }
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
    defaultValue: 'actif',
    validate: {
      isIn: [STATUTS]
    }
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
  }
}, {
  tableName: 'stagiaires',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['utilisateur_id'] },
    { fields: ['departement_id'] },
    { fields: ['tuteur_id'] },
    { fields: ['entity'] },
    { fields: ['statut'] },
  ]
});

// Méthodes d'instance (Sequelize 6+)
Stagiaire.prototype.toJSON = function() {
  const values = { ...this.get() };
  
  // S'assurer que les associations chargées (utilisateur, departement, etc.) sont incluses
  if (values.utilisateur && typeof values.utilisateur.toJSON === 'function') {
    values.utilisateur = values.utilisateur.toJSON();
  }
  if (values.departement && typeof values.departement.toJSON === 'function') {
    values.departement = values.departement.toJSON();
  }
  if (values.tuteur && typeof values.tuteur.toJSON === 'function') {
    values.tuteur = values.tuteur.toJSON();
  }
  
  return values;
};

Stagiaire.prototype.archiver = async function(raison = null) {
  this.statut = 'archive';
  this.date_archive = new Date();
  this.raison_archive = raison;
  return this.save();
};

Stagiaire.prototype.terminer = async function() {
  this.statut = 'termine';
  return this.save();
};

Stagiaire.prototype.reactiver = async function() {
  this.statut = 'actif';
  this.date_archive = null;
  this.raison_archive = null;
  return this.save();
};

// Export
module.exports = Stagiaire;
