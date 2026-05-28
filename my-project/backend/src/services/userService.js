/**
 * Service de gestion des utilisateurs
 * CRUD et operations sur les utilisateurs
 */

const { Utilisateur } = require('../models');
const AuditLog = require('../models/AuditLog');
const { validatePasswordFormat } = require('./authService');
const { Op } = require('sequelize');

/**
 * Crée un nouvel utilisateur
 * @param {object} userData - Données de l'utilisateur
 * @param {number} createdBy - ID de l'utilisateur créant
 * @param {string} ipAddress - Adresse IP
 * @returns {object} - Utilisateur créé
 */
async function createUser(userData, createdBy, ipAddress) {
  // Valider le format du mot de passe
  if (userData.password) {
    const passwordValidation = validatePasswordFormat(userData.password);
    if (!passwordValidation.valid) {
      const error = new Error('Format de mot de passe invalide');
      error.errors = passwordValidation.errors;
      throw error;
    }
  }
  
  // Vérifier si l'email existe déjà
  const existingUser = await Utilisateur.findOne({
    where: { email: userData.email.toLowerCase().trim() }
  });
  
  if (existingUser) {
    throw new Error('Cet email est déjà utilisé');
  }
  
  // Créer l'utilisateur
  const user = await Utilisateur.create({
    email: userData.email.toLowerCase().trim(),
    password_hash: userData.password,
    nom: userData.nom.trim(),
    prenom: userData.prenom.trim(),
    role: userData.role || 'stagiaire',
    telephone: userData.telephone || null,
    photo_url: userData.photo_url || null,
    entity: userData.entity || null,
    departement_id: userData.departement_id || null,
    is_active: true
  });
  
  // Logger l'événement
  await AuditLog.log({
    userId: createdBy,
    action: AuditLog.ACTIONS.USER_CREATED,
    ipAddress,
    resourceType: 'user',
    resourceId: user.id,
    details: { createdUserId: user.id, role: user.role }
  });
  
  return user.toPublicJSON();
}

/**
 * Met à jour un utilisateur existant
 * @param {number} userId - ID de l'utilisateur à mettre à jour
 * @param {object} updateData - Données à mettre à jour
 * @param {number} updatedBy - ID de l'utilisateur faisant la mise à jour
 * @param {string} ipAddress - Adresse IP
 * @returns {object} - Utilisateur mis à jour
 */
async function updateUser(userId, updateData, updatedBy, ipAddress) {
  const user = await Utilisateur.findByPk(userId);
  
  if (!user) {
    throw new Error('Utilisateur introuvable');
  }
  
  // Vérifier si le nouvel email est disponible (si modifié)
  if (updateData.email && updateData.email.toLowerCase() !== user.email) {
    const existingUser = await Utilisateur.findOne({
      where: { email: updateData.email.toLowerCase() }
    });
    
    if (existingUser) {
      throw new Error('Cet email est déjà utilisé');
    }
  }
  
  // Préparer les données de mise à jour
  const allowedFields = [
    'nom', 'prenom', 'telephone', 'photo_url', 
    'entity', 'departement_id', 'role', 'is_active'
  ];
  
  const updates = {};
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      updates[field] = updateData[field];
    }
  }
  
  // Ne pas permettre la modification du mot de passe par cette méthode
  // Utiliser changePassword pour cela
  
  // Mettre à jour l'utilisateur
  await user.update(updates);
  
  // Logger l'événement
  await AuditLog.log({
    userId: updatedBy,
    action: AuditLog.ACTIONS.USER_UPDATED,
    ipAddress,
    resourceType: 'user',
    resourceId: user.id,
    details: { updatedFields: Object.keys(updates) }
  });
  
  return user.toPublicJSON();
}

/**
 * Supprime un utilisateur (désactivation soft delete)
 * @param {number} userId - ID de l'utilisateur à supprimer
 * @param {number} deletedBy - ID de l'utilisateur supprimant
 * @param {string} ipAddress - Adresse IP
 * @returns {boolean} - Succès
 */
async function deleteUser(userId, deletedBy, ipAddress) {
  const user = await Utilisateur.findByPk(userId);
  
  if (!user) {
    throw new Error('Utilisateur introuvable');
  }
  
  // Empêcher la suppression du dernier Super Admin
  if (user.role === 'super_admin') {
    const adminCount = await Utilisateur.count({
      where: { role: 'super_admin', is_active: true }
    });
    
    if (adminCount <= 1) {
      throw new Error('Impossible de supprimer le dernier Super Admin');
    }
  }
  
  // Désactiver au lieu de supprimer (soft delete)
  await user.deactivate();
  
  // Logger l'événement
  await AuditLog.log({
    userId: deletedBy,
    action: AuditLog.ACTIONS.USER_DELETED,
    ipAddress,
    resourceType: 'user',
    resourceId: user.id
  });
  
  return true;
}

