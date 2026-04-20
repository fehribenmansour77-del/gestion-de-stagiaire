/**
 * Service: Stagiaire Management
 * Handles the transition from Candidature/Convention to active Stagiaire
 */

const { Stagiaire, Candidature, Convention } = require('../models');

/**
 * Creates a Stagiaire record from a signed Convention
 */
const createStagiaireFromConvention = async (conventionId) => {
  try {
    const convention = await Convention.findByPk(conventionId, {
      include: [
        { 
          model: Candidature, 
          as: 'candidature' 
        }
      ]
    });

    if (!convention || !convention.candidature) {
      throw new Error('Convention or associated Candidature not found');
    }

    const { candidature } = convention;

    // Check if stagiaire already exists for this candidature
    const existing = await Stagiaire.findOne({ where: { email: candidature.email, statut: 'actif' } });
    if (existing) return existing;

    // Create the Stagiaire
    const stagiaire = await Stagiaire.create({
      nom: candidature.nom,
      prenom: candidature.prenom,
      email: candidature.email,
      telephone: candidature.telephone,
      etablissement: candidature.etablissement,
      filiere: candidature.filiere,
      niveau_etude: candidature.niveau,
      theme_stage: candidature.theme,
      date_debut: candidature.date_debut,
      date_fin: candidature.date_fin,
      type_stage: candidature.type_stage,
      departement_id: candidature.departement_souhaite,
      cv_url: candidature.cv_url,
      lm_url: candidature.lm_url,
      statut: 'actif',
      convention_id: convention.id
    });

    return stagiaire;
  } catch (error) {
    console.error('Error creating stagiaire from convention:', error);
    throw error;
  }
};

module.exports = {
  createStagiaireFromConvention
};
