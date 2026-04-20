/**
 * Script de Seed - Données de Test pour Présentation PFE
 * 
 * Ce script :
 * 1. Récupère les stagiaires actifs existants
 * 2. Crée des présences réalistes pour Mars et Avril 2026
 * 3. Crée des évaluations avec notes pour chaque stagiaire
 * 
 * Usage: node seed-test-data.js
 */

require('dotenv').config();
const { sequelize } = require('./src/config/database');
const { setupAssociations } = require('./src/models/associations');
const { Stagiaire, Utilisateur, Presence, Evaluation } = require('./src/models');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connecté à la base de données');
    
    setupAssociations();

    // 1. Récupérer tous les stagiaires actifs
    const stagiaires = await Stagiaire.findAll({
      where: { statut: 'actif' },
      include: [{ model: Utilisateur, as: 'utilisateur', attributes: ['nom', 'prenom'] }]
    });

    if (stagiaires.length === 0) {
      console.log('❌ Aucun stagiaire actif trouvé. Veuillez d\'abord accepter des candidatures.');
      process.exit(1);
    }

    console.log(`\n📋 ${stagiaires.length} stagiaires actifs trouvés :`);
    stagiaires.forEach(s => {
      console.log(`   - [ID ${s.id}] ${s.utilisateur?.prenom || '?'} ${s.utilisateur?.nom || '?'}`);
    });

    // 2. Créer les présences pour Mars et Avril 2026
    console.log('\n📅 Création des présences...');
    
    const statuts = ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'R', 'ANJ', 'AJ', 'TT']; // Pondéré : majorité présent
    let presenceCount = 0;

    for (const stag of stagiaires) {
      // Mars 2026
      for (let day = 1; day <= 31; day++) {
        const date = new Date(2026, 2, day); // Mars = index 2
        if (date.getMonth() !== 2) continue; // Vérifier qu'on reste en mars
        const dow = date.getDay();
        if (dow === 0 || dow === 6) continue; // Skip weekends

        const dateStr = `2026-03-${String(day).padStart(2, '0')}`;

        // Vérifier si existe déjà
        const existing = await Presence.findOne({ where: { stage_id: stag.id, date: dateStr } });
        if (existing) continue;

        const randomStatut = statuts[Math.floor(Math.random() * statuts.length)];
        
        await Presence.create({
          stage_id: stag.id,
          date: dateStr,
          statut: randomStatut,
          heure_entree: randomStatut === 'P' ? '09:00' : randomStatut === 'R' ? '09:35' : null,
          heure_sortie: ['P', 'R', 'TT'].includes(randomStatut) ? '17:00' : null,
          saisie_par: 1,
          est_auto_pointe: false,
          valide: true
        });
        presenceCount++;
      }

      // Avril 2026 (jours passés jusqu'à aujourd'hui)
      const today = new Date();
      const lastDay = today.getMonth() === 3 ? today.getDate() : 30; // Avril = index 3
      
      for (let day = 1; day <= lastDay; day++) {
        const date = new Date(2026, 3, day); // Avril = index 3
        if (date.getMonth() !== 3) continue;
        const dow = date.getDay();
        if (dow === 0 || dow === 6) continue;

        const dateStr = `2026-04-${String(day).padStart(2, '0')}`;

        const existing = await Presence.findOne({ where: { stage_id: stag.id, date: dateStr } });
        if (existing) continue;

        const randomStatut = statuts[Math.floor(Math.random() * statuts.length)];
        
        await Presence.create({
          stage_id: stag.id,
          date: dateStr,
          statut: randomStatut,
          heure_entree: randomStatut === 'P' ? '09:00' : randomStatut === 'R' ? '09:42' : null,
          heure_sortie: ['P', 'R', 'TT'].includes(randomStatut) ? '17:00' : null,
          saisie_par: 1,
          est_auto_pointe: false,
          valide: true
        });
        presenceCount++;
      }
    }
    console.log(`   ✅ ${presenceCount} présences créées`);

    // 3. Créer des évaluations
    console.log('\n⭐ Création des évaluations...');
    let evalCount = 0;

    const evalTypes = ['INTEGRATION', 'MI_PARCOURS'];
    const mentionMap = { TB: [85, 100], B: [70, 84], AB: [55, 69], P: [40, 54], I: [0, 39] };

    for (const stag of stagiaires) {
      for (const type of evalTypes) {
        // Vérifier si existe déjà
        const existing = await Evaluation.findOne({ where: { stage_id: stag.id, type } });
        if (existing) {
          console.log(`   ⏩ Évaluation ${type} déjà existante pour stagiaire ${stag.id}`);
          continue;
        }

        // Notes réalistes (sur 40, 30, 30)
        const noteTech = Math.floor(Math.random() * 16) + 25; // 25-40
        const noteProf = Math.floor(Math.random() * 12) + 18; // 18-30
        const noteCom = Math.floor(Math.random() * 12) + 18;  // 18-30
        const total = noteTech + noteProf + noteCom;

        // Déterminer la mention
        let mention = 'P';
        if (total >= 85) mention = 'TB';
        else if (total >= 70) mention = 'B';
        else if (total >= 55) mention = 'AB';
        else if (total >= 40) mention = 'P';
        else mention = 'I';

        const commentaires = [
          'Excellent travail. Le stagiaire fait preuve d\'initiative et de rigueur.',
          'Bon niveau technique, continue de progresser dans la communication.',
          'Très bonne intégration dans l\'équipe. Résultats conformes aux attentes.',
          'Stagiaire motivé et assidu. Compétences techniques solides.'
        ];

        const axes = [
          'Approfondir les connaissances en gestion de projet.',
          'Améliorer la documentation technique des livrables.',
          'Renforcer l\'autonomie dans la résolution de problèmes complexes.',
          'Développer les compétences en présentation orale.'
        ];

        await Evaluation.create({
          stage_id: stag.id,
          tuteur_id: stag.tuteur_id || 1,
          type,
          note_technique: noteTech,
          note_prof: noteProf,
          note_com: noteCom,
          note_totale: total,
          mention,
          points_forts: commentaires[Math.floor(Math.random() * commentaires.length)],
          axes_amelioration: axes[Math.floor(Math.random() * axes.length)],
          commentaire_tuteur: 'Le stagiaire démontre une bonne capacité d\'adaptation et contribue positivement aux projets du département.',
          date_evaluation: type === 'INTEGRATION' ? '2026-03-10' : '2026-04-05',
          statut: type === 'INTEGRATION' ? 'VALIDEE_RH' : 'SOUMISE',
          rh_validee_par: type === 'INTEGRATION' ? 1 : null,
          rh_date_validation: type === 'INTEGRATION' ? new Date() : null
        });
        evalCount++;
      }
    }
    console.log(`   ✅ ${evalCount} évaluations créées`);

    // 4. Résumé
    console.log('\n' + '='.repeat(50));
    console.log('🎉 SEED TERMINÉ AVEC SUCCÈS !');
    console.log('='.repeat(50));
    console.log(`\n📊 Données de test créées :`);
    console.log(`   • ${presenceCount} enregistrements de présence`);
    console.log(`   • ${evalCount} évaluations`);
    console.log(`\n💡 Vous pouvez maintenant tester :`);
    console.log(`   1. /presences    → Calendrier avec pointages`);
    console.log(`   2. /evaluations  → Bilans avec notes et mentions`);
    console.log(`   3. /documents    → Générer attestations et feuilles de présence`);
    console.log(`   4. /dashboard    → KPIs avec taux de présence réel\n`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

seed();