/**
 * Active un utilisateur
 * @param {number} userId - ID de l'utilisateur à activer
 * @param {number} activatedBy - ID de l'utilisateur activant
 * @param {string} ipAddress - Adresse IP
 * @returns {object} - Utilisateur activé
 */
async function activateUser(userId, activatedBy, ipAddress) {
  const user = await Utilisateur.findByPk(userId);
  
  if (!user) {
    throw new Error('Utilisateur introuvable');
  }
  
  await user.activate();
  
  // Logger l'événement
  await AuditLog.log({
    userId: activatedBy,
    action: AuditLog.ACTIONS.USER_ACTIVATED,
    ipAddress,
    resourceType: 'user',
    resourceId: user.id
  });
  
  return user.toPublicJSON();
}

/**
 * Désactive un utilisateur
 * @param {number} userId - ID de l'utilisateur à désactiver
 * @param {number} deactivatedBy - ID de l'utilisateur désactivant
 * @param {string} ipAddress - Adresse IP
 * @returns {object} - Utilisateur désactivé
 */
async function deactivateUser(userId, deactivatedBy, ipAddress) {
  const user = await Utilisateur.findByPk(userId);
  
  if (!user) {
    throw new Error('Utilisateur introuvable');
  }
  
  // Empêcher la désactivation du dernier Super Admin
  if (user.role === 'super_admin') {
    const adminCount = await Utilisateur.count({
      where: { role: 'super_admin', is_active: true }
    });
    
    if (adminCount <= 1) {
      throw new Error('Impossible de désactiver le dernier Super Admin');
    }
  }
  
  await user.deactivate();
  
  // Logger l'événement
  await AuditLog.log({
    userId: deactivatedBy,
    action: AuditLog.ACTIONS.USER_DEACTIVATED,
    ipAddress,
    resourceType: 'user',
    resourceId: user.id
  });
  
  return user.toPublicJSON();
}

/**
 * Récupère un utilisateur par ID
 * @param {number} userId - ID de l'utilisateur
 * @returns {object} - Utilisateur
 */
async function getUserById(userId) {
  const user = await Utilisateur.findByPk(userId);
  
  if (!user) {
    throw new Error('Utilisateur introuvable');
  }
  
  return user.toPublicJSON();
}

/**
 * Liste les utilisateurs avec filtres
 * @param {object} filters - Filtres de recherche
 * @returns {array} - Liste des utilisateurs
 */
async function listUsers(filters = {}) {
  const where = {};
  
  if (filters.role) {
    where.role = filters.role;
  }
  
  if (filters.entity) {
    where.entity = filters.entity;
  }
  
  if (filters.departement_id) {
    where.departement_id = filters.departement_id;
  }
  
  if (filters.is_active !== undefined) {
    where.is_active = filters.is_active;
  }
  
  if (filters.search) {
    where[Op.or] = [
      { nom: { [Op.like]: `%${filters.search}%` } },
      { prenom: { [Op.like]: `%${filters.search}%` } },
      { email: { [Op.like]: `%${filters.search}%` } }
    ];
  }
  
  const users = await Utilisateur.findAll({
    where,
    order: [['prenom', 'ASC'], ['nom', 'ASC']],
    limit: filters.limit || 100,
    offset: filters.offset || 0
  });
  
  return users.map(u => u.toPublicJSON());
}

/**
 * Met à jour le profil utilisateur (par l'utilisateur lui-même)
 * @param {number} userId - ID de l'utilisateur
 * @param {object} profileData - Données du profil
 * @returns {object} - Utilisateur mis à jour
 */
async function updateProfile(userId, profileData) {
  const user = await Utilisateur.findByPk(userId);
  
  if (!user) {
    throw new Error('Utilisateur introuvable');
  }
  
  // Champs modifiables par l'utilisateur lui-même
  const allowedFields = ['nom', 'prenom', 'telephone', 'photo_url'];
  
  const updates = {};
  for (const field of allowedFields) {
    if (profileData[field] !== undefined) {
      updates[field] = profileData[field];
    }
  }
  
  await user.update(updates);
  
  return user.toPublicJSON();
}

module.exports = {
  createUser,
  updateUser,
  deleteUser,
  activateUser,
  deactivateUser,
  getUserById,
  listUsers,
  updateProfile
};
