/**
 * Middleware RBAC (Role-Based Access Control)
 * Gère les permissions basées sur les rôles utilisateur
 */

// Définition des rôles selon la constitution
const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN_RH: 'admin_rh',
  CHEF_DEPARTEMENT: 'chef_departement',
  TUTEUR: 'tuteur',
  STAGIAIRE: 'stagiaire'
};

// Définition des permissions par rôle
const PERMISSIONS = {
  // Super Admin - Accès complet
  [ROLES.SUPER_ADMIN]: [
    // Users
    'users:create', 'users:read', 'users:update', 'users:delete',
    'users:activate', 'users:deactivate', 'users:assign-role',
    // Departments
    'departements:create', 'departements:read', 'departements:update', 'departements:delete',
    // Org Charts
    'org:read', 'org:manage',
    // Stagiaires
    'stagiaires:create', 'stagiaires:read', 'stagiaires:update', 'stagiaires:delete',
    // Candidatures
    'candidatures:read', 'candidatures:accept', 'candidatures:reject',
    // Conventions
    'conventions:create', 'conventions:read', 'conventions:sign',
    // Présences
    'presences:read', 'presences:create', 'presences:update',
    // Evaluations
    'evaluations:create', 'evaluations:read', 'evaluations:update',
    // Documents
    'documents:read', 'documents:create', 'documents:download',
    // Dashboard
    'dashboard:read',
    // Notifications
    'notifications:read', 'notifications:send',
    // System
    'system:configure'
  ],
  
  // Admin RH - Gestion RH complète
  [ROLES.ADMIN_RH]: [
    // Users
    'users:read',
    // Departments
    'departements:read',
    // Stagiaires
    'stagiaires:create', 'stagiaires:read', 'stagiaires:update',
    // Candidatures
    'candidatures:read', 'candidatures:accept', 'candidatures:reject',
    // Conventions
    'conventions:create', 'conventions:read', 'conventions:sign',
    // Présences
    'presences:read', 'presences:create', 'presences:update',
    // Evaluations
    'evaluations:create', 'evaluations:read', 'evaluations:update',
    // Documents
    'documents:read', 'documents:create', 'documents:download',
    // Dashboard
    'dashboard:read',
    // Notifications
    'notifications:read', 'notifications:send'
  ],
  
  // Chef de Département - Gestion au niveau département
  [ROLES.CHEF_DEPARTEMENT]: [
    // Users
    'users:read',
    // Departments
    'departements:read',
    // Stagiaires
    'stagiaires:read', 'stagiaires:update',
    // Tuteurs
    'tuteurs:assign',
    // Conventions
    'conventions:read', 'conventions:sign',
    // Présences
    'presences:read', 'presences:create', 'presences:update',
    // Evaluations
    'evaluations:create', 'evaluations:read', 'evaluations:update',
    // Documents
    'documents:read', 'documents:download',
    // Dashboard
    'dashboard:read'
  ],
  
  // Tuteur - Accès aux stagiaires assignés
  [ROLES.TUTEUR]: [
    // Stagiaires (ses propres stagiaires seulement)
    'stagiaires:read',
    // Présences
    'presences:read', 'presences:create', 'presences:update',
    // Evaluations
    'evaluations:create', 'evaluations:read', 'evaluations:update',
    // Documents
    'documents:read', 'documents:download',
    // Dashboard
    'dashboard:read'
  ],
  
  // Stagiaire - Accès en lecture seule à son propre dossier
  [ROLES.STAGIAIRE]: [
    // Son propre profil
    'profile:read', 'profile:update',
    // Ses documents
    'documents:read', 'documents:download',
    // Dashboard (limité)
    'dashboard:read:own'
  ]
};

/**
 * Vérifie si un rôle a une permission spécifique
 */
function hasPermission(role, permission) {
  const rolePermissions = PERMISSIONS[role] || [];
  return rolePermissions.includes(permission);
}

/**
 * Middleware RBAC - Vérifie une permission spécifique
 */
function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentification requise' });
    }
    
    if (!hasPermission(req.user.role, permission)) {
      // Logger l'accès refusé
      const { logAuditEvent } = require('../services/auditService');
      logAuditEvent({
        userId: req.user.id,
        action: 'ACCESS_DENIED',
        ipAddress: req.ip,
        details: { 
          permission, 
          userRole: req.user.role,
          path: req.path 
        }
      });
      
      return res.status(403).json({ 
        error: 'Accès refusé',
        required: permission,
        current: req.user.role
      });
    }
    
    next();
  };
}

/**
 * Middleware RBAC - Vérifie un des rôles spécifiés
 */
function requireRole(...roles) {
  // Flatten: supporte authorize('admin', 'rh') ET authorize(['admin', 'rh'])
  const flatRoles = roles.flat();
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentification requise' });
    }
    
    if (!flatRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Rôle insuffisant',
        required: flatRoles,
        current: req.user.role
      });
    }
    
    next();
  };
}

/**
 * Middleware RBAC - Vérifie que l'utilisateur peut accéder à une ressource
 * Prend en compte les restrictions par entité et département
 */
function requireAccess(resourceType) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentification requise' });
    }
    
    const user = req.user;
    const userRole = user.role;
    const userEntity = user.entity;
    const userDepartementId = user.departement_id;
    
    // Super Admin a toujours accès
    if (userRole === ROLES.SUPER_ADMIN) {
      return next();
    }
    
    // Vérification par type de ressource
    switch (resourceType) {
      case 'stagiaire':
        // Admin RH et Chef de département ont accès
        if (userRole === ROLES.ADMIN_RH || userRole === ROLES.CHEF_DEPARTEMENT) {
          return next();
        }
        // Tuteur n'accède qu'à ses stagiaires assignés (à implémenter avec une vérification supplémentaire)
        if (userRole === ROLES.TUTEUR) {
          // Cette vérification sera faite au niveau du service
          return next();
        }
        // Stagiaire n'accède qu'à son propre dossier
        if (userRole === ROLES.STAGIAIRE) {
          const requestedId = req.params.id;
          if (requestedId && parseInt(requestedId) !== user.id) {
            return res.status(403).json({ error: 'Accès refusé à ce stagiaire' });
          }
          return next();
        }
        break;
        
      case 'candidature':
      case 'convention':
      case 'evaluation':
      case 'presence':
        // Accès selon le rôle
        if ([ROLES.ADMIN_RH, ROLES.CHEF_DEPARTEMENT, ROLES.TUTEUR].includes(userRole)) {
          return next();
        }
        break;
        
      case 'document':
        // Tout utilisateur connecté peut lire ses propres documents
        return next();
        
      default:
        break;
    }
    
    return res.status(403).json({ error: 'Accès refusé à cette ressource' });
  };
}

/**
 * Vérifie si un utilisateur peut accéder à une ressource spécifique
 * Utilisé pour les vérifications au niveau service
 */
function canAccess(user, resource, action) {
  // Super Admin a toujours accès
  if (user.role === ROLES.SUPER_ADMIN) {
    return true;
  }
  
  const permission = `${resource}:${action}`;
  return hasPermission(user.role, permission);
}

module.exports = {
  ROLES,
  PERMISSIONS,
  hasPermission,
  requirePermission,
  requireRole,
  requireAccess,
  canAccess,
  authorize: requireRole  // Alias pour requireRole (compatibilité)
};
