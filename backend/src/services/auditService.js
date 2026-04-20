/**
 * Service d'audit
 * Gestion centralisée des logs d'audit
 */

const AuditLog = require('../models/AuditLog');

/**
 * Enregistre un événement d'audit
 * @param {object} data - Données de l'événement
 * @returns {Promise} - Événement créé
 */
async function logAuditEvent(data) {
  try {
    return await AuditLog.log(data);
  } catch (error) {
    // Ne pas faire échouer la requête principale si l'audit échoue
    console.error('Audit log error:', error);
  }
}

/**
 * Récupère les logs d'audit pour un utilisateur
 * @param {number} userId - ID de l'utilisateur
 * @param {number} limit - Nombre de résultats
 * @returns {Promise} - Liste des logs
 */
async function getUserAuditLogs(userId, limit = 100) {
  return AuditLog.getUserLogs(userId, limit);
}

/**
 * Récupère les logs d'audit par type d'action
 * @param {string} action - Type d'action
 * @param {number} limit - Nombre de résultats
 * @returns {Promise} - Liste des logs
 */
async function getAuditLogsByAction(action, limit = 100) {
  return AuditLog.getByAction(action, limit);
}

module.exports = {
  logAuditEvent,
  getUserAuditLogs,
  getAuditLogsByAction
};
