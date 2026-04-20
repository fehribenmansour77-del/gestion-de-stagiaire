/**
 * Routes: Evaluations
 * API pour la gestion des évaluations
 */

const express = require('express');
const router = express.Router();
const { Evaluation, Stagiaire, Utilisateur, Departement } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const { logAuditEvent } = require('../services/auditService');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

// Import des associations pour avoir tous les modèles
require('../models/associations');

// Récupérer toutes les évaluations (pour RH et Admin)
router.get('/', authenticate, async (req, res) => {
  try {
    const { stage_id, type, statut, page = 1, limit = 20 } = req.query;
    
    const where = {};
    if (stage_id) where.stage_id = stage_id;
    if (type) where.type = type;
    if (statut) where.statut = statut;
    
    // Si tuteur, voir uniquement ses évaluations
    if (req.user.role === 'tuteur') {
      where.tuteur_id = req.user.id;
    }
    
    const offset = (page - 1) * limit;
    
    const { count, rows: evaluations } = await Evaluation.findAndCountAll({
      where,
      include: [
        { 
          model: Stagiaire, 
          as: 'stagiaire', 
          attributes: ['id', 'etablissement', 'niveau_etude'],
          include: [{ model: Utilisateur, as: 'utilisateur', attributes: ['nom', 'prenom'] }]
        },
        { model: Utilisateur, as: 'tuteur', attributes: ['id', 'nom', 'prenom'] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });
    
    // Formater pour le frontend
    const formattedEval = evaluations.map(e => {
      const evalData = e.toJSON();
      if (evalData.stagiaire && evalData.stagiaire.utilisateur) {
        evalData.stagiaire.nom = evalData.stagiaire.utilisateur.nom;
        evalData.stagiaire.prenom = evalData.stagiaire.utilisateur.prenom;
        delete evalData.stagiaire.utilisateur;
      }
      return evalData;
    });

    res.json({
      evaluations: formattedEval,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Erreur GET /evaluations:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des évaluations' });
  }
});

// Récupérer une évaluation par ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const evaluation = await Evaluation.findByPk(req.params.id, {
      include: [
        { model: Stagiaire, as: 'stagiaire' },
        { model: Utilisateur, as: 'tuteur', attributes: ['id', 'nom', 'prenom'] },
        { model: Utilisateur, as: 'rh_validateur', attributes: ['id', 'nom', 'prenom'] }
      ]
    });
    
    if (!evaluation) {
      return res.status(404).json({ error: 'Évaluation non trouvée' });
    }
    
    res.json(evaluation);
  } catch (error) {
    console.error('Erreur GET /evaluations/:id:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'évaluation' });
  }
});

// Créer une évaluation
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      stage_id,
      type,
      note_technique,
      note_prof,
      note_com,
      points_forts,
      axes_amelioration,
      commentaire_tuteur,
      date_evaluation
    } = req.body;
    
    // Vérifier que le stage existe
    const stage = await Stagiaire.findByPk(stage_id);
    if (!stage) {
      return res.status(404).json({ error: 'Stage non trouvé' });
    }
    
    // Vérifier que l'utilisateur est le tuteur du stage
    if (req.user.role === 'tuteur' && stage.tuteur_id !== req.user.id) {
      return res.status(403).json({ error: 'Vous n\'êtes pas le tuteur de ce stage' });
    }
    
    // Créer l'évaluation
    const evaluation = await Evaluation.create({
      stage_id,
      tuteur_id: req.user.id,
      type: type || 'MI_PARCOURS',
      note_technique: note_technique || 0,
      note_prof: note_prof || 0,
      note_com: note_com || 0,
      points_forts,
      axes_amelioration,
      commentaire_tuteur,
      date_evaluation: date_evaluation || new Date(),
      statut: 'BROUILLON'
    });
    
    // Calculer la note
    evaluation.calculerNote();
    await evaluation.save();
    
    // Audit
    logAuditEvent({
      userId: req.user.id,
      action: 'EVALUATION_CREATE',
      details: { evaluationId: evaluation.id, type: evaluation.type }
    });
    
    res.status(201).json(evaluation);
  } catch (error) {
    console.error('Erreur POST /evaluations:', error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'évaluation' });
  }
});

