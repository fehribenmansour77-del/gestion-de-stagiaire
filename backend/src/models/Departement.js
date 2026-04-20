/**
 * Modèle Sequelize: Departement
 * Correspond à la table des départements de l'organisation
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Définition des entités selon la constitution
const ENTITIES = ['GIAS', 'CSM', 'SHARED'];

const Departement = sequelize.define('Departement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  nom: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: {
      msg: 'Le code du département doit être unique'
    },
    validate: {
      notEmpty: true,
      len: [1, 20],
      isUppercase: true
    }
  },
  
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  responsable_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'responsable_id'
  },
  
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'parent_id'
  },
  
  entity: {
    type: DataTypes.ENUM(...ENTITIES),
    allowNull: false,
    validate: {
      isIn: [ENTITIES]
    }
  },
  
  capacite_accueil: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10,
    validate: {
      min: 0,
      max: 1000
    },
    field: 'capacite_accueil'
  },
  
  est_actif: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'est_actif'
  }
}, {
  tableName: 'departements',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['code'], unique: true },
    { fields: ['entity'] },
    { fields: ['parent_id'] },
    { fields: ['responsable_id'] },
    { fields: ['est_actif'] }
  ]
});

// Méthodes d'instance (Sequelize 6+)
Departement.prototype.toJSON = function() {
  return {
    id: this.id,
    nom: this.nom,
    code: this.code,
    description: this.description,
    responsable_id: this.responsable_id,
    parent_id: this.parent_id,
    entity: this.entity,
    capacite_accueil: this.capacite_accueil,
    est_actif: this.est_actif,
    created_at: this.createdAt,
    updated_at: this.updatedAt
  };
};

Departement.prototype.deactivate = async function() {
  this.est_actif = false;
  return this.save();
};

Departement.prototype.activate = async function() {
  this.est_actif = true;
  return this.save();
};

Departement.prototype.hasChildren = async function() {
  const children = await Departement.count({
    where: { parent_id: this.id }
  });
  return children > 0;
};

// Export
module.exports = Departement;
