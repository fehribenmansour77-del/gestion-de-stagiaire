const { Presence, Stagiaire, Utilisateur, Departement } = require('./src/models');
const { setupAssociations } = require('./src/models/associations');

async function test() {
  try {
    setupAssociations();
    console.log("\n--- TEST PRESENCES ---");
    try {
      await Presence.findAndCountAll({
        where: {},
        include: [
          {
            model: Stagiaire,
            as: 'stagiaire',
            include: [
              { model: require('./src/models/Utilisateur'), as: 'utilisateur', attributes: ['nom', 'prenom'] }
            ]
          }
        ],
        limit: 1
      });
      console.log("Presences OK");
    } catch(e) {
      console.error("Presences ERREUR:", e.message);
    }
    
    console.log("\n--- TEST STAGIAIRES ---");
    try {
      await Stagiaire.findAndCountAll({
        where: {},
        include: [
          { model: Utilisateur, as: 'utilisateur', attributes: ['id', 'nom', 'prenom', 'email'] },
          { model: Departement, as: 'departement', attributes: ['nom'] }
        ],
        limit: 1
      });
      console.log("Stagiaires OK");
    } catch(e) {
      console.error("Stagiaires ERREUR:", e.message);
    }
    
  } finally {
    process.exit(0);
  }
}

test();
