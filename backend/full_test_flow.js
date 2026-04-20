/**
 * Final End-to-End Test Flow
 * Verifies: Candidature -> Accept -> Trainee Account -> Document Generation
 */

const { Candidature, Utilisateur, Stagiaire, Document, Departement } = require('./src/models');
const { setupAssociations } = require('./src/models/associations');
const { sequelize } = require('./src/config/database');
const path = require('path');
const fs = require('fs');

async function runFullTest() {
  console.log('🚀 Démarrage du test de bout en bout...');
  
  try {
    // Initialisation des associations
    setupAssociations();
    
    // 1. Initialisation : Trouver un département
    const dept = await Departement.findOne();
    if (!dept) throw new Error('Aucun département trouvé pour le test');

    const testEmail = `test.pfe.${Date.now()}@example.com`;
    const testNom = 'TEST';
    const testPrenom = 'Automatisé';

    console.log(`\n1. Création d'une candidature pour ${testEmail}...`);
    const candidature = await Candidature.create({
      nom: testNom,
      prenom: testPrenom,
      email: testEmail,
      telephone: '55123456',
      etablissement: 'Université Centrale',
      filiere: 'Génie Logiciel',
      niveau: 'Master 2',
      date_debut: '2026-05-01',
      date_fin: '2026-08-31',
      type_stage: 'PFE',
      departement_souhaite: dept.id,
      statut: 'en_attente',
      numero_suivi: 'TEST-' + Math.floor(Math.random() * 10000)
    });
    console.log('✅ Candidature créée. ID:', candidature.id);

    // 2. Simulation de l'acceptation Admin
    console.log('\n2. Simulation de l\'acceptation par l\'Admin...');
    // Note: On simule la logique du routeur candidatures.js
    const defaultPassword = 'Gias@' + new Date().getFullYear();
    
    await sequelize.transaction(async (t) => {
      // Création Utilisateur
      const user = await Utilisateur.create({
        email: candidature.email.toLowerCase(),
        nom: candidature.nom,
        prenom: candidature.prenom,
        password_hash: defaultPassword, // Hook will hash it
        role: 'stagiaire',
        is_active: true,
        departement_id: candidature.departement_souhaite
      }, { transaction: t });

      // Création Stagiaire
      const stagiaire = await Stagiaire.create({
        utilisateur_id: user.id,
        etablissement: candidature.etablissement,
        filiere: candidature.filiere,
        niveau_etude: candidature.niveau,
        departement_id: candidature.departement_souhaite,
        date_demarrage: candidature.date_debut,
        date_fin: candidature.date_fin,
        statut: 'actif'
      }, { transaction: t });

      await candidature.update({ statut: 'acceptee', date_acceptation: new Date() }, { transaction: t });
      
      console.log('✅ Transition réussie !');
      console.log('   - Utilisateur ID:', user.id);
      console.log('   - Stagiaire ID:', stagiaire.id);
    });

    // 3. Vérification de la visibilité dans les stagiaires
    const checkUser = await Utilisateur.findOne({ where: { email: testEmail } });
    if (checkUser) {
      const checkStagiaire = await Stagiaire.findOne({
        where: { utilisateur_id: checkUser.id }
      });
      if (checkStagiaire) {
        console.log('\n3. Vérification Annuaire Stagiaires : ✅ PRÉSENT (Compte + Profil)');
      } else {
        throw new Error('Le profil stagiaire n\'est pas lié à l\'utilisateur');
      }
    } else {
       throw new Error('L\'utilisateur n\'a pas été créé');
    }

    // 4. Test de génération d'attestation (Final Step)
    console.log('\n4. Test de génération d\'attestation...');
    const checkStagiaire = await Stagiaire.findOne({ where: { etablissement: 'Université Centrale' } });
    const pdfService = require('./src/services/pdfService');
    const pdfPath = path.join(__dirname, 'uploads/documents', `Attestation_Test_${checkStagiaire.id}.pdf`);
    
    // Assurer le dossier
    if (!fs.existsSync(path.dirname(pdfPath))) fs.mkdirSync(path.dirname(pdfPath), { recursive: true });
    
    await pdfService.generateAttestationPDF(checkStagiaire, pdfPath);
    console.log('✅ Attestation générée avec succès à :', pdfPath);

    console.log('\n✨ TEST DE BOUT EN BOUT TERMINÉ AVEC SUCCÈS ! ✨');
    console.log('Le workflow complet [Candidature -> Account -> Stagiaire -> Document] est validé.');

  } catch (error) {
    console.error('\n❌ ÉCHEC DU TEST :', error.message);
    process.exit(1);
  }
}

runFullTest();
