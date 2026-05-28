/**
 * Service OTP (One-Time Password) - Version Email
 * Gère l'envoi et la vérification des codes de sécurité via Email (Nodemailer).
 */

const emailService = require('./emailService');

// Stockage temporaire des OTP en mémoire (email -> { code, expiresAt })
// Dans une application de production, on utiliserait Redis ou une table SQL.
const otps = new Map();

/**
 * Génère un code aléatoire à 6 chiffres
 */
function generateRandomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Envoie un code OTP par Email
 * @param {string} email - Email du destinataire
 * @returns {Promise<object>} - Statut de l'envoi
 */
async function sendOtp(email) {
  try {
    const code = generateRandomCode();
    const expiresAt = Date.now() + 10 * 60 * 1000; // Valable 10 minutes

    // Stocker le code
    otps.set(email.toLowerCase(), { code, expiresAt });

    // Envoyer l'email
    const result = await emailService.sendOtpEmail(email, code);

    if (result.success) {
      return {
        success: true,
        message: 'Code de vérification envoyé par email'
      };
    } else {
      throw new Error(result.error || 'Erreur lors de l\'envoi de l\'email');
    }
  } catch (error) {
    console.error('Erreur OTP Service:', error);
    throw new Error(`Échec de l'envoi du code de vérification : ${error.message}`);
  }
}

/**
 * Vérifie un code OTP
 * @param {string} email - Email du destinataire
 * @param {string} code - Code à vérifier
 * @returns {Promise<boolean>} - True si le code est valide
 */
async function verifyOtp(email, code) {
  try {
    const normalizedEmail = email.toLowerCase();
    const otpData = otps.get(normalizedEmail);

    if (!otpData) {
      throw new Error('Aucun code envoyé pour cet email ou code expiré');
    }

    // Vérifier l'expiration
    if (Date.now() > otpData.expiresAt) {
      otps.delete(normalizedEmail);
      throw new Error('Le code de vérification a expiré');
    }

    // Vérifier le code
    if (otpData.code !== code) {
      throw new Error('Code de vérification incorrect');
    }

    // Succès : Supprimer le code utilisé
    otps.delete(normalizedEmail);
    return true;
  } catch (error) {
    console.error('Erreur Vérification OTP:', error);
    throw new Error(error.message || 'Erreur lors de la vérification du code');
  }
}

module.exports = {
  sendOtp,
  verifyOtp
};
