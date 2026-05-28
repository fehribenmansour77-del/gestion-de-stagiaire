/**
 * Routes de gestion des utilisateurs
 * Endpoints pour le CRUD des utilisateurs
 */

const express = require('express');
const router = express.Router();
const userService = require('../services/userService');
const { authenticate } = require('../middleware/auth');
const { requireRole, ROLES } = require('../middleware/rbac');

/**
 * Middleware pour vérifier que seul le Super Admin peut gérer les utilisateurs
 */
const requireUserManagement = [
  authenticate,
  requireRole(ROLES.SUPER_ADMIN, ROLES.ADMIN_RH)
];

/**
 * GET /api/users
 * Liste des utilisateurs (avec filtres)
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    // Seuls Super Admin et Admin RH peuvent lister tous les utilisateurs
    // Les stagiaires peuvent lister uniquement les RH/Admins pour les contacter
    const isSpecialist = [ROLES.SUPER_ADMIN, ROLES.ADMIN_RH].includes(req.user.role);
    
    // Vérification des rôles demandés si c'est un stagiaire
    const requestedRoles = Array.isArray(req.query.role) ? req.query.role : [req.query.role];
    const isStagiaireLookingForRH = req.user.role === 'stagiaire' && 
                                   requestedRoles.every(r => ['admin_rh', 'super_admin'].includes(r));

    if (!isSpecialist && !isStagiaireLookingForRH) {
      return res.status(403).json({ error: 'Accès refusé. Vous ne pouvez lister que le service RH et Administration.' });
    }
    
    const filters = {
      role: req.query.role,
      entity: req.query.entity,
      departement_id: req.query.departement_id ? parseInt(req.query.departement_id) : undefined,
      is_active: req.query.is_active === 'true' ? true : req.query.is_active === 'false' ? false : undefined,
      search: req.query.search,
      limit: req.query.limit ? parseInt(req.query.limit) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset) : undefined
    };
    
    const users = await userService.listUsers(filters);
    res.json(users);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/:id
 * Détails d'un utilisateur
 */
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Vérifier les permissions
    // Un utilisateur peut voir son propre profil
    // Super Admin et Admin RH peuvent voir tous les profils
    if (req.user.id !== userId && 
        ![ROLES.SUPER_ADMIN, ROLES.ADMIN_RH].includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    
    const user = await userService.getUserById(userId);
    res.json(user);
  } catch (error) {
    if (error.message === 'Utilisateur introuvable') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

/**
 * POST /api/users
 * Créer un nouvel utilisateur
 */
router.post('/', requireUserManagement, async (req, res, next) => {
  try {
    const userData = req.body;
    
    // Validation des champs requis
    if (!userData.email || !userData.password || 
        !userData.nom || !userData.prenom) {
      return res.status(400).json({ 
        error: 'Email, mot de passe, nom et prénom requis' 
      });
    }
    
    // Vérifier que le rôle est valide
    const validRoles = Object.values(ROLES);
    if (userData.role && !validRoles.includes(userData.role)) {
      return res.status(400).json({ 
        error: 'Rôle invalide',
        validRoles 
      });
    }
    
    const user = await userService.createUser(
      userData,
      req.user.id,
      req.ip
    );
    
    res.status(201).json(user);
  } catch (error) {
    if (error.errors) {
      return res.status(400).json({ 
        error: error.message,
        details: error.errors
      });
    }
    if (error.message.includes('déjà utilisé')) {
      return res.status(409).json({ error: error.message });
    }
    next(error);
  }
});

/**
 * PUT /api/users/:id
 * Mettre à jour un utilisateur
 */
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    const updateData = req.body;
    
    // Vérifier les permissions
    // Un utilisateur peut modifier son propre profil (limité)
    // Super Admin peut tout modifier
    // Admin RH peut modifier certains champs
    const canEdit = req.user.id === userId || 
                   req.user.role === ROLES.SUPER_ADMIN ||
                   req.user.role === ROLES.ADMIN_RH;
    
    if (!canEdit) {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    
    // Si c'est l'utilisateur lui-même, limiter les champs modifiables
    if (req.user.id === userId && 
        req.user.role !== ROLES.SUPER_ADMIN) {
      // Limiter aux champs du profil
      delete updateData.role;
      delete updateData.is_active;
      delete updateData.entity;
      delete updateData.departement_id;
    }
    
    const user = await userService.updateUser(
      userId,
      updateData,
      req.user.id,
      req.ip
    );
    
    res.json(user);
  } catch (error) {
    if (error.errors) {
      return res.status(400).json({ 
        error: error.message,
        details: error.errors
      });
    }
    if (error.message.includes('déjà utilisé')) {
      return res.status(409).json({ error: error.message });
    }
    if (error.message === 'Utilisateur introuvable') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

/**
 * PUT /api/users/:id/profile
 * Mettre à jour le profil utilisateur (raccourci)
 */
router.put('/:id/profile', authenticate, async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Un utilisateur ne peut modifier que son propre profil
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    
    const user = await userService.updateProfile(userId, req.body);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/users/:id
 * Supprimer (désactiver) un utilisateur
 */
router.delete('/:id', requireUserManagement, async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Empêcher l'auto-suppression
    if (req.user.id === userId) {
      return res.status(400).json({ 
        error: 'Vous ne pouvez pas supprimer votre propre compte' 
      });
    }
    
    await userService.deleteUser(userId, req.user.id, req.ip);
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    if (error.message === 'Utilisateur introuvable') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('Super Admin')) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

/**
 * PATCH /api/users/:id/activate
 * Activer un utilisateur
 */
router.patch('/:id/activate', requireUserManagement, async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    
    const user = await userService.activateUser(
      userId,
      req.user.id,
      req.ip
    );
    
    res.json(user);
  } catch (error) {
    if (error.message === 'Utilisateur introuvable') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

/**
 * PATCH /api/users/:id/deactivate
 * Désactiver un utilisateur
 */
router.patch('/:id/deactivate', requireUserManagement, async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Empêcher l'auto-désactivation
    if (req.user.id === userId) {
      return res.status(400).json({ 
        error: 'Vous ne pouvez pas désactiver votre propre compte' 
      });
    }
    
    const user = await userService.deactivateUser(
      userId,
      req.user.id,
      req.ip
    );
    
    res.json(user);
  } catch (error) {
    if (error.message === 'Utilisateur introuvable') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('Super Admin')) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

/**
 * PATCH /api/users/:id/role
 * Changer le rôle d'un utilisateur
 */
router.patch('/:id/role', requireRole(ROLES.SUPER_ADMIN), async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    const { role } = req.body;
    
    if (!role) {
      return res.status(400).json({ error: 'Rôle requis' });
    }
    
    const validRoles = Object.values(ROLES);
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        error: 'Rôle invalide',
        validRoles 
      });
    }
    
    const user = await userService.updateUser(
      userId,
      { role },
      req.user.id,
      req.ip
    );
    
    res.json(user);
  } catch (error) {
    if (error.message === 'Utilisateur introuvable') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

module.exports = router;
