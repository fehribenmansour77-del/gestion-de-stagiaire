const { setupAssociations } = require('./src/models');
const { sequelize } = require('./src/config/database');
const models = require('./src/models'); // Force all models to be loaded

async function syncAll() {
  try {
    console.log('🔄 Démarrage de la synchronisation complète...');
    
    // Configurer les associations
    setupAssociations();
    
    // Synchroniser tous les modèles
    await sequelize.sync({ alter: true });
    
    console.log('✅ Tous les modèles ont été synchronisés avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation :', error);
    process.exit(1);
  }
}

syncAll();
