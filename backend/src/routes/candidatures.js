/**
 * Routes API: Candidatures
 * Endpoints pour la gestion des candidatures de stage
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { Candidature, Departement, Utilisateur, Stagiaire } = require('../models');
const { sequelize } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { Op } = require('sequelize');
const emailService = require('../services/emailService');
const pdfService = require('../services/pdfService');
const fs = require('fs');

// Configuration multer pour les uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/candidatures');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accepter seulement les PDF
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers PDF sont autorisés'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 Mo
  },
  fileFilter: fileFilter
});

// Route publique: Soumettre une candidature (sans authentification)
router.post('/', upload.fields([
  { name: 'cv', maxCount: 1 },
  { name: 'lm', maxCount: 1 }
]), async (req, res, next) => {
  try {
    const { 
      nom, 
      prenom, 
      email, 
      telephone,
      etablissement,
      filiere,
      niveau,
      departement_souhaite,
      date_debut,
      date_fin,
      theme,
      type_stage,
      password
    } = req.body;
    
    // Validation des champs requis
    const errors = [];
    if (!nom) errors.push('Le nom est requis');
    if (!prenom) errors.push('Le prénom est requis');
    if (!email) errors.push('L\'email est requis');
    if (!etablissement) errors.push('L\'établissement est requis');
    if (!filiere) errors.push('La filière est requise');
    if (!niveau) errors.push('Le niveau d\'étude est requis');
    if (!date_debut) errors.push('La date de début est requise');
    if (!date_fin) errors.push('La date de fin est requise');
    if (!type_stage) errors.push('Le type de stage est requis');
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors
      });
    }
    
    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        errors: ['Email invalide']
      });
    }
    
    // Validation des dates
    const debut = new Date(date_debut);
    const fin = new Date(date_fin);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    if (debut < now) {
      return res.status(400).json({
        success: false,
        errors: ['La date de début doit être dans le futur']
      });
    }
    
    if (fin <= debut) {
      return res.status(400).json({
        success: false,
        errors: ['La date de fin doit être après la date de début']
      });
    }
    
    // Vérifier si une candidature avec le même email existe déjà
    const existingCandidature = await Candidature.findOne({
      where: {
        email: email.toLowerCase(),
        statut: {
          [Op.in]: ['en_attente', 'en_cours']
        }
      }
    });
    
    if (existingCandidature) {
      return res.status(400).json({
        success: false,
        errors: ['Une candidature est déjà en cours pour cet email']
      });
    }

    // Hasher le mot de passe si fourni
    const bcrypt = require('bcrypt');
    let hashedPassword = null;
    if (password) {
      const salt = await bcrypt.genSalt(12);
      hashedPassword = await bcrypt.hash(password, salt);
    }
    
    // Générer le numéro de suivi
    const numeroSuivi = Candidature.generateSuiviNumber();
    
    // Créer la candidature
    const candidature = await Candidature.create({
      nom,
      prenom,
      email: email.toLowerCase(),
      telephone,
      etablissement,
      filiere,
      niveau,
      departement_souhaite: departement_souhaite || null,
      date_debut,
      date_fin,
      theme,
      type_stage,
      cv_url: req.files?.cv ? `/uploads/candidatures/${req.files.cv[0].filename}` : null,
      lm_url: req.files?.lm ? `/uploads/candidatures/${req.files.lm[0].filename}` : null,
      statut: 'en_attente',
      numero_suivi: numeroSuivi,
      mot_de_passe_temp: hashedPassword
    });
    
    // Envoyer l'email de confirmation
    emailService.sendCandidatureConfirmation(candidature).catch(err => console.error('Error sending confirmation email:', err));
    
    res.status(201).json({
      success: true,
      message: 'Candidature soumise avec succès',
      data: {
        numero_suivi: numeroSuivi,
        email: email
      }
    });
  } catch (error) {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          errors: ['Le fichier ne doit pas dépasser 5 Mo']
        });
      }
    }
    next(error);
  }
});

// Route publique: Suivre une candidature (avec email)
router.get('/suivi/:numero', async (req, res, next) => {
  try {
    const { numero } = req.params;
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'L\'email est requis pour le suivi'
      });
    }
    
    const candidature = await Candidature.findOne({
      where: {
        numero_suivi: numero,
        email: email.toLowerCase()
      }
    });
    
    if (!candidature) {
      return res.status(404).json({
        success: false,
        error: 'Candidature non trouvée'
      });
    }
    
    res.json({
      success: true,
      data: candidature.toCandidateJSON()
    });
  } catch (error) {
    next(error);
  }
});

// Route publique: Suivre une candidature (par numéro seulement)
router.get('/track/:numero', async (req, res, next) => {
  try {
    const { numero } = req.params;
    
    const candidature = await Candidature.findOne({
      where: {
        numero_suivi: numero
      },
      include: [
        {
          model: Departement,
          as: 'departement_souhaite_rel',
          attributes: ['id', 'nom']
        }
      ]
    });
    
    if (!candidature) {
      return res.status(404).json({
        success: false,
        error: 'Candidature non trouvée'
      });
    }
    
    // Mapping des statuts pour l'affichage frontend
    const statusMapping = {
      'en_attente': 'En attente',
      'en_cours': 'En cours',
      'documents_manquants': 'Documents manquants',
      'liste_attente': 'Liste d\'attente',
      'acceptee': 'Acceptée',
      'refusee': 'Refusée',
      'annulee': 'Annulée'
    };

    const data = candidature.toJSON();
    // On s'assure que le statut est au format attendu par le StatusBadge
    data.statut = statusMapping[data.statut] || data.statut;
    // On ajoute l'alias Departement pour le frontend
    data.Departement = candidature.departement_souhaite_rel;
    
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    next(error);
  }
});

// Routes protégées (pour l'admin)

// GET /api/candidatures - Liste avec pagination et filtres
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      statut, 
      etablissement,
      date_debut,
      date_fin
    } = req.query;
    
    const offset = (page - 1) * limit;
    const where = {};
    
    if (statut) {
      where.statut = statut;
    }
    
    if (etablissement) {
      where.etablissement = { [Op.like]: `%${etablissement}%` };
    }
    
    if (date_debut) {
      where.date_debut = { [Op.gte]: date_debut };
    }
    
    if (date_fin) {
      where.date_fin = { [Op.lte]: date_fin };
    }
    
    const { count, rows } = await Candidature.findAndCountAll({
      where,
      include: [
        {
          model: Departement,
          as: 'departement_souhaite_rel',
          attributes: ['id', 'nom', 'code']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date_soumission', 'DESC']]
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

// GET /api/candidatures/:id - Détails d'une candidature
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const candidature = await Candidature.findByPk(id, {
      include: [
        {
          model: Departement,
          as: 'departement_souhaite_rel',
          attributes: ['id', 'nom', 'code']
        }
      ]
    });
    
    if (!candidature) {
      return res.status(404).json({
        success: false,
        error: 'Candidature non trouvée'
      });
    }
    
    res.json({
      success: true,
      data: candidature
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/candidatures/:id - Modifier le statut
router.put('/:id', 
  authenticate, 
  authorize('admin_rh', 'super_admin'), 
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { statut, commentaire } = req.body;
      
      const candidature = await Candidature.findByPk(id);
      
      if (!candidature) {
        return res.status(404).json({
          success: false,
          error: 'Candidature non trouvée'
        });
      }
      
      // Mettre à jour le statut
      if (statut === 'acceptee') {
        await candidature.accepter(commentaire);
      } else if (statut === 'refusee') {
        await candidature.refuser(commentaire);
      } else if (statut === 'en_cours') {
        await candidature.traiter();
      } else if (statut === 'documents_manquants') {
        await candidature.demanderDocuments(commentaire);
      } else if (statut === 'liste_attente') {
        await candidature.mettreEnAttente(commentaire);
      } else if (statut === 'annulee') {
        await candidature.annuler(commentaire);
      }
      
      // Journalisation
      const { logAuditEvent } = require('../services/auditService');
      logAuditEvent({
        userId: req.user.id,
        action: 'UPDATE_CANDIDATURE',
        entityType: 'Candidature',
        entityId: id,
        ipAddress: req.ip,
        details: { oldStatut: candidature.statut, newStatut: statut }
      });
      
      res.json({
        success: true,
        message: 'Candidature mise à jour',
        data: candidature
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/candidatures/:id/accept - Accepter une candidature et générer la convention
router.post('/:id/accept',
  authenticate,
  authorize('admin_rh', 'super_admin'),
  async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const { commentaire } = req.body;
      
      const candidature = await Candidature.findByPk(id, {
        include: [
          { model: Departement, as: 'departement_souhaite_rel' }
        ],
        transaction: t
      });
      
      if (!candidature) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          error: 'Candidature non trouvée'
        });
      }
      
      if (!['en_attente', 'en_cours', 'liste_attente'].includes(candidature.statut)) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          error: 'Cette candidature ne peut pas être acceptée dans son état actuel'
        });
      }

      // 1 & 2. Gérer le Compte Utilisateur
      let user = await Utilisateur.findOne({ where: { email: candidature.email.toLowerCase() }, transaction: t });
      
      const defaultPassword = 'Gias@' + new Date().getFullYear();
      const entity = candidature.departement_souhaite_rel?.entity || 'SHARED';

      if (user) {
        // L'utilisateur existe déjà (car il s'est inscrit avant de postuler)
        // On s'assure qu'il a le bon rôle et les bonnes infos
        user.role = 'stagiaire';
        user.is_active = true;
        user.entity = entity;
        user.departement_id = candidature.departement_souhaite;
        await user.save({ transaction: t });
      } else {
        // Créer le Compte Utilisateur (si non existant)
        const finalPasswordHash = candidature.mot_de_passe_temp || defaultPassword;
        
        user = await Utilisateur.create({
          email: candidature.email.toLowerCase(),
          nom: candidature.nom,
          prenom: candidature.prenom,
          password_hash: finalPasswordHash,
          role: 'stagiaire',
          is_active: true,
          entity: entity,
          departement_id: candidature.departement_souhaite
        }, { transaction: t });
      }

      // 3. Créer le Profil Stagiaire
      const stagiaire = await Stagiaire.create({
        utilisateur_id: user.id,
        etablissement: candidature.etablissement,
        filiere: candidature.filiere,
        niveau_etude: candidature.niveau,
        departement_id: candidature.departement_souhaite,
        date_demarrage: candidature.date_debut,
        date_fin: candidature.date_fin,
        entity: entity,
        statut: 'actif'
      }, { transaction: t });
      
      // 4. Mettre à jour la candidature
      await candidature.accepter(commentaire, { transaction: t });
      
      // 5. Générer la convention PDF
      const conventionPath = path.join(__dirname, '../../uploads/conventions', `Convention_${candidature.numero_suivi}.pdf`);
      // Assurez-vous que le dossier existe
      const dir = path.dirname(conventionPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      
      await pdfService.generateConventionPDF(candidature, conventionPath);

      // Enregistrer une notification pour l'admin
      const { Notification } = require('../models');
      await Notification.create({
        titre: 'Nouvelle candidature acceptée',
        type: 'CANDIDATURE_ACCEPTEE',
        message: `Nouveau stagiaire créé : ${candidature.prenom} ${candidature.nom}`,
        utilisateur_id: req.user.id
      }, { transaction: t });

      await t.commit();
      
      // Envoyer l'email d'acceptation (ne plus envoyer le mot de passe si le candidat l'a défini)
      const passwordToMail = candidature.mot_de_passe_temp ? null : defaultPassword;
      await emailService.sendAcceptanceEmail(candidature, passwordToMail);
      
      // Journalisation
      const { logAuditEvent } = require('../services/auditService');
      logAuditEvent({
        userId: req.user.id,
        action: 'ACCEPT_CANDIDATURE_FULL',
        entityType: 'Candidature',
        entityId: id,
        ipAddress: req.ip,
        details: { 
          numero: candidature.numero_suivi,
          candidat: `${candidature.prenom} ${candidature.nom}`,
          stagiaireId: stagiaire.id,
          userId: user.id
        }
      });
      
      res.json({
        success: true,
        message: 'Candidature acceptée et stagiaire créé avec succès',
        data: {
          id: candidature.id,
          numero_suivi: candidature.numero_suivi,
          statut: candidature.statut,
          stagiaire: {
            id: stagiaire.id,
            email: user.email,
            password: defaultPassword
          }
        }
      });
    } catch (error) {
      if (t) await t.rollback();
      next(error);
    }
  }
);

// POST /api/candidatures/:id/reject - Refuser une candidature
router.post('/:id/reject',
  authenticate,
  authorize('admin_rh', 'super_admin'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { commentaire } = req.body;
      
      const candidature = await Candidature.findByPk(id);
      
      if (!candidature) {
        return res.status(404).json({
          success: false,
          error: 'Candidature non trouvée'
        });
      }
      
      if (!['en_attente', 'en_cours', 'liste_attente', 'documents_manquants'].includes(candidature.statut)) {
        return res.status(400).json({
          success: false,
          error: 'Cette candidature ne peut pas être refusée'
        });
      }
      
      // Refuser la candidature
      await candidature.refuser(commentaire);
      
      // Envoyer l'email de refus
      await emailService.sendRejectionEmail(candidature, commentaire);
      
      // Journalisation
      const { logAuditEvent } = require('../services/auditService');
      logAuditEvent({
        userId: req.user.id,
        action: 'REJECT_CANDIDATURE',
        entityType: 'Candidature',
        entityId: id,
        ipAddress: req.ip,
        details: { 
          numero: candidature.numero_suivi,
          candidat: `${candidature.prenom} ${candidature.nom}`,
          email: candidature.email,
          motif: commentaire
        }
      });
      
      res.json({
        success: true,
        message: 'Candidature refusée',
        data: {
          id: candidature.id,
          numero_suivi: candidature.numero_suivi,
          statut: candidature.statut,
          date_refus: candidature.date_refus
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/candidatures/:id/waitlist - Mettre en liste d'attente
router.post('/:id/waitlist',
  authenticate,
  authorize('admin_rh', 'super_admin'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { commentaire } = req.body;
      
      const candidature = await Candidature.findByPk(id);
      
      if (!candidature) {
        return res.status(404).json({
          success: false,
          error: 'Candidature non trouvée'
        });
      }
      
      if (!['en_attente', 'en_cours'].includes(candidature.statut)) {
        return res.status(400).json({
          success: false,
          error: 'Cette candidature ne peut pas être mise en liste d\'attente'
        });
      }
      
      // Mettre en liste d'attente
      await candidature.mettreEnAttente(commentaire);
      
      // Journalisation
      const { logAuditEvent } = require('../services/auditService');
      logAuditEvent({
        userId: req.user.id,
        action: 'WAITLIST_CANDIDATURE',
        entityType: 'Candidature',
        entityId: id,
        ipAddress: req.ip,
        details: { 
          numero: candidature.numero_suivi,
          candidat: `${candidature.prenom} ${candidature.nom}`,
          motif: commentaire
        }
      });
      
      res.json({
        success: true,
        message: 'Candidature mise en liste d\'attente',
        data: {
          id: candidature.id,
          numero_suivi: candidature.numero_suivi,
          statut: candidature.statut
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/candidatures/:id/documents - Demander des documents
router.post('/:id/documents',
  authenticate,
  authorize('admin_rh', 'super_admin'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { commentaire } = req.body;
      
      const candidature = await Candidature.findByPk(id);
      
      if (!candidature) {
        return res.status(404).json({
          success: false,
          error: 'Candidature non trouvée'
        });
      }
      
      if (!['en_attente', 'en_cours'].includes(candidature.statut)) {
        return res.status(400).json({
          success: false,
          error: 'Impossible de demander des documents pour cette candidature'
        });
      }
      
      // Demander des documents
      await candidature.demanderDocuments(commentaire);
      
      // Envoyer l'email de demande de documents
      await emailService.sendEmail(
        candidature.email, 
        `Documents manquants pour votre candidature - ${candidature.numero_suivi}`,
        `<p>Bonjour ${candidature.prenom},</p><p>Certains documents sont manquants pour votre dossier de stage (${candidature.numero_suivi}).</p><p><strong>Note du RH :</strong> ${commentaire}</p><p>Merci de les transmettre via votre espace de suivi.</p>`
      );
      
      // Journalisation
      const { logAuditEvent } = require('../services/auditService');
      logAuditEvent({
        userId: req.user.id,
        action: 'REQUEST_DOCUMENTS',
        entityType: 'Candidature',
        entityId: id,
        ipAddress: req.ip,
        details: { 
          numero: candidature.numero_suivi,
          candidat: `${candidature.prenom} ${candidature.nom}`,
          motif: commentaire
        }
      });
      
      res.json({
        success: true,
        message: 'Demande de documents envoyée au candidat',
        data: {
          id: candidature.id,
          numero_suivi: candidature.numero_suivi,
          statut: candidature.statut
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/candidatures/:id - Supprimer (admin seulement)
router.delete('/:id', 
  authenticate, 
  authorize('super_admin'), 
  async (req, res, next) => {
    try {
      const { id } = req.params;
      
      const candidature = await Candidature.findByPk(id);
      
      if (!candidature) {
        return res.status(404).json({
          success: false,
          error: 'Candidature non trouvée'
        });
      }
      
      await candidature.destroy();
      
      res.json({
        success: true,
        message: 'Candidature supprimée'
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/candidatures/:id/message - Envoyer un message direct (Email)
router.post('/:id/message',
  authenticate,
  authorize('admin_rh', 'super_admin'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { message } = req.body;
      
      if (!message || message.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Le message ne peut pas être vide'
        });
      }
      
      const candidature = await Candidature.findByPk(id);
      if (!candidature) {
        return res.status(404).json({
          success: false,
          error: 'Candidature non trouvée'
        });
      }
      
      // Envoyer l'email direct
      await emailService.sendDirectMessageEmail(candidature, message);
      
      // Journalisation
      const { logAuditEvent } = require('../services/auditService');
      logAuditEvent({
        userId: req.user.id,
        action: 'MESSAGE_CANDIDATE',
        entityType: 'Candidature',
        entityId: id,
        ipAddress: req.ip,
        details: { 
          numero: candidature.numero_suivi,
          candidat: `${candidature.prenom} ${candidature.nom}`,
          message
        }
      });
      
      res.json({
        success: true,
        message: 'Message envoyé avec succès'
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
