const mysql = require('mysql2/promise');

async function createDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''
    });
    console.log('Connecté à MySQL avec succès !');
    await connection.query('CREATE DATABASE IF NOT EXISTS gestion_stagiaires;');
    console.log('Base de données "gestion_stagiaires" créée avec succès !');
    await connection.end();
  } catch (error) {
    console.error('Erreur lors de la création de la base de données :', error.message);
  }
}

createDatabase();
