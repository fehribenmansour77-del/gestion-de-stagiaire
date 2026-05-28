const { Utilisateur } = require('./src/models');
const { sequelize } = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function fix() {
  try {
    await sequelize.authenticate();
    const users = await Utilisateur.findAll();
    console.log('Utilisateurs trouvés:', users.length);
    
    const rh = users.find(u => u.role === 'admin_rh' || u.email.includes('rh'));
    if (rh) {
      console.log('RH trouvé:', rh.email, 'ID:', rh.id);
      const hashedPassword = await bcrypt.hash('password123', 10);
      await Utilisateur.update({ mot_de_passe: hashedPassword }, { where: { id: rh.id } });
      console.log('✅ Mot de passe mis à jour!');
    } else {
      console.log('❌ Aucun RH trouvé');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
fix();
