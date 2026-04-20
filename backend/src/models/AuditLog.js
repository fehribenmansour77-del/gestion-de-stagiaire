/**
 * Modèle Sequelize: AuditLog
 * Journal d'audit pour toutes les actions utilisateur
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'user_id'
  },
  
  action: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: false,
    field: 'ip_address'
  },
  
  user_agent: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'user_agent'
  },
  
  details: {
    type: DataTypes.JSON,
    allowNull: true
  },
  
  resource_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'resource_type'
  },
  
  resource_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'resource_id'
  }
}, {
  tableName: 'audit_logs',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['action'] },
    { fields: ['created_at'] },
    { fields: ['resource_type', 'resource_id'] }
  ]
});

// Types d'actions courantes
AuditLog.ACTIONS = {
  // Auth
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  LOGIN_FAILED: 'LOGIN_FAILED',
  PASSWORD_RESET_REQUESTED: 'PASSWORD_RESET_REQUESTED',
  PASSWORD_RESET_COMPLETED: 'PASSWORD_RESET_COMPLETED',
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',
  
  // User management
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DELETED: 'USER_DELETED',
  USER_ACTIVATED: 'USER_ACTIVATED',
  USER_DEACTIVATED: 'USER_DEACTIVATED',
  ROLE_CHANGED: 'ROLE_CHANGED',
  
  // Stagiaire
  STAGIAIRE_CREATED: 'STAGIAIRE_CREATED',
  STAGIAIRE_UPDATED: 'STAGIAIRE_UPDATED',
  STAGIAIRE_DELETED: 'STAGIAIRE_DELETED',
  
  // Candidature
  CANDIDATURE_SUBMITTED: 'CANDIDATURE_SUBMITTED',
  CANDIDATURE_ACCEPTED: 'CANDIDATURE_ACCEPTED',
  CANDIDATURE_REJECTED: 'CANDIDATURE_REJECTED',
  
  // Convention
  CONVENTION_CREATED: 'CONVENTION_CREATED',
  CONVENTION_SIGNED: 'CONVENTION_SIGNED',
  
  // Presence
  PRESENCE_RECORDED: 'PRESENCE_RECORDED',
  
  // Evaluation
  EVALUATION_SUBMITTED: 'EVALUATION_SUBMITTED',
  
  // Errors
  ERROR: 'ERROR',
  ACCESS_DENIED: 'ACCESS_DENIED'
};

// Méthode pour enregistrer un événement
AuditLog.log = async function(data) {
  return AuditLog.create({
    user_id: data.userId || null,
    action: data.action,
    ip_address: data.ipAddress || 'unknown',
    user_agent: data.userAgent || null,
    details: data.details || null,
    resource_type: data.resourceType || null,
    resource_id: data.resourceId || null
  });
};

// Méthode pour obtenir les logs d'un utilisateur
AuditLog.getUserLogs = async function(userId, limit = 100) {
  return AuditLog.findAll({
    where: { user_id: userId },
    order: [['created_at', 'DESC']],
    limit
  });
};

// Méthode pour obtenir les logs par action
AuditLog.getByAction = async function(action, limit = 100) {
  return AuditLog.findAll({
    where: { action },
    order: [['created_at', 'DESC']],
    limit
  });
};

// Export
module.exports = AuditLog;
