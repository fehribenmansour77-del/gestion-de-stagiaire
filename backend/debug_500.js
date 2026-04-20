const { Notification, Message, setupAssociations } = require('./src/models');
const { sequelize } = require('./src/config/database');

async function debug() {
  try {
    console.log('--- DB Connection Test ---');
    await sequelize.authenticate();
    console.log('✅ Connection stable.');

    console.log('\n--- Setup Associations ---');
    setupAssociations();
    console.log('✅ Associations configurées.');

    console.log('\n--- Tables Check ---');
    
    try {
      const n = await Notification.count();
      console.log('✅ Table "notifications" existe. Count:', n);
    } catch (e) {
      console.error('❌ Table "notifications" Erreur:', e.message);
    }

    try {
      const m = await Message.count();
      console.log('✅ Table "messages" existe. Count:', m);
    } catch (e) {
      console.error('❌ Table "messages" Erreur:', e.message);
    }

    console.log('\n--- Test Queries (The exact ones in routes) ---');
    
    try {
      // Simulation d'une requête Notifications avec created_at
      await Notification.findAll({
        limit: 1,
        order: [['created_at', 'DESC']]
      });
      console.log('✅ Query Notifications (created_at) OK');
    } catch (e) {
      console.error('❌ Query Notifications (created_at) Erreur:', e.message);
      if (e.original) console.error('SQL:', e.original.sql);
    }

    try {
      // Simulation d'une requête Messages avec inclusion et created_at
      const { Utilisateur } = require('./src/models');
      await Message.findAll({
        limit: 1,
        include: [
          { model: Utilisateur, as: 'expediteur', attributes: ['id', 'nom', 'prenom'] }
        ],
        order: [['created_at', 'DESC']]
      });
      console.log('✅ Query Messages (Inclusion + created_at) OK');
    } catch (e) {
      console.error('❌ Query Messages (Inclusion + created_at) Erreur:', e.message);
      if (e.original) console.error('SQL:', e.original.sql);
    }

  } catch (err) {
    console.error('CRITICAL ERROR during debug:', err);
  } finally {
    process.exit(0);
  }
}

debug();
