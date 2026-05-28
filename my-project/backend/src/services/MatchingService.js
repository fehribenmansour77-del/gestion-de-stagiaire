/**
 * MatchingService - Service d'Intelligence Artificielle de simulation
 * Calcule la compatibilité d'un candidat avec un département
 */

class MatchingService {
  /**
   * Mots-clés requis par département (Simulation de besoins métier)
   */
  static getDepartmentKeywords() {
    return {
      1: ['informatique', 'développement', 'web', 'javascript', 'react', 'node', 'sql', 'logiciel'], // Informatique
      2: ['comptabilité', 'finance', 'gestion', 'audit', 'banque', 'chiffres', 'excel'],           // Finance
      3: ['marketing', 'communication', 'vente', 'digital', 'réseaux sociaux', 'stratégie'],       // Marketing
      4: ['ressources humaines', 'rh', 'recrutement', 'formation', 'social', 'paie'],             // RH
      5: ['maintenance', 'industriel', 'mécanique', 'électrique', 'technique', 'production']      // Technique
    };
  }

  /**
   * Calcule le score de matching pour une candidature
   * @param {Object} candidature - Instance de Candidature
   */
  static calculateScore(candidature) {
    if (!candidature.departement_souhaite) return 0;

    const deptKeywords = this.getDepartmentKeywords()[candidature.departement_souhaite] || [];
    if (deptKeywords.length === 0) return 50; // Score moyen par défaut

    // Texte à analyser (Thème + Filière)
    const textToAnalyze = `${candidature.theme || ''} ${candidature.filiere || ''}`.toLowerCase();
    
    let matches = 0;
    deptKeywords.forEach(keyword => {
      if (textToAnalyze.includes(keyword.toLowerCase())) {
        matches++;
      }
    });

    // Calcul du score de base (Nombre de mots-clés trouvés / Nombre total attendu)
    let score = Math.min(Math.round((matches / Math.max(3, deptKeywords.length / 2)) * 100), 100);

    // Bonus selon le niveau d'étude (Simulation)
    if (candidature.niveau && candidature.niveau.toLowerCase().includes('ingénieur')) {
      score += 10;
    } else if (candidature.niveau && candidature.niveau.toLowerCase().includes('master')) {
      score += 5;
    }

    return Math.min(score, 100);
  }

  /**
   * Met à jour le score de matching d'une candidature en base
   */
  static async updateCandidatureScore(candidature) {
    const score = this.calculateScore(candidature);
    candidature.score_matching = score;
    return candidature.save();
  }
}

module.exports = MatchingService;
