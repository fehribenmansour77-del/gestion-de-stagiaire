/**
 * Service d'authentification
 * Gère la connexion et la validation des utilisateurs
 */

const Utilisateur = require('../models/Utilisateur');
const LoginAttempt = require('../models/LoginAttempt');
const AuditLog = require('../models/AuditLog');
const { generateToken } = require('../middleware/auth');

/**
 * Valide les identifiants de connexion
 * @param {string} email - Email de l'utilisateur
 * @param {string} password - Mot de passe en clair
 * @param {string} ipAddress - Adresse IP du client
 * @param {string} userAgent - User agent du client
 * @returns {object} - Token et utilisateur
 */
async function login(email, password, ipAddress, userAgent) {
  // Normaliser l'email
  const normalizedEmail = email.toLowerCase().trim();
  
  // Rechercher l'utilisateur
  const user = await Utilisateur.findOne({ 
    where: { email: normalizedEmail } 
  });
  
  // Enregistrer la tentative (échec si utilisateur non trouvé)
  await LoginAttempt.record({
    email: normalizedEmail,
    ip_address: ipAddress,
    user_agent: userAgent,
    success: false,
    failure_reason: user ? 'INVALID_PASSWORD' : 'USER_NOT_FOUND'
  });
  
  // Vérifier si l'utilisateur existe
  if (!user) {
    // Ne pas révéler si l'utilisateur existe ou non
    throw new Error('Email ou mot de passe incorrect');
  }
  
  // Vérifier si le compte est actif
  if (!user.is_active) {
    await AuditLog.log({
      userId: user.id,
      action: AuditLog.ACTIONS.LOGIN_FAILED,
      ipAddress,
      userAgent,
      details: { reason: 'ACCOUNT_DISABLED' }
    });
    throw new Error('Compte désactivé');
  }
  
  // Vérifier le mot de passe
  const isValidPassword = await user.validatePassword(password);
  
  if (!isValidPassword) {
    await AuditLog.log({
      userId: user.id,
      action: AuditLog.ACTIONS.LOGIN_FAILED,
      ipAddress,
      userAgent,
      details: { reason: 'INVALID_PASSWORD' }
    });
    throw new Error('Email ou mot de passe incorrect');
  }
  
  // Mettre à jour la date de dernière connexion
  await user.updateLastLogin();
  
  // Enregistrer la tentative réussie
  await LoginAttempt.record({
    email: normalizedEmail,
    ip_address: ipAddress,
    user_agent: userAgent,
    success: true
  });
  
  // Générer le token JWT
  const token = generateToken(user);
  
  // Logger l'événement
  await AuditLog.log({
    userId: user.id,
    action: AuditLog.ACTIONS.LOGIN,
    ipAddress,
    userAgent
  });
  
  return {
    token,
    user: user.toPublicJSON()
  };
}

/**
 * Vérifie si un email existe pour la réinitialisation de mot de passe
 * @param {string} email - Email à vérifier
 * @returns {boolean} - True si l'email existe
 */
async function checkEmailExists(email) {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await Utilisateur.findOne({ 
    where: { email: normalizedEmail } 
  });
  return !!user;
}

/**
 * Obtient les informations de l'utilisateur connecté avec son contexte métier (Stagiaire/Candidature)
 * @param {number} userId - ID de l'utilisateur
 * @returns {object} - Données utilisateur avec profil stagiaire et candidature
 */
async function getCurrentUser(userId) {
  const { Utilisateur, Stagiaire, Candidature, Departement } = require('../models');
  
  const user = await Utilisateur.findByPk(userId, {
    include: [
      {
        model: Stagiaire,
        as: 'stages',
        where: { statut: 'actif' },
        required: false,
        include: [{ model: Departement, as: 'departement', attributes: ['nom', 'code'] }]
      }
    ]
  });
  
  if (!user) {
    throw new Error('Utilisateur introuvable');
  }
  
  const userData = user.toPublicJSON();
  
  // Si c'est un stagiaire, on cherche aussi sa candidature par email
  if (user.role === 'stagiaire') {
    const candidature = await Candidature.findOne({
      where: { email: user.email },
      order: [['created_at', 'DESC']]
    });
    userData.candidature = candidature;
    userData.stagiaire_active = user.stages && user.stages.length > 0 ? user.stages[0] : null;
  }
  
  return userData;
}

/**
 * Valide le format du mot de passe selon les exigences de sécurité
 * @param {string} password - Mot de passe à valider
 * @returns {object} - { valid: boolean, errors: string[] }
 */
function validatePasswordFormat(password) {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Enregistre un nouvel utilisateur (Candidat)
 * @param {object} userData - Données de l'utilisateur (nom, prenom, email, password)
 * @returns {object} - Utilisateur créé
 */
async function register(userData) {
  const { nom, prenom, email, password, telephone } = userData;
  
  // Normaliser l'email
  const normalizedEmail = email.toLowerCase().trim();
  
  // Vérifier si l'utilisateur existe déjà
  const existingUser = await Utilisateur.findOne({ 
    where: { email: normalizedEmail } 
  });
  
  if (existingUser) {
    throw new Error('Un compte existe déjà avec cet email');
  }
  
  // Valider le format du mot de passe
  const pwValidation = validatePasswordFormat(password);
  if (!pwValidation.valid) {
    throw new Error(pwValidation.errors[0]);
  }
  
  // Créer l'utilisateur
  const user = await Utilisateur.create({
    nom,
    prenom,
    email: normalizedEmail,
    password_hash: password, // Le hook beforeCreate s'occupera du hash
    telephone,
    role: 'stagiaire',
    is_active: true
  });
  
  // Générer le token pour la connexion automatique
  const token = generateToken(user);
  
  return {
    user: user.toPublicJSON(),
    token
  };
}

module.exports = {
  login,
  register,
  checkEmailExists,
  getCurrentUser,
  validatePasswordFormat
};
