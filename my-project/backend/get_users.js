
require('dotenv').config();
const { Utilisateur } = require('./src/models');
const { sequelize } = require('./src/config/database');

async function getUsers() {
  try {
    await sequelize.authenticate();
    const users = await Utilisateur.findAll({
      attributes: ['email', 'role', 'nom', 'prenom']
    });
    console.log('--- UTILISATEURS TROUVÉS ---');
    users.forEach(u => {
      console.log(`Email: ${u.email} | Rôle: ${u.role} | Nom: ${u.prenom} ${u.nom}`);
    });
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error.message);
    process.exit(1);
  }
}

getUsers();
