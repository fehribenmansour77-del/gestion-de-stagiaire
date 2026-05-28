const { sequelize } = require('./src/config/database');

async function debug() {
  try {
    await sequelize.authenticate();
    console.log('Connected.');
    
    // Check tables
    const [tables] = await sequelize.query('SHOW TABLES');
    console.log('Tables:', tables);
    
    // Check indexes for messages, utilisateurs, candidatures
    for (const table of ['utilisateurs', 'candidatures', 'messages', 'departements']) {
        try {
            const [indexes] = await sequelize.query(`SHOW INDEX FROM ${table}`);
            console.log(`Indexes for ${table}:`, indexes.map(i => ({ name: i.Key_name, column: i.Column_name, unique: !i.Non_unique })));
        } catch (e) {
            console.log(`Table ${table} might not exist or error:`, e.message);
        }
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Debug failed:', err);
    process.exit(1);
  }
}

debug();
