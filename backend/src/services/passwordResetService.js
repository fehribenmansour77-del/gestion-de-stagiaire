/**
 * Service de réinitialisation de mot de passe
 * Gère les demandes de mot de passe oublié
 */

const { Utilisateur } = require('../models');
const PasswordReset = require('../models/PasswordReset');
const AuditLog = require('../models/AuditLog');
const { validatePasswordFormat } = require('./authService');

/**
 * Demande de réinitialisation de mot de passe
 * @param {string} email - Email de l'utilisateur
 * @param {string} ipAddress - Adresse IP du client
 * @returns {object} - Token de réinitialisation (à envoyer par email)
 */
async function requestPasswordReset(email, ipAddress) {
  const normalizedEmail = email.toLowerCase().trim();
  
  // Rechercher l'utilisateur
  const user = await Utilisateur.findOne({ 
    where: { email: normalizedEmail } 
  });
  
  // Pour des raisons de sécurité, ne pas révéler si l'email existe
  // Toujours retourner succès même si l'email n'existe pas
  if (!user) {
    return { 
      success: true, 
      message: 'Si cet email existe, un lien de réinitialisation sera envoyé' 
    };
  }
  
  // Vérifier si le compte est actif
  if (!user.is_active) {
    return { 
      success: true, 
      message: 'Si cet email existe, un lien de réinitialisation sera envoyé' 
    };
  }
  
  // Invalider les tokens de réinitialisation précédents
  await PasswordReset.update(
    { used_at: new Date() },
    { 
      where: { 
        user_id: user.id,
        used_at: null
      } 
    }
  );
  
  // Créer un nouveau token
  const resetData = await PasswordReset.createToken(user.id);
  
  // Logger l'événement
  await AuditLog.log({
    userId: user.id,
    action: AuditLog.ACTIONS.PASSWORD_RESET_REQUESTED,
    ipAddress,
    details: { email: normalizedEmail }
  });
  
  // Retourner le token brut (à envoyer par email)
  return {
    success: true,
    message: 'Si cet email existe, un lien de réinitialisation sera envoyé',
    // En développement, retourner le token pour les tests
    // En production, ce champ ne devrait pas être retourné
    token: process.env.NODE_ENV === 'development' ? resetData.token : undefined
  };
}

/**
 * Réinitialise le mot de passe avec un token
 * @param {string} email - Email de l'utilisateur
 * @param {string} token - Token de réinitialisation
 * @param {string} newPassword - Nouveau mot de passe
 * @param {string} ipAddress - Adresse IP du client
 * @returns {object} - Succès de l'opération
 */
async function resetPassword(email, token, newPassword, ipAddress) {
  const normalizedEmail = email.toLowerCase().trim();
  
  // Valider le format du nouveau mot de passe
  const passwordValidation = validatePasswordFormat(newPassword);
  if (!passwordValidation.valid) {
    const error = new Error('Format de mot de passe invalide');
    error.errors = passwordValidation.errors;
    throw error;
  }
  
  // Rechercher l'utilisateur
  const user = await Utilisateur.findOne({ 
    where: { email: normalizedEmail } 
  });
  
  if (!user) {
    throw new Error('Token de réinitialisation invalide');
  }
  
  // Valider le token
  const validation = await PasswordReset.validateToken(user.id, token);
  
  if (!validation.valid) {
    // Logger la tentative échouée
    await AuditLog.log({
      userId: user.id,
      action: AuditLog.ACTIONS.PASSWORD_RESET_COMPLETED,
      ipAddress,
      details: { success: false, reason: validation.error }
    });
    throw new Error(validation.error);
  }
  
  // Mettre à jour le mot de passe
  await user.updatePassword(newPassword);
  
  // Marquer le token comme utilisé
  await validation.record.markAsUsed();
  
  // Invalider tous les tokens de réinitialisation précédents
  await PasswordReset.update(
    { used_at: new Date() },
    { 
      where: { 
        user_id: user.id,
        used_at: null,
        id: { [require('sequelize').Op.ne]: validation.record.id }
      } 
    }
  );
  
  // Logger l'événement
  await AuditLog.log({
    userId: user.id,
    action: AuditLog.ACTIONS.PASSWORD_RESET_COMPLETED,
    ipAddress,
    details: { success: true }
  });
  
  return {
    success: true,
    message: 'Mot de passe réinitialisé avec succès'
  };
}

/**
 * Change le mot de passe de l'utilisateur connecté
 * @param {number} userId - ID de l'utilisateur
 * @param {string} currentPassword - Mot de passe actuel
 * @param {string} newPassword - Nouveau mot de passe
 * @param {string} ipAddress - Adresse IP du client
 * @returns {object} - Succès de l'opération
 */
async function changePassword(userId, currentPassword, newPassword, ipAddress) {
  // Valider le format du nouveau mot de passe
  const passwordValidation = validatePasswordFormat(newPassword);
  if (!passwordValidation.valid) {
    const error = new Error('Format de mot de passe invalide');
    error.errors = passwordValidation.errors;
    throw error;
  }
  
  // Rechercher l'utilisateur
  const user = await Utilisateur.findByPk(userId);
  
  if (!user) {
    throw new Error('Utilisateur introuvable');
  }
  
  // Vérifier le mot de passe actuel
  const isValid = await user.validatePassword(currentPassword);
  
  if (!isValid) {
    await AuditLog.log({
      userId: user.id,
      action: AuditLog.ACTIONS.PASSWORD_CHANGED,
      ipAddress,
      details: { success: false, reason: 'INVALID_CURRENT_PASSWORD' }
    });
    throw new Error('Mot de passe actuel incorrect');
  }
  
  // Vérifier que le nouveau mot de passe est différent de l'ancien
  const isSame = await user.validatePassword(newPassword);
  
  if (isSame) {
    throw new Error('Le nouveau mot de passe doit être différent de l\'actuel');
  }
  
  // Mettre à jour le mot de passe
  await user.updatePassword(newPassword);
  
  // Logger l'événement
  await AuditLog.log({
    userId: user.id,
    action: AuditLog.ACTIONS.PASSWORD_CHANGED,
    ipAddress,
    details: { success: true }
  });
  
  return {
    success: true,
    message: 'Mot de passe changé avec succès'
  };
}

module.exports = {
  requestPasswordReset,
  resetPassword,
  changePassword
};
