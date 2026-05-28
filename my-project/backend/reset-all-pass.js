const { Utilisateur } = require('./src/models');
const bcrypt = require('bcryptjs');
const { sequelize } = require('./src/config/database');

async function resetAllPasswords() {
  try {
    await sequelize.authenticate();
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Reset RH and Admin
    await Utilisateur.update({ password_hash: hashedPassword }, { where: { email: 'rh@gias.ma' } });
    await Utilisateur.update({ password_hash: hashedPassword }, { where: { email: 'admin@gias.ma' } });
    await Utilisateur.update({ password_hash: hashedPassword }, { where: { email: 'admin_test@example.com' } });
    
    console.log('✅ Passwords reset to password123 for Admin RH, Super Admin and Admin Test');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
resetAllPasswords();
