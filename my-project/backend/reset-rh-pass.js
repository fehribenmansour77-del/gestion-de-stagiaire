const { Utilisateur } = require('./src/models');
const bcrypt = require('bcryptjs');
const { sequelize } = require('./src/config/database');

async function resetRHPassword() {
  try {
    await sequelize.authenticate();
    
    const email = 'rh@gias.ma';
    const newPassword = 'password123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const [updated] = await Utilisateur.update(
      { password_hash: hashedPassword },
      { where: { id: 2 } }
    );
    
    if (updated) {
      console.log(`\n✅ Mot de passe mis à jour pour: ${email}`);
      console.log(`Nouveau mot de passe: ${newPassword}`);
    } else {
      console.log(`\n❌ Utilisateur ${email} non trouvé.`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
}

resetRHPassword();
