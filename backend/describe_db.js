const { sequelize } = require('./src/config/database');

async function describeTable() {
  try {
    const [results] = await sequelize.query("DESCRIBE utilisateurs");
    console.log("Table 'utilisateurs' description:");
    console.table(results);
  } catch (error) {
    console.error("Error describing table:", error.message);
  } finally {
    process.exit(0);
  }
}

describeTable();
