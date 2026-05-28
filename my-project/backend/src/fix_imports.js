const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

function fixImports() {
  const srcDir = path.join(__dirname, '.');

  walk(srcDir, (filePath) => {
    if (!filePath.endsWith('.js') || filePath.includes('node_modules')) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Fix destructuring from specific models, e.g., const { Departement, Utilisateur } = require('../models');
    const regexSpecific = /const\s+\{\s*([a-zA-Z0-9_,\s]+)\s*\}\s*=\s*require\(['"](\.\.\/models\/[a-zA-Z0-9_]+)['"]\);/g;
    
    content = content.replace(regexSpecific, (match, modelsStr, modulePath) => {
      // If they are trying to import multiple models from a single model file, it's totally broken.
      // We will assume all listed models should be imported from the central '../models' index.
      changed = true;
      return `const { ${modelsStr.trim()} } = require('../models');`;
    });

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated imports in ${filePath}`);
    }
  });
}

function createModelsIndex() {
  const modelsDir = path.join(__dirname, 'models');
  const indexContent = `
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
`;
  fs.writeFileSync(path.join(modelsDir, 'index.js'), indexContent.trim(), 'utf8');
  console.log('Created models/index.js');
}

createModelsIndex();
fixImports();
