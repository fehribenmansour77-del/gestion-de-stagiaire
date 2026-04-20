/**
 * Routes d'authentification
 * Endpoints pour la connexion et la gestion des sessions
 */

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const authService = require('../services/authService');
const otpService = require('../services/otpService');
const passwordResetService = require('../services/passwordResetService');
const { authenticate } = require('../middleware/auth');

// Limitation du débit pour la sécurité (anti-spam SMS)
const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limite à 5 requêtes par IP
    message: { error: 'Trop de tentatives. Veuillez réessayer dans 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * POST /api/auth/send-otp
 * Génère et envoie un code OTP par SMS via Twilio Verify
 */
router.post('/send-otp', otpLimiter, async (req, res, next) => {
    try {
        const { telephone } = req.body;

        if (!telephone) {
            return res.status(400).json({
                error: 'Numéro de téléphone requis'
            });
        }

        const result = await otpService.sendOtp(telephone);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/verify-otp
 * Vérifie un code OTP envoyé par SMS
 */
router.post('/verify-otp', async (req, res, next) => {
    try {
        const { telephone, code } = req.body;

        if (!telephone || !code) {
            return res.status(400).json({
                error: 'Numéro de téléphone et code OTP requis'
            });
        }

        const verified = await otpService.verifyOtp(telephone, code);

        if (verified) {
            // Générer un jeton de vérification temporaire (valide 15 mins)
            // Ce jeton prouve au endpoint /register que le téléphone a été vérifié
            const verificationToken = jwt.sign(
                { telephone, verified: true },
                process.env.JWT_SECRET,
                { expiresIn: '15m' }
            );

            return res.json({
                success: true,
                message: 'Téléphone vérifié avec succès',
                verificationToken
            });
        }

        res.status(400).json({ error: 'Échec de la vérification' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * POST /api/auth/login
 * Connexion au système
 */
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validation des champs requis
        if (!email || !password) {
            return res.status(400).json({
                error: 'Email et mot de passe requis'
            });
        }

        const result = await authService.login(
            email,
            password,
            req.ip,
            req.headers['user-agent']
        );

        res.json(result);
    } catch (error) {
        // Ne pas révéler les détails de l'erreur
        res.status(401).json({
            error: error.message || 'Erreur de connexion'
        });
    }
});

/**
 * POST /api/auth/logout
 * Déconnexion
 */
router.post('/logout', authenticate, async (req, res, next) => {
    try {
        const { logout } = require('../middleware/auth');
        logout(req.user.id);

        res.json({ message: 'Déconnexion réussie' });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/auth/me
 * Obtenir les informations de l'utilisateur connecté
 */
router.get('/me', authenticate, async (req, res, next) => {
    try {
        const user = await authService.getCurrentUser(req.user.id);
        res.json(user);
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/forgot-password
 * Demande de réinitialisation de mot de passe
 */
router.post('/forgot-password', async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                error: 'Email requis'
            });
        }

        const result = await passwordResetService.requestPasswordReset(
            email,
            req.ip
        );

        res.json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/reset-password
 * Réinitialisation du mot de passe avec token
 */
router.post('/reset-password', async (req, res, next) => {
    try {
        const { email, token, password } = req.body;

        if (!email || !token || !password) {
            return res.status(400).json({
                error: 'Email, token et nouveau mot de passe requis'
            });
        }

        const result = await passwordResetService.resetPassword(
            email,
            token,
            password,
            req.ip
        );

        res.json(result);
    } catch (error) {
        res.status(400).json({
            error: error.message || 'Erreur de réinitialisation'
        });
    }
});

/**
 * POST /api/auth/change-password
 * Changement de mot de passe (utilisateur connecté)
 */
router.post('/change-password', authenticate, async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                error: 'Mot de passe actuel et nouveau mot de passe requis'
            });
        }

        const result = await passwordResetService.changePassword(
            req.user.id,
            currentPassword,
            newPassword,
            req.ip
        );

        res.json(result);
    } catch (error) {
        if (error.errors) {
            return res.status(400).json({
                error: error.message,
                details: error.errors
            });
        }
        res.status(400).json({
            error: error.message || 'Erreur de changement de mot de passe'
        });
    }
});

/**
 * POST /api/auth/refresh
 * Rafraîchir le token JWT
 */
router.post('/refresh', authenticate, async (req, res, next) => {
    try {
        const { generateToken } = require('../middleware/auth');
        const token = generateToken(req.user);

        res.json({ token });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/register
 * Inscription d'un nouveau candidat
 */
router.post('/register', async (req, res, next) => {
    try {
        const { nom, prenom, email, password, telephone, verificationToken } = req.body;

        if (!nom || !prenom || !email || !password || !telephone || !verificationToken) {
            return res.status(400).json({
                error: 'Tous les champs sont requis (y compris le téléphone et le jeton de vérification)'
            });
        }

        // Vérifier le jeton de vérification (émis par /verify-otp)
        try {
            const decoded = jwt.verify(verificationToken, process.env.JWT_SECRET);

            // Normalisation pour comparer sans les espaces, Tirets ou codes pays complexes si nécessaire
            const normalize = (num) => String(num).replace(/\D/g, '');

            if (!decoded.verified || normalize(decoded.telephone) !== normalize(telephone)) {
                throw new Error('Jeton de vérification invalide pour ce numéro.');
            }
        } catch (err) {
            return res.status(401).json({
                error: 'Vérification du téléphone expirée ou invalide. Veuillez recommencer.'
            });
        }

        const { user, token } = await authService.register({
            nom,
            prenom,
            email,
            password,
            telephone
        });

        res.status(201).json({
            message: 'Inscription réussie',
            user,
            token
        });
    } catch (error) {
        console.error('Registration Error Details:', {
            message: error.message,
            stack: error.stack,
            body: req.body
        });

        // Log to physical file for debugging
        try {
            require('fs').appendFileSync('error.log', '\n--- REGISTRATION ERROR --- ' + new Date().toISOString() + '\n' + JSON.stringify({
                message: error.message,
                body: req.body,
                stack: error.stack
            }, null, 2) + '\n\n');
        } catch (e) { }

        res.status(400).json({
            error: error.message || 'Erreur d\'inscription',
            details: error.errors ? error.errors.map(e => e.message) : undefined
        });
    }
});

module.exports = router;