// Mettre à jour une évaluation
router.put('/:id', authenticate, async (req, res) => {
  try {
    const evaluation = await Evaluation.findByPk(req.params.id);
    
    if (!evaluation) {
      return res.status(404).json({ error: 'Évaluation non trouvée' });
    }
    
    // Vérifier les permissions
    if (req.user.role === 'tuteur' && evaluation.tuteur_id !== req.user.id) {
      return res.status(403).json({ error: 'Vous n\'êtes pas le tuteur de cette évaluation' });
    }
    
    if (evaluation.statut === 'VALIDEE_RH') {
      return res.status(403).json({ error: 'Impossible de modifier une évaluation validée par RH' });
    }
    
    const {
      note_technique,
      note_prof,
      note_com,
      points_forts,
      axes_amelioration,
      commentaire_tuteur,
      date_evaluation,
      // Auto-évaluation
      auto_evaluation_tech,
      auto_evaluation_prof,
      auto_evaluation_com,
      auto_evaluation_commentaire
    } = req.body;
    
    // Mise à jour des champs
    if (note_technique !== undefined) evaluation.note_technique = note_technique;
    if (note_prof !== undefined) evaluation.note_prof = note_prof;
    if (note_com !== undefined) evaluation.note_com = note_com;
    if (points_forts !== undefined) evaluation.points_forts = points_forts;
    if (axes_amelioration !== undefined) evaluation.axes_amelioration = axes_amelioration;
    if (commentaire_tuteur !== undefined) evaluation.commentaire_tuteur = commentaire_tuteur;
    if (date_evaluation !== undefined) evaluation.date_evaluation = date_evaluation;
    
    // Auto-évaluation (peut être mise à jour par le stagière)
    if (auto_evaluation_tech !== undefined) evaluation.auto_evaluation_tech = auto_evaluation_tech;
    if (auto_evaluation_prof !== undefined) evaluation.auto_evaluation_prof = auto_evaluation_prof;
    if (auto_evaluation_com !== undefined) evaluation.auto_evaluation_com = auto_evaluation_com;
    if (auto_evaluation_commentaire !== undefined) evaluation.auto_evaluation_commentaire = auto_evaluation_commentaire;
    
    // Recalculer la note
    evaluation.calculerNote();
    
    await evaluation.save();
    
    logAuditEvent({
      userId: req.user.id,
      action: 'EVALUATION_UPDATE',
      details: { evaluationId: evaluation.id }
    });
    
    res.json(evaluation);
  } catch (error) {
    console.error('Erreur PUT /evaluations:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'évaluation' });
  }
});

// Soumettre une évaluation (passe de BROUILLON à SOUMISE)
router.post('/:id/soumettre', authenticate, async (req, res) => {
  try {
    const evaluation = await Evaluation.findByPk(req.params.id);
    
    if (!evaluation) {
      return res.status(404).json({ error: 'Évaluation non trouvée' });
    }
    
    if (req.user.role === 'tuteur' && evaluation.tuteur_id !== req.user.id) {
      return res.status(403).json({ error: 'Vous n\'êtes pas le tuteur de cette évaluation' });
    }
    
    if (evaluation.statut !== 'BROUILLON') {
      return res.status(400).json({ error: 'L\'évaluation doit être en brouillon pour être soumise' });
    }
    
    // Vérifier que les notes sont complètes pour MI_PARCOURS ou FINALE
    if (evaluation.type !== 'INTEGRATION') {
      if (!evaluation.note_technique && evaluation.note_technique !== 0) {
        return res.status(400).json({ error: 'La note technique est requise' });
      }
    }
    
    evaluation.statut = 'SOUMISE';
    await evaluation.save();
    
    logAuditEvent({
      userId: req.user.id,
      action: 'EVALUATION_SUBMIT',
      details: { evaluationId: evaluation.id }
    });
    
    res.json(evaluation);
  } catch (error) {
    console.error('Erreur POST /evaluations/:id/soumettre:', error);
    res.status(500).json({ error: 'Erreur lors de la soumission de l\'évaluation' });
  }
});

// Validation RH (admin_rh ou super_admin uniquement)
router.post('/:id/valider-rh', authenticate, authorize(['admin_rh', 'super_admin']), async (req, res) => {
  try {
    const evaluation = await Evaluation.findByPk(req.params.id, {
      include: [
        { model: Stagiaire, as: 'stagiaire' },
        { model: Utilisateur, as: 'tuteur', attributes: ['nom', 'prenom'] }
      ]
    });
    
    if (!evaluation) {
      return res.status(404).json({ error: 'Évaluation non trouvée' });
    }
    
    if (evaluation.statut !== 'SOUMISE') {
      return res.status(400).json({ error: 'L\'évaluation doit être soumise pour être validée' });
    }
    
    evaluation.statut = 'VALIDEE_RH';
    evaluation.rh_validee_par = req.user.id;
    evaluation.rh_date_validation = new Date();
    
    await evaluation.save();
    
    logAuditEvent({
      userId: req.user.id,
      action: 'EVALUATION_RH_VALIDATE',
      details: { evaluationId: evaluation.id }
    });
    
    res.json(evaluation);
  } catch (error) {
    console.error('Erreur POST /evaluations/:id/valider-rh:', error);
    res.status(500).json({ error: 'Erreur lors de la validation RH' });
  }
});

// Rejet RH
router.post('/:id/rejeter-rh', authenticate, authorize(['admin_rh', 'super_admin']), async (req, res) => {
  try {
    const { commentaire } = req.body;
    const evaluation = await Evaluation.findByPk(req.params.id);
    
    if (!evaluation) {
      return res.status(404).json({ error: 'Évaluation non trouvée' });
    }
    
    evaluation.statut = 'REFUSEE';
    evaluation.rh_validee_par = req.user.id;
    evaluation.rh_date_validation = new Date();
    evaluation.rh_commentaire = commentaire;
    
    await evaluation.save();
    
    logAuditEvent({
      userId: req.user.id,
      action: 'EVALUATION_RH_REJECT',
      details: { evaluationId: evaluation.id, reason: commentaire }
    });
    
    res.json(evaluation);
  } catch (error) {
    console.error('Erreur POST /evaluations/:id/rejeter-rh:', error);
    res.status(500).json({ error: 'Erreur lors du rejet de l\'évaluation' });
  }
});

// Générer le PDF de l'évaluation
router.get('/:id/pdf', authenticate, async (req, res) => {
  try {
    const evaluation = await Evaluation.findByPk(req.params.id, {
      include: [
        { model: Stagiaire, as: 'stagiaire', include: [
          { model: Departement, as: 'departement', attributes: ['nom'] }
        ]},
        { model: Utilisateur, as: 'tuteur', attributes: ['nom', 'prenom'] }
      ]
    });
    
    if (!evaluation) {
      return res.status(404).json({ error: 'Évaluation non trouvée' });
    }
    
    if (!['VALIDEE_RH', 'SOUMISE'].includes(evaluation.statut)) {
      return res.status(400).json({ error: 'L\'évaluation doit être soumise ou validée pour générer le PDF' });
    }
    
    // Créer le PDF
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];
    
    doc.on('data', chunk => chunks.push(chunk));
    
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=evaluation_${evaluation.id}.pdf`);
      res.send(pdfBuffer);
    });
    
    // En-tête
    doc.fontSize(20).text('RAPPORT D\'ÉVALUATION', { align: 'center' });
    doc.moveDown();
    
    // Type d'évaluation
    const typeLabels = {
      INTEGRATION: 'Évaluation d\'intégration',
      MI_PARCOURS: 'Évaluation mi-parcours',
      FINALE: 'Évaluation finale'
    };
    doc.fontSize(14).text(typeLabels[evaluation.type] || evaluation.type, { align: 'center' });
    doc.moveDown(2);
    
    // Informations stagière
    doc.fontSize(12).text('INFORMATIONS DU STAGIAIRE', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11);
    doc.text(`Nom: ${evaluation.stagiaire?.nom || ''} ${evaluation.stagiaire?.prenom || ''}`);
    doc.text(`Établissement: ${evaluation.stagiaire?.etablissement || 'N/A'}`);
    doc.text(`Niveau: ${evaluation.stagiaire?.niveau || 'N/A'}`);
    doc.text(`Département: ${evaluation.stagiaire?.departement?.nom || 'N/A'}`);
    doc.text(`Tuteur: ${evaluation.tuteur?.nom || ''} ${evaluation.tuteur?.prenom || ''}`);
    doc.text(`Date d'évaluation: ${evaluation.date_evaluation || evaluation.created_at}`);
    doc.moveDown(2);
    
    // Notes
    doc.fontSize(12).text('RÉSULTATS', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11);
    
    const notesTable = [
      ['Compétences techniques', `${evaluation.note_technique}/40`],
      ['Qualités professionnelles', `${evaluation.note_prof}/30`],
      ['Communication et rapport', `${evaluation.note_com}/30`],
      ['TOTAL', `${evaluation.note_totale}/100`]
    ];
    
    notesTable.forEach(([label, value]) => {
      doc.text(`${label}: ${value}`);
    });
    doc.moveDown();
    
    // Mention
    const mentionLabels = {
      TB: 'Très bien',
      B: 'Bien',
      AB: 'Assez bien',
      P: 'Passable',
      I: 'Insuffisant'
    };
    doc.fontSize(14).text(`Mention: ${evaluation.mention} - ${mentionLabels[evaluation.mention] || ''}`, { bold: true });
    doc.moveDown(2);
    
    // Points forts et axes d'amélioration
    if (evaluation.points_forts) {
      doc.fontSize(12).text('POINTS FORTS', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11).text(evaluation.points_forts);
      doc.moveDown();
    }
    
    if (evaluation.axes_amelioration) {
      doc.fontSize(12).text('AXES D\'AMÉLIORATION', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11).text(evaluation.axes_amelioration);
      doc.moveDown();
    }
    
    if (evaluation.commentaire_tuteur) {
      doc.fontSize(12).text('COMMENTAIRE DU TUTEUR', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11).text(evaluation.commentaire_tuteur);
      doc.moveDown();
    }
    
    // Signature
    doc.moveDown(3);
    doc.fontSize(10).text('Document généré automatiquement', { align: 'center' });
    doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' });
    
    doc.end();
  } catch (error) {
    console.error('Erreur GET /evaluations/:id/pdf:', error);
    res.status(500).json({ error: 'Erreur lors de la génération du PDF' });
  }
});

// Supprimer une évaluation ( Brouillon uniquement)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const evaluation = await Evaluation.findByPk(req.params.id);
    
    if (!evaluation) {
      return res.status(404).json({ error: 'Évaluation non trouvée' });
    }
    
    if (evaluation.statut !== 'BROUILLON') {
      return res.status(400).json({ error: 'Seules les évaluations en brouillon peuvent être supprimées' });
    }
    
    if (req.user.role === 'tuteur' && evaluation.tuteur_id !== req.user.id) {
      return res.status(403).json({ error: 'Vous n\'êtes pas le tuteur de cette évaluation' });
    }
    
    await evaluation.destroy();
    
    logAuditEvent({
      userId: req.user.id,
      action: 'EVALUATION_DELETE',
      details: { evaluationId: req.params.id }
    });
    
    res.json({ message: 'Évaluation supprimée avec succès' });
  } catch (error) {
    console.error('Erreur DELETE /evaluations:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'évaluation' });
  }
});

module.exports = router;
