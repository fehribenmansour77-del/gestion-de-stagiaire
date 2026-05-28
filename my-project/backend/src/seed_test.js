/**
 * Script de seed de test
 * Ajoute un Admin et un Stagiaire dans leurs tables respectives
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize } = require('./config/database');
const Utilisateur = require('./models/Utilisateur');
const Stagiaire = require('./models/Stagiaire');
const Admin = require('./models/Admin');
const Departement = require('./models/Departement');
const { setupAssociations } = require('./models/associations');

// Configurer les associations
setupAssociations();

async function seedTest() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie');

    // Synchroniser pour s'assurer que les nouvelles tables existent
    await sequelize.sync({ alter: true });
    console.log('✅ Modèles synchronisés');

    // 1. Créer un Admin
    const adminEmail = 'admin_test@example.com';
    let adminUser = await Utilisateur.findOne({ where: { email: adminEmail } });
    
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      adminUser = await Utilisateur.create({
        nom: 'Test',
        prenom: 'Admin',
        email: adminEmail,
        password_hash: hashedPassword,
        role: 'super_admin',
        is_active: true,
        entity: 'GIAS'
      });
      console.log('✅ Utilisateur Admin créé');
    }

    // Créer le profil Admin s'il n'existe pas
    const adminProfile = await Admin.findOne({ where: { utilisateur_id: adminUser.id } });
    if (!adminProfile) {
      await Admin.create({
        utilisateur_id: adminUser.id,
        poste: 'Responsable Système',
        service: 'Informatique',
        permissions_level: 5
      });
      console.log('✅ Profil Admin créé dans la table admins');
    }

    // 2. Créer un Stagiaire
    const stagiaireEmail = 'stagiaire_test@example.com';
    let stagiaireUser = await Utilisateur.findOne({ where: { email: stagiaireEmail } });
    
    if (!stagiaireUser) {
      const hashedPassword = await bcrypt.hash('Stagiaire123!', 10);
      stagiaireUser = await Utilisateur.create({
        nom: 'Dupont',
        prenom: 'Jean',
        email: stagiaireEmail,
        password_hash: hashedPassword,
        role: 'stagiaire',
        is_active: true,
        entity: 'GIAS'
      });
      console.log('✅ Utilisateur Stagiaire créé');
    }

    // Créer le profil Stagiaire s'il n'existe pas
    const stagiaireProfile = await Stagiaire.findOne({ where: { utilisateur_id: stagiaireUser.id } });
    if (!stagiaireProfile) {
      // Récupérer un département pour le stagiaire
      const dept = await Departement.findOne();
      
      await Stagiaire.create({
        utilisateur_id: stagiaireUser.id,
        etablissement: 'Université de Test',
        filiere: 'Informatique',
        niveau_etude: 'Master 2',
        annee_en_cours: 2024,
        departement_id: dept ? dept.id : null,
        statut: 'actif'
      });
      console.log('✅ Profil Stagiaire créé dans la table stagiaires');
    }

    console.log('\n🎉 Seed de test terminé!');
    console.log('Identifiants:');
    console.log(`  - Admin: ${adminEmail} / Admin123!`);
    console.log(`  - Stagiaire: ${stagiaireEmail} / Stagiaire123!`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
    if (error.name) console.error('Error Name:', error.name);
    if (error.errors) console.error('Sequelize Errors:', JSON.stringify(error.errors, null, 2));
    process.exit(1);
  }
}

seedTest();
