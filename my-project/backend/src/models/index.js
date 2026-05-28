const Admin = require('./Admin');
const AuditLog = require('./AuditLog');
const Candidature = require('./Candidature');
const Convention = require('./Convention');
const Departement = require('./Departement');
const Document = require('./Document');
const Evaluation = require('./Evaluation');
const LoginAttempt = require('./LoginAttempt');
const Message = require('./Message');
const Notification = require('./Notification');
const PasswordReset = require('./PasswordReset');
const Presence = require('./Presence');
const Stagiaire = require('./Stagiaire');
const StagiaireArchive = require('./StagiaireArchive');
const Utilisateur = require('./Utilisateur');
const { setupAssociations } = require('./associations');

module.exports = {
  Admin,
  AuditLog,
  Candidature,
  Convention,
  Departement,
  Document,
  Evaluation,
  LoginAttempt,
  Message,
  Notification,
  PasswordReset,
  Presence,
  Stagiaire,
  StagiaireArchive,
  Utilisateur,
  setupAssociations
};