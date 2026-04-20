/**
 * Modèle Sequelize: Utilisateur
 * Correspond à la table des utilisateurs du système
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcrypt');

// Définition des rôles selon la constitution
const ROLES = ['super_admin', 'admin_rh', 'chef_departement', 'tuteur', 'stagiaire'];
const ENTITIES = ['GIAS', 'CSM', 'SHARED'];

const Utilisateur = sequelize.define('Utilisateur', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'password_hash'
  },
  
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
  
  role: {
    type: DataTypes.ENUM(...ROLES),
    allowNull: false,
    defaultValue: 'stagiaire',
    validate: {
      isIn: [ROLES]
    }
  },
  
  telephone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      is: /^[0-9+\s()-]*$/
    }
  },
  
  photo_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'photo_url'
  },
  
  entity: {
    type: DataTypes.ENUM(...ENTITIES),
    allowNull: true,
    validate: {
      isIn: [ENTITIES]
    }
  },
  
  departement_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'departement_id'
  },
  
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  
  last_login: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_login'
  }
}, {
  tableName: 'utilisateurs',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['email'] },
    { fields: ['role'] },
    { fields: ['entity'] },
    { fields: ['departement_id'] }
  ]
});

// Méthodes d'instance (Sequelize 6+)
Utilisateur.prototype.validatePassword = async function(password) {
  return bcrypt.compare(password, this.password_hash);
};

Utilisateur.prototype.getFullName = function() {
  return `${this.prenom} ${this.nom}`;
};

Utilisateur.prototype.hasRole = function(role) {
  return this.role === role;
};

Utilisateur.prototype.hasAnyRole = function(roles) {
  return roles.includes(this.role);
};

Utilisateur.prototype.updatePassword = async function(newPassword) {
  const salt = await bcrypt.genSalt(12);
  this.password_hash = await bcrypt.hash(newPassword, salt);
  return this.save();
};

Utilisateur.prototype.updateLastLogin = async function() {
  this.last_login = new Date();
  return this.save();
};

Utilisateur.prototype.deactivate = async function() {
  this.is_active = false;
  return this.save();
};

Utilisateur.prototype.activate = async function() {
  this.is_active = true;
  return this.save();
};

Utilisateur.prototype.toPublicJSON = function() {
  return {
    id: this.id,
    email: this.email,
    nom: this.nom,
    prenom: this.prenom,
    role: this.role,
    telephone: this.telephone,
    photo_url: this.photo_url,
    entity: this.entity,
    departement_id: this.departement_id,
    is_active: this.is_active,
    last_login: this.last_login,
    created_at: this.createdAt,
    updated_at: this.updatedAt
  };
};

// Hooks Sequelize
Utilisateur.beforeCreate(async (user) => {
  // Hash du mot de passe avant création
  if (user.password_hash && !user.password_hash.startsWith('$2')) {
    const salt = await bcrypt.genSalt(12);
    user.password_hash = await bcrypt.hash(user.password_hash, salt);
  }
});

Utilisateur.beforeUpdate(async (user) => {
  // Re-hash si le mot de passe a changé
  if (user.changed('password_hash') && !user.password_hash.startsWith('$2')) {
    const salt = await bcrypt.genSalt(12);
    user.password_hash = await bcrypt.hash(user.password_hash, salt);
  }
});

// Export
module.exports = Utilisateur;
