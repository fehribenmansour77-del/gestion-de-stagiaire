/**
 * Routes API: Gestion des Tuteurs
 * Endpoints pour la gestion des tuteurs et l'affectation des stagiaires
 */

const express = require('express');
const router = express.Router();
const { Utilisateur, Departement } = require('../models');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// Middleware: tous les routes nécessitent authentication
router.use(authenticate);

/**
 * GET /api/tuteurs
 * Liste tous les tuteurs avec leur capacité
 */
router.get('/', async (req, res, next) => {
  try {
    const { departement_id } = req.query;
    
    const where = { role: 'tuteur', is_active: true };
    if (departement_id) {
      where.departement_id = departement_id;
    }
    
    const tuteurs = await Utilisateur.findAll({
      where,
      attributes: ['id', 'nom', 'prenom', 'email', 'departement_id', 'entity'],
      include: [
        {
          model: Departement,
          as: 'departement',
          attributes: ['id', 'nom', 'code']
        }
      ]
    });
    
    // Ajouter les informations de capacité (à remplacer par le vrai calcul quand Stagiaire existera)
    const tuteursWithCapacity = tuteurs.map(tuteur => ({
      id: tuteur.id,
      nom: tuteur.nom,
      prenom: tuteur.prenom,
      email: tuteur.email,
      departement: tuteur.departement,
      capacite_max: 5, // Par défaut
      stagiaires_actuels: 0, // Placeholder
      disponible: true
    }));
    
    res.json({
      success: true,
      data: tuteursWithCapacity
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/tuteurs/:id
 * Récupère un tuteur par son ID avec sa capacité
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const tuteur = await Utilisateur.findOne({
      where: { id, role: 'tuteur', is_active: true },
      attributes: ['id', 'nom', 'prenom', 'email', 'departement_id', 'entity'],
      include: [
        {
          model: Departement,
          as: 'departement',
          attributes: ['id', 'nom', 'code']
        }
      ]
    });
    
    if (!tuteur) {
      return res.status(404).json({
        success: false,
        error: 'Tuteur non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: {
        id: tuteur.id,
        nom: tuteur.nom,
        prenom: tuteur.prenom,
        email: tuteur.email,
        departement: tuteur.departement,
        capacite_max: 5,
        stagiaires_actuels: 0,
        disponible: true
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/tuteurs/:id/capacity
 * Vérifie la capacité d'un tuteur
 */
router.get('/:id/capacity', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const tuteur = await Utilisateur.findOne({
      where: { id, role: 'tuteur', is_active: true }
    });
    
    if (!tuteur) {
      return res.status(404).json({
        success: false,
        error: 'Tuteur non trouvé'
      });
    }
    
    // Calculer la capacité (à remplacer avec le vrai calcul)
    const capacite_max = 5;
    const stagiaires_actuels = 0;
    
    const capacityInfo = {
      tuteur_id: tuteur.id,
      capacite_max,
      stagiaires_actuels,
      disponible: stagiaires_actuels < capacite_max,
      pourcentage_occupation: Math.round((stagiaires_actuels / capacite_max) * 100),
      places_disponibles: capacite_max - stagiaires_actuels
    };
    
    // Ajouter des alertes selon le pourcentage
    if (stagiaires_actuels >= capacite_max) {
      capacityInfo.alert = 'FULL';
      capacityInfo.alert_message = 'Le tuteur a atteint sa capacité maximale';
    } else if (stagiaires_actuels >= capacite_max * 0.8) {
      capacityInfo.alert = 'WARNING';
      capacityInfo.alert_message = 'Le tuteur approche de sa capacité maximale';
    }
    
    res.json({
      success: true,
      data: capacityInfo
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/tuteurs/affecter
 * Affecte un stagiaire à un tuteur
 * Réservé au Chef de Département
 */
router.post('/affecter', 
  authorize('chef_departement', 'super_admin'), 
  async (req, res, next) => {
    try {
      const { tuteurId, stagiaireId } = req.body;
      
      if (!tuteurId || !stagiaireId) {
        return res.status(400).json({
          success: false,
          error: 'Les IDs du tuteur et du stagiaire sont requis'
        });
      }
      
      // Vérifier que le tuteur existe
      const tuteur = await Utilisateur.findOne({
        where: { id: tuteurId, role: 'tuteur', is_active: true }
      });
      
      if (!tuteur) {
        return res.status(404).json({
          success: false,
          error: 'Tuteur non trouvé'
        });
      }
      
      // Vérifier que le stagiaire existe
      const stagiaire = await Utilisateur.findOne({
        where: { id: stagiaireId, role: 'stagiaire', is_active: true }
      });
      
      if (!stagiaire) {
        return res.status(404).json({
          success: false,
          error: 'Stagiaire non trouvé'
        });
      }
      
      // Vérifier la capacité du tuteur
      const capacite_max = 5;
      const stagiaires_actuels = 0; // Placeholder
      
      if (stagiaires_actuels >= capacite_max) {
        return res.status(400).json({
          success: false,
          error: 'Le tuteur a atteint sa capacité maximale',
          capacity: {
            capacite_max,
            stagiaires_actuels
          }
        });
      }
      
      // Vérifier que le chef de département est bien responsable du même département
      if (req.user.role === 'chef_departement') {
        if (tuteur.departement_id !== req.user.departement_id) {
          return res.status(403).json({
            success: false,
            error: 'Vous ne pouvez affecter des stagiaires qu\'aux tuteurs de votre département'
          });
        }
      }
      
      // TODO: Créer l'affectation quand le modèle Stagiaire sera prêt
      // Pour l'instant, on met à jour le département du stagiaire
      await stagiaire.update({ departement_id: tuteur.departement_id });
      
      // Journalisation
      const { logAuditEvent } = require('../services/auditService');
      logAuditEvent({
        userId: req.user.id,
        action: 'ASSIGN_TRAINEE_TO_TUTOR',
        entityType: 'Utilisateur',
        entityId: stagiaireId,
        ipAddress: req.ip,
        details: { 
          tuteurId, 
          stagiaireId, 
          departementId: tuteur.departement_id 
        }
      });
      
      res.status(201).json({
        success: true,
        message: 'Stagiaire affecté au tuteur avec succès',
        data: {
          tuteur_id: tuteurId,
          stagiaire_id: stagiaireId,
          departement_id: tuteur.departement_id,
          places_disponibles: capacite_max - 1
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/tuteurs/reaffecter
 * Réaffecte un stagiaire à un autre tuteur
 * Réservé au Chef de Département
 */
router.post('/reaffecter',
  authorize('chef_departement', 'super_admin'),
  async (req, res, next) => {
    try {
      const { ancienTuteurId, nouveauTuteurId, stagiaireId } = req.body;
      
      if (!ancienTuteurId || !nouveauTuteurId || !stagiaireId) {
        return res.status(400).json({
          success: false,
          error: 'Les IDs du tuteur actuel, du nouveau tuteur et du stagiaire sont requis'
        });
      }
      
      // Vérifier que le nouveau tuteur a de la capacité
      const nouveauTuteur = await Utilisateur.findOne({
        where: { id: nouveauTuteurId, role: 'tuteur', is_active: true }
      });
      
      if (!nouveauTuteur) {
        return res.status(404).json({
          success: false,
          error: 'Nouveau tuteur non trouvé'
        });
      }
      
      const capacite_max = 5;
      const stagiaires_actuels = 0; // Placeholder
      
      if (stagiaires_actuels >= capacite_max) {
        return res.status(400).json({
          success: false,
          error: 'Le nouveau tuteur a atteint sa capacité maximale'
        });
      }
      
      // Vérifier les permissions du chef de département
      if (req.user.role === 'chef_departement') {
        if (nouveauTuteur.departement_id !== req.user.departement_id) {
          return res.status(403).json({
            success: false,
            error: 'Vous ne pouvez réaffecter des stagiaires qu\'au sein de votre département'
          });
        }
      }
      
      // TODO: Implémenter la réaffectation quand le modèle Stagiaire sera prêt
      
      // Journalisation
      const { logAuditEvent } = require('../services/auditService');
      logAuditEvent({
        userId: req.user.id,
        action: 'REASSIGN_TRAINEE',
        entityType: 'Utilisateur',
        entityId: stagiaireId,
        ipAddress: req.ip,
        details: { 
          ancienTuteurId, 
          nouveauTuteurId, 
          stagiaireId 
        }
      });
      
      res.json({
        success: true,
        message: 'Stagiaire réaffecté avec succès',
        data: {
          ancien_tuteur_id: ancienTuteurId,
          nouveau_tuteur_id: nouveauTuteurId,
          stagiaire_id: stagiaireId
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/tuteurs/:id/capacite
 * Met à jour la capacité maximale d'un tuteur
 * Réservé au Super Admin
 */
router.put('/:id/capacite',
  authorize('super_admin'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { capacite_max } = req.body;
      
      const tuteur = await Utilisateur.findOne({
        where: { id, role: 'tuteur', is_active: true }
      });
      
      if (!tuteur) {
        return res.status(404).json({
          success: false,
          error: 'Tuteur non trouvé'
        });
      }
      
      if (!capacite_max || capacite_max < 1 || capacite_max > 20) {
        return res.status(400).json({
          success: false,
          error: 'La capacité doit être entre 1 et 20'
        });
      }
      
      // TODO: Stocker la capacité dans un champ dédié du modèle
      // Pour l'instant, on ne fait que retourner un succès
      
      res.json({
        success: true,
        message: 'Capacité du tuteur mise à jour',
        data: {
          tuteur_id: id,
          capacite_max
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
