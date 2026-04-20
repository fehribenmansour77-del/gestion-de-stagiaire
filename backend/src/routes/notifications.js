/**
 * Routes: Notifications et Messages
 * API pour les notifications et la messagerie interne
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { Notification, Message, Stagiaire, Utilisateur } = require('../models');
const { authenticate } = require('../middleware/auth');
const { logAuditEvent } = require('../services/auditService');
const { Op } = require('sequelize');

// Configuration multer pour les pièces jointes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/messages/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|xls|xlsx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Type de fichier non autorisé'));
  }
});

// ==================== NOTIFICATIONS ====================

// GET /notifications - Liste des notifications utilisateur
router.get('/notifications', authenticate, async (req, res) => {
  try {
    const { non_lues_seulement, page = 1, limit = 20 } = req.query;
    
    const where = { utilisateur_id: req.user.id };
    if (non_lues_seulement === 'true') {
      where.lue = false;
    }
    
    const offset = (page - 1) * limit;
    
    const { count, rows: notifications } = await Notification.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit) || 20,
      offset: parseInt(offset) || 0
    });
    
    // Compter les non-lues
    const unreadCount = await Notification.count({
      where: { utilisateur_id: req.user.id, lue: false }
    });
    
    res.json({
      notifications,
      unreadCount,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Erreur GET /notifications:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération' });
  }
});

// GET /notifications/count - Nombre de notifications non lues
router.get('/notifications/count', authenticate, async (req, res) => {
  try {
    const count = await Notification.count({
      where: { utilisateur_id: req.user.id, lue: false }
    });
    res.json({ count });
  } catch (error) {
    console.error('Erreur GET /notifications/count:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération' });
  }
});

// PUT /notifications/:id/lire - Marquer comme lue
router.put('/notifications/:id/lire', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, utilisateur_id: req.user.id }
    });
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification non trouvée' });
    }
    
    notification.lue = true;
    notification.date_lecture = new Date();
    await notification.save();
    
    res.json(notification);
  } catch (error) {
    console.error('Erreur PUT /notifications/:id/lire:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

// PUT /notifications/lire-toutes - Marquer toutes comme lues
router.put('/notifications/lire-toutes', authenticate, async (req, res) => {
  try {
    await Notification.update(
      { lue: true, date_lecture: new Date() },
      { where: { utilisateur_id: req.user.id, lue: false } }
    );
    
    res.json({ message: 'Toutes les notifications marquées comme lues' });
  } catch (error) {
    console.error('Erreur PUT /notifications/lire-toutes:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

// ==================== MESSAGES ====================

// GET /messages - Liste des messages
router.get('/messages', authenticate, async (req, res) => {
  try {
    const { type = 'received', page = 1, limit = 20 } = req.query;
    
    let where;
    if (type === 'sent') {
      where = { expediteur_id: req.user.id };
    } else {
      where = { destinataire_id: req.user.id };
    }
    
    const offset = (page - 1) * limit;
    
    const { count, rows: messages } = await Message.findAndCountAll({
      where,
      include: [
        { model: Utilisateur, as: 'expediteur', attributes: ['id', 'nom', 'prenom', 'email'] },
        { model: Utilisateur, as: 'destinataire', attributes: ['id', 'nom', 'prenom', 'email'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit) || 20,
      offset: parseInt(offset) || 0
    });
    
    // Compter les non-lus
    const unreadCount = await Message.count({
      where: { destinataire_id: req.user.id, lu: false }
    });
    
    res.json({
      messages,
      unreadCount,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Erreur GET /messages:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération' });
  }
});

// GET /messages/:id - Détail d'un message
router.get('/messages/:id', authenticate, async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id, {
      include: [
        { model: Utilisateur, as: 'expediteur', attributes: ['id', 'nom', 'prenom', 'email'] },
        { model: Utilisateur, as: 'destinataire', attributes: ['id', 'nom', 'prenom', 'email'] },
        { model: Stagiaire, as: 'stagiaire', attributes: ['id', 'nom', 'prenom'] }
      ]
    });
    
    if (!message) {
      return res.status(404).json({ error: 'Message non trouvé' });
    }
    
    // Vérifier les permissions
    if (message.expediteur_id !== req.user.id && message.destinataire_id !== req.user.id) {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    
    // Marquer comme lu si destinataire
    if (message.destinataire_id === req.user.id && !message.lu) {
      message.lu = true;
      message.date_lecture = new Date();
      await message.save();
    }
    
    res.json(message);
  } catch (error) {
    console.error('Erreur GET /messages/:id:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération' });
  }
});

// POST /messages - Envoyer un message
router.post('/messages', authenticate, upload.single('piece_jointe'), async (req, res) => {
  try {
    const { destinataire_id, stage_id, sujet, contenu } = req.body;
    
    if (!destinataire_id || !contenu) {
      return res.status(400).json({ error: 'Destinataire et contenu requis' });
    }
    
    const message = await Message.create({
      expediteur_id: req.user.id,
      destinataire_id: parseInt(destinataire_id),
      stage_id: stage_id || null,
      sujet: sujet || null,
      contenu,
      piece_jointe_nom: req.file ? req.file.originalname : null,
      piece_jointe_chemin: req.file ? req.file.path : null,
      piece_jointe_taille: req.file ? req.file.size : null
    });
    
    // Créer une notification
    const destinataire = await Utilisateur.findByPk(destinataire_id);
    await Notification.create({
      utilisateur_id: destinataire_id,
      titre: 'Nouveau message',
      message: `Vous avez reçu un message de ${req.user.nom} ${req.user.prenom}`,
      type: 'SYSTEM',
      lien: `/messages/${message.id}`
    });
    
    logAuditEvent({
      userId: req.user.id,
      action: 'MESSAGE_SEND',
      details: { messageId: message.id, destinataire_id }
    });
    
    res.status(201).json(message);
  } catch (error) {
    console.error('Erreur POST /messages:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi du message' });
  }
});

// PUT /messages/:id/lu - Marquer comme lu
router.put('/messages/:id/lu', authenticate, async (req, res) => {
  try {
    const message = await Message.findOne({
      where: { id: req.params.id, destinataire_id: req.user.id }
    });
    
    if (!message) {
      return res.status(404).json({ error: 'Message non trouvé' });
    }
    
    message.lu = true;
    message.date_lecture = new Date();
    await message.save();
    
    res.json(message);
  } catch (error) {
    console.error('Erreur PUT /messages/:id/lu:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

// DELETE /messages/:id - Supprimer un message
router.delete('/messages/:id', authenticate, async (req, res) => {
  try {
    const message = await Message.findOne({
      where: { 
        id: req.params.id,
        [Op.or]: [
          { expediteur_id: req.user.id },
          { destinataire_id: req.user.id }
        ]
      }
    });
    
    if (!message) {
      return res.status(404).json({ error: 'Message non trouvé' });
    }
    
    await message.destroy();
    
    res.json({ message: 'Message supprimé' });
  } catch (error) {
    console.error('Erreur DELETE /messages/:id:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

// ==================== SERVICE DE NOTIFICATION ====================

// Fonction utilitaire pour créer des notifications
const createNotification = async (utilisateurId, titre, message, type, lien = null, donneesExtra = null) => {
  return await Notification.create({
    utilisateur_id: utilisateurId,
    titre,
    message,
    type,
    lien,
    donnees_extra: donneesExtra
  });
};

//Exporter pour utilisation dans d'autres modules
module.exports = router;
module.exports.createNotification = createNotification;
