/**
 * Modèle Sequelize: LoginAttempt
 * Suivi des tentatives de connexion pour sécurité
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LoginAttempt = sequelize.define('LoginAttempt', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      isEmail: true
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
  
  success: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  
  failure_reason: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'failure_reason'
  }
}, {
  tableName: 'login_attempts',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['email'] },
    { fields: ['ip_address'] },
    { fields: ['created_at'] }
  ]
});

// Méthode pour enregistrer une tentative
LoginAttempt.record = async function(data) {
  return LoginAttempt.create(data);
};

// Méthode pour obtenir le nombre de tentatives récentes
LoginAttempt.countRecentAttempts = async function(email, ipAddress, minutes = 15, threshold = 5) {
  const since = new Date(Date.now() - minutes * 60 * 1000);
  
  return LoginAttempt.count({
    where: {
      email,
      success: false,
      created_at: { [sequelize.Sequelize.Op.gte]: since }
    }
  });
};

// Export
module.exports = LoginAttempt;
