/**
 * Modèle: Evaluation
 * Évaluation des stagiaires (mi-parcours et finale)
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Evaluation = sequelize.define('Evaluation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  stage_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  tuteur_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('INTEGRATION', 'MI_PARCOURS', 'FINALE'),
    allowNull: false,
    defaultValue: 'MI_PARCOURS'
  },
  // Notes par catégorie
  note_technique: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 40
    },
    comment: 'Note compétences techniques (max 40 pts)'
  },
  note_prof: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 30
    },
    comment: 'Note qualités professionnelles (max 30 pts)'
  },
  note_com: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 30
    },
    comment: 'Note communication et rapport (max 30 pts)'
  },
  note_totale: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Note totale (max 100 pts)'
  },
  mention: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'TB, B, AB, P, I'
  },
  // Auto-évaluation du stagière
  auto_evaluation_tech: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true,
    comment: 'Auto-évaluation techniques'
  },
  auto_evaluation_prof: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true,
    comment: 'Auto-évaluation professionnelles'
  },
  auto_evaluation_com: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true,
    comment: 'Auto-évaluation communication'
  },
  auto_evaluation_commentaire: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Commentaire auto-évaluation'
  },
  // Commentaires tuteur
  points_forts: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Points forts du stagière'
  },
  axes_amelioration: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Axes d\'amélioration'
  },
  commentaire_tuteur: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Commentaire général du tuteur'
  },
  // Statut et validation
  statut: {
    type: DataTypes.ENUM('BROUILLON', 'SOUMISE', 'VALIDEE_RH', 'REFUSEE'),
    allowNull: false,
    defaultValue: 'BROUILLON'
  },
  // Validation RH
  rh_validee_par: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  rh_date_validation: {
    type: DataTypes.DATE,
    allowNull: true
  },
  rh_commentaire: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Commentaire RH en cas de refus'
  },
  // PDF
  pdf_path: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Chemin du PDF généré'
  },
  // Dates
  date_evaluation: {
    type: DataTypes.DATEONLY,
    allowNull: true
  }
}, {
  tableName: 'evaluations',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['stage_id'] },
    { fields: ['tuteur_id'] },
    { fields: ['type'] },
    { fields: ['statut'] }
  ]
});

// Méthode de calcul de la note totale et mention
Evaluation.prototype.calculerNote = function() {
  const tech = parseFloat(this.note_technique) || 0;
  const prof = parseFloat(this.note_prof) || 0;
  const com = parseFloat(this.note_com) || 0;
  
  this.note_totale = (tech + prof + com).toFixed(2);
  
  // Attribution de la mention
  const note = parseFloat(this.note_totale);
  if (note >= 90) {
    this.mention = 'TB'; // Très Bien
  } else if (note >= 75) {
    this.mention = 'B'; // Bien
  } else if (note >= 60) {
    this.mention = 'AB'; // Assez Bien
  } else if (note >= 50) {
    this.mention = 'P'; // Passable
  } else {
    this.mention = 'I'; // Insuffisant
  }
  
  return { note_totale: this.note_totale, mention: this.mention };
};

// Fonction utilitaire pour calculer la mention
Evaluation.getMentionFromNote = function(note) {
  if (note >= 90) return { code: 'TB', label: 'Très bien' };
  if (note >= 75) return { code: 'B', label: 'Bien' };
  if (note >= 60) return { code: 'AB', label: 'Assez bien' };
  if (note >= 50) return { code: 'P', label: 'Passable' };
  return { code: 'I', label: 'Insuffisant' };
};

module.exports = Evaluation;
