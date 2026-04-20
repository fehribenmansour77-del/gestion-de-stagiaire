/**
 * Routes: Dashboard
 * API pour les KPIs et statistiques
 */

const express = require('express');
const router = express.Router();
const { Stagiaire, Candidature, Presence, Convention, Departement, Evaluation, Utilisateur } = require('../models');
const { Op } = require('sequelize');
const { authenticate, authorize } = require('../middleware/auth');
const XLSX = require('xlsx');
const PDFDocument = require('pdfkit');

// GET /api/dashboard/kpis - KPIs principaux
router.get('/kpis', authenticate, async (req, res) => {
  try {
    const { date_debut, date_fin } = req.query;
    
    const whereStage = {};
    const whereCandidature = {};
    const wherePresence = {};
    
    if (date_debut && date_fin) {
      whereStage.date_debut = { [Op.between]: [date_debut, date_fin] };
    }
    
    // KPIs de base
    const [
      totalStagiaires,
      actifsStagiaires,
      totalCandidatures,
      pendingCandidatures,
      acceptedCandidatures,
      refusedCandidatures,
      conventionsEnAttente,
      conventionsSignees
    ] = await Promise.all([
      // Total des stagiaires (tous statuts)
      Stagiaire.count(),
      
      // Stagiaires actifs (en cours)
      Stagiaire.count({
        where: { statut: 'actif' }
      }),
      
      // Total candidatures (TOUS statuts)
      Candidature.count(),
      
      // Candidatures en attente
      Candidature.count({
        where: { statut: 'en_attente' }
      }),
      
      // Candidatures acceptées
      Candidature.count({
        where: { statut: 'acceptee' }
      }),
      
      // Candidatures refusées
      Candidature.count({
        where: { statut: 'refusee' }
      }),
      
      // Conventions en attente de signature
      Convention.count({
        where: { statut: 'en_signature' }
      }),
      
      // Conventions signées
      Convention.count({
        where: { statut: 'signee' }
      })
    ]);

    // Fins de stage dans les 7 prochains jours (Alerte Administrative)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const todayDate = new Date().toISOString().split('T')[0];
    
    const finsProches = await Stagiaire.findAll({
      where: {
        statut: 'actif',
        date_fin: {
          [Op.between]: [todayDate, sevenDaysFromNow.toISOString().split('T')[0]]
        }
      },
      include: [
        { model: Departement, as: 'departement', attributes: ['nom'] },
        { model: Utilisateur, as: 'utilisateur', attributes: ['nom', 'prenom'] }
      ],
      attributes: ['id', 'date_fin', 'etablissement'],
      order: [['date_fin', 'ASC']],
      limit: 5
    });
    
    // Calcul du taux de présence moyen
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    const presences = await Presence.findAll({
      where: {
        date: {
          [Op.between]: [
            `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`,
            `${currentYear}-${String(currentMonth).padStart(2, '0')}-31`
          ]
        }
      }
    });
    
    const totalPresences = presences.length;
    const presents = presences.filter(p => p.statut === 'P').length;
    const tauxPresence = totalPresences > 0 ? Math.round((presents / totalPresences) * 100) : 100;
    
    res.json({
      kpis: {
        total_stagiaires: totalStagiaires,
        stagiaires_actifs: actifsStagiaires,
        total_candidatures: totalCandidatures,
        candidatures_en_attente: pendingCandidatures,
        candidatures_acceptees: acceptedCandidatures,
        candidatures_refusees: refusedCandidatures,
        conventions_en_attente: conventionsEnAttente,
        conventions_signees: conventionsSignees,
        taux_presence: tauxPresence,
        fins_proches: finsProches,
        date_generation: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Erreur GET /dashboard/kpis:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des KPIs' });
  }
});

// GET /api/dashboard/evolution - Évolution mensuelle
router.get('/evolution', authenticate, async (req, res) => {
  try {
    const { mois = 12 } = req.query;
    const months = parseInt(mois);
    const currentDate = new Date();
    const data = [];
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthStr = `${year}-${String(month).padStart(2, '0')}`;
      
      const [stagiaires, presences, evaluations] = await Promise.all([
        Stagiaire.count({
          where: {
            created_at: {
              [Op.between]: [`${monthStr}-01`, `${monthStr}-31`]
            }
          }
        }),
        Presence.count({
          where: {
            date: {
              [Op.between]: [`${monthStr}-01`, `${monthStr}-31`]
            }
          }
        }),
        Evaluation.count({
          where: {
            created_at: {
              [Op.between]: [`${monthStr}-01`, `${monthStr}-31`]
            }
          }
        })
      ]);
      
      data.push({
        mois: monthStr,
        label: date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        nouveaux_stagiaires: stagiaires,
        presences_enregistrees: presences,
        evaluations_realisees: evaluations
      });
    }
    
    res.json({ evolution: data });
  } catch (error) {
    console.error('Erreur GET /dashboard/evolution:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'évolution' });
  }
});

// GET /api/dashboard/departements - Répartition par département
router.get('/departements', authenticate, async (req, res) => {
  try {
    const departements = await Departement.findAll({
      include: [{
        model: Stagiaire,
        as: 'stagiaires',
        where: { statut: 'actif' },
        required: false
      }]
    });
    
    const data = departements.map(dept => ({
      id: dept.id,
      nom: dept.nom,
      effectif: dept.stagiaires?.length || 0
    })).filter(d => d.effectif > 0);
    
    res.json({ departements: data });
  } catch (error) {
    console.error('Erreur GET /dashboard/departements:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération' });
  }
});

// GET /api/dashboard/activite - Activité récente
router.get('/activite', authenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Récupérer les dernières candidatures et stagiaires avec include Utilisateur
    const [recentCandidatures, recentStages] = await Promise.all([
      Candidature.findAll({
        order: [['created_at', 'DESC']],
        limit: Math.floor(limit / 2),
        attributes: ['id', 'nom', 'prenom', 'statut', 'created_at']
      }),
      Stagiaire.findAll({
        order: [['created_at', 'DESC']],
        limit: Math.floor(limit / 2),
        attributes: ['id', 'statut', 'created_at'],
        include: [{
          model: Utilisateur,
          as: 'utilisateur',
          attributes: ['nom', 'prenom']
        }]
      })
    ]);

    // Combiner et trier
    const activites = [
      ...recentCandidatures.map(c => ({
        type: 'candidature',
        id: c.id,
        description: `Nouvelle candidature: ${c.prenom} ${c.nom}`,
        statut: c.statut,
        date: c.created_at
      })),
      ...recentStages.map(s => ({
        type: 'stage',
        id: s.id,
        description: `Stage: ${s.utilisateur?.prenom} ${s.utilisateur?.nom}`,
        statut: s.statut,
        date: s.created_at
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, limit);

    res.json({ activite: activites });
  } catch (error) {
    console.error('Erreur GET /dashboard/activite:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération' });
  }
});

// POST /api/dashboard/export/excel - Export Excel
router.post('/export/excel', authenticate, authorize(['admin_rh', 'super_admin']), async (req, res) => {
  try {
    const { type = 'stagiaires' } = req.body;
    
    let data = [];
    let sheetName = 'Données';
    
    switch (type) {
      case 'stagiaires':
        data = await Stagiaire.findAll({
          include: [
            { model: Departement, as: 'departement', attributes: ['nom'] }
          ]
        });
        data = data.map(s => ({
          Nom: s.nom,
          Prénom: s.prenom,
          Email: s.email,
          Établissement: s.etablissement,
          Niveau: s.niveau,
          'Date début': s.date_debut,
          'Date fin': s.date_fin,
          Statut: s.statut,
          Département: s.departement?.nom
        }));
        sheetName = 'Stagiaires';
        break;
        
      case 'candidatures':
        data = await Candidature.findAll({ order: [['created_at', 'DESC']] });
        data = data.map(c => ({
          Nom: c.nom,
          Prénom: c.prenom,
          Email: c.email,
          Téléphone: c.telephone,
          Établissement: c.etablissement,
          Niveau: c.niveau,
          'Date postulation': c.created_at,
          Statut: c.statut
        }));
        sheetName = 'Candidatures';
        break;
        
      case 'presences':
        data = await Presence.findAll({
          include: [{
            model: Stagiaire,
            as: 'stagiaire',
            attributes: ['nom', 'prenom']
          }],
          order: [['date', 'DESC']],
          limit: 1000
        });
        data = data.map(p => ({
          Date: p.date,
          Stagiaire: p.stagiaire ? `${p.stagiaire.nom} ${p.stagiaire.prenom}` : '',
          Statut: p.statut,
          'Heure entrée': p.heure_entree,
          'Heure sortie': p.heure_sortie,
          Commentaire: p.commentaire
        }));
        sheetName = 'Présences';
        break;
    }
    
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=export_${type}_${new Date().toISOString().split('T')[0]}.xlsx`);
    res.send(buffer);
  } catch (error) {
    console.error('Erreur export Excel:', error);
    res.status(500).json({ error: 'Erreur lors de l\'export Excel' });
  }
});

// POST /api/dashboard/export/pdf - Export PDF
router.post('/export/pdf', authenticate, authorize(['admin_rh', 'super_admin']), async (req, res) => {
  try {
    const { type = 'rapport' } = req.body;
    
    // Récupérer les données
    const [kpis, evolution, departements] = await Promise.all([
      getKPIs(),
      getEvolution(6),
      getDepartements()
    ]);
    
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];
    
    doc.on('data', chunk => chunks.push(chunk));
    
    doc.on('end', () => {
      const buffer = Buffer.concat(chunks);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=rapport_${new Date().toISOString().split('T')[0]}.pdf`);
      res.send(buffer);
    });
    
    // En-tête
    doc.fontSize(20).text('RAPPORT D\'ACTIVITÉ', { align: 'center' });
    doc.fontSize(12).text(`GIAS Industries / CSM`, { align: 'center' });
    doc.fontSize(10).text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' });
    doc.moveDown(2);
    
    // KPIs
    doc.fontSize(14).text('INDICATEURS CLÉS', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11);
    doc.text(`Stagiaires actifs: ${kpis.stagiaires_actifs}`);
    doc.text(`Candidatures en attente: ${kpis.candidatures_en_attente}`);
    doc.text(`Taux de présence: ${kpis.taux_presence}%`);
    doc.text(`Conventions signées: ${kpis.conventions_signees}`);
    doc.moveDown(2);
    
    // Évolution
    doc.fontSize(14).text('ÉVOLUTION MENSUELLE', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    evolution.forEach(item => {
      doc.text(`${item.label}: ${item.nouveaux_stagiaires} nouveaux`);
    });
    doc.moveDown(2);
    
    // Départements
    doc.fontSize(14).text('RÉPARTITION PAR DÉPARTEMENT', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    departements.forEach(dept => {
      doc.text(`${dept.nom}: ${dept.effectif} stagiaires`);
    });
    
    // Pied de page
    doc.fontSize(8).text(
      `Rapport généré le ${new Date().toLocaleString('fr-FR')}`,
      50,
      doc.page.height - 50,
      { align: 'center' }
    );
    
    doc.end();
  } catch (error) {
    console.error('Erreur export PDF:', error);
    res.status(500).json({ error: 'Erreur lors de l\'export PDF' });
  }
});

// Fonctions utilitaires
async function getKPIs() {
  const [actifsStagiaires, pendingCandidatures, conventionsSignees] = await Promise.all([
    Stagiaire.count({ where: { statut: 'actif' } }),
    Candidature.count({ where: { statut: 'en_attente' } }),
    Convention.count({ where: { statut: 'signee' } })
  ]);
  
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  
  const presences = await Presence.findAll({
    where: {
      date: {
        [Op.between]: [
          `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`,
          `${currentYear}-${String(currentMonth).padStart(2, '0')}-31`
        ]
      }
    }
  });
  
  const presents = presences.filter(p => p.statut === 'P').length;
  const tauxPresence = presences.length > 0 ? Math.round((presents / presences.length) * 100) : 100;
  
  return {
    stagiaires_actifs: actifsStagiaires,
    candidatures_en_attente: pendingCandidatures,
    conventions_signees: conventionsSignees,
    taux_presence: tauxPresence
  };
}

async function getEvolution(months) {
  const currentDate = new Date();
  const data = [];
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    
    const count = await Stagiaire.count({
      where: {
        created_at: {
          [Op.between]: [`${monthStr}-01`, `${monthStr}-31`]
        }
      }
    });
    
    data.push({
      mois: monthStr,
      label: date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
      nouveaux_stagiaires: count
    });
  }
  
  return data;
}

async function getDepartements() {
  const departements = await Departement.findAll({
    include: [{
      model: Stagiaire,
      as: 'stagiaires',
      where: { statut: 'actif' },
      required: false
    }]
  });
  
  return departements.map(dept => ({
    nom: dept.nom,
    effectif: dept.stagiaires?.length || 0
  })).filter(d => d.effectif > 0);
}

module.exports = router;
