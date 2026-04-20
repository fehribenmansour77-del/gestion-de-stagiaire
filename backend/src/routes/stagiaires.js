/**
 * Routes API: Gestion des Stagiaires
 * Endpoints CRUD pour les stagiaires
 */

const express = require('express');
const router = express.Router();
const { Stagiaire, StagiaireArchive } = require('../models');
const { Utilisateur, Departement } = require('../models');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { Op } = require('sequelize');

// Middleware: tous les routes nécessitent authentication
router.use(authenticate);

/**
 * GET /api/stagiaires
 * Liste les stagiaires avec pagination et filtres
 */
router.get('/', async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search,
      departement_id, 
      entity, 
      statut,
      tuteur_id,
      include_archived = false
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    // Construction des filtres
    const where = {};
    const userWhere = {};
    
    // Filtrer par statut (par défaut, exclure les archivés sauf si explicitement demandé)
    if (include_archived === 'true') {
      // Pas de filtre sur le statut
    } else {
      where.statut = {
        [Op.ne]: 'archive'
      };
    }
    
    if (statut) {
      where.statut = statut;
    }
    
    if (departement_id) {
      where.departement_id = departement_id;
    }
    
    if (entity) {
      where.entity = entity;
    }
    
    if (tuteur_id) {
      where.tuteur_id = tuteur_id;
    }
    
    // Recherche par nom/prénom
    if (search) {
      userWhere[Op.or] = [
        { nom: { [Op.iLike]: `%${search}%` } },
        { prenom: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    // Requête avec include pour les données utilisateur
    const { count, rows } = await Stagiaire.findAndCountAll({
      where,
      include: [
        {
          model: Utilisateur,
          as: 'utilisateur',
          attributes: ['id', 'nom', 'prenom', 'email', 'telephone'],
          where: Object.keys(userWhere).length > 0 ? userWhere : undefined,
          required: search !== undefined
        },
        {
          model: Departement,
          as: 'departement',
          attributes: ['id', 'nom', 'code']
        },
        {
          model: Utilisateur,
          as: 'tuteur',
          attributes: ['id', 'nom', 'prenom', 'email']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });
    
    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/stagiaires/archives
 * Liste les stagiaires archivés
 * IMPORTANT: doit être définie AVANT /:id pour éviter le conflit de routing
 */
router.get('/archives',
  authorize('admin_rh', 'super_admin'),
  async (req, res, next) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const { count, rows } = await StagiaireArchive.findAndCountAll({
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['date_archive', 'DESC']]
      });

      res.json({
        success: true,
        data: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/stagiaires/:id
 * Récupère un stagiaire par son ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validation: l'ID doit être numérique
    if (isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: 'ID invalide'
      });
    }

    const stagiaire = await Stagiaire.findByPk(id, {
      include: [
        {
          model: Utilisateur,
          as: 'utilisateur',
          attributes: ['id', 'nom', 'prenom', 'email', 'telephone']
        },
        {
          model: Departement,
          as: 'departement',
          attributes: ['id', 'nom', 'code']
        },
        {
          model: Utilisateur,
          as: 'tuteur',
          attributes: ['id', 'nom', 'prenom', 'email']
        }
      ]
    });

    if (!stagiaire) {
      return res.status(404).json({
        success: false,
        error: 'Stagiaire non trouvé'
      });
    }

    res.json({
      success: true,
      data: stagiaire
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/stagiaires
 * Crée un nouveau stagiaire avec compte utilisateur
 */
router.post('/', 
  authorize('admin_rh', 'super_admin', 'chef_departement'), 
  async (req, res, next) => {
    try {
      const { 
        email,
        nom,
        prenom,
        telephone,
        etablissement,
        filiere,
        niveau_etude,
        annee_en_cours,
        departement_id,
        tuteur_id,
        date_demarrage,
        date_fin,
        entity
      } = req.body;
      
      // Validation des champs requis
      if (!email || !nom || !prenom) {
        return res.status(400).json({
          success: false,
          error: 'Les champs email, nom et prenom sont requis'
        });
      }
      
      // Vérifier que l'email n'existe pas déjà
      const existingUser = await Utilisateur.findOne({
        where: { email: email.toLowerCase() }
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Un utilisateur avec cet email existe déjà'
        });
      }
      
      // Créer l'utilisateur
      const utilisateur = await Utilisateur.create({
        email: email.toLowerCase(),
        password_hash: 'ChangeMe123!', // Mot de passe temporaire
        nom,
        prenom,
        telephone,
        role: 'stagiaire',
        entity: entity || null,
        departement_id: departement_id || null,
        is_active: true
      });
      
      // Créer le stagiaire
      const stagiaire = await Stagiaire.create({
        utilisateur_id: utilisateur.id,
        etablissement,
        filiere,
        niveau_etude,
        annee_en_cours,
        departement_id,
        tuteur_id,
        date_demarrage,
        date_fin,
        entity,
        statut: 'actif'
      });
      
      // Journalisation
      const { logAuditEvent } = require('../services/auditService');
      logAuditEvent({
        userId: req.user.id,
        action: 'CREATE_STAGIAIRE',
        entityType: 'Stagiaire',
        entityId: stagiaire.id,
        ipAddress: req.ip,
        details: { 
          stagiaireId: stagiaire.id, 
          utilisateurId: utilisateur.id,
          email: utilisateur.email
        }
      });
      
      res.status(201).json({
        success: true,
        message: 'Stagiaire créé avec succès',
        data: {
          ...stagiaire.toJSON(),
          utilisateur: utilisateur.toPublicJSON()
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/stagiaires/:id
 * Met à jour un stagiaire existant
 */
router.put('/:id', 
  authorize('admin_rh', 'super_admin', 'chef_departement'), 
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const {
        etablissement,
        filiere,
        niveau_etude,
        annee_en_cours,
        departement_id,
        tuteur_id,
        date_demarrage,
        date_fin,
        entity
      } = req.body;
      
      const stagiaire = await Stagiaire.findByPk(id);
      
      if (!stagiaire) {
        return res.status(404).json({
          success: false,
          error: 'Stagiaire non trouvé'
        });
      }
      
      // Vérifier les permissions du chef de département
      if (req.user.role === 'chef_departement') {
        if (stagiaire.departement_id !== req.user.departement_id) {
          return res.status(403).json({
            success: false,
            error: 'Vous ne pouvez modifier que les stagiaires de votre département'
          });
        }
      }
      
      // Mettre à jour le stagiaire
      await stagiaire.update({
        etablissement: etablissement !== undefined ? etablissement : stagiaire.etablissement,
        filiere: filiere !== undefined ? filiere : stagiaire.filiere,
        niveau_etude: niveau_etude !== undefined ? niveau_etude : stagiaire.niveau_etude,
        annee_en_cours: annee_en_cours !== undefined ? annee_en_cours : stagiaire.annee_en_cours,
        departement_id: departement_id !== undefined ? departement_id : stagiaire.departement_id,
        tuteur_id: tuteur_id !== undefined ? tuteur_id : stagiaire.tuteur_id,
        date_demarrage: date_demarrage !== undefined ? date_demarrage : stagiaire.date_demarrage,
        date_fin: date_fin !== undefined ? date_fin : stagiaire.date_fin,
        entity: entity !== undefined ? entity : stagiaire.entity
      });
      
      // Si le département change, mettre à jour l'utilisateur aussi
      if (departement_id !== undefined && departement_id !== stagiaire.departement_id) {
        await Utilisateur.update(
          { departement_id },
          { where: { id: stagiaire.utilisateur_id } }
        );
      }
      
      // Journalisation
      const { logAuditEvent } = require('../services/auditService');
      logAuditEvent({
        userId: req.user.id,
        action: 'UPDATE_STAGIAIRE',
        entityType: 'Stagiaire',
        entityId: stagiaire.id,
        ipAddress: req.ip,
        details: { modifications: req.body }
      });
      
      res.json({
        success: true,
        message: 'Stagiaire mis à jour avec succès',
        data: stagiaire
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/stagiaires/:id
 * Archive un stagiaire (soft delete)
 */
router.delete('/:id', 
  authorize('admin_rh', 'super_admin'), 
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { raison } = req.body;
      
      const stagiaire = await Stagiaire.findByPk(id);
      
      if (!stagiaire) {
        return res.status(404).json({
          success: false,
          error: 'Stagiaire non trouvé'
        });
      }
      
      // Créer l'archive
      await StagiaireArchive.create({
        original_id: stagiaire.id,
        utilisateur_id: stagiaire.utilisateur_id,
        etablissement: stagiaire.etablissement,
        filiere: stagiaire.filiere,
        niveau_etude: stagiaire.niveau_etude,
        annee_en_cours: stagiaire.annee_en_cours,
        departement_id: stagiaire.departement_id,
        tuteur_id: stagiaire.tuteur_id,
        date_demarrage: stagiaire.date_demarrage,
        date_fin: stagiaire.date_fin,
        entity: stagiaire.entity,
        statut: 'archive',
        date_archive: new Date(),
        raison_archive: raison || 'Archivé par l\'administrateur',
        retention_end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 10))
      });
      
      // Archiver le stagiaire
      await stagiaire.archiver(raison);
      
      // Désactiver le compte utilisateur
      await Utilisateur.update(
        { is_active: false },
        { where: { id: stagiaire.utilisateur_id } }
      );
      
      // Journalisation
      const { logAuditEvent } = require('../services/auditService');
      logAuditEvent({
        userId: req.user.id,
        action: 'ARCHIVE_STAGIAIRE',
        entityType: 'Stagiaire',
        entityId: stagiaire.id,
        ipAddress: req.ip,
        details: { raison }
      });
      
      res.json({
        success: true,
        message: 'Stagiaire archivé avec succès'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/stagiaires/:id/terminer
 * Marque le stage comme terminé
 */
router.post('/:id/terminer', 
  authorize('admin_rh', 'super_admin', 'chef_departement'), 
  async (req, res, next) => {
    try {
      const { id } = req.params;
      
      const stagiaire = await Stagiaire.findByPk(id);
      
      if (!stagiaire) {
        return res.status(404).json({
          success: false,
          error: 'Stagiaire non trouvé'
        });
      }
      
      await stagiaire.terminer();
      
      res.json({
        success: true,
        message: 'Stage marqué comme terminé',
        data: stagiaire
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/stagiaires/:id/reactiver
 * Réactive un stagiaire archivé
 */
router.post('/:id/reactiver', 
  authorize('admin_rh', 'super_admin'), 
  async (req, res, next) => {
    try {
      const { id } = req.params;
      
      const stagiaire = await Stagiaire.findByPk(id);
      
      if (!stagiaire) {
        return res.status(404).json({
          success: false,
          error: 'Stagiaire non trouvé'
        });
      }
      
      if (stagiaire.statut !== 'archive') {
        return res.status(400).json({
          success: false,
          error: 'Ce stagiaire n\'est pas archivé'
        });
      }
      
      await stagiaire.reactiver();
      
      // Réactiver le compte utilisateur
      await Utilisateur.update(
        { is_active: true },
        { where: { id: stagiaire.utilisateur_id } }
      );
      
      res.json({
        success: true,
        message: 'Stagiaire réactivé avec succès',
        data: stagiaire
      });
    } catch (error) {
      next(error);
    }
  }
);

// NOTE: La route GET /archives a été déplacée AVANT /:id (ligne ~116)
// pour éviter le conflit de routing Express où 'archives' était interprété comme un ID.

module.exports = router;
