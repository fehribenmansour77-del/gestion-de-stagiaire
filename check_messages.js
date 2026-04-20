const models = require('./backend/src/models');
const { Message, Utilisateur, Notification, setupAssociations } = models;

setupAssociations();

async function checkAll() {
  try {
    console.log('--- DERNIERS MESSAGES ---');
    const messages = await Message.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [
        { model: Utilisateur, as: 'expediteur', attributes: ['nom', 'prenom', 'email'] },
        { model: Utilisateur, as: 'destinataire', attributes: ['nom', 'prenom', 'email'] }
      ]
    });

    if (messages.length === 0) {
      console.log('Aucun message trouvé.');
    }
    messages.forEach(m => {
      console.log(`ID: ${m.id} | De: ${m.expediteur?.email} | À: ${m.destinataire?.email} | Sujet: ${m.sujet}`);
    });

    console.log('\n--- DERNIÈRES NOTIFICATIONS ---');
    const notifs = await Notification.findAll({
      limit: 10,
      order: [['created_at', 'DESC']]
    });

    if (notifs.length === 0) {
      console.log('Aucune notification trouvée.');
    }
    notifs.forEach(n => {
      console.log(`ID: ${n.id} | UserID: ${n.utilisateur_id} | Titre: ${n.titre} | Msg: ${n.message.substring(0, 50)}...`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
}

checkAll();
