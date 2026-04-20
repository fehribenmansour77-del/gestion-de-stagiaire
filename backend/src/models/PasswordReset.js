/**
 * Modèle Sequelize: PasswordReset
 * Gestion des tokens de réinitialisation de mot de passe
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcrypt');

const PasswordReset = sequelize.define('PasswordReset', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'utilisateurs',
      key: 'id'
    }
  },
  
  token_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'token_hash'
  },
  
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at',
    validate: {
      isDate: true
    }
  },
  
  used_at: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'used_at'
  }
}, {
  tableName: 'password_resets',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['token_hash'] },
    { fields: ['expires_at'] }
  ]
});

// Méthodes d'instance (Sequelize 6+)
PasswordReset.prototype.isValid = function() {
  return !this.usedAt && new Date() < this.expiresAt;
};

PasswordReset.prototype.markAsUsed = async function() {
  this.usedAt = new Date();
  return this.save();
};

PasswordReset.prototype.isExpired = function() {
  return new Date() >= this.expiresAt;
};

PasswordReset.prototype.isUsed = function() {
  return this.usedAt !== null;
};

// Méthode statique pour créer un token
PasswordReset.createToken = async function(userId) {
  // Générer un token aléatoire
  const token = require('uuid').v4() + require('uuid').v4();
  
  // Hasher le token pour le stockage
  const salt = await bcrypt.genSalt(10);
  const tokenHash = await bcrypt.hash(token, salt);
  
  // Définir la date d'expiration (1 heure)
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  
  // Créer l'enregistrement
  const passwordReset = await PasswordReset.create({
    user_id: userId,
    token_hash: tokenHash,
    expires_at: expiresAt
  });
  
  // Retourner le token brut (pour envoyer par email)
  return {
    token,
    expiresAt,
    record: passwordReset
  };
};

// Méthode statique pour valider un token
PasswordReset.validateToken = async function(userId, token) {
  // Trouver le token non utilisé pour cet utilisateur
  const resetRecord = await PasswordReset.findOne({
    where: {
      user_id: userId,
      used_at: null
    },
    order: [['created_at', 'DESC']]
  });
  
  if (!resetRecord) {
    return { valid: false, error: 'Token invalide' };
  }
  
  if (resetRecord.isExpired()) {
    return { valid: false, error: 'Token expiré' };
  }
  
  // Vérifier le token
  const valid = await bcrypt.compare(token, resetRecord.token_hash);
  
  if (!valid) {
    return { valid: false, error: 'Token invalide' };
  }
  
  return { valid: true, record: resetRecord };
};

// Export
module.exports = PasswordReset;
