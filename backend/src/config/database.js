/**
 * Configuration de la base de données Sequelize
 * Connexion MySQL pour le projet Gestion des Stagiaires
 */

const { Sequelize } = require('sequelize');

// Configuration depuis les variables d'environnement
const dbName = process.env.DB_NAME || 'gestion_stagiaires';
const dbUser = process.env.DB_USER || 'root';
const dbPass = process.env.DB_PASSWORD || '';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || 3306;

// Instance Sequelize
const sequelize = new Sequelize(dbName, dbUser, dbPass, {
  host: dbHost,
  port: dbPort,
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  
  // Pool de connexions
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  
  // Options globales
  define: {
    timestamps: true,
    underscored: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  },
  
  // Configuration MySQL
  dialectOptions: {
    connectTimeout: 60000
  }
});

// Hook pour supporter "instanceMethods" (déprécié dans Sequelize v4+)
sequelize.addHook('afterDefine', (model) => {
  if (model.options && model.options.instanceMethods) {
    Object.assign(model.prototype, model.options.instanceMethods);
  }
  if (model.options && model.options.classMethods) {
    Object.assign(model, model.options.classMethods);
  }
});

// Export
module.exports = { sequelize, Sequelize };
