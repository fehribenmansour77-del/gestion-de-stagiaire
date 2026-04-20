/**
 * Modèle Sequelize: Convention
 * Correspond à la table des conventions de stage
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const STATUTS = ['generee', 'en_signature', 'signee', 'annulee'];

const Convention = sequelize.define('Convention', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  // Lien vers la candidature/stagiaire
  candidature_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'candidature_id'
  },
  
  // Numéro de convention
  numero: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  
  // Fichiers
  fichier_genere: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'fichier_genere'
  },
  
  fichier_signe: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'fichier_signe'
  },
  
  fichier_archive: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'fichier_archive'
  },
  
  // Statut
  statut: {
    type: DataTypes.ENUM(...STATUTS),
    allowNull: false,
    defaultValue: 'generee'
  },
  
  // Dates
  date_generation: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'date_generation'
  },
  
  date_signature: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'date_signature'
  },
  
  date_signature_rh: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'date_signature_rh'
  },
  
  // Commentaires
  commentaire: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  // Archive
  archive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  date_archive: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'date_archive'
  }
}, {
  tableName: 'conventions',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['candidature_id'] },
    { fields: ['numero'], unique: true },
    { fields: ['statut'] },
    { fields: ['archive'] }
  ]
});

// Méthodes d'instance (Sequelize 6+)

Convention.prototype.toJSON = function() {
  return {
    id: this.id,
    numero: this.numero,
    candidature_id: this.candidature_id,
    fichier_genere: this.fichier_genere,
    fichier_signe: this.fichier_signe,
    statut: this.statut,
    date_generation: this.date_generation,
    date_signature: this.date_signature,
    date_signature_rh: this.date_signature_rh,
    commentaire: this.commentaire
  };
};

Convention.prototype.toCandidateJSON = function() {
  return {
    id: this.id,
    numero: this.numero,
    statut: this.statut,
    fichier_genere: this.fichier_genere,
    date_generation: this.date_generation
  };
};

Convention.prototype.mettreEnSignature = async function(commentaire = null) {
  this.statut = 'en_signature';
  if (commentaire) this.commentaire = commentaire;
  return this.save();
};

Convention.prototype.signer = async function(commentaire = null) {
  this.statut = 'signee';
  this.date_signature = new Date();
  if (commentaire) this.commentaire = commentaire;
  return this.save();
};

Convention.prototype.signerRH = async function(commentaire = null) {
  this.date_signature_rh = new Date();
  if (commentaire) this.commentaire = commentaire;
  return this.save();
};

Convention.prototype.archiver = async function() {
  this.archive = true;
  this.date_archive = new Date();
  return this.save();
};

// Fonction pour générer un numéro de convention unique
Convention.generateNumber = function() {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
  return `CONV-${year}-${random}`;
};

module.exports = Convention;
