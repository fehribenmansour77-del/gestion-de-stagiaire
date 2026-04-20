/**
 * Script de seed - Création des utilisateurs initiaux
 * 
 * Usage: node src/seed.js
 * 
 * Crée un administrateur RH et un tuteur de test
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize } = require('./config/database');
const Utilisateur = require('./models/Utilisateur');
const Departement = require('./models/Departement');

async function seed() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie');

    // Sync models
    await sequelize.sync({ alter: true });
    console.log('✅ Modèles synchronisés');

    // Check if admin already exists
    const adminExists = await Utilisateur.findOne({ 
      where: { email: 'admin@gias.ma' } 
    });

    if (adminExists) {
      console.log('⚠️ L\'administrateur existe déjà');
    } else {
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const admin = await Utilisateur.create({
        nom: 'Administrateur',
        prenom: 'Système',
        email: 'admin@gias.ma',
        password_hash: hashedPassword,
        role: 'super_admin',
        is_active: true,
        entity: 'GIAS'
      });
      console.log('✅ Administrateur créé: admin@gias.ma / admin123');
    }

    // Check if RH user exists
    const rhExists = await Utilisateur.findOne({ 
      where: { email: 'rh@gias.ma' } 
    });

    if (!rhExists) {
      const rhPassword = await bcrypt.hash('rh123456', 10);
      
      const rh = await Utilisateur.create({
        nom: 'RH',
        prenom: 'Manager',
        email: 'rh@gias.ma',
        password_hash: rhPassword,
        role: 'admin_rh',
        is_active: true,
        entity: 'GIAS'
      });
      console.log('✅ Utilisateur RH créé: rh@gias.ma / rh123456');
    }

    // Check if tuteur exists
    const tuteurExists = await Utilisateur.findOne({ 
      where: { email: 'tuteur@gias.ma' } 
    });

    if (!tuteurExists) {
      const tuteurPassword = await bcrypt.hash('tuteur123', 10);
      
      const tuteur = await Utilisateur.create({
        nom: 'Martin',
        prenom: 'Pierre',
        email: 'tuteur@gias.ma',
        password_hash: tuteurPassword,
        role: 'tuteur',
        is_active: true,
        entity: 'GIAS'
      });
      console.log('✅ Tuteur créé: tuteur@gias.ma / tuteur123');
    }

    // Create default departments if they don't exist
    const depts = [
      { nom: 'Informatique', code: 'IT', est_actif: true, entity: 'SHARED' },
      { nom: 'RH', code: 'RH', est_actif: true, entity: 'SHARED' },
      { nom: 'Finance', code: 'FIN', est_actif: true, entity: 'SHARED' },
      { nom: 'Marketing', code: 'MKT', est_actif: true, entity: 'SHARED' },
      { nom: 'Production', code: 'PROD', est_actif: true, entity: 'SHARED' }
    ];

    for (const dept of depts) {
      const exists = await Departement.findOne({ where: { code: dept.code } });
      if (!exists) {
        await Departement.create(dept);
        console.log(`✅ Département créé: ${dept.nom}`);
      }
    }

    console.log('\n🎉 Seed terminé avec succès!');
    console.log('\nComptes de test disponibles:');
    console.log('  - Administrateur: admin@gias.ma / admin123');
    console.log('  - RH: rh@gias.ma / rh123456');
    console.log('  - Tuteur: tuteur@gias.ma / tuteur123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
    process.exit(1);
  }
}

seed();
