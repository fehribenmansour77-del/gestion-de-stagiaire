/**
 * Service: Email Notifications (via Nodemailer)
 * Handlers for sending transactional emails to candidates and RH
 */

const nodemailer = require('nodemailer');
const company = require('../config/company');

// Transporter configuration
// In production, these should be in .env
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/**
 * Send a generic email
 */
const sendEmail = async (to, subject, html) => {
  try {
    // If no credentials, log the email for development
    if (!process.env.SMTP_USER) {
      console.log('--- [EMAIL LOG (Development)] ---');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log('--- CONTENT START ---');
      console.log(html.replace(/<[^>]*>?/gm, '')); // Strip HTML for console
      console.log('--- CONTENT END ---');
      return { success: true, message: 'Email logged to console (no SMTP config)' };
    }

    const info = await transporter.sendMail({
      from: `"${company.name}" <${company.email}>`,
      to,
      subject,
      html
    });

    return { success: true, info };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error };
  }
};

/**
 * Email: Candidature Confirmation
 */
const sendCandidatureConfirmation = async (candidature) => {
  const subject = `Confirmation de réception de votre candidature - ${company.name}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
      <h2 style="color: ${company.colors.primary};">Bonjour ${candidature.prenom} ${candidature.nom},</h2>
      <p>Nous avons bien reçu votre candidature pour un stage au sein du département <strong>${candidature.departement_souhaite || 'RH/Compta/Technique'}</strong>.</p>
      <p>Votre dossier est actuellement en cours d'examen par notre équipe des Ressources Humaines.</p>
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Référence de suivi :</strong> ${candidature.numero_suivi}</p>
      </div>
      <p>Nous vous recontacterons dans les plus brefs délais.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #777;">Cet email est automatique, merci de ne pas y répondre.</p>
      <p style="font-size: 12px; color: #777; font-weight: bold;">${company.name}</p>
    </div>
  `;
  return sendEmail(candidature.email, subject, html);
};

/**
 * Email: Acceptance notification
 */
const sendAcceptanceEmail = async (candidature, defaultPassword) => {
  const subject = `Bienvenue chez ${company.name} : Votre compte stagiaire est créé !`;
  const loginUrl = `${company.website}/login`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
      <h2 style="color: #22c55e;">Félicitations, ${candidature.prenom} !</h2>
      <p>Nous avons le plaisir de vous informer que votre candidature de stage a été acceptée.</p>
      <p><strong>Un compte stagiaire a été automatiquement créé pour vous.</strong> Vous pouvez dès à présent vous connecter pour accéder à votre tableau de bord, télécharger votre convention et gérer vos présences.</p>
      
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #eee;">
        <h3 style="margin-top: 0; color: ${company.colors.primary};">Vos identifiants de connexion :</h3>
        <p><strong>Email :</strong> ${candidature.email}</p>
        ${defaultPassword ? (
          `<p><strong>Mot de passe temporaire :</strong> <span style="background: #fff; padding: 2px 8px; border: 1px dashed #ccc; font-family: monospace; font-weight: bold;">${defaultPassword}</span></p>
           <p style="font-size: 12px; color: #666; margin-top: 10px;">* Pour votre sécurité, merci de changer ce mot de passe lors de votre première connexion.</p>`
        ) : (
          `<p><strong>Mot de passe :</strong> Celui que vous avez défini lors du dépôt de votre candidature.</p>`
        )}
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${loginUrl}" style="background-color: ${company.colors.primary}; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Se connecter à mon espace</a>
      </div>

      <p>Bienvenue dans l'équipe !</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #777;">${company.name} - Ressources Humaines</p>
    </div>
  `;
  return sendEmail(candidature.email, subject, html);
};

/**
 * Email: Rejection notification
 */
const sendRejectionEmail = async (candidature, motif) => {
  const subject = `Réponse concernant votre candidature de stage - ${company.name}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
      <h2>Bonjour ${candidature.prenom} ${candidature.nom},</h2>
      <p>Nous tenons à vous remercier pour l'intérêt que vous portez à <strong>${company.name}</strong>.</p>
      <p>Après examen attentif de votre dossier, nous avons le regret de vous informer que nous ne pouvons pas donner suite à votre demande pour le moment.</p>
      ${motif ? `<p><strong>Motif :</strong> ${motif}</p>` : ''}
      <p>Cependant, nous conservons votre CV dans notre base de données et n'hésiterons pas à vous recontacter si une opportunité correspondant à votre profil se présente.</p>
      <p>Nous vous souhaitons pleine réussite dans vos recherches.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #777;">Cordialement,<br>L'équipe RH</p>
    </div>
  `;
  return sendEmail(candidature.email, subject, html);
};

/**
 * Email: Direct message from RH
 */
const sendDirectMessageEmail = async (candidature, message) => {
  const subject = `Nouveau message concernant votre candidature - ${company.name}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
      <h2>Bonjour ${candidature.prenom} ${candidature.nom},</h2>
      <p>Vous avez reçu un nouveau message de la part de l'équipe des Ressources Humaines de <strong>${company.name}</strong> concernant votre candidature (Réf: ${candidature.numero_suivi}).</p>
      <div style="background-color: #f9f9f9; padding: 20px; border-left: 4px solid ${company.colors.primary}; margin: 20px 0; font-style: italic;">
        "${message.replace(/\n/g, '<br>')}"
      </div>
      <p>Pour toute question supplémentaire, vous pouvez consulter votre espace de suivi.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${company.website}/suivi/${candidature.numero_suivi}" style="background-color: ${company.colors.primary}; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Accéder à mon espace</a>
      </div>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #777;">Cordialement,<br>L'équipe RH</p>
    </div>
  `;
  return sendEmail(candidature.email, subject, html);
};

module.exports = {
  sendEmail,
  sendCandidatureConfirmation,
  sendAcceptanceEmail,
  sendRejectionEmail,
  sendDirectMessageEmail
};
