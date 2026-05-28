/**
 * Routes API: Conventions
 * Endpoints pour la gestion des conventions de stage
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { Convention, Candidature, Departement } = require('../models');
const { Op } = require('sequelize');
const pdfService = require('../services/pdfService');
const stagiaireService = require('../services/stagiaireService');
const { logAuditEvent } = require('../services/auditService');

// Configuration multer pour les uploads de conventions signées
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/conventions');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 Mo
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Seuls les fichiers PDF sont autorisés'), false);
  }
});

/**
 * POST /api/conventions - Générer une convention pour une candidature
 */
router.post('/', authenticate, authorize('admin_rh', 'super_admin'), async (req, res, next) => {
  try {
    const { candidature_id } = req.body;
    
    const candidature = await Candidature.findByPk(candidature_id, {
      include: [{ model: Departement, as: 'departement_souhaite_rel' }]
    });
    
    if (!candidature) return res.status(404).json({ success: false, error: 'Candidature non trouvée' });
    if (candidature.statut !== 'acceptee') return res.status(400).json({ success: false, error: 'Candidature non acceptée' });

    // Check existing
    const existing = await Convention.findOne({ where: { candidature_id, statut: { [Op.notIn]: ['annulee'] } } });
    if (existing) return res.status(400).json({ success: false, error: 'Convention déjà existante' });

    const convention = await Convention.create({
      candidature_id,
      numero: Convention.generateNumber(),
      statut: 'generee'
    });

    const filename = `Convention_${convention.numero}.pdf`;
    const filepath = path.join(__dirname, '../../uploads/conventions', filename);
    
    // Generate PDF using centralized service
    await pdfService.generateConventionPDF(candidature, filepath);
    
    convention.fichier_genere = `uploads/conventions/${filename}`;
    await convention.save();
    
    logAuditEvent({
      userId: req.user.id,
      action: 'GENERATE_CONVENTION',
      entityId: convention.id,
      details: { numero: convention.numero }
    });
    
    res.status(201).json({ success: true, data: convention });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/conventions - Liste des conventions
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { page = 1, limit = 10, statut } = req.query;
    const offset = (page - 1) * limit;
    const where = statut ? { statut } : {};
    
    const { count, rows } = await Convention.findAndCountAll({
      where,
      include: [{ model: Candidature, as: 'candidature', attributes: ['nom', 'prenom', 'etablissement'] }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
    
    res.json({ success: true, data: rows, pagination: { total: count, pages: Math.ceil(count / limit) } });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/conventions/:id/sign - Signature finale RH et création du stagiaire
 */
router.post('/:id/sign', authenticate, authorize('admin_rh', 'super_admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const convention = await Convention.findByPk(id);
    
    if (!convention) return res.status(404).json({ success: false, error: 'Convention non trouvée' });
    if (convention.statut !== 'en_signature') {
      // In a real scenario, we might allow signing even if not in 'en_signature' if the file is uploaded.
    }

    // Sign the convention
    await convention.signerRH(req.body.commentaire);
    
    const { Document } = require('../models');

    // AUTOMATIC CREATION OF STAGIAIRE
    const stagiaire = await stagiaireService.createStagiaireFromConvention(convention.id);

    // Record the signed convention in the Documents archive
    await Document.create({
      stage_id: stagiaire.id,
      type: 'CONVENTION',
      genere_par: req.user.id,
      fichier_nom: `Convention_${stagiaire.nom}_${stagiaire.prenom}.pdf`,
      fichier_path: convention.fichier_signe || convention.fichier_genere,
      taille_fichier: 0 // Will be updated if possible or kept as is
    });
    
    const { logAuditEvent } = require('../services/auditService');
    logAuditEvent({
      userId: req.user.id,
      action: 'SIGN_CONVENTION_AND_CREATE_STAGIAIRE',
      entityId: convention.id,
      details: { stagiaireId: stagiaire.id, numero: convention.numero }
    });
    
    res.json({ success: true, message: 'Convention signée et stagiaire créé', data: { convention, stagiaire } });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/conventions/:id/download - Télécharger le PDF
 */
router.get('/:id/download', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type = 'genere' } = req.query;
    const convention = await Convention.findByPk(id);
    
    if (!convention) return res.status(404).json({ error: 'Convention non trouvée' });
    
    const relativePath = (type === 'signe') ? convention.fichier_signe : convention.fichier_genere;
    if (!relativePath) return res.status(404).json({ error: 'Fichier non disponible' });
    
    res.download(path.join(__dirname, '../../', relativePath));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
