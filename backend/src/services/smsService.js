/**
 * Service SMS
 * Gère l'envoi de messages SMS (OTP, notifications)
 */

/**
 * Envoie un SMS à un numéro de téléphone
 * @param {string} telephone - Numéro de téléphone au format international
 * @param {string} message - Contenu du message
 * @returns {Promise<boolean>} - Succès de l'envoi
 */
async function sendSms(telephone, message) {
  console.log('--- ENVOI SMS (SIMULÉ) ---');
  console.log(`POUR: ${telephone}`);
  console.log(`MESSAGE: ${message}`);
  console.log('---------------------------');
  
  // Simulation d'un délai réseau
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return true;
}

/**
 * Envoie un OTP par SMS
 * @param {string} telephone - Numéro de téléphone
 * @param {string} otp - Code OTP
 * @returns {Promise<boolean>}
 */
async function sendOtpSms(telephone, otp) {
  const message = `Votre code de vérification GIAS est : ${otp}. Ce code expire dans 5 minutes.`;
  return sendSms(telephone, message);
}

module.exports = {
  sendSms,
  sendOtpSms
};
