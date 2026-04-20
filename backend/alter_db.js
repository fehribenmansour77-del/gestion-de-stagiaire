const { sequelize } = require('./src/config/database');

async function alterDB() {
  try {
    await sequelize.query("ALTER TABLE utilisateurs MODIFY COLUMN entity enum('GIAS', 'CSM', 'SHARED') NULL");
    console.log("Utilisateurs table altered.");
    await sequelize.query("ALTER TABLE stagiaires MODIFY COLUMN entity enum('GIAS', 'CSM', 'SHARED') NULL");
    console.log("Stagiaires table altered.");
    process.exit(0);
  } catch (error) {
    console.error("Error altering table", error);
    process.exit(1);
  }
}

alterDB();
