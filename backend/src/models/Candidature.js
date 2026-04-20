/**
 * Modèle Sequelize: Candidature
 * Correspond à la table des candidatures de stage
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const STATUTS = [
  'en_attente',         // Candidature nouvellement soumise
  'en_cours',          // En cours d'examen par le RH
  'documents_manquants', // Documents manquants
  'liste_attente',     // En liste d'attente (pas de tuteur disponible)
  'acceptee',          // Acceptée
  'refusee',          // Refusée
  'annulee'           // Annulée par le candidat
];
const TYPES_STAGE = ['pfe', 'ete', 'initiation', 'professionnel'];

const Candidature = sequelize.define('Candidature', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  // Informations personnelles
  nom: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  
  prenom: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  
  telephone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      is: /^[0-9+\s()-]*$/
    }
  },
  
  // Informations académiques
  etablissement: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  
  filiere: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  
  niveau: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'niveau_etude'
  },
  
  // Informations sur le stage souhaité
  departement_souhaite: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'departement_souhaite'
  },
  
  date_debut: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'date_debut'
  },
  
  date_fin: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'date_fin'
  },
  
  theme: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  type_stage: {
    type: DataTypes.ENUM(...TYPES_STAGE),
    allowNull: false,
    defaultValue: 'pfe',
    field: 'type_stage'
  },
  
  // Fichiers uploadés
  cv_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'cv_url'
  },
  
  lm_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'lm_url'
  },
  
  // Statut de la candidature
  statut: {
    type: DataTypes.ENUM(...STATUTS),
    allowNull: false,
    defaultValue: 'en_attente'
  },
  
  // Numéro de suivi unique
  numero_suivi: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    field: 'numero_suivi'
  },
  
  // Mot de passe temporaire (pour création de compte à l'acceptation)
  mot_de_passe_temp: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'mot_de_passe_temp'
  },
  
  // Commentaires
  commentaire: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  // Dates
  date_soumission: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'date_soumission'
  },
  
  date_traitement: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'date_traitement'
  },
  
  date_acceptation: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'date_acceptation'
  },
  
  date_refus: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'date_refus'
  }
}, {
  tableName: 'candidatures',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['email'] },
    { fields: ['statut'] },
    { fields: ['numero_suivi'], unique: true },
    { fields: ['date_soumission'] }
  ]
});

// --- MÉTHODES D'INSTANCE (Sequelize v6+) ---

/**
 * Retourne les données publiques
 */
Candidature.prototype.toJSON = function() {
  return {
    id: this.id,
    nom: this.nom,
    prenom: this.prenom,
    email: this.email,
    telephone: this.telephone,
    etablissement: this.etablissement,
    filiere: this.filiere,
    niveau: this.niveau,
    departement_souhaite: this.departement_souhaite,
    date_debut: this.date_debut,
    date_fin: this.date_fin,
    theme: this.theme,
    type_stage: this.type_stage,
    statut: this.statut,
    numero_suivi: this.numero_suivi,
    date_soumission: this.date_soumission,
    date_traitement: this.date_traitement,
    createdAt: this.createdAt
  };
};

/**
 * Retourne les données pour le candidat (sans informations sensibles)
 */
Candidature.prototype.toCandidateJSON = function() {
  return {
    id: this.id,
    numero_suivi: this.numero_suivi,
    statut: this.statut,
    date_soumission: this.date_soumission,
    date_traitement: this.date_traitement,
    commentaire: this.commentaire
  };
};

/**
 * Accepte la candidature
 */
Candidature.prototype.accepter = async function(commentaire = null, options = {}) {
  this.statut = 'acceptee';
  this.date_traitement = new Date();
  this.date_acceptation = new Date();
  if (commentaire) this.commentaire = commentaire;
  return this.save(options);
};

/**
 * Refuse la candidature
 */
Candidature.prototype.refuser = async function(commentaire = null, options = {}) {
  this.statut = 'refusee';
  this.date_traitement = new Date();
  this.date_refus = new Date();
  if (commentaire) this.commentaire = commentaire;
  return this.save(options);
};

/**
 * Marque la candidature en cours de traitement
 */
Candidature.prototype.traiter = async function(options = {}) {
  this.statut = 'en_cours';
  this.date_traitement = new Date();
  return this.save(options);
};

/**
 * Marque la candidature comme documents manquants
 */
Candidature.prototype.demanderDocuments = async function(commentaire = null, options = {}) {
  this.statut = 'documents_manquants';
  this.date_traitement = new Date();
  if (commentaire) this.commentaire = commentaire;
  return this.save(options);
};

/**
 * Met la candidature en liste d'attente
 */
Candidature.prototype.mettreEnAttente = async function(commentaire = null, options = {}) {
  this.statut = 'liste_attente';
  this.date_traitement = new Date();
  if (commentaire) this.commentaire = commentaire;
  return this.save(options);
};

/**
 * Annule la candidature
 */
Candidature.prototype.annuler = async function(commentaire = null, options = {}) {
  this.statut = 'annulee';
  this.date_traitement = new Date();
  if (commentaire) this.commentaire = commentaire;
  return this.save(options);
};

// Fonction pour générer un numéro de suivi unique
Candidature.generateSuiviNumber = function() {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
  return `GIAS-${year}-${random}`;
};

module.exports = Candidature;
