/**
 * Middleware d'authentification JWT
 * Gère la vérification des tokens et la session utilisateur
 */

const jwt = require('jsonwebtoken');
const { Utilisateur } = require('../models');
const { authorize } = require('./rbac');  // Import depuis rbac

// Configuration JWT
const JWT_SECRET = process.env.JWT_SECRET || 'gestion-stagiaires-secret-key-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h'; // 24 heures selon spécification
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes selon spécification

// Stockage en mémoire des sessions (en production, utiliser Redis)
const sessions = new Map();

/**
 * Génère un token JWT pour un utilisateur
 */
function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    entity: user.entity,
    departement_id: user.departement_id
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/**
 * Extrait le token de l'en-tête Authorization
 */
function extractToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Middleware d'authentification JWT
 */
async function authenticate(req, res, next) {
  try {
    // Extraire le token
    const token = extractToken(req.headers.authorization);
    
    if (!token) {
      return res.status(401).json({ error: 'Token d\'authentification requis' });
    }
    
    // Vérifier et décoder le token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expiré' });
      }
      return res.status(401).json({ error: 'Token invalide' });
    }
    
    // Vérifier si la session n'a pas expiré (timeout de 30 min)
    const session = sessions.get(decoded.id);
    if (session) {
      const lastActivity = session.lastActivity;
      const now = Date.now();
      
      if (now - lastActivity > SESSION_TIMEOUT) {
        sessions.delete(decoded.id);
        return res.status(401).json({ error: 'Session expirée' });
      }
      
      // Mettre à jour l'activité
      session.lastActivity = now;
    }
    
    // Récupérer l'utilisateur depuis la base de données
    const user = await Utilisateur.findByPk(decoded.id);
    
    if (!user) {
      return res.status(401).json({ error: 'Utilisateur introuvable' });
    }
    
    if (!user.is_active) {
      return res.status(401).json({ error: 'Compte désactivé' });
    }
    
    // Ajouter l'utilisateur à la requête
    req.user = user;
    req.token = token;
    
    // Enregistrer la session
    sessions.set(user.id, {
      lastActivity: Date.now(),
      loginTime: session?.loginTime || Date.now()
    });
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    try { require('fs').appendFileSync('error.log', '\n--- ERREUR AUTHENTIFICATION 500 ---\n' + error.stack + '\n'); } catch(e){}
    return res.status(500).json({ error: 'Erreur d\'authentification', details: error.message });
  }
}

/**
 * Middleware optionnel d'authentification
 * Ne bloque pas si pas de token, mais ajoute l'utilisateur si présent
 */
async function optionalAuth(req, res, next) {
  try {
    const token = extractToken(req.headers.authorization);
    
    if (!token) {
      return next();
    }
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await Utilisateur.findByPk(decoded.id);
      
      if (user && user.is_active) {
        req.user = user;
      }
    } catch (err) {
      // Token invalide, on continue sans utilisateur
    }
    
    next();
  } catch (error) {
    next();
  }
}

/**
 * Déconnexion - supprime la session
 */
function logout(userId) {
  sessions.delete(userId);
}

/**
 * Nettoyage des sessions expirées
 */
function cleanupSessions() {
  const now = Date.now();
  for (const [userId, session] of sessions.entries()) {
    if (now - session.lastActivity > SESSION_TIMEOUT) {
      sessions.delete(userId);
    }
  }
}

// Nettoyer les sessions toutes les 5 minutes
setInterval(cleanupSessions, 5 * 60 * 1000);

module.exports = {
  generateToken,
  authenticate,
  optionalAuth,
  logout,
  authorize,  // Réexport depuis rbac
  JWT_SECRET,
  JWT_EXPIRY,
  SESSION_TIMEOUT
};
