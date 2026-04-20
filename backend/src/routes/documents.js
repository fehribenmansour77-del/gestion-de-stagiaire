/**
 * Routes: Documents
 * API pour la gestion et la génération des documents PDF
 */

const express = require('express');
const router = express.Router();
const { Document, Stagiaire, Evaluation, Presence } = require('../models');
const { Utilisateur, Departement } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const { logAuditEvent } = require('../services/auditService');
const pdfService = require('../services/pdfService');
const path = require('path');
const fs = require('fs');

// Ensure associations are loaded
require('../models/associations');

/**
 * GET /documents - Liste des documents avec filtres
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { stage_id, type, archive, search, entity, page = 1, limit = 20 } = req.query;
    
    const { Op } = require('sequelize');
    const where = {};
    if (stage_id) where.stage_id = stage_id;
    if (type) where.type = type;
    if (archive !== undefined) where.archive = archive === 'true';
    
    const stagiaireWhere = {};
    if (entity) stagiaireWhere.entity = entity;
    
    const utilisateurWhere = {};
    if (search) {
      utilisateurWhere[Op.or] = [
        { nom: { [Op.like]: `%${search}%` } },
        { prenom: { [Op.like]: `%${search}%` } }
      ];
    }
    
    const offset = (page - 1) * limit;
    
    const { count, rows: documents } = await Document.findAndCountAll({
      where,
      include: [
        { 
          model: Stagiaire, 
          as: 'stagiaire', 
          where: Object.keys(stagiaireWhere).length > 0 ? stagiaireWhere : null,
          attributes: ['id', 'entity'],
          required: !!entity,
          include: [{ 
            model: Utilisateur, 
            as: 'utilisateur', 
            where: Object.keys(utilisateurWhere).length > 0 ? utilisateurWhere : null,
            attributes: ['nom', 'prenom'],
            required: !!search
          }]
        },
        { model: Utilisateur, as: 'generateur', attributes: ['nom', 'prenom'] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });
    
    // Formater pour le frontend
    const formattedDocs = documents.map(d => {
      const doc = d.toJSON();
      if (doc.stagiaire && doc.stagiaire.utilisateur) {
        doc.stagiaire.nom = doc.stagiaire.utilisateur.nom;
        doc.stagiaire.prenom = doc.stagiaire.utilisateur.prenom;
        delete doc.stagiaire.utilisateur;
      }
      return doc;
    });

    res.json({
      documents: formattedDocs,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Erreur GET /documents:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des documents' });
  }
});

/**
 * GET /documents/:id - Détail d'un document
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id, {
      include: [
        { model: Stagiaire, as: 'stagiaire' },
        { model: Utilisateur, as: 'generateur', attributes: ['nom', 'prenom'] }
      ]
    });
    
    if (!document) {
      return res.status(404).json({ error: 'Document non trouvé' });
    }
    
    res.json(document);
  } catch (error) {
    console.error('Erreur GET /documents/:id:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du document' });
  }
});

/**
 * POST /documents/attestation/:stageId - Générer une attestation de fin de stage
 */
router.post('/attestation/:stageId', authenticate, authorize(['admin_rh', 'super_admin']), async (req, res) => {
  try {
    const stageId = req.params.stageId;
    
    const stage = await Stagiaire.findByPk(stageId, {
      include: [
        { model: Utilisateur, as: 'utilisateur', attributes: ['nom', 'prenom'] },
        { model: Departement, as: 'departement', attributes: ['nom'] },
        { model: Utilisateur, as: 'tuteur', attributes: ['nom', 'prenom'] }
      ]
    });
    
    if (!stage) return res.status(404).json({ error: 'Stage non trouvé' });

    const evaluation = await Evaluation.findOne({
      where: { stage_id: stageId, type: 'FINALE', statut: 'VALIDEE_RH' }
    });

    const docRecord = await Document.create({
      stage_id: stageId,
      type: 'ATTESTATION_STAGE',
      genere_par: req.user.id,
      fichier_nom: `Attestation_${stage.utilisateur?.nom || 'Stagiaire'}_${stage.utilisateur?.prenom || stageId}.pdf`
    });

    const uploadsDir = path.join(__dirname, '../../uploads/attestations');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    
    const filePath = path.join(uploadsDir, `Attestation_${docRecord.id}.pdf`);
    
    const stageData = {
      nom: stage.utilisateur?.nom || 'N/A',
      prenom: stage.utilisateur?.prenom || 'N/A',
      dateDebut: stage.date_demarrage ? new Date(stage.date_demarrage).toLocaleDateString('fr-FR') : 'N/A',
      dateFin: stage.date_fin ? new Date(stage.date_fin).toLocaleDateString('fr-FR') : 'N/A',
      departement: stage.departement?.nom || 'N/A',
      tuteur: stage.tuteur ? `${stage.tuteur.nom || ''} ${stage.tuteur.prenom || ''}` : 'N/A',
      mention: evaluation ? evaluation.mention : null
    };

    await pdfService.generateAttestationPDF(stageData, filePath);

    docRecord.fichier_path = filePath;
    docRecord.taille_fichier = fs.statSync(filePath).size;
    await docRecord.save();

    logAuditEvent({
      userId: req.user.id,
      action: 'ATTESTATION_GENERATE',
      details: { documentId: docRecord.id, stageId }
    });

    res.json({ success: true, message: 'Attestation générée', data: docRecord });
  } catch (error) {
    console.error('Erreur attestation:', error);
    res.status(500).json({ error: 'Erreur lors de la génération' });
  }
});

/**
 * POST /documents/evaluation/:stageId - Générer un rapport d'évaluation technique
 */
