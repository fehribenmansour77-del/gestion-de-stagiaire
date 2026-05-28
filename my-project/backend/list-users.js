const { Utilisateur } = require('./src/models');
const { sequelize } = require('./src/config/database');

async function listUsers() {
  try {
    await sequelize.authenticate();
    const users = await Utilisateur.findAll({
      attributes: ['id', 'email', 'prenom', 'nom', 'role']
    });
    
    console.log('\n--- LISTE DES UTILISATEURS ---');
    console.table(users.map(u => ({
      ID: u.id,
      Email: u.email,
      Nom: `${u.prenom} ${u.nom}`,
      Role: u.role
    })));
    
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
}

listUsers();
