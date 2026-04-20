/**
 * Gestion des Stagiaires - Backend API
 * Point d'entrée principal de l'application
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { sequelize } = require('./config/database');
const { setupAssociations } = require('./models/associations');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const departementsRoutes = require('./routes/departements');
const tuteursRoutes = require('./routes/tuteurs');
const candidatureRoutes = require('./routes/candidatures');
const conventionRoutes = require('./routes/conventions');
const presencesRoutes = require('./routes/presences');
const evaluationRoutes = require('./routes/evaluations');
const documentRoutes = require('./routes/documents');
const dashboardRoutes = require('./routes/dashboard');
const notificationRoutes = require('./routes/notifications');
const searchRoutes = require('./routes/search');
const stagiaireRoutes = require('./routes/stagiaires');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. CORS en premier pour gérer les preflights et les autorisations
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true,
  exposedHeaders: ['Content-Disposition']
}));

// 2. Helmet après avec configuration pour autoriser le partage de ressources
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting - 100 requests per minute per IP (increased for development)
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests
  message: { error: 'Trop de requêtes, veuillez réessayer plus tard.' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const path = require('path');

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/departements', departementsRoutes);
app.use('/api/tuteurs', tuteursRoutes);
app.use('/api/candidatures', candidatureRoutes);
app.use('/api/conventions', conventionRoutes);
app.use('/api/presences', presencesRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', notificationRoutes);
app.use('/api/stagiaires', searchRoutes);
app.use('/api/stagiaires', stagiaireRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // LOG PHYSIQUE DE L'ERREUR
  try {
    require('fs').appendFileSync('error.log', '\n--- ERREUR 500 --- ' + new Date().toISOString() + '\nROUTE: ' + req.originalUrl + '\n' + err.stack + '\n\n');
  } catch(e) {}
  
  // Audit log for errors
  const { logAuditEvent } = require('./services/auditService');
  try {
    logAuditEvent({
      userId: req.user?.id,
      action: 'ERROR',
      ipAddress: req.ip,
      details: { error: err.message, path: req.path }
    });
  } catch(e) {}

  res.status(err.status || 500).json({
    error: err.message || 'Erreur interne du serveur',
    details: err.stack
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Database connection and server start
async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie');

    // Setup model associations
    setupAssociations();

    // Sync models (in development only)
    if (process.env.NODE_ENV !== 'production') {
      // DÉSACTIVÉ CAR IL CRÉE DES INDEX EN BOUCLE SUR MYSQL JUSQU'AU PLANTE ("Too many keys specified")
      // await sequelize.sync();
      console.log('✅ Synchronisation Sequelize ignorée (protège la limite des clés MySQL)');
    }

    app.listen(PORT, () => {
      console.log(`✅ Serveur démarré sur le port ${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Erreur au démarrage du serveur:', error);
    require('fs').writeFileSync('clean_error.txt', error.stack, 'utf8');
    process.exit(1);
  }
}

// Export for testing
module.exports = app;

// Start server if run directly
if (require.main === module) {
  startServer();
}