router.post('/evaluation/:stageId', authenticate, authorize(['admin_rh', 'super_admin', 'chef_departement', 'tuteur']), async (req, res) => {
  try {
    const stageId = req.params.stageId;
    
    const stage = await Stagiaire.findByPk(stageId, {
      include: [
        { model: Utilisateur, as: 'utilisateur', attributes: ['nom', 'prenom'] },
        { model: Departement, as: 'departement', attributes: ['nom'] },
        { model: Utilisateur, as: 'tuteur', attributes: ['nom', 'prenom'] }
      ]
    });
    
    if (!stage) return res.status(404).json({ error: 'Stage non trouvé' });

    const evaluation = await Evaluation.findOne({
      where: { stage_id: stageId, statut: { [require('sequelize').Op.or]: ['VALIDEE_RH', 'SOUMIS'] } },
      order: [['created_at', 'DESC']]
    });

    if (!evaluation) return res.status(404).json({ error: 'Aucune évaluation validée ou soumise trouvée' });

    const docRecord = await Document.create({
      stage_id: stageId,
      type: 'RAPPORT_EVALUATION',
      genere_par: req.user.id,
      fichier_nom: `Evaluation_${stage.utilisateur?.nom || 'Stagiaire'}_${stageId}.pdf`
    });

    const uploadsDir = path.join(__dirname, '../../uploads/evaluations');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    
    const filePath = path.join(uploadsDir, `EvalReport_${docRecord.id}.pdf`);
    
    await pdfService.generateEvaluationReportPDF({
      stage,
      evaluation,
      date_generation: new Date().toLocaleDateString('fr-FR')
    }, filePath);

    docRecord.fichier_path = filePath;
    docRecord.taille_fichier = fs.statSync(filePath).size;
    await docRecord.save();

    res.json({ success: true, message: 'Rapport d\'évaluation généré', data: docRecord });
  } catch (error) {
    console.error('Erreur évaluation report:', error);
    res.status(500).json({ error: 'Erreur lors de la génération' });
  }
});

/**
 * POST /documents/presence/:stageId - Générer une feuille de présence mensuelle
 */
router.post('/presence/:stageId', authenticate, async (req, res) => {
  try {
    const { mois, annee } = req.body;
    const stageId = req.params.stageId;
    
    if (!mois || !annee) return res.status(400).json({ error: 'Mois et année requis' });

    const stage = await Stagiaire.findByPk(stageId, {
      include: [
        { model: Utilisateur, as: 'utilisateur', attributes: ['nom', 'prenom'] },
        { model: Departement, as: 'departement', attributes: ['nom'] },
        { model: Utilisateur, as: 'tuteur', attributes: ['nom', 'prenom'] }
      ]
    });

    if (!stage) return res.status(404).json({ error: 'Stage non trouvé' });

    const presences = await Presence.findAll({ where: { stage_id: stageId } });
    const presencesMois = presences.filter(p => {
      const d = new Date(p.date);
      return (d.getMonth() + 1) === parseInt(mois) && d.getFullYear() === parseInt(annee);
    });

    const docRecord = await Document.create({
      stage_id: stageId,
      type: 'FEUILLE_PRESENCE',
      periode_mois: parseInt(mois),
      periode_annee: parseInt(annee),
      genere_par: req.user.id,
      fichier_nom: `Presences_${mois}_${annee}_${stage.utilisateur?.nom}.pdf`
    });

    const uploadsDir = path.join(__dirname, '../../uploads/presences');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    
    const filePath = path.join(uploadsDir, `Presences_${docRecord.id}.pdf`);
    
    await pdfService.generatePresencePDF({
      stage,
      presences: presencesMois,
      mois: parseInt(mois),
      annee: parseInt(annee)
    }, filePath);

    docRecord.fichier_path = filePath;
    docRecord.taille_fichier = fs.statSync(filePath).size;
    await docRecord.save();

    logAuditEvent({
      userId: req.user.id,
      action: 'PRESENCE_SHEET_GENERATE',
      details: { documentId: docRecord.id, stageId, mois, annee }
    });

    res.json({ success: true, message: 'Feuille de présence générée', data: docRecord });
  } catch (error) {
    console.error('Erreur présence:', error);
    res.status(500).json({ error: 'Erreur lors de la génération' });
  }
});

/**
 * GET /documents/:id/download - Télécharger un document
 */
router.get('/:id/download', authenticate, async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    
    if (!document || !document.fichier_path) {
      return res.status(404).json({ error: 'Fichier non trouvé' });
    }

    if (!fs.existsSync(document.fichier_path)) {
      return res.status(404).json({ error: 'Le fichier physique est introuvable sur le serveur' });
    }

    res.download(document.fichier_path, document.fichier_nom);
  } catch (error) {
    console.error('Erreur Download:', error);
    res.status(500).json({ error: 'Erreur lors du téléchargement' });
  }
});

/**
 * DELETE /documents/:id - Supprimer un document
 */
router.delete('/:id', authenticate, authorize(['admin_rh', 'super_admin']), async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) return res.status(404).json({ error: 'Document non trouvé' });

    if (document.fichier_path && fs.existsSync(document.fichier_path)) {
      fs.unlinkSync(document.fichier_path);
    }
    
    await document.destroy();
    
    logAuditEvent({
      userId: req.user.id,
      action: 'DOCUMENT_DELETE',
      details: { documentId: req.params.id }
    });
    
    res.json({ success: true, message: 'Document supprimé' });
  } catch (error) {
    console.error('Erreur DELETE /documents:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

module.exports = router;
