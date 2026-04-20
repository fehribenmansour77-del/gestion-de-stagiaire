const models = require('./backend/src/models');
const { Utilisateur, setupAssociations } = models;

setupAssociations();

async function listAdmins() {
  try {
    const admins = await Utilisateur.findAll({
      where: {
        role: ['super_admin', 'admin_rh']
      },
      attributes: ['id', 'nom', 'prenom', 'email', 'role']
    });

    console.log('--- ADMINISTRATEURS ---');
    admins.forEach(a => {
      console.log(`ID: ${a.id} | Nom: ${a.nom} ${a.prenom} | Email: ${a.email} | Role: ${a.role}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
}

listAdmins();
