/**
 * Modèle Sequelize: Presence
 * Correspond à la table des présences des stagiaires
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Types de présence
const STATUTS = [
  'P',   // Présent
  'AJ',  // Absence justifiée
  'ANJ', // Absence non justifiée
  'C',   // Congé
  'R',   // Retard
  'DA',  // Départ anticipé
  'TT',  // Télétravail
  'JF'   // Jour férié
];

const Presence = sequelize.define('Presence', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  // Lien vers le stagiaire
  stage_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'stage_id'
  },
  
  // Date de présence
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  
  // Statut
  statut: {
    type: DataTypes.ENUM(...STATUTS),
    allowNull: false,
    defaultValue: 'P'
  },
  
  // Heures
  heure_entree: {
    type: DataTypes.TIME,
    allowNull: true
  },
  
  heure_sortie: {
    type: DataTypes.TIME,
    allowNull: true
  },
  
  // Commentaires
  justificatif: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'justificatif'
  },
  
  commentaire: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  // Auto-pointage
  est_auto_pointe: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'est_auto_pointe'
  },
  
  // Validation tuteur
  valide: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'valide'
  },
  
  date_validation: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'date_validation'
  },
  
  valide_par: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'valide_par'
  },
  
  // Saisi par
  saisie_par: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'saisie_par'
  },
  
  // Alerte générée
  alerte_generee: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'alerte_generee'
  }
}, {
  tableName: 'presences',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['stage_id', 'date'], unique: true },
    { fields: ['date'] },
    { fields: ['statut'] },
    { fields: ['valide'] }
  ]
});

// Méthodes d'instance (Sequelize 6+)
Presence.prototype.toJSON = function() {
  return {
    id: this.id,
    stage_id: this.stage_id,
    date: this.date,
    statut: this.statut,
    heure_entree: this.heure_entree,
    heure_sortie: this.heure_sortie,
    justificatif: this.justificatif,
    commentaire: this.commentaire,
    est_auto_pointe: this.est_auto_pointe,
    valide: this.valide,
    date_validation: this.date_validation,
    alerte_generee: this.alerte_generee
  };
};

Presence.prototype.getHeuresEffectuees = function() {
  if (!this.heure_entree || !this.heure_sortie) return 0;
  
  const [entreeH, entreeM] = this.heure_entree.split(':').map(Number);
  const [sortieH, sortieM] = this.heure_sortie.split(':').map(Number);
  
  const entreeMinutes = entreeH * 60 + entreeM;
  const sortieMinutes = sortieH * 60 + sortieM;
  
  return (sortieMinutes - entreeMinutes) / 60;
};

Presence.prototype.valider = async function(userId) {
  this.valide = true;
  this.date_validation = new Date();
  this.valide_par = userId;
  return this.save();
};

Presence.prototype.invalider = async function(commentaire) {
  this.valide = false;
  this.commentaire = commentaire;
  return this.save();
};

Presence.prototype.marquerAlerteGeneree = async function() {
  this.alerte_generee = true;
  return this.save();
};

// Méthodes de classe pour le calcul du taux
Presence.calculateTauxPresence = async function(stageId, dateDebut, dateFin) {
  const presences = await this.findAll({
    where: {
      stage_id: stageId,
      date: {
        [require('sequelize').Op.between]: [dateDebut, dateFin]
      }
    }
  });
  
  if (presences.length === 0) return 100;
  
  // Jours ouvrables (lundi-vendredi)
  const joursOuvrables = [];
  let current = new Date(dateDebut);
  const end = new Date(dateFin);
  
  while (current <= end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      joursOuvrables.push(current.toISOString().split('T')[0]);
    }
    current.setDate(current.getDate() + 1);
  }
  
  const joursPresents = presences.filter(p => 
    ['P', 'AJ', 'R', 'TT', 'JF'].includes(p.statut)
  ).length;
  
  return Math.round((joursPresents / joursOuvrables.length) * 100);
};

// Vérifie les absences consécutives
Presence.checkAbsencesConsecutives = async function(stageId) {
  const presences = await this.findAll({
    where: {
      stage_id: stageId,
      statut: 'ANJ'
    },
    order: [['date', 'DESC']],
    limit: 5
  });
  
  let consecutive = 0;
  let lastDate = null;
  
  for (const p of presences) {
    if (!lastDate) {
      consecutive = 1;
      lastDate = new Date(p.date);
      continue;
    }
    
    const diff = Math.floor((lastDate - new Date(p.date)) / (1000 * 60 * 60 * 24));
    
    if (diff === 1) {
      consecutive++;
    } else {
      break;
    }
    
    lastDate = new Date(p.date);
  }
  
  return consecutive >= 2;
};

module.exports = Presence;
