/**
 * Service OTP (One-Time Password) - Intégration Twilio Verify API avec Fallback Sandbox
 * Gère l'envoi et la vérification des codes de sécurité via Twilio.
 */

const twilio = require('twilio');

// Configuration Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

// Mode Sandbox : Activé si les clés sont absentes ou par défaut
const isSandboxMode = !accountSid || !authToken || !verifyServiceSid || 
                     accountSid === 'your_account_sid' || 
                     authToken === 'your_auth_token' || 
                     verifyServiceSid === 'your_verify_service_sid';

// Initialisation du client Twilio (uniquement si non-sandbox)
let client;
function getTwilioClient() {
  if (isSandboxMode) return null;
  if (!client) {
    client = twilio(accountSid, authToken);
  }
  return client;
}

/**
 * Envoie un code OTP à un numéro de téléphone
 * @param {string} telephone - Numéro de téléphone
 * @returns {Promise<object>} - Statut de l'envoi
 */
async function sendOtp(telephone) {
  try {
    if (isSandboxMode) {
      const mockCode = '123456';
      console.log('--------------------------------------------------');
      console.log('🚀 MODE SANDBOX - TWILIO NON CONFIGURÉ');
      console.log(`📱 DESTINATAIRE : ${telephone}`);
      console.log(`🔑 CODE OTP SIMULÉ : ${mockCode}`);
      console.log('--------------------------------------------------');
      
      return {
        success: true,
        mode: 'sandbox',
        message: 'Code OTP simulé envoyé (voir console backend)'
      };
    }

    const twilioClient = getTwilioClient();
    const verification = await twilioClient.verify.v2
      .services(verifyServiceSid)
      .verifications.create({
        to: telephone,
        channel: 'sms'
      });

    return {
      success: true,
      sid: verification.sid,
      status: verification.status,
      message: 'Code OTP envoyé via Twilio Verify'
    };
  } catch (error) {
    console.error('Erreur Twilio SendOTP:', error);
    throw new Error(`Échec de l'envoi du SMS : ${error.message}`);
  }
}

/**
 * Vérifie un code OTP
 * @param {string} telephone - Numéro de téléphone
 * @param {string} code - Code à vérifier
 * @returns {Promise<boolean>} - True si le code est valide
 */
async function verifyOtp(telephone, code) {
  try {
    if (isSandboxMode) {
      // En mode sandbox, tout code '123456' est valide
      if (code === '123456') {
        console.log(`✅ MODE SANDBOX - Verification réussie pour ${telephone}`);
        return true;
      }
      throw new Error('Code OTP invalide (Mode Sandbox: utilisez 123456)');
    }

    const twilioClient = getTwilioClient();
    const verificationCheck = await twilioClient.verify.v2
      .services(verifyServiceSid)
      .verificationChecks.create({
        to: telephone,
        code: code
      });

    if (verificationCheck.status !== 'approved') {
      throw new Error('Code OTP invalide ou expiré');
    }

    return true;
  } catch (error) {
    console.error('Erreur Twilio VerifyOTP:', error);
    throw new Error(error.message || 'Erreur lors de la vérification du code');
  }
}

module.exports = {
  sendOtp,
  verifyOtp
};
