/**
 * Associations Sequelize
 * Définit toutes les relations entre les modèles
 */

const Utilisateur = require('./Utilisateur');
const Departement = require('./Departement');
const Stagiaire = require('./Stagiaire');
const Evaluation = require('./Evaluation');
const Notification = require('./Notification');
const Message = require('./Message');
const Admin = require('./Admin');
const Document = require('./Document');
const Presence = require('./Presence');
const Convention = require('./Convention');
const Candidature = require('./Candidature');

/**
 * Configure toutes les associations entre modèles
 */
function setupAssociations() {
  const models = { Departement, Utilisateur, Stagiaire, Candidature, Admin, Evaluation, Notification, Message, Document, Presence, Convention };
  const missingModels = Object.entries(models).filter(([_, model]) => !model).map(([name]) => name);
  
  if (missingModels.length > 0) {
    console.warn(`⚠️ Modèles indéfinis lors du paramétrage des associations: ${missingModels.join(', ')}. Cela est généralement dû à une dépendance circulaire dans les requires.`);
    return;
  }
  // Departement - Departement (hiérarchie parent-enfant)
  Departement.belongsTo(Departement, {
    as: 'parent',
    foreignKey: 'parent_id',
    targetKey: 'id'
  });
  
  Departement.hasMany(Departement, {
    as: 'children',
    foreignKey: 'parent_id',
    sourceKey: 'id'
  });
  
  // Departement - Utilisateur (responsable)
  Departement.belongsTo(Utilisateur, {
    as: 'responsable',
    foreignKey: 'responsable_id',
    targetKey: 'id'
  });
  
  Utilisateur.hasMany(Departement, {
    as: 'departementsResponsables',
    foreignKey: 'responsable_id',
    sourceKey: 'id'
  });
  
  // Utilisateur - Departement (affectation)
  Utilisateur.belongsTo(Departement, {
    as: 'departement',
    foreignKey: 'departement_id',
    targetKey: 'id'
  });
  
  Departement.hasMany(Utilisateur, {
    as: 'membres',
    foreignKey: 'departement_id',
    sourceKey: 'id'
  });
  
  // Stagiaire - Utilisateur
  Stagiaire.belongsTo(Utilisateur, {
    as: 'utilisateur',
    foreignKey: 'utilisateur_id',
    targetKey: 'id'
  });
  
  Utilisateur.hasMany(Stagiaire, {
    as: 'stages',
    foreignKey: 'utilisateur_id',
    sourceKey: 'id'
  });
  
  // Admin - Utilisateur
  Admin.belongsTo(Utilisateur, {
    as: 'utilisateur',
    foreignKey: 'utilisateur_id',
    targetKey: 'id'
  });
  
  Utilisateur.hasOne(Admin, {
    as: 'adminProfile',
    foreignKey: 'utilisateur_id',
    sourceKey: 'id'
  });
  
  // Stagiaire - Departement
  Stagiaire.belongsTo(Departement, {
    as: 'departement',
    foreignKey: 'departement_id',
    targetKey: 'id'
  });
  
  Departement.hasMany(Stagiaire, {
    as: 'stagiaires',
    foreignKey: 'departement_id',
    sourceKey: 'id'
  });
  
  // Stagiaire - Tuteur (Utilisateur)
  Stagiaire.belongsTo(Utilisateur, {
    as: 'tuteur',
    foreignKey: 'tuteur_id',
    targetKey: 'id'
  });
  
  Utilisateur.hasMany(Stagiaire, {
    as: 'stagiairesEncadres',
    foreignKey: 'tuteur_id',
    sourceKey: 'id'
  });
  
  // Evaluation - Stagiaire (stage)
  Evaluation.belongsTo(Stagiaire, {
    as: 'stagiaire',
    foreignKey: 'stage_id',
    targetKey: 'id'
  });
  
  Stagiaire.hasMany(Evaluation, {
    as: 'evaluations',
    foreignKey: 'stage_id',
    sourceKey: 'id'
  });
  
  // Evaluation - Tuteur
  Evaluation.belongsTo(Utilisateur, {
    as: 'tuteur',
    foreignKey: 'tuteur_id',
    targetKey: 'id'
  });
  
  Utilisateur.hasMany(Evaluation, {
    as: 'evaluationsDonnees',
    foreignKey: 'tuteur_id',
    sourceKey: 'id'
  });
  
  // Notification - Utilisateur
  Notification.belongsTo(Utilisateur, {
    as: 'utilisateur',
    foreignKey: 'utilisateur_id',
    targetKey: 'id'
  });
  
  Utilisateur.hasMany(Notification, {
    as: 'notifications',
    foreignKey: 'utilisateur_id',
    sourceKey: 'id'
  });
  
  // Message - Expediteur et Destinataire
  Message.belongsTo(Utilisateur, {
    as: 'expediteur',
    foreignKey: 'expediteur_id',
    targetKey: 'id'
  });
  
  Message.belongsTo(Utilisateur, {
    as: 'destinataire',
    foreignKey: 'destinataire_id',
    targetKey: 'id'
  });

  // Message - Stagiaire (Relation manquante corrigée)
  Message.belongsTo(Stagiaire, {
    as: 'stagiaire',
    foreignKey: 'stage_id',
    targetKey: 'id'
  });
  
  Utilisateur.hasMany(Message, {
    as: 'messagesEnvoyes',
    foreignKey: 'expediteur_id',
    sourceKey: 'id'
  });
  
  Utilisateur.hasMany(Message, {
    as: 'messagesRecus',
    foreignKey: 'destinataire_id',
    sourceKey: 'id'
  });

  Stagiaire.hasMany(Message, {
    as: 'messages',
    foreignKey: 'stage_id',
    sourceKey: 'id'
  });

  // Document - Stagiaire
  Document.belongsTo(Stagiaire, {
    as: 'stagiaire',
    foreignKey: 'stage_id',
    targetKey: 'id'
  });

  Stagiaire.hasMany(Document, {
    as: 'documents',
    foreignKey: 'stage_id',
    sourceKey: 'id'
  });

  // Document - Utilisateur (generateur)
  Document.belongsTo(Utilisateur, {
    as: 'generateur',
    foreignKey: 'genere_par',
    targetKey: 'id'
  });

  Utilisateur.hasMany(Document, {
    as: 'documentsGeneres',
    foreignKey: 'genere_par',
    sourceKey: 'id'
  });

  // Presence - Stagiaire
  Presence.belongsTo(Stagiaire, {
    as: 'stagiaire',
    foreignKey: 'stage_id',
    targetKey: 'id'
  });

  Stagiaire.hasMany(Presence, {
    as: 'presences',
    foreignKey: 'stage_id',
    sourceKey: 'id'
  });

  // Presence - Utilisateur (validateur)
  Presence.belongsTo(Utilisateur, {
    as: 'validateur',
    foreignKey: 'valide_par',
    targetKey: 'id'
  });

  // Convention - Stagiaire
  Convention.belongsTo(Stagiaire, {
    as: 'stagiaire',
    foreignKey: 'stagiaire_id',
    targetKey: 'id'
  });

  Stagiaire.hasMany(Convention, {
    as: 'conventions',
    foreignKey: 'stagiaire_id',
    sourceKey: 'id'
  });

  // Candidature - Departement
  Candidature.belongsTo(Departement, {
    as: 'departement_souhaite_rel',
    foreignKey: 'departement_souhaite',
    targetKey: 'id'
  });

  // Evaluation - RH validateur
  Evaluation.belongsTo(Utilisateur, {
    as: 'rh_validateur',
    foreignKey: 'rh_validee_par',
    targetKey: 'id'
  });

  console.log('✅ Associations Sequelize configurées');
}

module.exports = { setupAssociations };
