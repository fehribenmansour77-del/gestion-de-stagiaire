/**
 * Routes API: Gestion des Départements
 * Endpoints pour CRUD des départements
 */

const express = require('express');
const router = express.Router();
const { Departement, Utilisateur, Stagiaire } = require('../models');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { Op } = require('sequelize');

// Middleware: tous les routes nécessitent authentication
router.use(authenticate);

/**
 * GET /api/departements
 * Liste tous les départements avec filtrage optionnel par entité
 */
router.get('/', async (req, res, next) => {
  try {
    const { entity } = req.query;
    
    // Construction des filtres
    const where = {};
    
    // Par défaut, afficher uniquement les départements actifs
    where.est_actif = true;
    
    // Filtrage par entité (GIAS, CSM, SHARED)
    if (entity && ['GIAS', 'CSM', 'SHARED'].includes(entity)) {
      where.entity = entity;
    }
    
    // Récupérer les départements avec leurs relations
    const departements = await Departement.findAll({
      where,
      include: [
        {
          model: Departement,
          as: 'parent',
          attributes: ['id', 'nom', 'code']
        },
        {
          model: Utilisateur,
          as: 'responsable',
          attributes: ['id', 'nom', 'prenom', 'email']
        },
        {
          model: Stagiaire,
          as: 'stagiaires',
          where: { statut: 'actif' },
          required: false,
          attributes: ['id']
        }
      ],
      order: [
        ['entity', 'ASC'],
        ['nom', 'ASC']
      ]
    });
    
    // Calculate the number of active interns for each department
    const departementsData = departements.map(d => {
      const data = d.toJSON();
      data.nombre_stagiaires = data.stagiaires ? data.stagiaires.length : 0;
      delete data.stagiaires; // We don't need the whole list, just the count
      return data;
    });
    
    res.json({
      success: true,
      data: departementsData
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/departements/tree
 * Récupère l'arbre complet des départements
 */
router.get('/tree', async (req, res, next) => {
  try {
    const { entity } = req.query;
    
    const where = { est_actif: true };
    if (entity && ['GIAS', 'CSM', 'SHARED'].includes(entity)) {
      where.entity = entity;
    }
    
    // Récupérer tous les départements racine
    const rootDepartements = await Departement.findAll({
      where: {
        ...where,
        parent_id: null
      },
      include: [
        {
          model: Utilisateur,
          as: 'responsable',
          attributes: ['id', 'nom', 'prenom', 'email']
        }
      ],
      order: [['nom', 'ASC']]
    });
    
    // Fonction récursive pour construire l'arbre
    const buildTree = async (parentId) => {
      const children = await Departement.findAll({
        where: { ...where, parent_id: parentId },
        include: [
          {
            model: Utilisateur,
            as: 'responsable',
            attributes: ['id', 'nom', 'prenom', 'email']
          }
        ],
        order: [['nom', 'ASC']]
      });
      
      const result = [];
      for (const child of children) {
        result.push({
          ...child.toJSON(),
          children: await buildTree(child.id)
        });
      }
      
      return result;
    };
    
    // Construire l'arbre
    const tree = [];
    for (const root of rootDepartements) {
      tree.push({
        ...root.toJSON(),
        children: await buildTree(root.id)
      });
    }
    
    res.json({
      success: true,
      data: tree
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/departements/:id
 * Récupère un département par son ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const departement = await Departement.findByPk(id, {
      include: [
        {
          model: Departement,
          as: 'parent',
          attributes: ['id', 'nom', 'code']
        },
        {
          model: Departement,
          as: 'children',
          attributes: ['id', 'nom', 'code']
        },
        {
          model: Utilisateur,
          as: 'responsable',
          attributes: ['id', 'nom', 'prenom', 'email']
        },
        {
          model: Utilisateur,
          as: 'membres',
          attributes: ['id', 'nom', 'prenom', 'email', 'role']
        }
      ]
    });
    
    if (!departement) {
      return res.status(404).json({
        success: false,
        error: 'Département non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: departement
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/departements
 * Crée un nouveau département
 * Réservé au Super Admin
 */
router.post('/', 
  authorize('super_admin'), 
  async (req, res, next) => {
    try {
      const { nom, code, description, entity, parent_id, capacite_accueil, responsable_id } = req.body;
      
      // Validation des champs requis
      if (!nom || !code || !entity) {
        return res.status(400).json({
          success: false,
          error: 'Les champs nom, code et entity sont requis'
        });
      }
      
      // Validation de l'entité
      if (!['GIAS', 'CSM', 'SHARED'].includes(entity)) {
        return res.status(400).json({
          success: false,
          error: 'L\'entité doit être GIAS, CSM ou SHARED'
        });
      }
      
      // Vérifier l'unicité du code
      const existingDepartement = await Departement.findOne({
        where: { code: code.toUpperCase() }
      });
      
      if (existingDepartement) {
        return res.status(400).json({
          success: false,
          error: 'Un département avec ce code existe déjà'
        });
      }
      
      // Vérifier que le parent existe si fourni
      if (parent_id) {
        const parentExists = await Departement.findByPk(parent_id);
        if (!parentExists) {
          return res.status(400).json({
            success: false,
            error: 'Le département parent n\'existe pas'
          });
        }
      }
      
      // Vérifier que le responsable existe si fourni
      if (responsable_id) {
        const responsableExists = await Utilisateur.findByPk(responsable_id);
        if (!responsableExists) {
          return res.status(400).json({
            success: false,
            error: 'L\'utilisateur responsable n\'existe pas'
          });
        }
      }
      
      // Créer le département
      const departement = await Departement.create({
        nom,
        code: code.toUpperCase(),
        description,
        entity,
        parent_id: parent_id || null,
        capacite_accueil: capacite_accueil || 10,
        responsable_id: responsable_id || null
      });
      
      // Journalisation
      const { logAuditEvent } = require('../services/auditService');
      logAuditEvent({
        userId: req.user.id,
        action: 'CREATE_DEPARTEMENT',
        entityType: 'Departement',
        entityId: departement.id,
        ipAddress: req.ip,
        details: { nom: departement.nom, code: departement.code, entity }
      });
      
      res.status(201).json({
        success: true,
        data: departement
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/departements/:id
 * Met à jour un département existant
 * Réservé au Super Admin
 */
router.put('/:id', 
  authorize('super_admin'), 
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { nom, code, description, entity, parent_id, capacite_accueil, responsable_id, est_actif } = req.body;
      
      const departement = await Departement.findByPk(id);
      
      if (!departement) {
        return res.status(404).json({
          success: false,
          error: 'Département non trouvé'
        });
      }
      
      // Vérifier l'unicité du code si modifié
      if (code && code.toUpperCase() !== departement.code) {
        const existingDepartement = await Departement.findOne({
          where: { code: code.toUpperCase() }
        });
        
        if (existingDepartement) {
          return res.status(400).json({
            success: false,
            error: 'Un département avec ce code existe déjà'
          });
        }
      }
      
      // Vérifier que le parent existe si fourni et n'est pas lui-même
      if (parent_id) {
        if (parseInt(parent_id) === departement.id) {
          return res.status(400).json({
            success: false,
            error: 'Un département ne peut pas être son propre parent'
          });
        }
        
        const parentExists = await Departement.findByPk(parent_id);
        if (!parentExists) {
          return res.status(400).json({
            success: false,
            error: 'Le département parent n\'existe pas'
          });
        }
      }
      
      // Vérifier que le responsable existe si fourni
      if (responsable_id) {
        const responsableExists = await Utilisateur.findByPk(responsable_id);
        if (!responsableExists) {
          return res.status(400).json({
            success: false,
            error: 'L\'utilisateur responsable n\'existe pas'
          });
        }
      }
      
      // Mettre à jour le département
      await departement.update({
        nom: nom || departement.nom,
        code: code ? code.toUpperCase() : departement.code,
        description: description !== undefined ? description : departement.description,
        entity: entity || departement.entity,
        parent_id: parent_id !== undefined ? parent_id : departement.parent_id,
        capacite_accueil: capacite_accueil !== undefined ? capacite_accueil : departement.capacite_accueil,
        responsable_id: responsable_id !== undefined ? responsable_id : departement.responsable_id,
        est_actif: est_actif !== undefined ? est_actif : departement.est_actif
      });
      
      // Journalisation
      const { logAuditEvent } = require('../services/auditService');
      logAuditEvent({
        userId: req.user.id,
        action: 'UPDATE_DEPARTEMENT',
        entityType: 'Departement',
        entityId: departement.id,
        ipAddress: req.ip,
        details: { nom: departement.nom }
      });
      
      res.json({
        success: true,
        data: departement
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/departements/:id
 * Désactive un département (soft delete)
 * Réservé au Super Admin
 */
router.delete('/:id', 
  authorize('super_admin'), 
  async (req, res, next) => {
    try {
      const { id } = req.params;
      
      const departement = await Departement.findByPk(id);
      
      if (!departement) {
        return res.status(404).json({
          success: false,
          error: 'Département non trouvé'
        });
      }
      
      // Vérifier si le département a des enfants
      const childrenCount = await Departement.count({
        where: { parent_id: id }
      });
      
      if (childrenCount > 0) {
        return res.status(400).json({
          success: false,
          error: 'Impossible de supprimer un département qui a des sous-départements. Veuillez d\'abord les supprimer ou les déplacer.'
        });
      }
      
      // Désactiver le département
      await departement.update({ est_actif: false });
      
      // Journalisation
      const { logAuditEvent } = require('../services/auditService');
      logAuditEvent({
        userId: req.user.id,
        action: 'DELETE_DEPARTEMENT',
        entityType: 'Departement',
        entityId: departement.id,
        ipAddress: req.ip,
        details: { nom: departement.nom }
      });
      
      res.json({
        success: true,
        message: 'Département désactivé avec succès'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/departements/:id/hierarchy
 * Récupère la hiérarchie complète d'un département
 */
router.get('/:id/hierarchy', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const departement = await Departement.findByPk(id);
    
    if (!departement) {
      return res.status(404).json({
        success: false,
        error: 'Département non trouvé'
      });
    }
    
    // Récupérer les ancêtres
    const ancestors = [];
    let current = departement;
    
    while (current && current.parent_id) {
      const parent = await Departement.findByPk(current.parent_id);
      if (parent) {
        ancestors.push(parent);
        current = parent;
      } else {
        break;
      }
    }
    
    // Récupérer les descendants (enfants directs et indirects)
    const getDescendants = async (parentId, level = 0) => {
      if (level > 3) return []; // Limiter à 3 niveaux
      
      const children = await Departement.findAll({
        where: { parent_id: parentId, est_actif: true }
      });
      
      const descendants = [];
      for (const child of children) {
        const childDescendants = await getDescendants(child.id, level + 1);
        descendants.push({
          ...child.toJSON(),
          children: childDescendants
        });
      }
      
      return descendants;
    };
    
    const descendants = await getDescendants(id);
    
    res.json({
      success: true,
      data: {
        ...departement.toJSON(),
        ancestors: ancestors.reverse(),
        children: descendants
      }
    });
  } catch (error) {
    next(error);
  }
});


/**
 * GET /api/departements/:id/tuteurs
 * Récupère les tuteurs d'un département avec leur capacité d'encadrement
 */
router.get('/:id/tuteurs', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const departement = await Departement.findByPk(id);
    
    if (!departement) {
      return res.status(404).json({
        success: false,
        error: 'Département non trouvé'
      });
    }
    
    // Récupérer les tuteurs du département
    const tuteurs = await Utilisateur.findAll({
      where: {
        departement_id: id,
        role: 'tuteur',
        is_active: true
      },
      attributes: ['id', 'nom', 'prenom', 'email', 'departement_id']
    });
    
    // Pour chaque tuteur, calculer le nombre de stagiaires actuels
    // et la capacité max (par défaut 5)
    const tuteursWithCapacity = await Promise.all(
      tuteurs.map(async (tuteur) => {
        const currentStagiaires = await Stagiaire.count({
          where: {
            tuteur_id: tuteur.id,
            statut: 'actif'
          }
        });
        
        return {
          id: tuteur.id,
          nom: tuteur.nom,
          prenom: tuteur.prenom,
          email: tuteur.email,
          capacite_max: 5, // Par défaut
          stagiaires_actuels: currentStagiaires,
          disponible: currentStagiaires < 5
        };
      })
    );
    
    res.json({
      success: true,
      data: tuteursWithCapacity
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
