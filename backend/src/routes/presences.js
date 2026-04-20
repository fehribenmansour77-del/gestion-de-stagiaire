/**
 * Routes API: Présences
 * Endpoints pour la gestion des présences des stagiaires
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const XLSX = require('xlsx');
const fs = require('fs');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { Presence } = require('../models');
const { Stagiaire } = require('../models');
const { Op } = require('sequelize');

// Configuration multer pour les imports Excel
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/presences');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'import-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.xlsx', '.xls'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers Excel sont autorisés'), false);
    }
  }
});

// Ensure upload directory exists
const uploadDir = 'uploads/presences';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// POST /api/presences - Enregistrer une présence
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { stage_id, date, statut, heure_entree, heure_sortie, justificatif, commentaire } = req.body;
    
    // Vérifier le stagiaire
    const stagiaire = await Stagiaire.findByPk(stage_id);
    if (!stagiaire) {
      return res.status(404).json({
        success: false,
        error: 'Stagiaire non trouvé'
      });
    }
    
    // Vérifier si une présence existe déjà
    const existing = await Presence.findOne({
      where: { stage_id, date }
    });
    
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Une présence existe déjà pour cette date'
      });
    }
    
    // Créer la présence
    const presence = await Presence.create({
      stage_id,
      date,
      statut: statut || 'P',
      heure_entree,
      heure_sortie,
      justificatif,
      commentaire,
      saisie_par: req.user.id,
      est_auto_pointe: false,
      valide: true
    });
    
    // Vérifier les alertes
    await checkAlertes(stage_id);
    
    // Journalisation
    const { logAuditEvent } = require('../services/auditService');
    logAuditEvent({
      userId: req.user.id,
      action: 'CREATE_PRESENCE',
      entityType: 'Presence',
      entityId: presence.id,
      ipAddress: req.ip,
      details: { stage_id, date, statut }
    });
    
    res.status(201).json({
      success: true,
      message: 'Présence enregistrée',
      data: presence
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/presences/auto - Auto-pointage par le stagière
router.post('/auto', authenticate, async (req, res, next) => {
  try {
    const { stage_id } = req.body;
    const today = new Date().toISOString().split('T')[0];
    
    // Vérifier le stagière
    const stagiaire = await Stagiaire.findByPk(stage_id);
    if (!stagiaire) {
      return res.status(404).json({
        success: false,
        error: 'Stagiaire non trouvé'
      });
    }
    
    // Vérifier si une présence existe déjà
    const existing = await Presence.findOne({
      where: { stage_id, date: today }
    });
    
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Vous avez déjà pointé aujourd\'hui'
      });
    }
    
    // Créer la présence en attente de validation
    const presence = await Presence.create({
      stage_id,
      date: today,
      statut: 'P',
      heure_entree: new Date().toTimeString().split(' ')[0],
      saisie_par: req.user.id,
      est_auto_pointe: true,
      valide: false // En attente de validation
    });
    
    res.status(201).json({
      success: true,
      message: 'Pointage enregistré. En attente de validation par votre tuteur.',
      data: presence
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/presences/validate - Valider une présence auto-pointée
router.post('/validate',
  authenticate,
  authorize('tuteur', 'admin_rh', 'super_admin'),
  async (req, res, next) => {
    try {
      const { presence_id } = req.body;
      
      const presence = await Presence.findByPk(presence_id);
      if (!presence) {
        return res.status(404).json({
          success: false,
          error: 'Présence non trouvée'
        });
      }
      
      if (!presence.est_auto_pointe) {
        return res.status(400).json({
          success: false,
          error: 'Cette présence ne nécessite pas de validation'
        });
      }
      
      await presence.valider(req.user.id);
      
      res.json({
        success: true,
        message: 'Présence validée',
        data: presence
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/presences - Liste des présences
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { stage_id, date_debut, date_fin, statut, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (stage_id) where.stage_id = stage_id;
    if (statut) where.statut = statut;
    if (date_debut && date_fin) {
      where.date = { [Op.between]: [date_debut, date_fin] };
    }
    
    const { count, rows } = await Presence.findAndCountAll({
      where,
      include: [
        {
          model: Stagiaire,
          as: 'stagiaire',
          include: [
            { model: require('../models/Utilisateur'), as: 'utilisateur', attributes: ['nom', 'prenom'] }
          ]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date', 'DESC']]
    });
    
    // Ajouter le taux de présence si un stage_id est spécifié
    let tauxPresence = null;
    if (stage_id && date_debut && date_fin) {
      tauxPresence = await Presence.calculateTauxPresence(stage_id, date_debut, date_fin);
    }

    // Formater pour garder la compatibilité avec le frontend
    const formattedRows = rows.map(r => {
      const row = r.toJSON();
      if (row.stagiaire && row.stagiaire.utilisateur) {
        row.stagiaire.nom = row.stagiaire.utilisateur.nom;
        row.stagiaire.prenom = row.stagiaire.utilisateur.prenom;
        delete row.stagiaire.utilisateur;
      }
      return row;
    });
    
    res.json({
      success: true,
      data: formattedRows,
      taux_presence: tauxPresence,
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

// GET /api/presences/stagiaire/:stageId - Historique d'un stagière
router.get('/stagiaire/:stageId', authenticate, async (req, res, next) => {
  try {
    const { stageId } = req.params;
    const { mois, annee } = req.query;
    
    let dateDebut, dateFin;
    
    if (mois && annee) {
      dateDebut = `${annee}-${mois.padStart(2, '0')}-01`;
      const lastDay = new Date(annee, parseInt(mois), 0).getDate();
      dateFin = `${annee}-${mois.padStart(2, '0')}-${lastDay}`;
    } else {
      // Mois en cours
      const now = new Date();
      dateDebut = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      dateFin = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    }
    
    const presences = await Presence.findAll({
      where: {
        stage_id: stageId,
        date: { [Op.between]: [dateDebut, dateFin] }
      },
      order: [['date', 'ASC']]
    });
    
    const tauxPresence = await Presence.calculateTauxPresence(stageId, dateDebut, dateFin);
    
    res.json({
      success: true,
      data: presences,
      taux_presence: tauxPresence,
      periode: { date_debut: dateDebut, date_fin: dateFin }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/presences/import - Import Excel
router.post('/import',
  authenticate,
  authorize('tuteur', 'admin_rh', 'super_admin'),
  upload.single('fichier'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Aucun fichier上传'
        });
      }
      
      const { stage_id, date_debut } = req.body;
      
      // Lire le fichier Excel
      const workbook = XLSX.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      
      let imported = 0;
      let errors = [];
      
      for (const row of data) {
        try {
          const datePresence = row.Date || row.date || row.DATE;
          if (!datePresence) {
            errors.push({ row, error: 'Date manquante' });
            continue;
          }
          
          // Convertir la date Excel
          let dateStr;
          if (typeof datePresence === 'number') {
            const excelDate = new Date(Math.round((datePresence - 25569) * 86400 * 1000));
            dateStr = excelDate.toISOString().split('T')[0];
          } else {
            dateStr = datePresence;
          }
          
          const statut = (row.Statut || row.statut || row.STATUT || 'P').toString().toUpperCase();
          
          // Vérifier si une présence existe déjà
          const existing = await Presence.findOne({
            where: { stage_id, date: dateStr }
          });
          
          if (!existing) {
            await Presence.create({
              stage_id,
              date: dateStr,
              statut: ['P', 'AJ', 'ANJ', 'C', 'R', 'DA', 'TT', 'JF'].includes(statut) ? statut : 'P',
              heure_entree: row.HeureEntree || row.heure_entree || null,
              heure_sortie: row.HeureSortie || row.heure_sortie || null,
              commentaire: row.Commentaire || row.commentaire || null,
              saisie_par: req.user.id,
              valide: true
            });
            imported++;
          }
        } catch (e) {
          errors.push({ row, error: e.message });
        }
      }
      
      // Supprimer le fichier temporaire
      fs.unlinkSync(req.file.path);
      
      res.json({
        success: true,
        message: `${imported} présences importées`,
        imported,
        errors: errors.length > 0 ? errors : null
      });
    } catch (error) {
      next(error);
    }
  }
);

// Fonction de vérification des alertes
async function checkAlertes(stageId) {
  // Les fonctions sont des méthodes statiques sur le modèle Presence
  
  // Vérifier les absences consécutives
  const hasConsecutiveAbsences = await Presence.checkAbsencesConsecutives(stageId);
  if (hasConsecutiveAbsences) {
    // TODO: Envoyer alerte
    console.log(`Alerte: 2 absences consécutives pour le stage ${stageId}`);
  }
  
  // Vérifier le taux de présence
  const now = new Date();
  const dateDebut = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const dateFin = now.toISOString().split('T')[0];
  
  const taux = await Presence.calculateTauxPresence(stageId, dateDebut, dateFin);
  if (taux < 80) {
    // TODO: Envoyer alerte
    console.log(`Alerte: Taux de présence ${taux}% pour le stage ${stageId}`);
  }
}

module.exports = router;
