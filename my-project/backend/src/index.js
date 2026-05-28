require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const { sequelize } = require('./config/database');
const { setupAssociations } = require('./models/associations');
const { logAuditEvent } = require('./services/auditService');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true, exposedHeaders: ['Content-Disposition'] }));
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use('/api/', rateLimit({ windowMs: 60_000, max: 100, message: { error: 'Trop de requêtes.' }, standardHeaders: true, legacyHeaders: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('combined'));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── Routes ───────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

[
  ['/api/auth', 'auth'],
  ['/api/users', 'users'],
  ['/api/departements', 'departements'],
  ['/api/tuteurs', 'tuteurs'],
  ['/api/candidatures', 'candidatures'],
  ['/api/conventions', 'conventions'],
  ['/api/presences', 'presences'],
  ['/api/evaluations', 'evaluations'],
  ['/api/documents', 'documents'],
  ['/api/dashboard', 'dashboard'],
  ['/api', 'notifications'],
  ['/api/stagiaires', 'search'],
  ['/api/stagiaires', 'stagiaires'],
].forEach(([path, route]) => app.use(path, require(`./routes/${route}`)));

// ─── Error Handling ───────────────────────────────────────────
app.use((err, req, res, next) => {
  fs.appendFileSync('error.log', `\n--- ${new Date().toISOString()} ---\n${req.originalUrl}\n${err.stack}\n`);
  try { logAuditEvent({ userId: req.user?.id, action: 'ERROR', ipAddress: req.ip, details: { error: err.message, path: req.path } }); } catch { }
  res.status(err.status || 500).json({ error: err.message || 'Erreur interne', details: err.stack });
});
app.use((_, res) => res.status(404).json({ error: 'Route non trouvée' }));

// ─── Start ────────────────────────────────────────────────────
async function startServer() {
  try {
    await sequelize.authenticate();
    setupAssociations();
    console.log('✅ DB connectée');
    if (process.env.NODE_ENV !== 'production') console.log('✅ Sequelize sync ignorée');
    app.listen(PORT, () => console.log(`✅ Serveur: port ${PORT} (${process.env.NODE_ENV || 'development'})`));
  } catch (err) {
    console.error('❌ Erreur démarrage:', err);
    fs.writeFileSync('clean_error.txt', err.stack, 'utf8');
    process.exit(1);
  }
}

module.exports = app;
if (require.main === module) startServer();